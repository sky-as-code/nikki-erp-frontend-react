import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ControlPanel } from '@/components';
import { DetailLayout } from '@/components/DetailLayout';
import { PageContainer } from '@/components/PageContainer';
import { useKioskDetail } from '@/features/kiosks';
import { KioskDetailTabId, useKioskDetailPageConfig,
	KioskDetailTabControlProvider, KioskNotFound,
} from '@/features/kiosks/components/KioskDetail';



export const KioskDetailPage: React.FC = () => {
	return (
		<KioskDetailTabControlProvider>
			<KioskDetailPageContent />
		</KioskDetailTabControlProvider>
	);
};


const KioskDetailPageContent: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { t: translate } = useTranslation();
	const { kiosk, isLoading } = useKioskDetail(id);
	const { breadcrumbs, actions, tabs, activeTab, onTabChange } = useKioskDetailPageConfig({ kiosk });

	return (
		<PageContainer
			documentTitle={kiosk?.name ?? translate('nikki.vendingMachine.kiosk.detail.title')}
			breadcrumbs={breadcrumbs}
			sections={[ <ControlPanel actions={actions} /> ]}
			isLoading={isLoading}
			isNotFound={!kiosk && !isLoading}
			notFoundContent={<KioskNotFound />}
		>
			<DetailLayout
				header={{
					title: kiosk?.name || '',
					subtitle: kiosk?.code || '',
				}}
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={(value) => onTabChange(value as KioskDetailTabId)}
			/>
		</PageContainer>
	);
};
