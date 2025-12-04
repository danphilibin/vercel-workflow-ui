/**
 * Relay SDK
 *
 * Streams output and input requests directly to the client via Vercel's
 * workflow streaming. Uses defineHook for type-safe input handling.
 */

import { streamWrite } from "./stream";

export { loading } from "./loading";
export { waitForInput } from "./input";

export type {
	StreamMessage,
	InputField,
	InputSchema,
	TextInput,
	CheckboxInput,
} from "./types";

/**
 * Send output text to the Relay UI
 */
export async function output(content: string) {
	"use step";
	await streamWrite({ type: "output", content });
}
