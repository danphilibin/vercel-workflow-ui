"use client";

type TextInputProps = {
	name: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	autoFocus?: boolean;
	placeholder?: string;
	error?: boolean;
	optional?: boolean;
};

export function TextInput({
	label,
	value,
	onChange,
	disabled,
	autoFocus,
	placeholder = "Type here...",
	error,
	optional,
}: TextInputProps) {
	return (
		<>
			<span className="text-base font-medium text-[#fafafa]">
				{label}
				{optional && (
					<span className="ml-1.5 text-sm font-normal text-[#666]">
						(optional)
					</span>
				)}
			</span>
			<input
				type="text"
				data-1p-ignore
				value={value}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
				autoFocus={autoFocus}
				placeholder={placeholder}
				className={`w-full px-3 py-2.5 text-base bg-black border rounded-md text-[#fafafa] placeholder:text-[#666] focus:outline-none focus:ring-[3px] disabled:bg-[#0a0a0a] disabled:border-[#222] disabled:text-[#888] transition-all ${
					error
						? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
						: "border-[#333] focus:border-[#888] focus:ring-white/5"
				}`}
			/>
			{error && (
				<span className="text-sm text-red-400">This field is required</span>
			)}
		</>
	);
}
