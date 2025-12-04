/**
 * Workflow hooks
 *
 * Typed hooks for workflow-client communication.
 * Used internally by relay SDK and resumed by API routes.
 */

import { defineHook } from "workflow";
import { z } from "zod";

type InputPayload = {
	values: Record<string, string | boolean>;
};

const inputSchema = z.object({
	values: z.record(z.string(), z.union([z.string(), z.boolean()])),
});

export const inputHook = defineHook<InputPayload>({
	schema: inputSchema,
});
