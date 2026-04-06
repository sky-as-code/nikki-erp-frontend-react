import {
	Box,
	Center,
	Stack,
} from '@mantine/core';
import { useDocumentTitle } from '@nikkierp/ui/hooks';
import React from 'react';

import {
	mockCustomerUsage,
	mockKioskErrors,
	mockLowStockAlerts,
	mockOperationParameters,
	mockSupportRequests,
} from '@/features/kiosks/mocks';
import { CustomerSupportRequest, OperationParametersChart, OverviewStats } from '@/features/reports/operations/components';

import {
	KioskErrorAlert,
	KioskLowStockAlert,
} from '../../features/kiosks/components';
import { KioskHitMap } from '../../features/kiosks/components/KioskHitMap';
import { useKioskList } from '../../features/kiosks/hooks';
import {
	KioskStatus,
	type Kiosk,
} from '../../features/kiosks/types';


export default function OverviewPage(): React.ReactNode {
	const { kiosks = [] } = useKioskList();

	const totalKiosks = kiosks.length;
	const activeKiosks = kiosks.filter((k: Kiosk) => k.status === KioskStatus.ACTIVATED && k.isActive).length;
	const inactiveKiosks = kiosks.filter((k: Kiosk) => !(k.status === KioskStatus.ACTIVATED && k.isActive)).length;

	useDocumentTitle('nikki.vendingMachine.overview.title');

	return (
		<Stack gap='md' pt={'sm'}>
			<Box pos='relative' h='max-content' mih={800}>
				<Box
					pos='absolute' top={0} left={0} right={0} bottom={0} z-index={0}
					bg='light-dark(var(--nikki-color-white), var(--mantine-color-dark-6))'
					p={3} bdrs={'sm'}
					display={{ base: 'none', lg: 'block' }}
				>
					<KioskHitMap kiosks={kiosks} />
				</Box>
				<OverviewStats
					totalKiosks={totalKiosks}
					activeKiosks={activeKiosks}
					inactiveKiosks={inactiveKiosks}
					kiosks={kiosks}
					operationParameters={mockOperationParameters}
					customerUsage={mockCustomerUsage}
					width={{ base: '100%', lg: '50%' }}
					miw={{ base: '100%', lg: 800 }}
					padding={{ base: 0, lg: 'md' }}
				/>
			</Box>

			<OperationParametersChart parameters={mockOperationParameters} />

			<KioskErrorAlert errors={mockKioskErrors} detailLink='../reports/error-analytics'/>

			<KioskLowStockAlert alerts={mockLowStockAlerts} detailLink='../reports/inventory' />

			<CustomerSupportRequest requests={mockSupportRequests} detailLink='../customer-support' />

			<Box
				display={{ base: 'block', lg: 'none' }}
				h='400px' w='100%' p={'xs'} bdrs={'md'}
				bg='light-dark(var(--nikki-color-white), var(--mantine-color-dark-6))'
			>
				<KioskHitMap kiosks={kiosks} />
			</Box>

			<Center h='100px' bg='light-dark(var(--nikki-color-white), var(--mantine-color-dark-6))' mb='md'/>
		</Stack>
	);
}
