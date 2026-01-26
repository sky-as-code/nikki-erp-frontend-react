import maplibregl from 'maplibre-gl';
import { useEffect } from 'react';


const lightThemeColors = {
	background: '#e3f2fd',
	water: '#90caf9',
};

const darkThemeColors = {
	background: '#0d1b2a',
	water: '#1e3a5f',
};

const updateMapThemeColors = (map: maplibregl.Map, isDark: boolean) => {
	const themeColors = isDark ? darkThemeColors : lightThemeColors;
	const style = map.getStyle();

	if (style && style.layers) {
		const backgroundLayer = style.layers.find((layer: any) => layer.type === 'background');
		if (backgroundLayer) {
			map.setPaintProperty(backgroundLayer.id, 'background-color', themeColors.background);
		}
		else {
			const existingBackground = style.layers.find((layer: any) => layer.id === 'custom-background');
			if (!existingBackground) {
				map.addLayer({
					id: 'custom-background',
					type: 'background',
					paint: {
						'background-color': themeColors.background,
					},
				});
			}
			else {
				map.setPaintProperty('custom-background', 'background-color', themeColors.background);
			}
		}

		const waterLayers = style.layers.filter((layer: any) =>
			layer.id && (layer.id.includes('water') || layer.id.includes('ocean')),
		);
		waterLayers.forEach((layer: any) => {
			if (layer.paint && layer.paint['fill-color']) {
				map.setPaintProperty(layer.id, 'fill-color', themeColors.water);
			}
		});
	}
};

interface UseMapThemeProps {
	mapRef: React.RefObject<maplibregl.Map | null>;
	isDark: boolean;
	getMapStyle: (dark: boolean) => string;
	onThemeUpdated?: (map: maplibregl.Map) => void;
}

export function useMapTheme({
	mapRef,
	isDark,
	getMapStyle,
	onThemeUpdated,
}: UseMapThemeProps) {
	useEffect(() => {
		if (!mapRef.current) return;

		const map = mapRef.current;

		// Chỉ cập nhật theme nếu map đã load
		if (!map.loaded()) {
			map.once('load', () => {
				updateMapThemeColors(map, isDark);
			});
			return;
		}

		const updateTheme = () => {
			const newMapStyle = getMapStyle(isDark);
			const center = map.getCenter();
			const zoom = map.getZoom();

			map.setStyle(newMapStyle);

			map.once('style.load', () => {
				map.setCenter(center);
				map.setZoom(zoom);
				updateMapThemeColors(map, isDark);
				onThemeUpdated?.(map);
			});
		};

		updateTheme();
	}, [isDark, getMapStyle, mapRef, onThemeUpdated]);
}

