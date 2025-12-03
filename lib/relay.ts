/**
 * Relay SDK
 *
 * Streams output and input requests directly to the client via Vercel's
 * workflow streaming. Uses defineHook for type-safe input handling.
 */

import { getWritable } from "workflow";
import { inputHook } from "./input-hook";

/**
 * Input field schema
 */
type TextInput = { type: "text"; label: string };
type CheckboxInput = { type: "checkbox"; label: string };
type InputField = TextInput | CheckboxInput;

type InputSchema = Record<string, InputField>;

// Re-export types for server-side use
export type { StreamMessage } from "./relay-types";
import type { StreamMessage } from "./relay-types";

/**
 * Send output text to the Relay UI
 */
export async function output(content: string) {
	"use step";
	const writable = getWritable<StreamMessage>();
	const writer = writable.getWriter();
	await writer.write({ type: "output", content });
	writer.releaseLock();
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
	// Handle single-arg case: waitForInput("prompt")
	let stepId: string;
	let schemaOrPrompt: string | InputSchema;

	if (promptOrSchema === undefined) {
		// Single arg - use slugified prompt as stepId
		stepId = slugify(stepIdOrPrompt);
		schemaOrPrompt = stepIdOrPrompt;
	} else {
		stepId = stepIdOrPrompt;
		schemaOrPrompt = promptOrSchema;
	}

	// Normalize to schema format
	const schema: InputSchema =
		typeof schemaOrPrompt === "string"
			? { value: { type: "text", label: schemaOrPrompt } }
			: schemaOrPrompt;

	// Convert schema to inputs array for the UI
	const inputs = Object.entries(schema).map(([name, field]) => ({
		name,
		type: field.type,
		label: field.label,
	}));

	// Generate a unique token for this input request
	// Combines stepId with timestamp and random string for uniqueness across runs
	const token = `${stepId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

	// Create hook with the unique token (workflow context, no "use step")
	const hook = inputHook.create({ token });

	// Stream input request to client (includes token for submission)
	await streamInputRequest(stepId, inputs, token);

	// Wait for response via hook
	const result = await hook;
	const values = result.values as Record<string, string | boolean>;

	// For single-input shorthand, return just the value
	if (typeof schemaOrPrompt === "string") {
		return values.value as string;
	}

	return values;
}

// Simple slugify for generating stepId from prompt
function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 50);
}

// Internal: stream input request to client
async function streamInputRequest(
	stepId: string,
	inputs: Array<{ name: string; type: string; label: string }>,
	token: string,
) {
	"use step";
	const writable = getWritable<StreamMessage>();
	const writer = writable.getWriter();
	await writer.write({ type: "input", stepId, inputs, token });
	writer.releaseLock();
}
