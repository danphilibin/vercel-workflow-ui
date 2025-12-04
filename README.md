# Relay

**UI layer for durable workflows.** Relay lets workflows pause for human input, collect data in a browser, and resume execution seamlessly.

Built on [Vercel Workflows](https://vercel.com/docs/workflow-kit).

## What It Does

```typescript
const { name, email } = await waitForInput("user-info", {
  name: { type: "text", label: "Your name" },
  email: { type: "text", label: "Email address" },
});

await output(`Thanks, ${name}!`);
```

- Workflows **stream** output to the browser in real-time
- `waitForInput()` **pauses** the workflow until the user submits
- No polling, no WebSockets—just HTTP streaming + webhooks

## Quick Start

```bash
bun install
bun run dev
open http://localhost:3000
```

## Adding a Workflow

Create a file in `workflows/`:

```typescript
// workflows/my-workflow.ts
import { output, waitForInput } from "@/lib/relay";
import type { WorkflowMeta } from "@/lib/relay/meta";

export const meta: WorkflowMeta = {
  title: "My Workflow",
  description: "Does something useful",
};

export async function workflow() {
  "use workflow";
  
  await output("Hello!");
  const name = await waitForInput("What's your name?");
  await output(`Nice to meet you, ${name}!`);
}
```

That's it—the registry auto-generates on save.

**Nested routes:** `workflows/users/create.ts` → `/workflow/users/create`

## Docs

See [docs/ABOUT.md](docs/ABOUT.md) for architecture details and production considerations.
