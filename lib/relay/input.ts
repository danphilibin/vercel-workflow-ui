/**
 * User input handling
 *
 * Wait for and collect user input in workflows.
 */

import { inputHook } from "./hooks";
import { streamWrite } from "./stream";
import type { InputSchema, CheckboxInput } from "./types";
import { slugify } from "./utils";

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
 *   const name = await waitForInput("What's your name?");
 *
 * With explicit stepId:
 *   const name = await waitForInput("get-name", "What's your name?");
 *
 * Multiple inputs:
 *   const { name, color } = await waitForInput("user-info", {
 *     name: { type: "text", label: "What's your name?" },
 *     color: { type: "text", label: "Favorite color?" },
 *   });
 */
export async function waitForInput(prompt: string): Promise<string>;
export async function waitForInput(
	stepId: string,
	prompt: string,
): Promise<string>;
export async function waitForInput<T extends InputSchema>(
	stepId: string,
	schema: T,
): Promise<{ [K in keyof T]: T[K] extends CheckboxInput ? boolean : string }>;
export async function waitForInput(
	stepIdOrPrompt: string,
	promptOrSchema?: string | InputSchema,
): Promise<string | Record<string, string | boolean>> {
	const { stepId, schema, wasStringPrompt } = normalizeInputParameters(stepIdOrPrompt, promptOrSchema);

	const inputs = Object.entries(schema).map(([name, field]) => ({
		name,
		type: field.type,
		label: field.label,
	}));

	const token = `${stepId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	const hook = inputHook.create({ token });

	await streamInputRequest(stepId, inputs, token);

	const result = await hook;
	const values = result.values;

	if (wasStringPrompt) {
		return values.value as string;
	}

	return values;
}

async function streamInputRequest(
	stepId: string,
	inputs: Array<{ name: string; type: string; label: string }>,
	token: string,
) {
	"use step";
	await streamWrite({ type: "input", stepId, inputs, token });
}

