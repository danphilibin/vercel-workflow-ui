/**
 * Workflow Registry
 *
 * Single source of truth for all workflows.
 * Add new workflows here - they'll automatically be available
 * in the trigger route and registration script.
 */

import { start } from "workflow/api";
import { spikeWorkflow } from "./hello-relay";
import { handleUserSignup } from "./user-signup";

export type WorkflowEntry = {
	name: string;
	trigger: () => Promise<unknown>;
};

// Add new workflows here
export const WORKFLOWS: WorkflowEntry[] = [
	{
		name: "hello-relay",
		trigger: () => start(spikeWorkflow),
	},
	{
		name: "user-signup",
		trigger: () => start(handleUserSignup),
	},
];

// Helper to get workflow by name
export function getWorkflow(name: string): WorkflowEntry | undefined {
	return WORKFLOWS.find((w) => w.name === name);
}
