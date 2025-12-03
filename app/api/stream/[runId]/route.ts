/**
 * Stream workflow output
 *
 * GET /api/stream/:runId
 * Query params:
 *   - startIndex: (optional) Resume from a specific chunk index
 *
 * Returns: ReadableStream of StreamMessage objects (newline-delimited JSON)
 */

import { getRun } from "workflow/api";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ runId: string }> },
) {
	const { runId } = await params;
	const { searchParams } = new URL(request.url);

	// Optional: resume from a specific index
	const startIndexParam = searchParams.get("startIndex");
	const startIndex = startIndexParam
		? parseInt(startIndexParam, 10)
		: undefined;

	console.log(`📡 Streaming run: ${runId}${startIndex !== undefined ? ` from index ${startIndex}` : ""}`);

	try {
		const run = getRun(runId);
		const readable = run.getReadable({ startIndex });

		// Transform object stream to newline-delimited JSON strings
		const encoder = new TextEncoder();
		const jsonStream = readable.pipeThrough(
			new TransformStream({
				transform(chunk, controller) {
					const json = JSON.stringify(chunk) + "\n";
					controller.enqueue(encoder.encode(json));
				},
			}),
		);

		return new Response(jsonStream, {
			headers: {
				"Content-Type": "application/x-ndjson",
				"Transfer-Encoding": "chunked",
				"Cache-Control": "no-cache",
			},
		});
	} catch (error) {
		console.error(`❌ Failed to stream run ${runId}:`, error);
		return Response.json(
			{ error: "Run not found or stream unavailable" },
			{ status: 404 },
		);
	}
}

