/**
 * Workflow Registry
 *
 * Single source of truth for all workflows.
 * Add new workflows here - they'll automatically be available
 * in the trigger route and registration script.
 */

import { start, type Run } from "workflow/api";
import { spikeWorkflow } from "./hello-relay";
import { supportTicket } from "./support-ticket";

export type WorkflowEntry = {
	name: string;
	trigger: () => Promise<Run>;
};

// Add new workflows here
export const WORKFLOWS: WorkflowEntry[] = [
	{
		name: "hello-relay",
		trigger: () => start(spikeWorkflow),
	},
	{
		name: "support-ticket",
		trigger: () => start(supportTicket),
	},
];

// Helper to get workflow by name
export function getWorkflow(name: string): WorkflowEntry | undefined {
	return WORKFLOWS.find((w) => w.name === name);
}
