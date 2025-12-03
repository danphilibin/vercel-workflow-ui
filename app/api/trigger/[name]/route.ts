import { getWorkflow } from "@/workflows";

export async function POST(
	_request: Request,
	{ params }: { params: Promise<{ name: string }> },
) {
	const { name } = await params;
	const workflow = getWorkflow(name);

	if (!workflow) {
		return Response.json({ error: "Workflow not found" }, { status: 404 });
	}

	try {
		console.log(`🚀 Triggering workflow: ${name}`);
		const result = await workflow.trigger();
		return Response.json({ success: true, result });
	} catch (err) {
		console.error(`Failed to trigger ${name}:`, err);
		return Response.json(
			{ error: err instanceof Error ? err.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
