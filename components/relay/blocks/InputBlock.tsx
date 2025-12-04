"use client";

import { useState } from "react";

export function InputBlock({
	inputs,
	submitted,
	submittedValues,
	onSubmit,
}: {
	inputs: Array<{ name: string; type: string; label: string }>;
	submitted?: boolean;
	submittedValues?: Record<string, string | boolean>;
	onSubmit: (values: Record<string, string | boolean>) => void;
}) {
	const [values, setValues] = useState<Record<string, string | boolean>>(() => {
		const initial: Record<string, string | boolean> = {};
		for (const input of inputs) {
			initial[input.name] = input.type === "checkbox" ? false : "";
		}
		return initial;
	});

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const allFilled = inputs.every(
			(input) =>
				input.type === "checkbox" ||
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
					<label
						key={input.name}
						className="flex flex-col gap-2"
						htmlFor={input.name}
					>
						{input.type === "checkbox" ? (
							<div className="flex items-center gap-2.5 cursor-pointer py-1">
								<input
									type="checkbox"
									checked={
										(submitted
											? submittedValues?.[input.name]
											: values[input.name]) as boolean
									}
									onChange={(e) =>
										setValues((v) => ({
											...v,
											[input.name]: e.target.checked,
										}))
									}
									disabled={submitted}
									className="checkbox-custom"
								/>
								<span
									className={`text-base select-none ${submitted ? "opacity-70" : ""}`}
								>
									{input.label}
								</span>
							</div>
						) : (
							<>
								<span className="text-base font-medium text-[#fafafa]">
									{input.label}
								</span>
								<input
									type="text"
									data-1p-ignore
									value={
										(submitted
											? submittedValues?.[input.name]
											: values[input.name]) as string
									}
									onChange={(e) =>
										setValues((v) => ({
											...v,
											[input.name]: e.target.value,
										}))
									}
									disabled={submitted}
									autoFocus={index === 0 && !submitted}
									placeholder="Type here..."
									className="w-full px-3 py-2.5 text-base bg-black border border-[#333] rounded-md text-[#fafafa] placeholder:text-[#666] focus:outline-none focus:border-[#888] focus:ring-[3px] focus:ring-white/5 disabled:bg-[#0a0a0a] disabled:border-[#222] disabled:text-[#888] transition-all"
								/>
							</>
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
