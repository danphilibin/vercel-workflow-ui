"use client";

import { useEffect } from "react";
import { MessageBlock } from "./blocks";
import { useWorkflowStream } from "./useWorkflowStream";

export function TransactionUI({ workflow }: { workflow: string }) {
	const { messages, runWorkflow, submitInput } = useWorkflowStream();

	useEffect(() => {
		runWorkflow(workflow);
	}, [workflow, runWorkflow]);

	return (
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
	);
}
