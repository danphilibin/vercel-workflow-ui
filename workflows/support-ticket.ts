/**
 * Support Ticket - Example workflow using Relay
 *
 * Collects issue details, priority, and contact preferences,
 * then outputs a ticket confirmation.
 */

import { output, waitForInput } from "@/lib/relay";

export async function supportTicket() {
	"use workflow";

	await output("Let's create a support ticket for you.");

	const { subject, description } = await waitForInput("issue-details", {
		subject: { type: "text", label: "Subject" },
		description: { type: "text", label: "Describe your issue" },
	});

	const { priority, emailUpdates } = await waitForInput("ticket-options", {
		priority: { type: "text", label: "Priority (low, medium, high)" },
		emailUpdates: { type: "checkbox", label: "Send me email updates" },
	});

	const ticketId = `TKT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

	await output(`✓ Ticket created: ${ticketId}`);
	await output(`Subject: ${subject}`);
	await output(`Priority: ${priority}`);

	if (emailUpdates) {
		await output("You'll receive email updates on this ticket.");
	}

	await output("Our team will review your issue shortly.");

	return { ticketId, subject, description, priority, emailUpdates };
}

