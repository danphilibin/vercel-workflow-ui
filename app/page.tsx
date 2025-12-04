"use client";

import { useState } from "react";
import { WORKFLOW_NAMES } from "@/workflows/manifest";
import {
	useWorkflowStream,
	type Message,
} from "@/components/relay/useWorkflowStream";

export default function Home() {
	const { messages, runWorkflow, submitInput } = useWorkflowStream();

	return (
		<div className="flex h-screen bg-black text-[#fafafa] font-sans">
			{/* Sidebar */}
			<div className="w-[260px] bg-[#0a0a0a] border-r border-[#222] flex flex-col">
				<div className="p-5 border-b border-[#222] flex items-center justify-between">
					<h1 className="text-base font-semibold tracking-tight flex items-center gap-2">
						Relay
					</h1>
				</div>
				<div className="flex-1 overflow-y-auto p-3">
					{WORKFLOW_NAMES.map((name) => (
						<button
							type="button"
							key={name}
							onClick={() => runWorkflow(name)}
							className="w-full text-left px-3.5 py-3 rounded-md mb-1 text-base font-medium hover:bg-[#1a1a1a] transition-colors cursor-pointer"
						>
							{name}
						</button>
					))}
				</div>
			</div>

			{/* Main content */}
			<div className="flex-1 overflow-y-auto">
				<div className="max-w-[640px] p-8">
					{messages.map((msg, i) => (
						<MessageBlock
							key={i}
							message={msg}
							onSubmit={(values) => {
								if (msg.type === "input") {
									submitInput(msg.stepId, msg.token, values);
								}
							}}
						/>
					))}
				</div>
			</div>

			<style jsx global>{`
				@keyframes pulse {
					0%,
					100% {
						opacity: 0.4;
					}
					50% {
						opacity: 1;
					}
				}
				.animate-pulse-dot {
					animation: pulse 1.5s ease-in-out infinite;
				}
			`}</style>
		</div>
	);
}

function MessageBlock({
	message,
	onSubmit,
}: {
	message: Message;
	onSubmit: (values: Record<string, string | boolean>) => void;
}) {
	if (message.type === "output") {
		return (
			<div className="py-3 text-base leading-relaxed text-[#888]">
				{message.content}
			</div>
		);
	}

	if (message.type === "system") {
		return (
			<div className="py-3 text-base text-[#666] flex items-center gap-2">
				<span className="w-1.5 h-1.5 rounded-full bg-[#666] animate-pulse-dot" />
				{message.content}
			</div>
		);
	}

	if (message.type === "input") {
		return (
			<InputBlock
				inputs={message.inputs}
				submitted={message.submitted}
				submittedValues={message.values}
				onSubmit={onSubmit}
			/>
		);
	}

	if (message.type === "loading") {
		return (
			<LoadingBlock
				message={message.message}
				current={message.current}
				total={message.total}
				completed={message.completed}
			/>
		);
	}

	return null;
}

function LoadingBlock({
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

function InputBlock({
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

			<style jsx>{`
				.checkbox-custom {
					appearance: none;
					-webkit-appearance: none;
					width: 18px;
					height: 18px;
					background: black;
					border: 1px solid #333;
					border-radius: 4px;
					cursor: pointer;
					position: relative;
					transition: background 0.15s ease, border-color 0.15s ease;
				}
				.checkbox-custom:checked {
					background: white;
					border-color: white;
				}
				.checkbox-custom:checked::after {
					content: "";
					position: absolute;
					left: 5px;
					top: 2px;
					width: 5px;
					height: 10px;
					border: solid black;
					border-width: 0 2px 2px 0;
					transform: rotate(45deg);
				}
				.checkbox-custom:focus {
					outline: none;
					border-color: #888;
					box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.06);
				}
				.checkbox-custom:disabled {
					opacity: 0.5;
					cursor: default;
				}
				.checkbox-custom:disabled:checked {
					background: #333;
					border-color: #333;
				}
			`}</style>
		</div>
	);
}
