/**
 * Support Ticket - Example workflow using Relay
 *
 * A realistic support workflow that demonstrates all Relay APIs:
 * - output() for messages
 * - input() for collecting user input
 * - loading() with progress and complete callbacks
 * - loaders for async data fetching (POC)
 */

import { sleep } from "workflow";
import { input, loading, output } from "@/lib/relay";
import type { WorkflowMeta } from "@/lib/relay/meta";

/**
 * Loader: fetchable data endpoint (POC)
 * The generator will detect exports ending in "Loader" and register them.
 */
export const issuesLoader = async (params: { page?: number }) => {
	// Simulate fetching issues - in reality this would be a DB call
	const page = params.page ?? 0;
	const fakeIssues = Array.from({ length: 5 }, (_, i) => ({
		id: `ISS-${page * 5 + i + 1}`,
		title: `Issue ${page * 5 + i + 1}`,
		status: i % 2 === 0 ? "open" : "closed",
	}));

	return {
		data: fakeIssues,
		page,
		hasMore: page < 3,
	};
};

export const meta: WorkflowMeta = {
	title: "Support Ticket",
	description: "Create a support ticket with guided troubleshooting",
	access: ["support", "admin"],
};

export async function workflow() {
	"use workflow";

	// POC: Show fetchable data from loader
	await output.fetchable("Your Recent Issues", {
		workflow: "support-ticket",
		loader: "issuesLoader",
	});

	const email = await input("What's the email on your account?");

	await loading("Looking up your account...", async (_, complete) => {
		await sleep("1.5s");
		complete(`Found account: ${email}`);
	});

	const { category, description } = await input("issue-details", {
		category: {
			type: "select",
			label: "Category",
			options: ["Billing", "Technical", "Account", "Other"],
		},
		description: { type: "text", label: "Describe your issue" },
	});

	await output(`Got it — a ${category} issue.`);

	const kbArticles = [
		"connection-troubleshooting",
		"billing-faq",
		"account-settings",
	];
	const foundSolution = false;

	await loading("Searching knowledge base...", async (progress, complete) => {
		for (let i = 0; i < kbArticles.length; i++) {
			await sleep("600ms");
			await progress(i + 1, kbArticles.length);
		}
		complete("No matching articles found");
	});

	if (!foundSolution) {
		await output(
			"I couldn't find an existing solution. Let's create a ticket for our team.",
		);

		const { priority, urgent, emailUpdates } = await input("ticket-options", {
			priority: {
				type: "select",
				label: "Priority",
				options: ["Low", "Medium", "High"],
			},
			urgent: { type: "checkbox", label: "This is blocking my work" },
			emailUpdates: { type: "checkbox", label: "Email me updates" },
		});

		// Create and assign ticket
		const ticketId = await loading(
			"Creating your ticket...",
			async (progress, complete) => {
				await sleep("800ms");
				await progress({ message: "Assigning to support team..." });
				await sleep("800ms");
				await progress({ message: "Setting up notifications..." });
				await sleep("600ms");

				const id = `TKT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
				complete(`Ticket ${id} created`);
				return id;
			},
		);

		// Summary
		await output.metadata("Ticket Summary", {
			ID: ticketId,
			Category: category,
			Priority: urgent ? `${priority} (urgent)` : priority,
			Issue: description,
			"Email Updates": emailUpdates ? email : null,
		});

		await output(
			"Our team typically responds within 2-4 hours. Thanks for your patience!",
		);

		return {
			ticketId,
			email,
			category,
			description,
			priority,
			urgent,
			emailUpdates,
		};
	}
}
