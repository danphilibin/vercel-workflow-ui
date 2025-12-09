/**
 * Relay SDK Types
 *
 * Type definitions for workflow inputs and outputs.
 * Extend these as new input/output types are added.
 */

/**
 * Input field types
 */
export type TextInput = { type: "text"; label: string; optional?: boolean };
export type CheckboxInput = {
	type: "checkbox";
	label: string;
	optional?: boolean;
};
export type SelectInput = {
	type: "select";
	label: string;
	options: Array<string | { value: string; label: string }>;
	optional?: boolean;
};

export type InputField = TextInput | CheckboxInput | SelectInput;

/**
 * Button customization types
 */
export type ButtonIntent = "primary" | "secondary" | "danger";

export type ButtonDef =
	| string
	| { label: string; intent?: ButtonIntent };

export type InputOptions<B extends readonly ButtonDef[] = readonly ButtonDef[]> = {
	buttons: B;
};

export type InputSchema = Record<string, InputField>;

/** The possible value types for a single input field */
export type InputValue = string | boolean | undefined;

/** A record of input field values keyed by field name */
export type InputValues = Record<string, InputValue>;

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

export type InputRequestMessage = {
	type: "input-request";
	stepId: string;
	blocks: InputSchema;
	token: string;
	buttons?: ButtonDef[];
};

export type InputResponseMessage = {
	type: "input-response";
	stepId: string;
	values: InputValues;
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
