/**
 * Hello Relay - Example workflow using the Relay SDK
 */

import { output, waitForInput } from "@/lib/relay";

export async function spikeWorkflow() {
	"use workflow";

	const name = await waitForInput("What's your name?");
	await output(`Hello, ${name}!`);

	const color = await waitForInput("What's your favorite color?");
	await output(`${color} is a great choice.`);

	await output("✅ Vercel Workflow complete");
}
