import maplibregl from 'maplibre-gl';
import { useEffect } from 'react';


interface UseMapZoomProps {
	mapRef: React.RefObject<maplibregl.Map | null>;
	mapContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function useMapZoom({ mapRef, mapContainerRef }: UseMapZoomProps) {
	useEffect(() => {
		if (!mapContainerRef.current) return;

		const mapContainer = mapContainerRef.current;

		const handleWheel = (e: WheelEvent) => {
			if (!mapRef.current) return;

			if (e.shiftKey && !('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
				e.preventDefault();

				// Only proceed if map is loaded
				if (!mapRef.current.loaded()) return;

				const rect = mapContainer.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;

				const lngLat = mapRef.current.unproject([x, y]);

				const currentZoom = mapRef.current.getZoom();
				const zoomDelta = e.deltaY > 0 ? -0.5 : 0.5;
				const newZoom = Math.max(0, Math.min(22, currentZoom + zoomDelta));

				mapRef.current.zoomTo(newZoom, {
					around: lngLat,
					duration: 0,
				});
			}

			//* use this to log the map zoom changes, get the center and zoom of the map
			// const center = mapRef.current.getCenter();
			// const zoom = mapRef.current.getZoom();
			// console.log('Map zoom changed:', {
			// 	center: {
			// 		lng: center.lng,
			// 		lat: center.lat,
			// 	},
			// 	zoom,
			// });
		};

		mapContainer.addEventListener('wheel', handleWheel, { passive: false });

		return () => {
			mapContainer.removeEventListener('wheel', handleWheel);
		};
	}, [mapRef, mapContainerRef]);
}

