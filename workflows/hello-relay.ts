/**
 * Hello Relay - Example workflow using the Relay SDK
 */

import { sleep } from "workflow";
import { loading, output, waitForInput } from "@/lib/relay";

export async function spikeWorkflow() {
	"use workflow";

	const name = await waitForInput("What is your name?");

	await output(`Hello, ${name}!`);

	// Loading with completion message (stays visible)
	await loading("Looking up your profile...", async (_progress, complete) => {
		await sleep("2s");
		complete("Profile found!");
	});

	const { food, color, newsletter } = await waitForInput("favorites", {
		food: { type: "text", label: "Favorite food?" },
		color: { type: "text", label: "Favorite color?" },
		newsletter: { type: "checkbox", label: "Subscribe to our newsletter?" },
	});

	await output(`${food}? Delicious! And ${color} is a great choice.`);

	// Progress loading with numeric updates
	const items = [
		"Validating preferences",
		"Updating database",
		"Sending confirmation",
	];
	await loading("Saving your choices...", async (progress) => {
		for (let i = 0; i < items.length; i++) {
			await sleep("1s");
			await progress(i + 1, items.length);
		}
	});

	await output(
		newsletter ? "Thanks for subscribing!" : "No newsletter? No problem.",
	);

	await output("✅ Vercel Workflow complete");
}
