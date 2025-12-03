import { sleep } from "workflow";
import { FatalError } from "workflow";

async function createUser(email: string) {
	"use step";

	console.log(`Creating user with email: ${email}`);

	// Full Node.js access - database calls, APIs, etc.
	return { id: crypto.randomUUID(), email };
}

async function sendWelcomeEmail(user: { id: string; email: string }) {
	"use step";

	console.log(`Sending welcome email to user: ${user.id}`);

	if (Math.random() < 0.3) {
		// By default, steps will be retried for unhandled errors
		throw new Error("Retryable!");
	}
}

async function sendOnboardingEmail(user: { id: string; email: string }) {
	"use step";

	if (!user.email.includes("@")) {
		// To skip retrying, throw a FatalError instead
		throw new FatalError("Invalid Email");
	}

	console.log(`Sending onboarding email to user: ${user.id}`);
}

export async function handleUserSignup() {
	"use workflow";

	const email = "dan@danphilibin.com";

	const user = await createUser(email);

	await sendWelcomeEmail(user);

	await sleep("5s"); // Pause for 5s - doesn't consume any resources

	await sendOnboardingEmail(user);

	console.log(
		"Workflow is complete! Run 'npx workflow web' to inspect your run",
	);

	return { userId: user.id, status: "onboarded" };
}
