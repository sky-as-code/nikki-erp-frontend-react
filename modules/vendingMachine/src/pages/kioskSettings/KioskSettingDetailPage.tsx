import { useDocumentTitle } from '@nikkierp/ui/hooks';
import { IconArrowLeft } from '@tabler/icons-react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { ControlPanel } from '@/components';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { DetailLayout } from '@/components/DetailLayout';
import { PageContainer } from '@/components/PageContainer';
import { useKioskSettingDetail } from '@/features/kioskSettings';
import {
	KioskSettingDetailTabId,
	useKioskSettingDetailBreadcrumbs,
	useKioskSettingDetailTabs,
} from '@/features/kioskSettings/components/KioskSettingDetail';


export const KioskSettingDetailPage: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { t: translate } = useTranslation();

	const [activeTab, setActiveTab] = useState<KioskSettingDetailTabId>('basicInfo');
	const { setting, isLoading } = useKioskSettingDetail(id);
	const { tabs, getTabActions } = useKioskSettingDetailTabs({ setting, activeTab });
	const breadcrumbs = useKioskSettingDetailBreadcrumbs({ setting });

	const handleTabChange = useCallback((value: string) => {
		setActiveTab(value as KioskSettingDetailTabId);
	}, []);

	const actions: ControlPanelProps['actions'] = [{
		label: translate('nikki.general.actions.back'),
		onClick: () => navigate('../kiosk-settings'),
		leftSection: <IconArrowLeft size={16} />,
		variant: 'outline',
	}];
	const tabActions = getTabActions(activeTab) ?? [];
	if (setting) actions.push(...tabActions);

	useDocumentTitle(setting?.name || translate('nikki.vendingMachine.kioskSettings.detail.title'));

	return (
		<>
			<PageContainer
				breadcrumbs={breadcrumbs}
				sections={[<ControlPanel key='control-panel' actions={actions} />]}
				isLoading={isLoading}
				isNotFound={!setting && !isLoading}
			>
				<DetailLayout
					header={{
						title: setting?.name || '',
						subtitle: setting?.code || '',
					}}
					tabs={tabs}
					activeTab={activeTab}
					onTabChange={handleTabChange}
				/>
			</PageContainer>
		</>
	);
};
