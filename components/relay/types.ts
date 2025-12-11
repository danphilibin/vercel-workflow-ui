/**
 * Client-side message types for the Relay UI
 *
 * These extend the wire format types with UI-specific state.
 */

import type {
	ConfirmRequestMessage,
	InputRequestMessage,
	InputValues,
	OutputMessage,
} from "@/lib/relay/types";

export type SystemMessage = { type: "system"; content: string };

export type InputMessage = InputRequestMessage & {
	submitted?: boolean;
	values?: InputValues;
};

export type LoadingMessage = {
	type: "loading";
	id: string;
	message: string;
	current?: number;
	total?: number;
	completed?: boolean;
};

export type ConfirmMessage = ConfirmRequestMessage & {
	submitted?: boolean;
	confirmed?: boolean;
};

export type Message =
	| OutputMessage
	| SystemMessage
	| InputMessage
	| LoadingMessage
	| ConfirmMessage;

// Re-export base types for convenience
export type { InputRequestMessage, OutputMessage } from "@/lib/relay/types";
