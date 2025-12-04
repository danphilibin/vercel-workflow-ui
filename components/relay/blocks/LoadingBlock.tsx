export function LoadingBlock({
	message,
	current,
	total,
	completed,
}: {
	message: string;
	current?: number;
	total?: number;
	completed?: boolean;
}) {
	const hasProgress =
		current !== undefined && total !== undefined && !completed;
	const percent = hasProgress ? Math.round((current / total) * 100) : null;

	return (
		<div
			className={`my-4 p-4 rounded-xl border ${completed ? "border-[#1a3a1a] bg-[#0a150a]" : "border-[#222] bg-[#0a0a0a]"}`}
		>
			<div className="flex items-center gap-3">
				<div className="relative w-5 h-5">
					{completed ? (
						<svg
							className="w-5 h-5 text-green-500"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<circle
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="2"
								className="opacity-30"
							/>
							<path
								d="M8 12l3 3 5-6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					) : (
						<svg
							className="w-5 h-5 animate-spin"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<circle
								className="opacity-20"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="3"
							/>
							<path
								className="opacity-80"
								d="M12 2a10 10 0 0 1 10 10"
								stroke="currentColor"
								strokeWidth="3"
								strokeLinecap="round"
							/>
						</svg>
					)}
				</div>
				<div className="flex-1 min-w-0">
					<div
						className={`text-base ${completed ? "text-green-500/90" : "text-[#888]"}`}
					>
						{message}
					</div>
					{hasProgress && (
						<div className="mt-2 flex items-center gap-3">
							<div className="flex-1 h-1.5 bg-[#222] rounded-full overflow-hidden">
								<div
									className="h-full bg-white/70 rounded-full transition-all duration-300 ease-out"
									style={{ width: `${percent}%` }}
								/>
							</div>
							<span className="text-sm text-[#666] tabular-nums">
								{current}/{total}
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
