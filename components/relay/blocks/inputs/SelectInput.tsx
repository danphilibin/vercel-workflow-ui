"use client";

type SelectInputProps = {
	name: string;
	label: string;
	value: string;
	options: Array<string | { value: string; label: string }>;
	onChange: (value: string) => void;
	disabled?: boolean;
	autoFocus?: boolean;
};

export function SelectInput({
	label,
	value,
	options,
	onChange,
	disabled,
	autoFocus,
}: SelectInputProps) {
	return (
		<>
			<span className="text-base font-medium text-[#fafafa]">{label}</span>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
				autoFocus={autoFocus}
				className="w-full px-3 py-2.5 text-base bg-black border border-[#333] rounded-md text-[#fafafa] focus:outline-none focus:border-[#888] focus:ring-[3px] focus:ring-white/5 disabled:bg-[#0a0a0a] disabled:border-[#222] disabled:text-[#888] transition-all appearance-none cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMS41TDYgNi41TDExIDEuNSIgc3Ryb2tlPSIjODg4IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-position-[right_12px_center]"
			>
				{options.map((option) => {
					const optionValue =
						typeof option === "string" ? option : option.value;
					const optionLabel =
						typeof option === "string" ? option : option.label;
					return (
						<option key={optionValue} value={optionValue}>
							{optionLabel}
						</option>
					);
				})}
			</select>
		</>
	);
}

