"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { WorkflowEntry } from "@/lib/relay/meta";

export function Sidebar({
	workflows,
	title = "Relay",
}: {
	workflows: Pick<WorkflowEntry, "slug" | "title" | "description">[];
	title?: string;
}) {
	const pathname = usePathname();

	return (
		<div className="w-[260px] bg-[#0a0a0a] border-r border-[#222] flex flex-col">
			<div className="p-5 border-b border-[#222] flex items-center justify-between">
				<Link
					href="/"
					className="text-base font-semibold tracking-tight flex items-center gap-2"
				>
					{title}
				</Link>
			</div>
			<div className="flex-1 overflow-y-auto p-3">
				{workflows.map((workflow) => {
					const href = `/workflow/${workflow.slug}`;
					const isActive = pathname === href;

					return (
						<Link
							key={workflow.slug}
							href={href}
							className={`block w-full text-left px-3.5 py-3 rounded-md mb-1 transition-colors ${
								isActive
									? "bg-[#1a1a1a] text-white"
									: "text-[#888] hover:bg-[#1a1a1a] hover:text-white"
							}`}
						>
							<div className="font-medium text-sm">{workflow.title}</div>
							{workflow.description && (
								<div className="text-xs text-[#666] mt-0.5 line-clamp-1">
									{workflow.description}
								</div>
							)}
						</Link>
					);
				})}
			</div>
		</div>
	);
}
