import { useEffect } from 'react';

/**
 * Hook to hide MapLibre attribution control
 */
export function useMapAttribution(): void {
	useEffect(() => {
		const style = document.createElement('style');
		style.textContent = `
			.maplibregl-ctrl-attrib {
				display: none !important;
			}
		`;
		document.head.appendChild(style);

		return () => {
			document.head.removeChild(style);
		};
	}, []);
}
