/**
 * Confirm dialog
 *
 * Prompt the user with a yes/no confirmation dialog.
 */

import { inputHook } from "./hooks";
import { streamWrite } from "./stream";
import { generateToken, slugify } from "./utils";

export type ConfirmOptions = {
	helpText?: string;
};

/**
 * Prompt the user with a confirmation dialog.
 *
 * Returns true if the user clicks "Confirm", false if they click "Cancel".
 *
 * @example
 *   const shouldContinue = await confirm("Are you sure you want to continue?");
 *
 *   const shouldDelete = await confirm("Delete this item?", {
 *     helpText: "This action cannot be undone."
 *   });
 */
export async function confirm(
	question: string,
	options?: ConfirmOptions,
): Promise<boolean> {
	const stepId = slugify(question);
	const token = generateToken(stepId);
	const hook = inputHook.create({ token });

	await streamConfirmRequest(stepId, question, token, options?.helpText);

	const result = await hook;
	const confirmed = result.values.$confirmed === true;

	await streamConfirmResponse(stepId, confirmed);

	return confirmed;
}

async function streamConfirmRequest(
	stepId: string,
	question: string,
	token: string,
	helpText?: string,
) {
	"use step";
	await streamWrite({
		type: "confirm-request",
		stepId,
		question,
		token,
		helpText,
	});
}

async function streamConfirmResponse(stepId: string, confirmed: boolean) {
	"use step";
	await streamWrite({ type: "confirm-response", stepId, confirmed });
}
