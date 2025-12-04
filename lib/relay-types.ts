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
	  }
	| { type: "loading-start"; id: string; message: string; total?: number }
	| {
			type: "loading-progress";
			id: string;
			current?: number;
			total?: number;
			message?: string;
	  }
	| { type: "loading-end"; id: string; message?: string };
