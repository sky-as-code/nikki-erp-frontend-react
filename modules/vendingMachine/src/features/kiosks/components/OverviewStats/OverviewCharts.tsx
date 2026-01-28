import { SimpleGrid } from '@mantine/core';
import React from 'react';

import { type Kiosk } from '@/features/kiosks/types';

import { ConnectionStatusChart } from '../ConnectionStatusChart';
import { MachineTypeChart } from '../MachineTypeChart';
import { OperationStatusChart } from '../OperationStatusChart';


interface OverviewChartsProps {
	kiosks: Kiosk[];
}

export function OverviewCharts({ kiosks }: OverviewChartsProps): React.ReactElement {
	return (
		<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='md' h={'max-content'}>
			<ConnectionStatusChart kiosks={kiosks} h={250} />
			<OperationStatusChart kiosks={kiosks} h={250} />
			<MachineTypeChart kiosks={kiosks} h={250} />
		</SimpleGrid>
	);
}
