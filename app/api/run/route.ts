/**
 * Start a workflow and stream its output to the client
 *
 * POST /api/run
 * Body: { workflow: "hello-relay" }
 *
 * Returns: ReadableStream of StreamMessage objects (newline-delimited JSON)
 */

import { getWorkflow } from "@/workflows";

export async function POST(request: Request) {
	const { workflow: workflowName } = (await request.json()) as {
		workflow: string;
	};

	const workflow = getWorkflow(workflowName);
	if (!workflow) {
		return Response.json({ error: "Workflow not found" }, { status: 404 });
	}

	console.log(`🚀 Starting workflow: ${workflowName}`);

	const run = await workflow.trigger();

	// Transform object stream to newline-delimited JSON strings
	const encoder = new TextEncoder();
	const jsonStream = run.readable.pipeThrough(
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
		},
	});
}
