import { useEffect, useRef, useState } from 'react';


export function useMinimumLoading(isLoading: boolean, minimumMs: number): boolean {
	const [showLoading, setShowLoading] = useState(false);
	const startRef = useRef<number | null>(null);

	useEffect(() => {
		if (isLoading) {
			startRef.current = Date.now();
			setShowLoading(true);
			return;
		}
		if (startRef.current === null) return;
		const elapsed = Date.now() - startRef.current;
		const remaining = Math.max(0, minimumMs - elapsed);
		const t = setTimeout(() => {
			setShowLoading(false);
			startRef.current = null;
		}, remaining);
		return () => clearTimeout(t);
	}, [isLoading, minimumMs]);

	return showLoading;
}
