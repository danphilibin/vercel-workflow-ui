"use client";

import { useState } from "react";
import type { InputSchema } from "@/lib/relay/types";
import { CheckboxInput } from "./inputs/CheckboxInput";
import { SelectInput } from "./inputs/SelectInput";
import { TextInput } from "./inputs/TextInput";

export function InputBlock({
	blocks,
	submitted,
	submittedValues,
	onSubmit,
}: {
	blocks: InputSchema;
	submitted?: boolean;
	submittedValues?: Record<string, string | boolean>;
	onSubmit: (values: Record<string, string | boolean>) => void;
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

	const blockEntries = Object.entries(blocks);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const allFilled = blockEntries.every(
			([name, block]) =>
				block.type === "checkbox" ||
				block.type === "select" ||
				(typeof values[name] === "string" &&
					(values[name] as string).trim() !== ""),
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
								onChange={(value) =>
									setValues((v) => ({ ...v, [name]: value }))
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
