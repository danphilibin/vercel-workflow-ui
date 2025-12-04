"use client";

type CheckboxInputProps = {
	name: string;
	label: string;
	value: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
};

export function CheckboxInput({
	label,
	value,
	onChange,
	disabled,
}: CheckboxInputProps) {
	return (
		<div className="flex items-center gap-2.5 cursor-pointer py-1">
			<input
				type="checkbox"
				checked={value}
				onChange={(e) => onChange(e.target.checked)}
				disabled={disabled}
				className="checkbox-custom"
			/>
			<span className={`text-base select-none ${disabled ? "opacity-70" : ""}`}>
				{label}
			</span>
		</div>
	);
}
