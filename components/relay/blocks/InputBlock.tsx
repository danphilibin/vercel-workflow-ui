"use client";

import { useState } from "react";
import type { ButtonDef, InputSchema, InputValues } from "@/lib/relay/types";
import { CheckboxInput } from "./inputs/CheckboxInput";
import { SelectInput } from "./inputs/SelectInput";
import { TextInput } from "./inputs/TextInput";

function getButtonLabel(button: ButtonDef): string {
	return typeof button === "string" ? button : button.label;
}

function getButtonIntent(button: ButtonDef): string {
	if (typeof button === "string") return "primary";
	return button.intent ?? "primary";
}

const buttonStyles = {
	primary: "bg-white text-black not-disabled:hover:opacity-90",
	secondary:
		"bg-transparent text-white border border-[#333] not-disabled:hover:bg-[#1a1a1a]",
	danger: "bg-red-600 text-white not-disabled:hover:bg-red-700",
} as const;

export function InputBlock({
	blocks,
	buttons,
	submitted,
	submittedValues,
	onSubmit,
}: {
	blocks: InputSchema;
	buttons?: ButtonDef[];
	submitted?: boolean;
	submittedValues?: InputValues;
	onSubmit: (values: InputValues) => void;
}) {
	const [values, setValues] = useState<Record<string, string | boolean>>(() => {
		const initial: Record<string, string | boolean> = {};
		for (const [name, block] of Object.entries(blocks)) {
			if (block.type === "checkbox") {
				initial[name] = false;
			} else if (block.type === "select" && block.options?.length) {
				const firstOption = block.options[0];
				initial[name] =
					typeof firstOption === "string" ? firstOption : firstOption.value;
			} else {
				initial[name] = "";
			}
		}
		return initial;
	});
	const [errors, setErrors] = useState<Record<string, boolean>>({});

	const blockEntries = Object.entries(blocks);

	function validateAndSubmit(choice?: string): boolean {
		const newErrors: Record<string, boolean> = {};
		for (const [name, block] of blockEntries) {
			const isRequired =
				!block.optional && block.type !== "checkbox" && block.type !== "select";
			const isEmpty =
				typeof values[name] === "string" &&
				(values[name] as string).trim() === "";
			if (isRequired && isEmpty) {
				newErrors[name] = true;
			}
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return false;
		}

		const submitValues =
			choice !== undefined ? { ...values, $choice: choice } : values;
		onSubmit(submitValues);
		return true;
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		validateAndSubmit();
	}

	function handleButtonClick(button: ButtonDef) {
		const label = getButtonLabel(button);
		validateAndSubmit(label);
	}

	return (
		<div
			className={`my-4 p-5 rounded-xl border ${
				submitted ? "bg-[#0a0a0a] border-[#222]" : "bg-[#111] border-[#222]"
			}`}
		>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				{blockEntries.map(([name, block], index) => (
					<label key={name} className="flex flex-col gap-2">
						{block.type === "checkbox" ? (
							<CheckboxInput
								name={name}
								label={block.label}
								value={
									(submitted
										? submittedValues?.[name]
										: values[name]) as boolean
								}
								onChange={(checked) =>
									setValues((v) => ({ ...v, [name]: checked }))
								}
								disabled={submitted}
							/>
						) : block.type === "select" ? (
							<SelectInput
								name={name}
								label={block.label}
								value={
									(submitted ? submittedValues?.[name] : values[name]) as string
								}
								options={block.options || []}
								onChange={(value) =>
									setValues((v) => ({ ...v, [name]: value }))
								}
								disabled={submitted}
								autoFocus={index === 0 && !submitted}
							/>
						) : (
							<TextInput
								name={name}
								label={block.label}
								value={
									(submitted ? submittedValues?.[name] : values[name]) as string
								}
								onChange={(value) => {
									setValues((v) => ({ ...v, [name]: value }));
									if (errors[name]) {
										setErrors((e) => ({ ...e, [name]: false }));
									}
								}}
								disabled={submitted}
								autoFocus={index === 0 && !submitted}
								error={errors[name]}
								optional={block.optional}
							/>
						)}
					</label>
				))}
				<div className="flex gap-2">
					{buttons && buttons.length > 0 ? (
						buttons.map((button) => {
							const label = getButtonLabel(button);
							const intent = getButtonIntent(button);
							const isSelected =
								submitted && submittedValues?.$choice === label;
							return (
								<button
									key={label}
									type="button"
									disabled={submitted}
									onClick={() => handleButtonClick(button)}
									className={`px-3.5 py-2 text-[15px] font-medium rounded-md active:scale-[0.98] disabled:cursor-default transition-all ${
										submitted
											? isSelected
												? "bg-[#333] text-white"
												: "bg-transparent text-[#666] border border-[#333]"
											: buttonStyles[intent as keyof typeof buttonStyles]
									}`}
								>
									{label}
								</button>
							);
						})
					) : (
						<button
							type="submit"
							disabled={submitted}
							className="px-3.5 py-2 text-[15px] font-medium bg-white text-black rounded-md not-disabled:hover:opacity-90 active:scale-[0.98] disabled:bg-[#333] disabled:text-[#666] disabled:cursor-default transition-all"
						>
							Continue
						</button>
					)}
				</div>
			</form>
		</div>
	);
}
