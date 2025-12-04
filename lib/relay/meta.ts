/**
 * Workflow Metadata Types
 *
 * These types define the metadata that can be exported from workflow files.
 * The codegen script extracts this metadata to build the registry.
 */

export type WorkflowMeta = {
	/** Display title for the workflow */
	title: string;
	/** Short description of what the workflow does */
	description?: string;
	/** Teams/roles that can access this workflow (empty = public) */
	access?: string[];
	/** Hide from UI but still callable via API */
	unlisted?: boolean;
};

/**
 * Generated workflow entry (output of codegen)
 */
export type WorkflowEntry = WorkflowMeta & {
	/** URL-safe slug derived from file path (e.g., "support/ticket") */
	slug: string;
	/** Path segments for building nested navigation */
	path: string[];
	/** Dynamic import function for the workflow module */
	import: () => Promise<{ workflow: () => Promise<unknown> }>;
};
