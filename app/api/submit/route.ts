/**
 * Proxy webhook submissions
 *
 * This endpoint proxies form submissions to the workflow webhook.
 * Rewrites deployment-specific URLs to use the production URL to avoid
 * Vercel deployment protection 401 errors.
 *
 * POST /api/submit
 * Body: { webhookUrl: string, values: Record<string, string | boolean> }
 */

const PRODUCTION_HOST = process.env.VERCEL_PROJECT_PRODUCTION_URL || "vercel-workflow-ui.vercel.app";

/**
 * Rewrite deployment URLs to production URL
 * 
 * Webhook URLs come in like:
 *   https://vercel-workflow-54xjrbn0s-dan-philibins-projects.vercel.app/.well-known/...
 * 
 * We rewrite to:
 *   https://vercel-workflow-ui.vercel.app/.well-known/...
 */
function rewriteToProductionUrl(webhookUrl: string): string {
	const url = new URL(webhookUrl);

	// Check if this is a Vercel deployment URL (has hash like -abc123-)
	// e.g., vercel-workflow-54xjrbn0s-dan-philibins-projects.vercel.app
	const isDeploymentUrl = /-[a-z0-9]+-.*\.vercel\.app$/.test(url.hostname);

	if (isDeploymentUrl) {
		const originalHost = url.hostname;
		url.hostname = PRODUCTION_HOST;
		console.log(`🔄 Rewrote ${originalHost} → ${PRODUCTION_HOST}`);
	}

	return url.toString();
}

export async function POST(request: Request) {
	const { webhookUrl, values } = (await request.json()) as {
		webhookUrl: string;
		values: Record<string, string | boolean>;
	};

	if (!webhookUrl || !values) {
		return Response.json(
			{ error: "Missing webhookUrl or values" },
			{ status: 400 },
		);
	}

	const targetUrl = rewriteToProductionUrl(webhookUrl);
	console.log(`📤 Proxying submission to: ${targetUrl}`);

	try {
		const response = await fetch(targetUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ values }),
		});

		if (!response.ok) {
			console.error(`❌ Webhook failed: ${response.status}`);
			return Response.json(
				{ error: `Webhook returned ${response.status}` },
				{ status: response.status },
			);
		}

		const data = await response.json();
		return Response.json(data);
	} catch (error) {
		console.error(`❌ Webhook error:`, error);
		return Response.json(
			{ error: "Failed to submit to webhook" },
			{ status: 500 },
		);
	}
}

