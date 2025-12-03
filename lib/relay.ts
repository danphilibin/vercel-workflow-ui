/**
 * Relay SDK (spike version)
 *
 * Provides step functions for interacting with the Relay UI.
 */

import { createWebhook } from "workflow";

const RELAY_SERVER = process.env.RELAY_SERVER || "http://localhost:3333";

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
 * Wait for text input from the user
 * Creates a webhook, sends the prompt to the UI, and waits for a response
 */
export async function waitForInput(prompt: string): Promise<string> {
	const id = crypto.randomUUID();
	const webhook = createWebhook({
		respondWith: Response.json({ received: true }),
	});

	await sendInputPrompt(prompt, id, webhook.url);

	const request = await webhook;
	const { value } = (await request.json()) as { value: string };
	return value;
}

// Internal: send input prompt to UI (must be a step for durability)
async function sendInputPrompt(prompt: string, id: string, webhookUrl: string) {
	"use step";
	await fetch(`${RELAY_SERVER}/message`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ type: "input", prompt, id, webhookUrl }),
	});
}

