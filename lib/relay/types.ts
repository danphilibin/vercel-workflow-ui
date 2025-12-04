/**
 * Relay SDK Types
 *
 * Type definitions for workflow inputs and outputs.
 * Extend these as new input/output types are added.
 */

/**
 * Input field types
 */
export type TextInput = { type: "text"; label: string };
export type CheckboxInput = { type: "checkbox"; label: string };

export type InputField = TextInput | CheckboxInput;

export type InputSchema = Record<string, InputField>;

/**
 * Loading/progress callback types
 */
export type ProgressFn = {
	(current: number, total: number): Promise<void>;
	(opts: { message?: string; current?: number; total?: number }): Promise<void>;
};

export type CompleteFn = (message: string) => void;

/**
 * Stream message types (wire format)
 */
export type OutputMessage = { type: "output"; content: string };

export type InputMessageBase = {
	type: "input";
	stepId: string;
	inputs: Array<{ name: string; type: string; label: string }>;
	token: string;
};

export type LoadingStartMessage = { type: "loading-start"; id: string; message: string; total?: number };
export type LoadingProgressMessage = { type: "loading-progress"; id: string; current?: number; total?: number; message?: string };
export type LoadingEndMessage = { type: "loading-end"; id: string; message?: string };

export type StreamMessage =
	| OutputMessage
	| InputMessageBase
	| LoadingStartMessage
	| LoadingProgressMessage
	| LoadingEndMessage;
