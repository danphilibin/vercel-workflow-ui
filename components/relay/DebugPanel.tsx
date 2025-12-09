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
	const [isOpen, setIsOpen] = useState(true);

	return (
		<>
			{/* Toggle button when closed */}
			{!isOpen && (
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					className="fixed top-4 right-4 z-50 bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md text-xs font-mono hover:bg-zinc-700 transition-colors"
				>
					Debug
				</button>
			)}

			{/* Full-height sidebar */}
			{isOpen && (
				<div className="w-[380px] h-full border-l border-zinc-800 bg-zinc-900 flex flex-col shrink-0">
					{/* Header */}
					<div className="p-3 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm shrink-0">
						<div className="flex items-center justify-between gap-2">
							<span className="text-xs font-mono text-zinc-400">
								Stream Debug
							</span>
							<div className="flex items-center gap-2">
								<StatusBadge status={status} />
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
								>
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>
						</div>
						{runId && (
							<div className="mt-2 text-[10px] font-mono text-zinc-600 truncate">
								{runId}
							</div>
						)}
					</div>

					{/* Scrollable message list */}
					<div className="flex-1 overflow-y-auto p-3 space-y-1.5">
						{messages.length === 0 ? (
							<div className="text-xs text-zinc-600 font-mono py-4 text-center">
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
		</>
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
			return (
				message.content.slice(0, 40) +
				(message.content.length > 40 ? "..." : "")
			);
		}
		if (message.type === "input-request") {
			const status = message.submitted ? "✓" : "⏳";
			return `${status} ${message.stepId}`;
		}
		if (message.type === "loading") {
			const status = message.completed ? "✓" : "⏳";
			return `${status} ${message.message.slice(0, 30)}`;
		}
		if (message.type === "system") {
			return message.content;
		}
		return JSON.stringify(message).slice(0, 30);
	};

	return (
		<div className="border border-zinc-800/50 rounded bg-zinc-950/50">
			<button
				type="button"
				onClick={() => setExpanded(!expanded)}
				className="w-full px-2 py-1.5 flex items-center gap-1.5 text-left hover:bg-zinc-800/30 transition-colors"
			>
				<span className="text-zinc-700 text-[10px] font-mono w-3 text-right shrink-0">
					{index}
				</span>
				<span
					className={`text-[9px] font-mono uppercase shrink-0 ${typeColors[message.type] || "text-zinc-400"}`}
				>
					{message.type.replace("-request", "")}
				</span>
				<span className="text-[11px] text-zinc-500 font-mono truncate flex-1">
					{getPreview()}
				</span>
				<span className="text-zinc-700 text-[10px] shrink-0">
					{expanded ? "▼" : "▶"}
				</span>
			</button>

			{expanded && (
				<pre className="px-2 py-2 text-[10px] font-mono text-zinc-400 bg-black/20 overflow-x-auto border-t border-zinc-800/50 max-h-[300px] overflow-y-auto">
					{JSON.stringify(message, null, 2)}
				</pre>
			)}
		</div>
	);
}
