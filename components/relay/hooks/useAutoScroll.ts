import { useCallback, useEffect, useRef } from "react";

/**
 * Hook to manage auto-scroll behavior for a scrollable container.
 * Auto-scrolls to bottom when content changes, unless the user has scrolled up.
 * Re-enables auto-scroll when user scrolls back to the bottom.
 */
export function useAutoScroll<T>(deps: T[]) {
	const containerRef = useRef<HTMLDivElement>(null);
	const isAtBottomRef = useRef(true);

	// Threshold in pixels - if within this distance from bottom, consider "at bottom"
	const SCROLL_THRESHOLD = 50;

	const checkIfAtBottom = useCallback(() => {
		const container = containerRef.current;
		if (!container) return true;

		const { scrollTop, scrollHeight, clientHeight } = container;
		const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
		return distanceFromBottom <= SCROLL_THRESHOLD;
	}, []);

	const scrollToBottom = useCallback(() => {
		const container = containerRef.current;
		if (!container) return;

		container.scrollTo({
			top: container.scrollHeight,
			behavior: "smooth",
		});
	}, []);

	// Handle scroll events to track if user is at bottom
	const handleScroll = useCallback(() => {
		isAtBottomRef.current = checkIfAtBottom();
	}, [checkIfAtBottom]);

	// Auto-scroll when dependencies change (e.g., new messages)
	useEffect(() => {
		if (isAtBottomRef.current) {
			scrollToBottom();
		}
	}, [deps, scrollToBottom]);

	// Attach scroll listener
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		container.addEventListener("scroll", handleScroll, { passive: true });
		return () => container.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);

	return {
		containerRef,
		scrollToBottom,
		isAtBottom: () => isAtBottomRef.current,
	};
}
