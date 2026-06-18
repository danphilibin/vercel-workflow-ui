import { TransactionUI } from "@/components/relay/TransactionUI";

export default async function WorkflowRunPage({
	params,
}: {
	params: Promise<{ name: string; runId: string }>;
}) {
	const { name, runId } = await params;

	return <TransactionUI workflow={name} runId={runId} />;
}
