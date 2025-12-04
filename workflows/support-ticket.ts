/**
 * Support Ticket - Example workflow using Relay
 *
 * A realistic support workflow that demonstrates all Relay APIs:
 * - output() for messages
 * - waitForInput() for collecting user input
 * - loading() with progress and complete callbacks
 */

import { loading, output, waitForInput } from "@/lib/relay";
import { sleep } from "workflow";

export async function supportTicket() {
	"use workflow";

	await output("👋 Welcome to Acme Support");

	// Collect email and look up account
	const email = await waitForInput("What's the email on your account?");

	await loading("Looking up your account...", async (_, complete) => {
		await sleep("1.5s");
		complete(`Found account: ${email}`);
	});

	// Collect issue details
	const { category, description } = await waitForInput("issue-details", {
		category: {
			type: "text",
			label: "Category (billing, technical, account, other)",
		},
		description: { type: "text", label: "Describe your issue" },
	});

	await output(`Got it — a ${category} issue.`);

	// Search knowledge base
	const kbArticles = [
		"connection-troubleshooting",
		"billing-faq",
		"account-settings",
	];
	let foundSolution = false;

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

		// Collect priority and preferences
		const { priority, urgent, emailUpdates } = await waitForInput(
			"ticket-options",
			{
				priority: { type: "text", label: "Priority (low, medium, high)" },
				urgent: { type: "checkbox", label: "This is blocking my work" },
				emailUpdates: { type: "checkbox", label: "Email me updates" },
			},
		);

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
		await output(`📋 Ticket Summary`);
		await output(`ID: ${ticketId}`);
		await output(`Category: ${category}`);
		await output(`Priority: ${priority}${urgent ? " (urgent)" : ""}`);
		await output(`Issue: ${description}`);

		if (emailUpdates) {
			await output(`📧 Updates will be sent to ${email}`);
		}

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
