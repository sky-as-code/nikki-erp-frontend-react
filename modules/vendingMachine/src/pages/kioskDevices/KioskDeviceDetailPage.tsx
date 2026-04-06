import { IconDeviceDesktop } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ControlPanel } from '@/components';
import { DetailLayout } from '@/components/DetailLayout';
import { PageContainer } from '@/components/PageContainer';
import { useKioskDeviceDetail } from '@/features/kioskDevices';
import {
	KioskDeviceDetailTabId,
	useKioskDeviceDetailPageConfig,
	KioskDeviceDetailTabControlProvider,
	KioskDeviceNotFound,
} from '@/features/kioskDevices/components/KioskDeviceDetail';


export const KioskDeviceDetailPage: React.FC = () => {
	return (
		<KioskDeviceDetailTabControlProvider>
			<KioskDeviceDetailPageContent />
		</KioskDeviceDetailTabControlProvider>
	);
};

const KioskDeviceDetailPageContent: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { t: translate } = useTranslation();
	const { kioskDevice, isLoading } = useKioskDeviceDetail(id);
	const { breadcrumbs, actions, tabs, activeTab, onTabChange } = useKioskDeviceDetailPageConfig({ kioskDevice });

	return (
		<PageContainer
			documentTitle={kioskDevice?.name ?? translate('nikki.vendingMachine.device.detail.title')}
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel actions={actions} />]}
			isLoading={isLoading}
			isNotFound={!kioskDevice && !isLoading}
			notFoundContent={<KioskDeviceNotFound />}
		>
			<DetailLayout
				header={{
					title: kioskDevice?.name || '',
					subtitle: kioskDevice?.code || '',
					avatar: <IconDeviceDesktop size={46} />,
				}}
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={(value) => onTabChange(value as KioskDeviceDetailTabId)}
			/>
		</PageContainer>
	);
};
