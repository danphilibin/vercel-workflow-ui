"use client";

type TextInputProps = {
	name: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	autoFocus?: boolean;
	placeholder?: string;
};

export function TextInput({
	label,
	value,
	onChange,
	disabled,
	autoFocus,
	placeholder = "Type here...",
}: TextInputProps) {
	return (
		<>
			<span className="text-base font-medium text-[#fafafa]">{label}</span>
			<input
				type="text"
				data-1p-ignore
				value={value}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
				autoFocus={autoFocus}
				placeholder={placeholder}
				className="w-full px-3 py-2.5 text-base bg-black border border-[#333] rounded-md text-[#fafafa] placeholder:text-[#666] focus:outline-none focus:border-[#888] focus:ring-[3px] focus:ring-white/5 disabled:bg-[#0a0a0a] disabled:border-[#222] disabled:text-[#888] transition-all"
			/>
		</>
	);
}

