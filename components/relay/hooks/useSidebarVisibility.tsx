"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

interface SidebarVisibilityContext {
	visible: boolean;
	toggle: () => void;
}

const SidebarVisibilityContext = createContext<SidebarVisibilityContext>({
	visible: true,
	toggle: () => {},
});

export function SidebarVisibilityProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [visible, setVisible] = useState(true);

	const toggle = useCallback(() => {
		setVisible((v) => !v);
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.metaKey && e.key === "/") {
				e.preventDefault();
				toggle();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [toggle]);

	return (
		<SidebarVisibilityContext.Provider value={{ visible, toggle }}>
			{children}
		</SidebarVisibilityContext.Provider>
	);
}

export function useSidebarVisibility() {
	return useContext(SidebarVisibilityContext);
}
