"use client";

import { useState, useRef, useCallback } from "react";
import type {
	StreamMessage,
	OutputMessage,
	InputMessageBase,
} from "@/lib/relay/types";

type SystemMessage = { type: "system"; content: string };

type InputMessage = InputMessageBase & {
	submitted?: boolean;
	values?: Record<string, string | boolean>;
};

type LoadingMessage = {
	type: "loading";
	id: string;
	message: string;
	current?: number;
	total?: number;
	completed?: boolean;
};

export type Message =
	| OutputMessage
	| SystemMessage
	| InputMessage
	| LoadingMessage;

export function useWorkflowStream() {
	const [messages, setMessages] = useState<Message[]>([]);
	const abortRef = useRef<AbortController | null>(null);

	const runWorkflow = useCallback(async (name: string) => {
		abortRef.current?.abort();
		abortRef.current = new AbortController();

		setMessages([{ type: "system", content: `Starting ${name}...` }]);

		try {
			const triggerResponse = await fetch("/api/run", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ workflow: name }),
				signal: abortRef.current.signal,
			});

			if (!triggerResponse.ok) {
				setMessages((m) => [
					...m,
					{ type: "system", content: "Failed to start workflow" },
				]);
				return;
			}

			const { runId } = (await triggerResponse.json()) as { runId: string };
			setMessages((m) => [...m, { type: "system", content: "Running..." }]);

			const streamResponse = await fetch(`/api/stream/${runId}`, {
				signal: abortRef.current.signal,
			});

			if (!streamResponse.ok || !streamResponse.body) {
				setMessages((m) => [
					...m,
					{ type: "system", content: "Failed to connect to stream" },
				]);
				return;
			}

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

			setMessages((m) => [...m, { type: "system", content: "Complete" }]);
		} catch (err) {
			if ((err as Error).name !== "AbortError") {
				setMessages((m) => [
					...m,
					{ type: "system", content: `Error: ${(err as Error).message}` },
				]);
			}
		}
	}, []);

	const submitInput = useCallback(
		async (
			stepId: string,
			token: string,
			values: Record<string, string | boolean>,
		) => {
			setMessages((m) =>
				m.map((msg) =>
					msg.type === "input" && msg.stepId === stepId
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

	return { messages, runWorkflow, submitInput };
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

	setMessages((m) => [...m, msg]);
}
