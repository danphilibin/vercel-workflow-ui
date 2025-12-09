/**
 * Hello Relay - Example workflow using the Relay SDK
 */

import { sleep } from "workflow";
import { input, loading, output } from "@/lib/relay";
import type { WorkflowMeta } from "@/lib/relay/meta";

export const meta: WorkflowMeta = {
	title: "Hello Relay",
	description: "A simple demo of Relay's output and input capabilities",
};

export async function workflow() {
	"use workflow";

	const name = await input("What is your name?");

	await loading("Looking up your profile...", async ({ complete }) => {
		await sleep("2s");
		complete("Profile found!");
	});

	await output(`Hello, ${name}!`);
}
