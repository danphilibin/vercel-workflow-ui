import { TransactionUI } from "@/components/relay";

export default async function WorkflowRunPage({
	params,
}: {
	params: Promise<{ name: string; runId: string }>;
}) {
	const { name, runId } = await params;

	return <TransactionUI workflow={name} runId={runId} />;
}
