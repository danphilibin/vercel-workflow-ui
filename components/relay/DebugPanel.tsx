"use client";

import { useState } from "react";
import type { Message } from "./types";
import type { WorkflowStatus } from "./useWorkflowStream";

interface DebugPanelProps {
	messages: Message[];
	status: WorkflowStatus;
	runId: string | null;
}

export function DebugPanel({ messages, status, runId }: DebugPanelProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="fixed bottom-4 right-4 z-50">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md text-xs font-mono hover:bg-zinc-700 transition-colors"
			>
				{isOpen ? "Close Debug" : "Debug"}
			</button>

			{isOpen && (
				<div className="absolute bottom-10 right-0 w-[480px] max-h-[60vh] bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden">
					<div className="p-3 border-b border-zinc-700 bg-zinc-800">
						<div className="flex items-center justify-between">
							<span className="text-xs font-mono text-zinc-400">
								Stream Debug
							</span>
							<div className="flex items-center gap-3">
								<StatusBadge status={status} />
								{runId && (
									<span className="text-xs font-mono text-zinc-500 truncate max-w-[200px]">
										{runId}
									</span>
								)}
							</div>
						</div>
					</div>

					<div className="overflow-y-auto max-h-[calc(60vh-48px)] p-3 space-y-2">
						{messages.length === 0 ? (
							<div className="text-xs text-zinc-500 font-mono">
								No messages yet...
							</div>
						) : (
							messages.map((msg, i) => (
								<MessageEntry key={i} index={i} message={msg} />
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}

function StatusBadge({ status }: { status: WorkflowStatus }) {
	const colors: Record<WorkflowStatus, string> = {
		idle: "bg-zinc-600",
		connecting: "bg-yellow-600",
		streaming: "bg-green-600 animate-pulse",
		complete: "bg-blue-600",
		error: "bg-red-600",
	};

	return (
		<span
			className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${colors[status]} text-white`}
		>
			{status}
		</span>
	);
}

function MessageEntry({ index, message }: { index: number; message: Message }) {
	const [expanded, setExpanded] = useState(false);

	const typeColors: Record<string, string> = {
		output: "text-emerald-400",
		"input-request": "text-amber-400",
		loading: "text-blue-400",
		system: "text-red-400",
	};

	const getPreview = () => {
		if (message.type === "output") {
			if (message.variant === "metadata") {
				return `metadata: ${message.title || Object.keys(message.data).join(", ")}`;
			}
			return message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "");
		}
		if (message.type === "input-request") {
			const status = message.submitted ? "✓ submitted" : "⏳ waiting";
			return `${message.stepId} (${status})`;
		}
		if (message.type === "loading") {
			const status = message.completed ? "✓" : "⏳";
			return `${status} ${message.message}`;
		}
		if (message.type === "system") {
			return message.content;
		}
		return JSON.stringify(message).slice(0, 40);
	};

	return (
		<div className="border border-zinc-800 rounded bg-zinc-950">
			<button
				type="button"
				onClick={() => setExpanded(!expanded)}
				className="w-full px-2 py-1.5 flex items-center gap-2 text-left hover:bg-zinc-800/50 transition-colors"
			>
				<span className="text-zinc-600 text-[10px] font-mono w-4">
					{index}
				</span>
				<span
					className={`text-[10px] font-mono uppercase ${typeColors[message.type] || "text-zinc-400"}`}
				>
					{message.type}
				</span>
				<span className="text-xs text-zinc-400 font-mono truncate flex-1">
					{getPreview()}
				</span>
				<span className="text-zinc-600 text-xs">{expanded ? "▼" : "▶"}</span>
			</button>

			{expanded && (
				<pre className="px-2 py-2 text-[10px] font-mono text-zinc-300 bg-black/30 overflow-x-auto border-t border-zinc-800">
					{JSON.stringify(message, null, 2)}
				</pre>
			)}
		</div>
	);
}

