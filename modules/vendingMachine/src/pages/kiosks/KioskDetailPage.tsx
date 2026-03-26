
import { IconArrowLeft } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { ControlPanel } from '@/components';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { DetailLayout } from '@/components/DetailLayout';
import { KioskNotFound } from '@/components/KioskNotFound';
import { PageContainer } from '@/components/PageContainer';
import { useKioskDetail } from '@/features/kiosks';
import { TabId, useKioskDetailBreadcrumbs, useKioskDetailTabs } from '@/features/kiosks/components/KioskDetail/hooks';


export const KioskDetailPage: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { t: translate } = useTranslation();

	const [activeTab, setActiveTab] = useState<TabId>('basicInfo');
	const { kiosk, isLoading } = useKioskDetail(id);
	const { tabs, actions: tabActions } = useKioskDetailTabs({ kiosk, activeTab });
	const breadcrumbs = useKioskDetailBreadcrumbs({ kiosk });

	const actions: ControlPanelProps['actions'] = [{
		label: translate('nikki.general.actions.back'),
		onClick: () => navigate('../kiosks'),
		leftSection: <IconArrowLeft size={16} />,
		variant: 'outline',
	}];
	if (kiosk) actions.push(...(tabActions ?? []));

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
				onTabChange={(value) => setActiveTab(value as TabId)}
			/>
		</PageContainer>
	);
};
