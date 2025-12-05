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
export type SelectInput = {
	type: "select";
	label: string;
	options: Array<string | { value: string; label: string }>;
};

export type InputField = TextInput | CheckboxInput | SelectInput;

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
export type TextOutputMessage = {
	type: "output";
	variant?: "text";
	content: string;
};
export type MetadataOutputMessage = {
	type: "output";
	variant: "metadata";
	title?: string;
	data: Record<string, string | number | boolean | null>;
};

export type OutputMessage = TextOutputMessage | MetadataOutputMessage;

export type InputBlock = {
	type: string;
	label: string;
	options?: Array<string | { value: string; label: string }>;
};

export type InputRequestMessage = {
	type: "input-request";
	stepId: string;
	blocks: Record<string, InputBlock>;
	token: string;
};

export type InputResponseMessage = {
	type: "input-response";
	stepId: string;
	values: Record<string, string | boolean>;
};

export type LoadingStartMessage = {
	type: "loading-start";
	id: string;
	message: string;
	total?: number;
};
export type LoadingProgressMessage = {
	type: "loading-progress";
	id: string;
	current?: number;
	total?: number;
	message?: string;
};
export type LoadingEndMessage = {
	type: "loading-end";
	id: string;
	message?: string;
};

export type StreamMessage =
	| OutputMessage
	| InputRequestMessage
	| InputResponseMessage
	| LoadingStartMessage
	| LoadingProgressMessage
	| LoadingEndMessage;
