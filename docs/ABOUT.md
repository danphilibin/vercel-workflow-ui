# Relay (Vercel Workflows Edition)

Relay is the **UI layer for durable workflows**. It lets workflows pause for human input, collect data in a browser, and resume execution seamlessly. This repo is a self-contained prototype built on **Vercel Workflows**.

## What We're Building

The core idea: durable functions that can **pause and wait for user input**.

```typescript
import { output, waitForInput } from "@/lib/relay";

export async function onboardUser() {
	"use workflow";

	await output("Welcome! Let's get you set up.");

	const { name, email, newsletter } = await waitForInput("user-info", {
		name: { type: "text", label: "Your name" },
		email: { type: "text", label: "Email address" },
		newsletter: { type: "checkbox", label: "Subscribe to updates?" },
	});

	await output(`Thanks, ${name}! Check ${email} for next steps.`);

	if (newsletter) {
		// subscribe to newsletter...
	}

	return { name, email, newsletter };
}
```

The workflow **streams** output to the browser in real-time and **pauses** at `waitForInput()` until the user submits the form. No polling, no external message queues—just HTTP streaming and webhooks.

## API Ergonomics

Three ways to call `waitForInput`:

```typescript
// Simplest - auto-generates stepId from prompt
const name = await waitForInput("What's your name?");

// Explicit stepId
const name = await waitForInput("get-name", "What's your name?");

// Multiple inputs with schema
const { name, color } = await waitForInput("user-info", {
	name: { type: "text", label: "Your name" },
	color: { type: "text", label: "Favorite color" },
});
```

## Production Considerations

This prototype skips auth for simplicity. For production:

1. **Don't expose webhook URLs** - Have the client POST to your own `/api/submit` endpoint
2. **Track run ownership** - Map `runId → userId` in your database
3. **Validate on submit** - Ensure the user owns the run before forwarding to webhook
4. **Add auth middleware** - Protect `/api/run` and workflow list

The underlying architecture (streaming + webhooks) is production-ready—it's what Vercel Workflows is designed for.

## Learnings

### HTTP Streaming > WebSockets (for this use case)

We originally built a "spike" with WebSockets for real-time updates. Turns out Vercel's streaming is simpler and works everywhere:

- No WebSocket server to maintain
- No connection state to manage
- Works on serverless (Vercel) out of the box
- Same real-time feel

### Webhooks Are the Right Primitive for Input

Vercel's `createWebhook()` is perfect for "wait for external event":

- Generates a unique URL per wait point
- Workflow suspends until webhook is called
- Caller can include arbitrary payload
- Built-in timeout handling

## Running Locally

```bash
# Install dependencies
bun install

# Start dev server
npx vercel dev

# Open browser
open http://localhost:3000
```

Click a workflow in the sidebar to run it. Messages stream in real-time, forms appear when input is needed, and the workflow resumes when you submit.

## Next Steps

- [ ] More input types (select, textarea, number)
- [ ] Output blocks (tables, JSON, images)
- [ ] Auth layer for production
- [ ] Deploy to Vercel and test cold starts
- [ ] Compare latency with other durable workflow platforms
