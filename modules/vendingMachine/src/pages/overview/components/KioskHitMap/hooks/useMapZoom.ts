import maplibregl from 'maplibre-gl';
import { useEffect } from 'react';


interface UseMapZoomProps {
	mapRef: React.RefObject<maplibregl.Map | null>;
	mapContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function useMapZoom({ mapRef, mapContainerRef }: UseMapZoomProps) {
	useEffect(() => {
		if (!mapRef.current || !mapContainerRef.current) return;

		const map = mapRef.current;
		const mapContainer = mapContainerRef.current;

		const handleWheel = (e: WheelEvent) => {
			if (e.shiftKey && !('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
				e.preventDefault();

				if (!mapContainer) return;

				const rect = mapContainer.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;

				const lngLat = map.unproject([x, y]);

				const currentZoom = map.getZoom();
				const zoomDelta = e.deltaY > 0 ? -0.5 : 0.5;
				const newZoom = Math.max(0, Math.min(22, currentZoom + zoomDelta));

				map.zoomTo(newZoom, {
					around: lngLat,
					duration: 0,
				});
			}
		};

		mapContainer.addEventListener('wheel', handleWheel, { passive: false });

		return () => {
			mapContainer.removeEventListener('wheel', handleWheel);
		};
	}, [mapRef, mapContainerRef]);
}

