/**
 * Relay Types (client-safe)
 *
 * Types for messages streamed from workflows to the client.
 * Separated from relay.ts to avoid importing server-only code.
 */

export type StreamMessage =
	| { type: "output"; content: string }
	| {
			type: "input";
			stepId: string;
			inputs: Array<{ name: string; type: string; label: string }>;
			token: string;
	  };
