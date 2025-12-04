import { notFound } from "next/navigation";
import { TransactionUI } from "@/components/relay";
import { WORKFLOW_NAMES } from "@/workflows/manifest";

export function generateStaticParams() {
	return WORKFLOW_NAMES.map((name) => ({ name }));
}

export default async function WorkflowPage({
	params,
}: {
	params: Promise<{ name: string }>;
}) {
	const { name } = await params;

	if (!WORKFLOW_NAMES.includes(name as (typeof WORKFLOW_NAMES)[number])) {
		notFound();
	}

	return <TransactionUI workflow={name} />;
}
