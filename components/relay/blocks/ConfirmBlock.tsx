"use client";

const buttonStyles = {
	primary: "bg-white text-black not-disabled:hover:opacity-90",
	secondary:
		"bg-transparent text-white border border-[#333] not-disabled:hover:bg-[#1a1a1a]",
} as const;

export function ConfirmBlock({
	question,
	helpText,
	submitted,
	confirmedValue,
	onSubmit,
}: {
	question: string;
	helpText?: string;
	submitted?: boolean;
	confirmedValue?: boolean;
	onSubmit: (confirmed: boolean) => void;
}) {
	return (
		<div
			className={`my-4 p-5 rounded-xl border ${
				submitted ? "bg-[#0a0a0a] border-[#222]" : "bg-[#111] border-[#222]"
			}`}
		>
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-1">
					<p className="text-[15px] text-white">{question}</p>
					{helpText && <p className="text-[13px] text-[#888]">{helpText}</p>}
				</div>
				<div className="flex gap-2">
					<button
						type="button"
						disabled={submitted}
						onClick={() => onSubmit(true)}
						className={`px-3.5 py-2 text-[15px] font-medium rounded-md active:scale-[0.98] disabled:cursor-default transition-all ${
							submitted
								? confirmedValue === true
									? "bg-[#333] text-white"
									: "bg-transparent text-[#666] border border-[#333]"
								: buttonStyles.primary
						}`}
					>
						Confirm
					</button>
					<button
						type="button"
						disabled={submitted}
						onClick={() => onSubmit(false)}
						className={`px-3.5 py-2 text-[15px] font-medium rounded-md active:scale-[0.98] disabled:cursor-default transition-all ${
							submitted
								? confirmedValue === false
									? "bg-[#333] text-white"
									: "bg-transparent text-[#666] border border-[#333]"
								: buttonStyles.secondary
						}`}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
