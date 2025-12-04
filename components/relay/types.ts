/**
 * Client-side message types for the Relay UI
 *
 * These extend the wire format types with UI-specific state.
 */

import type { InputMessageBase, OutputMessage } from "@/lib/relay/types";

export type SystemMessage = { type: "system"; content: string };

export type InputMessage = InputMessageBase & {
	submitted?: boolean;
	values?: Record<string, string | boolean>;
};

export type LoadingMessage = {
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

// Re-export base types for convenience
export type { InputMessageBase, OutputMessage } from "@/lib/relay/types";
