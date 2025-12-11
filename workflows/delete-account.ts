/**
 * Delete Account - Example workflow demonstrating confirm()
 */

import { sleep } from "workflow";
import { confirm, input, loading, output } from "@/lib/relay";
import type { WorkflowMeta } from "@/lib/relay/meta";

export const meta: WorkflowMeta = {
	title: "Delete Account",
	description: "Permanently delete your account and all associated data",
	access: ["admin"],
};

export async function workflow() {
	"use workflow";

	const email = await input("What's the email of the account to delete?");

	await loading("Looking up account...", async ({ complete }) => {
		await sleep("1s");
		complete(`Found account: ${email}`);
	});

	const confirmed = await confirm(
		"Are you sure you want to delete this account?",
		{
			helpText:
				"This action cannot be undone. All data will be permanently removed.",
		},
	);

	if (!confirmed) {
		await output("Account deletion cancelled.");
		return { deleted: false, email };
	}

	await loading("Deleting account...", async ({ progress, complete }) => {
		await progress({ message: "Removing user data..." });
		await sleep("800ms");
		await progress({ message: "Cancelling subscriptions..." });
		await sleep("600ms");
		await progress({ message: "Sending confirmation email..." });
		await sleep("400ms");
		complete("Account deleted");
	});

	await output(`Account ${email} has been permanently deleted.`);

	return { deleted: true, email };
}
