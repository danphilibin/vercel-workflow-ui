/**
 * Internal stream utilities
 *
 * Low-level helpers for writing to the workflow stream.
 * Not intended for direct use by workflow authors.
 */

import { getWritable } from "workflow";
import type { StreamMessage } from "./types";

/**
 * Writes a message to the workflow stream.
 * Must be called within a "use step" context.
 */
export async function streamWrite(message: StreamMessage): Promise<void> {
	const writable = getWritable<StreamMessage>();
	const writer = writable.getWriter();
	await writer.write(message);
	writer.releaseLock();
}
