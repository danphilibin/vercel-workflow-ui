/**
 * Hello Relay - Example workflow using the Relay SDK
 */

import { output, waitForInput } from "@/lib/relay";

export async function spikeWorkflow() {
	"use workflow";

	const name = await waitForInput("What is your name?");

	await output(`Hello, ${name}!`);

	const { food, color, newsletter } = await waitForInput("favorites", {
		food: { type: "text", label: "Favorite food?" },
		color: { type: "text", label: "Favorite color?" },
		newsletter: { type: "checkbox", label: "Subscribe to our newsletter?" },
	});

	await output(`${food}? Delicious! And ${color} is a great choice.`);
	await output(
		newsletter ? "Thanks for subscribing!" : "No newsletter? No problem.",
	);

	await output("✅ Vercel Workflow complete");
}
