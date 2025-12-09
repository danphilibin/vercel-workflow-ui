"use client";

import { useEffect } from "react";
import { MessageBlock } from "./blocks";
import { DebugPanel } from "./DebugPanel";
import { useAutoScroll } from "./hooks/useAutoScroll";
import { useWorkflowStream } from "./useWorkflowStream";

interface TransactionUIProps {
	workflow: string;
	runId?: string;
}

export function TransactionUI({
	workflow,
	runId: initialRunId,
}: TransactionUIProps) {
	const { messages, status, runId, runWorkflow, submitInput } =
		useWorkflowStream();
	const { containerRef } = useAutoScroll(messages);

	useEffect(() => {
		runWorkflow(workflow, initialRunId);
	}, [workflow, initialRunId, runWorkflow]);

	return (
		<div className="flex h-full w-full">
			<div ref={containerRef} className="flex-1 overflow-y-auto">
				<div className="max-w-[640px] p-8">
					{status === "connecting" && (
						<div className="py-3 text-base text-[#666] flex items-center gap-2">
							<span className="w-1.5 h-1.5 rounded-full bg-[#666] animate-pulse-dot" />
							Connecting...
						</div>
					)}
					{messages.map((msg, i) => (
						<MessageBlock
							key={i}
							message={msg}
							onSubmit={(values) => {
								if (msg.type === "input-request") {
									submitInput(msg.stepId, msg.token, values);
								}
							}}
						/>
					))}
				</div>
			</div>
			<DebugPanel messages={messages} status={status} runId={runId} />
		</div>
	);
}
