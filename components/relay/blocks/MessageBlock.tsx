import type { Message } from "../types";
import { InputBlock } from "./InputBlock";
import { LoadingBlock } from "./LoadingBlock";
import { OutputBlock } from "./OutputBlock";
import { SystemBlock } from "./SystemBlock";

export function MessageBlock({
	message,
	onSubmit,
}: {
	message: Message;
	onSubmit: (values: Record<string, string | boolean>) => void;
}) {
	if (message.type === "output") {
		return <OutputBlock message={message} />;
	}

	if (message.type === "system") {
		return <SystemBlock content={message.content} />;
	}

	if (message.type === "input-request") {
		return (
			<InputBlock
				blocks={message.blocks}
				submitted={message.submitted}
				submittedValues={message.values}
				onSubmit={onSubmit}
			/>
		);
	}

	if (message.type === "loading") {
		return (
			<LoadingBlock
				message={message.message}
				current={message.current}
				total={message.total}
				completed={message.completed}
			/>
		);
	}

	return null;
}
