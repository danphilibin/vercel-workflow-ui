/**
 * Relay SDK
 *
 * Streams output and input requests directly to the client via Vercel's
 * workflow streaming. Uses defineHook for type-safe input handling.
 */

import { streamWrite } from "./stream";

export { input } from "./input";
export { loading } from "./loading";

export type {
	CheckboxInput,
	InputField,
	InputSchema,
	StreamMessage,
	TextInput,
} from "./types";

/**
 * Send output to the Relay UI
 *
 * Text output:
 *   await output("Hello world");
 *
 * Metadata table:
 *   await output.metadata({ status: "Active", plan: "Pro" });
 *   await output.metadata("Account Details", { status: "Active", plan: "Pro" });
 */
async function outputText(content: string) {
	"use step";
	await streamWrite({ type: "output", content });
}

async function outputMetadata(
	titleOrData: string | Record<string, string | number | boolean | null>,
	maybeData?: Record<string, string | number | boolean | null>,
) {
	"use step";
	const title = typeof titleOrData === "string" ? titleOrData : undefined;
	const data =
		typeof titleOrData === "string" ? (maybeData ?? {}) : titleOrData;
	await streamWrite({ type: "output", variant: "metadata", title, data });
}

type OutputFn = typeof outputText & {
	metadata: typeof outputMetadata;
};

export const output: OutputFn = Object.assign(outputText, {
	metadata: outputMetadata,
});
