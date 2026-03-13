import { Box, Grid, MantineStyleProps } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { type CustomerUsage, type Kiosk, type OperationParameter } from '@/features/kiosks/types';

import { CustomerVisitChart } from '../CustomerVisitChart';
import { KioskCountCard } from './KioskCountCard';
import { OperationParametersCard } from './OperationParametersCard';
import { OverviewCharts } from './OverviewCharts';


interface OverviewStatsProps {
	totalKiosks: number;
	activeKiosks: number;
	inactiveKiosks: number;
	kiosks: Kiosk[];
	operationParameters: OperationParameter[];
	customerUsage: CustomerUsage[];
	padding?: MantineStyleProps['p'];
	width?: MantineStyleProps['w'];
	miw?: MantineStyleProps['miw'];
}

export function OverviewStats({
	totalKiosks,
	activeKiosks,
	inactiveKiosks,
	kiosks,
	operationParameters,
	customerUsage,
	padding = 'md',
	width,
	miw,
}: OverviewStatsProps): React.ReactElement {
	const { t: translate } = useTranslation();

	return (
		<Box p={padding} w={width} h={'100%'} miw={miw}>
			<Grid h={'100%'}>
				<Grid.Col span={{ base: 12, sm: 5, md: 5, lg: 5, xl: 4 }}>
					<KioskCountCard
						totalKiosks={totalKiosks}
						activeKiosks={activeKiosks}
						inactiveKiosks={inactiveKiosks}
						translate={translate}
					/>
				</Grid.Col>

				<Grid.Col span={{ base: 12, sm: 7, md: 7, lg: 7, xl: 8 }}>
					<OperationParametersCard
						operationParameters={operationParameters}
						translate={translate}
					/>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 12 }}>
					<OverviewCharts kiosks={kiosks} />
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 12 }} h={350}>
					<CustomerVisitChart usageData={customerUsage} />
				</Grid.Col>
			</Grid>
		</Box>
	);
}
