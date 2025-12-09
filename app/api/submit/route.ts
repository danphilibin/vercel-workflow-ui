/**
 * Submit user input to workflow
 *
 * POST /api/submit
 * Body: { token: string, values: InputValues }
 *
 * Resumes the workflow hook with the provided values.
 */

import { inputHook } from "@/lib/relay/hooks";
import type { InputValues } from "@/lib/relay/types";

export async function POST(request: Request) {
	const { token, values } = (await request.json()) as {
		token: string;
		values: InputValues;
	};

	if (!token || !values) {
		return Response.json({ error: "Missing token or values" }, { status: 400 });
	}

	console.log(`📤 Resuming hook with token: ${token}`);

	try {
		await inputHook.resume(token, { values });
		return Response.json({ success: true });
	} catch (error) {
		console.error(`❌ Failed to resume hook:`, error);
		return Response.json(
			{ error: "Failed to resume workflow" },
			{ status: 500 },
		);
	}
}
