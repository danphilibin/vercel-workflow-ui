export function SystemBlock({ content }: { content: string }) {
	return (
		<div className="py-3 text-base text-[#666] flex items-center gap-2">
			<span className="w-1.5 h-1.5 rounded-full bg-[#666] animate-pulse-dot" />
			{content}
		</div>
	);
}
