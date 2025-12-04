/**
 * Loading state management
 *
 * Show loading indicators with optional progress tracking.
 */

import { streamWrite } from "./stream";
import type { ProgressFn, CompleteFn } from "./types";

/**
 * Show a loading state while executing work
 *
 * Simple loading (no progress updates):
 *   await loading("Processing...", async () => {
 *     await doWork();
 *   });
 *
 * With numeric progress:
 *   await loading("Processing items...", async (progress) => {
 *     for (let i = 0; i < items.length; i++) {
 *       await processItem(items[i]);
 *       await progress(i + 1, items.length);
 *     }
 *   });
 *
 * With message updates:
 *   await loading("Starting...", async (progress) => {
 *     await progress({ message: "Step 1..." });
 *     await step1();
 *     await progress({ message: "Step 2..." });
 *     await step2();
 *   });
 *
 * With completion message (stays visible instead of disappearing):
 *   await loading("Looking for account...", async (progress, complete) => {
 *     const account = await findAccount();
 *     complete("Account found");
 *   });
 */
export async function loading<T>(
	message: string,
	work: (progress: ProgressFn, complete: CompleteFn) => Promise<T>,
): Promise<T> {
	const id = await streamLoadingStart(message);

	let completeMessage: string | undefined;

	const progress: ProgressFn = async (
		currentOrOpts:
			| number
			| { message?: string; current?: number; total?: number },
		total?: number,
	) => {
		if (typeof currentOrOpts === "number") {
			await streamLoadingProgress(id, { current: currentOrOpts, total });
		} else {
			await streamLoadingProgress(id, currentOrOpts);
		}
	};

	const complete: CompleteFn = (msg: string) => {
		completeMessage = msg;
	};

	try {
		const result = await work(progress, complete);
		return result;
	} finally {
		await streamLoadingEnd(id, completeMessage);
	}
}

async function streamLoadingStart(message: string): Promise<string> {
	"use step";
	// ID generated inside step so it's stable across workflow replays
	const id = `loading-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	await streamWrite({ type: "loading-start", id, message });
	return id;
}

async function streamLoadingProgress(
	id: string,
	opts: { current?: number; total?: number; message?: string },
) {
	"use step";
	await streamWrite({ type: "loading-progress", id, ...opts });
}

async function streamLoadingEnd(id: string, message?: string) {
	"use step";
	await streamWrite({ type: "loading-end", id, message });
}

