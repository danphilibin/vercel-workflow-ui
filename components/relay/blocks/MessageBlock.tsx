import type { InputValues } from "@/lib/relay/types";
import type { Message } from "../types";
import { ConfirmBlock } from "./ConfirmBlock";
import { InputBlock } from "./InputBlock";
import { LoadingBlock } from "./LoadingBlock";
import { OutputBlock } from "./OutputBlock";
import { SystemBlock } from "./SystemBlock";

export function MessageBlock({
	message,
	onSubmit,
	onConfirm,
}: {
	message: Message;
	onSubmit: (values: InputValues) => void;
	onConfirm: (confirmed: boolean) => void;
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
				buttons={message.buttons}
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

	if (message.type === "confirm-request") {
		return (
			<ConfirmBlock
				question={message.question}
				helpText={message.helpText}
				submitted={message.submitted}
				confirmedValue={message.confirmed}
				onSubmit={onConfirm}
			/>
		);
	}

	return null;
}
