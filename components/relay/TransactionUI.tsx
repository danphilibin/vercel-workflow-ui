"use client";

import { useEffect } from "react";
import { MessageBlock } from "./blocks";
import { useWorkflowStream } from "./useWorkflowStream";

export function TransactionUI({ workflow }: { workflow: string }) {
	const { messages, status, runWorkflow, submitInput } = useWorkflowStream();

	useEffect(() => {
		runWorkflow(workflow);
	}, [workflow, runWorkflow]);

	return (
		<div className="flex-1 overflow-y-auto">
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
							if (msg.type === "input") {
								submitInput(msg.stepId, msg.token, values);
							}
						}}
					/>
				))}
			</div>
		</div>
	);
}
