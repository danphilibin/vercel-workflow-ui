/**
 * Workflow Manifest (client-safe)
 *
 * Just the names - no server-side imports.
 * Used by the UI to display available workflows.
 */

export const WORKFLOW_NAMES = ["hello-relay", "support-ticket"] as const;

export type WorkflowName = (typeof WORKFLOW_NAMES)[number];
