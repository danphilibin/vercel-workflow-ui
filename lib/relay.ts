/**
 * Relay SDK (spike version)
 *
 * Provides step functions for interacting with the Relay UI.
 */

import { createWebhook } from "workflow";

const RELAY_SERVER = process.env.RELAY_SERVER || "http://localhost:3333";

/**
 * Input field schema
 */
type TextInput = { type: "text"; label: string };
type CheckboxInput = { type: "checkbox"; label: string };
type InputField = TextInput | CheckboxInput;

type InputSchema = Record<string, InputField>;

// Infer return type based on input type
type InputValue<T extends InputField> = T extends CheckboxInput
	? boolean
	: string;

/**
 * Send output text to the Relay UI
 */
export async function output(content: string) {
	"use step";
	await fetch(`${RELAY_SERVER}/message`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ type: "output", content }),
	});
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
): Promise<string | Record<string, string>> {
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

	// Create webhook - let Vercel generate unique token per run
	// (custom tokens are for long-running workflows that receive multiple events)
	const webhook = createWebhook({
		respondWith: Response.json({ received: true }),
	});

	// Send input request to UI
	await sendInputRequest(stepId, inputs, webhook.url);

	// Wait for response
	const request = await webhook;
	const { values } = (await request.json()) as {
		values: Record<string, string | boolean>;
	};

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

// Internal: send input request to UI (must be a step for durability)
async function sendInputRequest(
	stepId: string,
	inputs: Array<{ name: string; type: string; label: string }>,
	webhookUrl: string,
) {
	"use step";
	await fetch(`${RELAY_SERVER}/message`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ type: "input", stepId, inputs, webhookUrl }),
	});
}
