import type { OutputMessage } from "@/lib/relay/types";
import { MetadataOutput } from "./outputs";

export function OutputBlock({ message }: { message: OutputMessage }) {
	if (message.variant === "metadata") {
		return <MetadataOutput title={message.title} data={message.data} />;
	}

	// Default: text output
	return (
		<div className="py-3 text-base leading-relaxed text-[#888]">
			{message.content}
		</div>
	);
}
