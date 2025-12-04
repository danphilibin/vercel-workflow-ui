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

import { start } from "workflow/api";
import { getWorkflow } from "@/generated/workflows";

export async function POST(request: Request) {
	const { workflow: workflowSlug } = (await request.json()) as {
		workflow: string;
	};

	const entry = getWorkflow(workflowSlug);
	if (!entry) {
		return Response.json({ error: "Workflow not found" }, { status: 404 });
	}

	console.log(`🚀 Starting workflow: ${entry.title} (${workflowSlug})`);

	// Dynamic import and start
	const mod = await entry.import();
	const run = await start(mod.workflow);

	console.log(`✅ Workflow started with runId: ${run.runId}`);

	// Return runId - client will connect to /api/stream/:runId for output
	return Response.json({ runId: run.runId });
}
