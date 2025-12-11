"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import type { InputValues, StreamMessage } from "@/lib/relay/types";
import type { Message } from "./types";

export type { Message } from "./types";

export type WorkflowStatus =
	| "idle"
	| "connecting"
	| "streaming"
	| "complete"
	| "error";

export function useWorkflowStream() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [status, setStatus] = useState<WorkflowStatus>("idle");
	const [runId, setRunId] = useState<string | null>(null);
	const abortRef = useRef<AbortController | null>(null);
	const router = useRouter();

	const runWorkflow = useCallback(
		async (name: string, existingRunId?: string) => {
			abortRef.current?.abort();
			abortRef.current = new AbortController();

			setMessages([]);
			setStatus("connecting");

			try {
				let currentRunId = existingRunId;

				// Only create a new run if we don't have an existing runId
				if (!currentRunId) {
					const triggerResponse = await fetch("/api/run", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ workflow: name }),
						signal: abortRef.current.signal,
					});

					if (!triggerResponse.ok) {
						setStatus("error");
						setMessages([
							{ type: "system", content: "Failed to start workflow" },
						]);
						return;
					}

					const result = (await triggerResponse.json()) as { runId: string };
					currentRunId = result.runId;

					// Navigate to the URL with runId
					router.replace(`/workflow/${name}/${currentRunId}`);
				}

				setRunId(currentRunId);

				const streamResponse = await fetch(`/api/stream/${currentRunId}`, {
					signal: abortRef.current.signal,
				});

				if (!streamResponse.ok || !streamResponse.body) {
					setStatus("error");
					setMessages([
						{ type: "system", content: "Failed to connect to stream" },
					]);
					return;
				}

				setStatus("streaming");

				const reader = streamResponse.body.getReader();
				const decoder = new TextDecoder();
				let buffer = "";

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split("\n");
					buffer = lines.pop() || "";

					for (const line of lines) {
						if (!line.trim()) continue;
						try {
							const msg = JSON.parse(line) as StreamMessage;
							handleStreamMessage(msg, setMessages);
						} catch {
							console.warn("Failed to parse:", line);
						}
					}
				}

				setStatus("complete");
			} catch (err) {
				if ((err as Error).name !== "AbortError") {
					setStatus("error");
					setMessages((m) => [
						...m,
						{ type: "system", content: `Error: ${(err as Error).message}` },
					]);
				}
			}
		},
		[router],
	);

	const submitInput = useCallback(
		async (stepId: string, token: string, values: InputValues) => {
			setMessages((m) =>
				m.map((msg) =>
					msg.type === "input-request" && msg.stepId === stepId
						? { ...msg, submitted: true, values }
						: msg,
				),
			);

			try {
				await fetch("/api/submit", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ token, values }),
				});
			} catch (err) {
				console.error("Failed to submit:", err);
			}
		},
		[],
	);

	const submitConfirm = useCallback(
		async (stepId: string, token: string, confirmed: boolean) => {
			setMessages((m) =>
				m.map((msg) =>
					msg.type === "confirm-request" && msg.stepId === stepId
						? { ...msg, submitted: true, confirmed }
						: msg,
				),
			);

			try {
				await fetch("/api/submit", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ token, values: { $confirmed: confirmed } }),
				});
			} catch (err) {
				console.error("Failed to submit confirm:", err);
			}
		},
		[],
	);

	return { messages, status, runId, runWorkflow, submitInput, submitConfirm };
}

function handleStreamMessage(
	msg: StreamMessage,
	setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
) {
	if (msg.type === "loading-start") {
		setMessages((m) => [
			...m,
			{ type: "loading", id: msg.id, message: msg.message, total: msg.total },
		]);

		return;
	}

	if (msg.type === "loading-progress") {
		setMessages((m) =>
			m.map((item) =>
				item.type === "loading" && item.id === msg.id
					? {
							...item,
							current: msg.current,
							total: msg.total ?? item.total,
							message: msg.message ?? item.message,
						}
					: item,
			),
		);

		return;
	}

	if (msg.type === "loading-end") {
		if (msg.message) {
			setMessages((m) =>
				m.map((item) =>
					item.type === "loading" && item.id === msg.id
						? { ...item, message: msg.message ?? item.message, completed: true }
						: item,
				),
			);
		} else {
			setMessages((m) =>
				m.filter((item) => !(item.type === "loading" && item.id === msg.id)),
			);
		}

		return;
	}

	// Handle input responses - mark input as submitted with values
	if (msg.type === "input-response") {
		setMessages((m) =>
			m.map((item) =>
				item.type === "input-request" && item.stepId === msg.stepId
					? { ...item, submitted: true, values: msg.values }
					: item,
			),
		);

		return;
	}

	// Handle confirm responses - mark confirm as submitted with value
	if (msg.type === "confirm-response") {
		setMessages((m) =>
			m.map((item) =>
				item.type === "confirm-request" && item.stepId === msg.stepId
					? { ...item, submitted: true, confirmed: msg.confirmed }
					: item,
			),
		);

		return;
	}

	setMessages((m) => [...m, msg]);
}
