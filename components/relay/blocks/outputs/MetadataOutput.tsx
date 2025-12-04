export function MetadataOutput({
	title,
	data,
}: {
	title?: string;
	data: Record<string, string | number | boolean | null>;
}) {
	const entries = Object.entries(data);

	return (
		<div className="py-3">
			{title && (
				<div className="text-xs font-medium text-[#666] uppercase tracking-wider mb-2">
					{title}
				</div>
			)}
			<div className="border border-[#333] rounded-lg overflow-hidden">
				{entries.map(([key, value], i) => (
					<div
						key={key}
						className={`flex text-sm ${i !== entries.length - 1 ? "border-b border-[#333]" : ""}`}
					>
						<div className="px-3 py-2 w-[140px] shrink-0 bg-white/8 text-[#888] font-medium">
							{key}
						</div>
						<div className="px-3 py-2 text-[#ccc]">{formatValue(value)}</div>
					</div>
				))}
			</div>
		</div>
	);
}

function formatValue(value: string | number | boolean | null): string {
	if (value === null) return "—";
	if (typeof value === "boolean") return value ? "Yes" : "No";
	return String(value);
}
