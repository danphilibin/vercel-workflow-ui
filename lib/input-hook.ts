/**
 * Input Hook Definition
 *
 * A typed hook for receiving user input in workflows.
 * Used by waitForInput() in workflows and resumed by /api/submit.
 */

import { defineHook } from "workflow";
import { z } from "zod";

// Define the input payload type
type InputPayload = {
	values: Record<string, string | boolean>;
};

// Zod schema for validation
const inputSchema = z.object({
	values: z.record(z.string(), z.union([z.string(), z.boolean()])),
});

export const inputHook = defineHook<InputPayload>({
	schema: inputSchema,
});
