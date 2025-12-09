/**
 * User input handling
 *
 * Wait for and collect user input in workflows.
 */

import { inputHook } from "./hooks";
import { streamWrite } from "./stream";
import type {
	CheckboxInput,
	InputField,
	InputSchema,
	InputValues,
} from "./types";
import { slugify } from "./utils";

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
 * Normalizes the overloaded function arguments into a consistent format.
 * Handles three cases:
 * 1. Single string (prompt only) - generates stepId from prompt
 * 2. Two strings (stepId, prompt) - uses provided stepId
 * 3. String + schema (stepId, schema) - uses provided stepId and schema
 * Also converts string prompts into a schema format for consistent processing.
 */
function normalizeInputParameters(
	stepIdOrPrompt: string,
	promptOrSchema?: string | InputSchema,
): { stepId: string; schema: InputSchema; wasStringPrompt: boolean } {
	let stepId: string;
	let schemaOrPrompt: string | InputSchema;

	if (promptOrSchema === undefined) {
		stepId = slugify(stepIdOrPrompt);
		schemaOrPrompt = stepIdOrPrompt;
	} else {
		stepId = stepIdOrPrompt;
		schemaOrPrompt = promptOrSchema;
	}

	const wasStringPrompt = typeof schemaOrPrompt === "string";
	const schema: InputSchema =
		typeof schemaOrPrompt === "string"
			? { value: { type: "text", label: schemaOrPrompt } }
			: schemaOrPrompt;

	return { stepId, schema, wasStringPrompt };
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
 */
export async function input(prompt: string): Promise<string>;
export async function input(stepId: string, prompt: string): Promise<string>;
export async function input<T extends InputSchema>(
	stepId: string,
	schema: T,
): Promise<InferInputResult<T>>;
export async function input(
	stepIdOrPrompt: string,
	promptOrSchema?: string | InputSchema,
): Promise<string | InputValues> {
	const { stepId, schema, wasStringPrompt } = normalizeInputParameters(
		stepIdOrPrompt,
		promptOrSchema,
	);

	const token = `${stepId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	const hook = inputHook.create({ token });

	await streamInputRequest(stepId, schema, token);

	const result = await hook;
	const values = result.values;

	await streamInputResponse(stepId, values);

	if (wasStringPrompt) {
		return values.value as string;
	}

	return values;
}

async function streamInputRequest(
	stepId: string,
	blocks: InputSchema,
	token: string,
) {
	"use step";
	await streamWrite({ type: "input-request", stepId, blocks, token });
}

async function streamInputResponse(stepId: string, values: InputValues) {
	"use step";
	await streamWrite({ type: "input-response", stepId, values });
}
