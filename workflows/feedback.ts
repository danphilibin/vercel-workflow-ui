/**
 * Feedback - Simple workflow demonstrating button choices
 *
 * A quick feedback form that shows custom button usage.
 */

import { sleep } from "workflow";
import { input, loading, output } from "@/lib/relay";
import type { WorkflowMeta } from "@/lib/relay/meta";

export const meta: WorkflowMeta = {
	title: "Quick Feedback",
	description: "Share your thoughts with us",
	access: ["support", "admin"],
};

export async function workflow() {
	"use workflow";

	const { $choice } = await input("How was your experience today?", {
		buttons: ["😊 Great", "😐 Okay", "😞 Not good"],
	});

	if ($choice === "😊 Great") {
		const { value: testimonial, $choice: action } = await input(
			"Awesome! Would you mind sharing what you liked?",
			{ buttons: ["Submit", "Skip"] },
		);

		if (action === "Submit" && testimonial.trim()) {
			await loading("Saving your feedback...", async ({ complete }) => {
				await sleep("800ms");
				complete("Feedback saved");
			});
			await output("Thanks for sharing! We really appreciate it. 💙");
		} else {
			await output("No worries! Thanks for the positive feedback. 🙌");
		}
	} else if ($choice === "😐 Okay") {
		await output(
			"Thanks for letting us know. We're always working to improve!",
		);
	} else {
		const { issue, $choice: action } = await input(
			"feedback-details",
			{
				issue: { type: "text", label: "What could we do better?" },
			},
			{
				buttons: [
					{ label: "Send Feedback", intent: "primary" },
					{ label: "Skip", intent: "secondary" },
				],
			},
		);

		if (action === "Send Feedback" && issue.trim()) {
			await loading("Submitting feedback...", async ({ complete }) => {
				await sleep("800ms");
				complete("Feedback submitted");
			});
			await output("Thank you for helping us improve. We'll look into this!");
		} else {
			await output("Thanks for your time. We hope to do better next time.");
		}
	}

	return { choice: $choice };
}
