/**
 * Workflow Registration Script
 *
 * Registers all workflows from workflows/index.ts with the spike server.
 *
 * Usage:
 *   bun run lib/register-workflows.ts
 */

import { WORKFLOWS } from "../workflows";

const SPIKE_SERVER = "http://localhost:3333";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function registerWorkflows() {
	console.log("📝 Registering workflows with spike server...\n");

	for (const workflow of WORKFLOWS) {
		const registration = {
			name: workflow.name,
			triggerUrl: `${APP_URL}/api/trigger/${workflow.name}`,
		};

		try {
			const res = await fetch(`${SPIKE_SERVER}/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(registration),
			});

			if (res.ok) {
				console.log(`  ✓ ${workflow.name}`);
				console.log(`    → ${registration.triggerUrl}`);
			} else {
				console.log(`  ✗ ${workflow.name} (${res.status})`);
			}
		} catch {
			console.log(`  ✗ ${workflow.name} (spike server not running?)`);
		}
	}

	console.log("\n✅ Done!");
}
