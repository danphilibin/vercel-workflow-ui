# Relay

Relay is a UI layer built on top of [Vercel Workflows](https://vercel.com/docs/workflow-kit). It lets workflows pause to `await` input from a browser and resume execution seamlessly.

```typescript
import { input, loading, output } from "@/lib/relay";

export async function createSupportTicket() {
	"use workflow";

	// Displays a text input in the browser
	const email = await input("Enter your email address");

	// Dynamic loading states
	await loading("Looking up your profile...", async (progress, complete) => {
		// Make API/DB calls, etc
		complete("Profile found!");
	});

	// Supports multiple inputs per step; response object is type-safe
	const { issue, priority } = await input("What is your issue?", {
		issue: { type: "text", label: "Describe your issue", lines: 3 },
		priority: { type: "select", options: ["High", "Medium", "Low"] },
		notifyWhenResolved: { type: "boolean", label: "Notify when resolved?", defaultValue: true },
	});

	// Call your own code, etc. 

	// Display output as markdown, tables, etc.
	await output(`✅ Ticket created. **Reference number: DP-1025**`);
}
```

- Workflows stream UI instructions to the browser
- `input()` pauses the workflow until the user submits
- Built on top of [Vercel Workflows](https://vercel.com/docs/workflow-kit) for durability, resumability, etc. 

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
import { output, input } from "@/lib/relay";
import type { WorkflowMeta } from "@/lib/relay/meta";

export const meta: WorkflowMeta = {
	title: "My Workflow",
	description: "Does something useful",
};

export async function workflow() {
	"use workflow";

	await output("Hello!");
	const name = await input("What's your name?");
	await output(`Nice to meet you, ${name}!`);
}
```

That's it—the registry auto-generates on save.

**Nested routes:** `workflows/users/create.ts` → `/workflow/users/create`

## Docs

See [docs/ABOUT.md](docs/ABOUT.md) for architecture details and production considerations.
