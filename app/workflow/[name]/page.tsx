import { notFound } from "next/navigation";
import { TransactionUI } from "@/components/relay/TransactionUI";
import { getWorkflow, WORKFLOW_SLUGS } from "@/generated/workflows";

export function generateStaticParams() {
	return WORKFLOW_SLUGS.map((slug) => ({ name: slug }));
}

export default async function WorkflowPage({
	params,
}: {
	params: Promise<{ name: string }>;
}) {
	const { name } = await params;

	const workflow = getWorkflow(name);
	if (!workflow) {
		notFound();
	}

	return <TransactionUI workflow={name} />;
}
