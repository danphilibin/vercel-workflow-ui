/**
 * User input handling
 *
 * Wait for and collect user input in workflows.
 */

import { inputHook } from "./hooks";
import { streamWrite } from "./stream";
import type {
	ButtonDef,
	CheckboxInput,
	InputField,
	InputOptions,
	InputSchema,
	InputValues,
} from "./types";
import { generateToken, slugify } from "./utils";

/**
 * Infer the return type for a single input field.
 * - Checkbox returns boolean, others return string
 * - If optional: true, the type is T | undefined
 */
type InferFieldValue<T extends InputField> = T extends CheckboxInput
	? T extends { optional: true }
		? boolean | undefined
		: boolean
	: T extends { optional: true }
		? string | undefined
		: string;

/**
 * Infer the return type for an entire input schema.
 */
type InferInputResult<T extends InputSchema> = {
	[K in keyof T]: InferFieldValue<T[K]>;
};

/**
 * Extract button label from a ButtonDef
 */
type ButtonLabel<B extends ButtonDef> = B extends string
	? B
	: B extends { label: infer L }
		? L
		: never;

/**
 * Extract all button labels from an array of ButtonDefs
 */
type ButtonLabels<B extends readonly ButtonDef[]> = ButtonLabel<B[number]>;

/**
 * Check if an object is an InputOptions (has buttons key)
 */
function isInputOptions(obj: unknown): obj is InputOptions {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"buttons" in obj &&
		Array.isArray((obj as InputOptions).buttons)
	);
}

/**
 * Normalizes the overloaded function arguments into a consistent format.
 * Handles these cases:
 * 1. Single string (prompt only) - generates stepId from prompt
 * 2. Two strings (stepId, prompt) - uses provided stepId
 * 3. String + schema (stepId, schema) - uses provided stepId and schema
 * 4. String + options (prompt, options) - prompt with custom buttons
 * 5. String + schema + options (stepId, schema, options) - full form
 * Also converts string prompts into a schema format for consistent processing.
 */
function normalizeInputParameters(
	stepIdOrPrompt: string,
	promptOrSchemaOrOptions?: string | InputSchema | InputOptions,
	maybeOptions?: InputOptions,
): {
	stepId: string;
	schema: InputSchema;
	wasStringPrompt: boolean;
	buttons?: ButtonDef[];
} {
	let stepId: string;
	let schemaOrPrompt: string | InputSchema;
	let options: InputOptions | undefined;

	if (promptOrSchemaOrOptions === undefined) {
		// Case 1: input("prompt")
		stepId = slugify(stepIdOrPrompt);
		schemaOrPrompt = stepIdOrPrompt;
	} else if (typeof promptOrSchemaOrOptions === "string") {
		// Case 2: input("stepId", "prompt")
		stepId = stepIdOrPrompt;
		schemaOrPrompt = promptOrSchemaOrOptions;
		options = maybeOptions;
	} else if (isInputOptions(promptOrSchemaOrOptions)) {
		// Case 4: input("prompt", { buttons: [...] })
		stepId = slugify(stepIdOrPrompt);
		schemaOrPrompt = stepIdOrPrompt;
		options = promptOrSchemaOrOptions;
	} else {
		// Case 3 or 5: input("stepId", schema) or input("stepId", schema, options)
		stepId = stepIdOrPrompt;
		schemaOrPrompt = promptOrSchemaOrOptions;
		options = maybeOptions;
	}

	const wasStringPrompt = typeof schemaOrPrompt === "string";
	const schema: InputSchema =
		typeof schemaOrPrompt === "string"
			? { value: { type: "text", label: schemaOrPrompt } }
			: schemaOrPrompt;

	return {
		stepId,
		schema,
		wasStringPrompt,
		buttons: options?.buttons as ButtonDef[] | undefined,
	};
}

/**
 * Wait for input from the user
 *
 * Simplest (prompt only, auto-generates stepId):
 *   const name = await input("What's your name?");
 *
 * With explicit stepId:
 *   const name = await input("get-name", "What's your name?");
 *
 * Multiple inputs:
 *   const { name, color } = await input("user-info", {
 *     name: { type: "text", label: "What's your name?" },
 *     color: { type: "text", label: "Favorite color?" },
 *   });
 *
 * With custom buttons (returns $choice):
 *   const { value, $choice } = await input("What's your name?", {
 *     buttons: ["Submit", "Skip"]
 *   });
 *
 *   const { name, $choice } = await input("user-info", {
 *     name: { type: "text", label: "What's your name?" },
 *   }, {
 *     buttons: [
 *       { label: "Continue", intent: "primary" },
 *       { label: "Cancel", intent: "secondary" }
 *     ]
 *   });
 */
// Simple prompt, no buttons
export async function input(prompt: string): Promise<string>;

// Simple prompt with buttons
export async function input<B extends readonly ButtonDef[]>(
	prompt: string,
	options: InputOptions<B>,
): Promise<{ value: string; $choice: ButtonLabels<B> }>;

// Explicit stepId with prompt
export async function input(stepId: string, prompt: string): Promise<string>;

// Explicit stepId with prompt and buttons
export async function input<B extends readonly ButtonDef[]>(
	stepId: string,
	prompt: string,
	options: InputOptions<B>,
): Promise<{ value: string; $choice: ButtonLabels<B> }>;

// Schema without buttons
export async function input<T extends InputSchema>(
	stepId: string,
	schema: T,
): Promise<InferInputResult<T>>;

// Schema with buttons
export async function input<
	T extends InputSchema,
	B extends readonly ButtonDef[],
>(
	stepId: string,
	schema: T,
	options: InputOptions<B>,
): Promise<InferInputResult<T> & { $choice: ButtonLabels<B> }>;

// Implementation
export async function input(
	stepIdOrPrompt: string,
	promptOrSchemaOrOptions?: string | InputSchema | InputOptions,
	maybeOptions?: InputOptions,
): Promise<string | InputValues | (InputValues & { $choice: string })> {
	const { stepId, schema, wasStringPrompt, buttons } = normalizeInputParameters(
		stepIdOrPrompt,
		promptOrSchemaOrOptions,
		maybeOptions,
	);

	const token = generateToken(stepId);
	const hook = inputHook.create({ token });

	await streamInputRequest(stepId, schema, token, buttons);

	const result = await hook;
	const values = result.values;

	await streamInputResponse(stepId, values);

	// If buttons were provided, always return object with $choice
	if (buttons) {
		if (wasStringPrompt) {
			return {
				value: values.value as string,
				$choice: values.$choice as string,
			};
		}
		return values;
	}

	// No buttons: original behavior
	if (wasStringPrompt) {
		return values.value as string;
	}

	return values;
}

async function streamInputRequest(
	stepId: string,
	blocks: InputSchema,
	token: string,
	buttons?: ButtonDef[],
) {
	"use step";
	await streamWrite({ type: "input-request", stepId, blocks, token, buttons });
}

async function streamInputResponse(stepId: string, values: InputValues) {
	"use step";
	await streamWrite({ type: "input-response", stepId, values });
}
