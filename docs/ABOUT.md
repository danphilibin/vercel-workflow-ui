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

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                                                              │
│  1. Click workflow → POST /api/run                          │
│  2. Read streaming response (chunked HTTP)                  │
│  3. Render output messages + input forms                    │
│  4. Submit input → POST directly to webhook URL             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Vercel (Next.js)                        │
│                                                              │
│  /api/run                    Workflow                        │
│  ┌──────────────┐           ┌──────────────────────────┐    │
│  │ start(wf)    │           │ output()                 │    │
│  │ return       │◄──stream──│   → getWritable()        │    │
│  │ run.readable │           │                          │    │
│  └──────────────┘           │ waitForInput()           │    │
│                             │   → getWritable() +      │    │
│  /.well-known/workflow/     │     createWebhook()      │    │
│  └─► webhook endpoint ──────┼─► await webhook          │    │
│                             │   → resume & continue    │    │
│                             └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Key Insight: No Intermediate Server

Traditional approach (our earlier "spike"):
```
Workflow → POST → Relay Server → WebSocket → Browser
Browser → WebSocket → Relay Server → POST webhook → Workflow
```

This prototype:
```
Workflow → stream → Browser
Browser → POST webhook → Workflow
```

Vercel Workflows' `getWritable()` lets workflows stream directly to HTTP responses. Combined with `createWebhook()` for input, we get bidirectional communication with **zero infrastructure**.

## Project Structure

```
relay-nextjs/
├── app/
│   ├── page.tsx           # React UI (sidebar + messages + forms)
│   └── api/
│       └── run/route.ts   # Start workflow, return stream
├── lib/
│   ├── relay.ts           # SDK: output() + waitForInput()
│   └── relay-types.ts     # Shared types (client-safe)
├── workflows/
│   ├── index.ts           # Workflow registry (server)
│   ├── manifest.ts        # Workflow names (client-safe)
│   └── hello-relay.ts     # Example workflow
└── docs/
    └── ABOUT.md           # You are here
```

## The SDK (~100 lines)

The entire Relay SDK for Vercel Workflows is remarkably small:

**`output(content)`** - Write a message to the stream
```typescript
export async function output(content: string) {
  "use step";
  const writable = getWritable<StreamMessage>();
  const writer = writable.getWriter();
  await writer.write({ type: "output", content });
  writer.releaseLock();
}
```

**`waitForInput(stepId, schema)`** - Pause for user input
```typescript
export async function waitForInput(stepId, schema) {
  const webhook = createWebhook({ respondWith: Response.json({ received: true }) });

  // Stream input request to client (includes webhook URL)
  await streamInputRequest(stepId, inputs, webhook.url);

  // Workflow pauses here until webhook is called
  const request = await webhook;
  const { values } = await request.json();
  return values;
}
```

The magic is that `webhook.url` is included in the streamed message, so the browser knows exactly where to POST the user's input.

## Input Types

Currently supported:

| Type | Schema | Returns |
|------|--------|---------|
| Text | `{ type: "text", label: "..." }` | `string` |
| Checkbox | `{ type: "checkbox", label: "..." }` | `boolean` |

Adding more (select, textarea, etc.) is straightforward—just update the schema types and client rendering.

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

### The Transform Stream Pattern

`run.readable` streams objects, but HTTP needs bytes:

```typescript
const jsonStream = run.readable.pipeThrough(
  new TransformStream({
    transform(chunk, controller) {
      const json = JSON.stringify(chunk) + "\n";
      controller.enqueue(encoder.encode(json));
    },
  }),
);
```

This converts objects to newline-delimited JSON, which the browser parses incrementally.

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

