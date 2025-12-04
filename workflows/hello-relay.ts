/**
 * Hello Relay - Example workflow using the Relay SDK
 */

import { sleep } from "workflow";
import { loading, output, waitForInput } from "@/lib/relay";
import type { WorkflowMeta } from "@/lib/relay/meta";

export const meta: WorkflowMeta = {
	title: "Hello Relay",
	description: "A simple demo of Relay's output and input capabilities",
};

export async function workflow() {
	"use workflow";

	const name = await waitForInput("What is your name?");

	await output(`Hello, ${name}!`);

	// Loading with completion message (stays visible)
	await loading("Looking up your profile...", async (_progress, complete) => {
		await sleep("2s");
		complete("Profile found!");
	});

	await output("✅ Workflow complete");
}
