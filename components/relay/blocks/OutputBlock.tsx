import type { OutputMessage } from "@/lib/relay/types";
import { FetchableOutput, MetadataOutput } from "./outputs";

export function OutputBlock({ message }: { message: OutputMessage }) {
	if (message.variant === "metadata") {
		return <MetadataOutput title={message.title} data={message.data} />;
	}

	if (message.variant === "fetchable") {
		return (
			<FetchableOutput
				title={message.title}
				workflow={message.workflow}
				loader={message.loader}
			/>
		);
	}

	// Default: text output
	return (
		<div className="py-3 text-base leading-relaxed text-[#888]">
			{message.content}
		</div>
	);
}
