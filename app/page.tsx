"use client";

import { MessageBlock } from "@/components/relay/blocks";
import { useWorkflowStream } from "@/components/relay/useWorkflowStream";
import { WORKFLOW_NAMES } from "@/workflows/manifest";

export default function Home() {
	const { messages, runWorkflow, submitInput } = useWorkflowStream();

	return (
		<div className="flex h-screen bg-black text-[#fafafa] font-sans">
			{/* Sidebar */}
			<div className="w-[260px] bg-[#0a0a0a] border-r border-[#222] flex flex-col">
				<div className="p-5 border-b border-[#222] flex items-center justify-between">
					<h1 className="text-base font-semibold tracking-tight flex items-center gap-2">
						Relay
					</h1>
				</div>
				<div className="flex-1 overflow-y-auto p-3">
					{WORKFLOW_NAMES.map((name) => (
						<button
							type="button"
							key={name}
							onClick={() => runWorkflow(name)}
							className="w-full text-left px-3.5 py-3 rounded-md mb-1 text-base font-medium hover:bg-[#1a1a1a] transition-colors cursor-pointer"
						>
							{name}
						</button>
					))}
				</div>
			</div>

			{/* Main content */}
			<div className="flex-1 overflow-y-auto">
				<div className="max-w-[640px] p-8">
					{messages.map((msg, i) => (
						<MessageBlock
							key={i}
							message={msg}
							onSubmit={(values) => {
								if (msg.type === "input") {
									submitInput(msg.stepId, msg.token, values);
								}
							}}
						/>
					))}
				</div>
			</div>

			<style jsx global>{`
				@keyframes pulse {
					0%,
					100% {
						opacity: 0.4;
					}
					50% {
						opacity: 1;
					}
				}
				.animate-pulse-dot {
					animation: pulse 1.5s ease-in-out infinite;
				}
			`}</style>
		</div>
	);
}
