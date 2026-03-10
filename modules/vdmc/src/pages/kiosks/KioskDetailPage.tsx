import { LoadingState } from '@nikkierp/ui/components';
import { IconArrowLeft } from '@tabler/icons-react';
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ControlPanel } from '@/components';
import { DetailLayout } from '@/components/DetailLayout';
import { PageContainer, PageContainerProps } from '@/components/PageContainer';
import { useKioskDetail } from '@/features/kiosks';
import { TabId, useKioskDetailBreadcrumbs, useKioskDetailTabs } from '@/features/kiosks/components/KioskDetail/hooks';


export const KioskDetailPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<TabId>('basicInfo');
	const { id } = useParams<{ id: string }>();
	const { kiosk, isLoading } = useKioskDetail(id);
	const { tabs, getTabActions } = useKioskDetailTabs({ kiosk, activeTab });
	const breadcrumbs = useKioskDetailBreadcrumbs({ kiosk });

	const handleTabChange = useCallback((value: string) => {
		setActiveTab(value as TabId);
	}, []);

	if (isLoading || !kiosk) {
		return <KioskDetailPageLoading breadcrumbs={breadcrumbs} />;
	}

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[ <ControlPanel actions={getTabActions(activeTab)} /> ]}
		>
			<DetailLayout
				header={{
					title: kiosk.name,
					subtitle: kiosk.code,
				}}
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={handleTabChange}
			/>
		</PageContainer>
	);
};


const KioskDetailPageLoading: React.FC<{ breadcrumbs: PageContainerProps['breadcrumbs'] }> = ({ breadcrumbs }) => {
	const { t: translate } = useTranslation();

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[
				<ControlPanel
					actions={[
						{
							label: translate('nikki.general.actions.back'),
							leftSection: <IconArrowLeft size={16} />,
							variant: 'outline',
						},
					]}
				/>,
			]}>
			<LoadingState messageKey='nikki.general.messages.loading' />
		</PageContainer>
	);
};