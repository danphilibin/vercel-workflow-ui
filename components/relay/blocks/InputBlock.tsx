"use client";

import { useState } from "react";
import { CheckboxInput } from "./inputs/CheckboxInput";
import { SelectInput } from "./inputs/SelectInput";
import { TextInput } from "./inputs/TextInput";

type InputDef = {
	name: string;
	type: string;
	label: string;
	options?: Array<string | { value: string; label: string }>;
};

export function InputBlock({
	inputs,
	submitted,
	submittedValues,
	onSubmit,
}: {
	inputs: Array<InputDef>;
	submitted?: boolean;
	submittedValues?: Record<string, string | boolean>;
	onSubmit: (values: Record<string, string | boolean>) => void;
}) {
	const [values, setValues] = useState<Record<string, string | boolean>>(() => {
		const initial: Record<string, string | boolean> = {};
		for (const input of inputs) {
			if (input.type === "checkbox") {
				initial[input.name] = false;
			} else if (input.type === "select" && input.options?.length) {
				const firstOption = input.options[0];
				initial[input.name] =
					typeof firstOption === "string" ? firstOption : firstOption.value;
			} else {
				initial[input.name] = "";
			}
		}
		return initial;
	});

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const allFilled = inputs.every(
			(input) =>
				input.type === "checkbox" ||
				input.type === "select" ||
				(typeof values[input.name] === "string" &&
					(values[input.name] as string).trim() !== ""),
		);
		if (!allFilled) return;
		onSubmit(values);
	}

	return (
		<div
			className={`my-4 p-5 rounded-xl border ${
				submitted ? "bg-[#0a0a0a] border-[#222]" : "bg-[#111] border-[#222]"
			}`}
		>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				{inputs.map((input, index) => (
					<label key={input.name} className="flex flex-col gap-2">
						{input.type === "checkbox" ? (
							<CheckboxInput
								name={input.name}
								label={input.label}
								value={
									(submitted
										? submittedValues?.[input.name]
										: values[input.name]) as boolean
								}
								onChange={(checked) =>
									setValues((v) => ({ ...v, [input.name]: checked }))
								}
								disabled={submitted}
							/>
						) : input.type === "select" ? (
							<SelectInput
								name={input.name}
								label={input.label}
								value={
									(submitted
										? submittedValues?.[input.name]
										: values[input.name]) as string
								}
								options={input.options || []}
								onChange={(value) =>
									setValues((v) => ({ ...v, [input.name]: value }))
								}
								disabled={submitted}
								autoFocus={index === 0 && !submitted}
							/>
						) : (
							<TextInput
								name={input.name}
								label={input.label}
								value={
									(submitted
										? submittedValues?.[input.name]
										: values[input.name]) as string
								}
								onChange={(value) =>
									setValues((v) => ({ ...v, [input.name]: value }))
								}
								disabled={submitted}
								autoFocus={index === 0 && !submitted}
							/>
						)}
					</label>
				))}
				<button
					type="submit"
					disabled={submitted}
					className="self-start px-3.5 py-2 text-[15px] font-medium bg-white text-black rounded-md not-disabled:hover:opacity-90 active:scale-[0.98] disabled:bg-[#333] disabled:text-[#666] disabled:cursor-default transition-all"
				>
					Continue
				</button>
			</form>
		</div>
	);
}
