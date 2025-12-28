"use client";

import type { ReactNode } from "react";
import type { WorkflowEntry } from "@/lib/relay/meta";
import {
	SidebarVisibilityProvider,
	useSidebarVisibility,
} from "./hooks/useSidebarVisibility";
import { Sidebar } from "./Sidebar";

function LayoutContent({
	workflows,
	children,
}: {
	workflows: Pick<WorkflowEntry, "slug" | "title" | "description">[];
	children: ReactNode;
}) {
	const { visible } = useSidebarVisibility();

	return (
		<div className="flex h-screen bg-black text-[#fafafa] font-sans">
			{visible && <Sidebar workflows={workflows} />}
			{children}
		</div>
	);
}

export function LayoutShell({
	workflows,
	children,
}: {
	workflows: Pick<WorkflowEntry, "slug" | "title" | "description">[];
	children: ReactNode;
}) {
	return (
		<SidebarVisibilityProvider>
			<LayoutContent workflows={workflows}>{children}</LayoutContent>
		</SidebarVisibilityProvider>
	);
}
