/**
 * Proxy webhook submissions
 *
 * This endpoint proxies form submissions to the workflow webhook.
 * This ensures the frontend always uses a consistent URL (the production alias)
 * rather than deployment-specific URLs that the workflow generates.
 *
 * POST /api/submit
 * Body: { webhookUrl: string, values: Record<string, string | boolean> }
 */

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

	console.log(`📤 Proxying submission to: ${webhookUrl}`);

	try {
		const response = await fetch(webhookUrl, {
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

