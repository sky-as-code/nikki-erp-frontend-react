import { IconArrowLeft, IconBox } from '@tabler/icons-react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { ControlPanel } from '@/components';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { DetailLayout } from '@/components/DetailLayout';
import { KioskModelNotFound } from '@/components/KioskModelNotFound';
import { PageContainer } from '@/components/PageContainer';
import { useKioskModelDetail } from '@/features/kioskModels';
import { TabId, useKioskModelDetailBreadcrumbs, useKioskModelDetailTabs } from '@/features/kioskModels/components/KioskModelDetail/hooks';


export const KioskModelDetailPage: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { t: translate } = useTranslation();

	const [activeTab, setActiveTab] = useState<TabId>('basicInfo');
	const { model, isLoading } = useKioskModelDetail(id);
	const { tabs, getTabActions } = useKioskModelDetailTabs({ model, activeTab });
	const breadcrumbs = useKioskModelDetailBreadcrumbs({ model });

	const handleTabChange = useCallback((value: string) => {
		setActiveTab(value as TabId);
	}, []);

	const actions: ControlPanelProps['actions'] = [{
		label: translate('nikki.general.actions.back'),
		onClick: () => navigate('../kiosk-models'),
		leftSection: <IconArrowLeft size={16} />,
		variant: 'outline',
	}];
	const tabActions = getTabActions(activeTab) ?? [];
	if (model) actions.push(...tabActions);

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel key='control-panel' actions={actions} />]}
			isLoading={isLoading}
			isNotFound={!model && !isLoading}
			notFoundContent={<KioskModelNotFound />}
		>
			<DetailLayout
				header={{
					title: model?.name || '',
					subtitle: model?.code || '',
					avatar: <IconBox size={46} />,
				}}
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={handleTabChange}
			/>
		</PageContainer>
	);
};
