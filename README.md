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
# Install dependencies
bun install

# Start dev server
npx vercel dev

# Open browser
open http://localhost:3000
```

Click a workflow in the sidebar to run it. Messages appear as they're streamed, forms render when input is needed, and the workflow resumes when you submit.

## Project Structure

```
├── app/
│   ├── page.tsx              # UI (sidebar + messages + forms)
│   └── api/run/route.ts      # Start workflow, return stream
├── lib/
│   ├── relay.ts              # SDK: output() + waitForInput()
│   └── relay-types.ts        # Shared types
├── workflows/
│   ├── index.ts              # Workflow registry
│   └── hello-relay.ts        # Example workflow
└── docs/
    └── ABOUT.md              # Detailed architecture docs
```

## Adding a Workflow

1. Create `workflows/my-workflow.ts`:

```typescript
import { output, waitForInput } from "@/lib/relay";

export async function myWorkflow() {
  "use workflow";
  
  await output("Hello!");
  const name = await waitForInput("What's your name?");
  await output(`Nice to meet you, ${name}!`);
}
```

2. Register in `workflows/index.ts`:

```typescript
import { myWorkflow } from "./my-workflow";

export const WORKFLOWS = [
  // ...existing
  { name: "my-workflow", trigger: () => start(myWorkflow) },
];
```

3. Add to `workflows/manifest.ts`:

```typescript
export const WORKFLOW_NAMES = [
  // ...existing
  "my-workflow",
] as const;
```

## Docs

See [docs/ABOUT.md](docs/ABOUT.md) for detailed architecture, how the SDK works, and production considerations.
