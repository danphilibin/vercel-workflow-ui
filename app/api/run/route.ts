/**
 * Start a workflow
 *
 * POST /api/run
 * Body: { workflow: "hello-relay" }
 *
 * Returns: { runId: string }
 *
 * To stream the output, use GET /api/stream/:runId
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

	console.log(`✅ Workflow started with runId: ${run.runId}`);

	// Return runId - client will connect to /api/stream/:runId for output
	return Response.json({ runId: run.runId });
}
