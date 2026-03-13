
import { IconArrowLeft } from '@tabler/icons-react';
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { ControlPanel } from '@/components';
import { DetailLayout } from '@/components/DetailLayout';
import { KioskNotFound } from '@/components/KioskNotFound';
import { PageContainer } from '@/components/PageContainer';
import { useKioskDetail } from '@/features/kiosks';
import { TabId, useKioskDetailBreadcrumbs, useKioskDetailTabs } from '@/features/kiosks/components/KioskDetail/hooks';


export const KioskDetailPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<TabId>('basicInfo');
	const { id } = useParams<{ id: string }>();
	const { kiosk, isLoading } = useKioskDetail(id);
	const { tabs, getTabActions } = useKioskDetailTabs({ kiosk, activeTab });
	const breadcrumbs = useKioskDetailBreadcrumbs({ kiosk });

	const navigate = useNavigate();
	const { t: translate } = useTranslation();

	const handleTabChange = useCallback((value: string) => {
		setActiveTab(value as TabId);
	}, []);

	const tabActions = getTabActions(activeTab) ?? [];
	const backAction = {
		label: translate('nikki.general.actions.back'),
		onClick: () => navigate('../kiosks'),
		leftSection: <IconArrowLeft size={16} />,
		variant: 'outline',
	};
	const actions = kiosk ? [backAction, ...tabActions] : [backAction];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[ <ControlPanel actions={actions} /> ]}
			isLoading={isLoading}
			isNotFound={!kiosk && !isLoading}
			notFoundComponent={<KioskNotFound />}
		>
			<DetailLayout
				header={{
					title: kiosk?.name || '',
					subtitle: kiosk?.code || '',
				}}
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={handleTabChange}
			/>
		</PageContainer>
	);
};
