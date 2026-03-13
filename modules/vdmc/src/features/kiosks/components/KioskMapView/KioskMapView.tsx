import { Box } from '@mantine/core';
import React from 'react';

import 'maplibre-gl/dist/maplibre-gl.css';
import { Kiosk } from '../../types';
import { KioskHitMap } from '../KioskHitMap';


export interface KioskMapViewProps {
	kiosks: Kiosk[];
}


export const KioskMapView: React.FC<KioskMapViewProps> = ({ kiosks }) => {
	return (
		<Box pos='relative' h='max-content' mih={{ base: 400, md: 600, lg: 700 }}>
			<Box
				pos='absolute' top={0} left={0} right={0} bottom={0}
				bg='light-dark(var(--nikki-color-white), var(--mantine-color-dark-6))'
			>
				<KioskHitMap kiosks={kiosks} />
			</Box>
		</Box>
	);
};

