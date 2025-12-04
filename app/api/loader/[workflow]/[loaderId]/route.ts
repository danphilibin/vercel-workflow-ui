/**
 * Loader API Route
 *
 * GET /api/loader/:workflow/:loaderId?params=...
 * POST /api/loader/:workflow/:loaderId (body: params)
 *
 * Calls registered loaders from workflow files.
 */

import { getLoader } from "@/generated/workflows";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ workflow: string; loaderId: string }> },
) {
	const { workflow, loaderId } = await params;
	const { searchParams } = new URL(request.url);

	// Parse params from query string
	const paramsJson = searchParams.get("params");
	const loaderParams = paramsJson ? JSON.parse(paramsJson) : {};

	const loader = getLoader(workflow, loaderId);
	if (!loader) {
		return Response.json(
			{ error: `Loader "${loaderId}" not found in workflow "${workflow}"` },
			{ status: 404 },
		);
	}

	try {
		const result = await loader(loaderParams);
		return Response.json(result);
	} catch (error) {
		console.error(`Loader error [${workflow}/${loaderId}]:`, error);
		return Response.json({ error: "Loader execution failed" }, { status: 500 });
	}
}

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ workflow: string; loaderId: string }> },
) {
	const { workflow, loaderId } = await params;
	const loaderParams = await request.json();

	const loader = getLoader(workflow, loaderId);
	if (!loader) {
		return Response.json(
			{ error: `Loader "${loaderId}" not found in workflow "${workflow}"` },
			{ status: 404 },
		);
	}

	try {
		const result = await loader(loaderParams);
		return Response.json(result);
	} catch (error) {
		console.error(`Loader error [${workflow}/${loaderId}]:`, error);
		return Response.json({ error: "Loader execution failed" }, { status: 500 });
	}
}
