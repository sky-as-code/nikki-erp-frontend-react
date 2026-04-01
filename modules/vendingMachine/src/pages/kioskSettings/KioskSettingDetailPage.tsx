import { useDocumentTitle } from '@nikkierp/ui/hooks';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ControlPanel } from '@/components';
import { DetailLayout } from '@/components/DetailLayout';
import { PageContainer } from '@/components/PageContainer';
import { useKioskSettingDetail } from '@/features/kioskSettings';
import {
	KioskSettingDetailTabControlProvider,
	useKioskSettingDetailPageConfig,
} from '@/features/kioskSettings/components/KioskSettingDetail';


export const KioskSettingDetailPage: React.FC = () => {
	return (
		<KioskSettingDetailTabControlProvider>
			<KioskSettingDetailPageContent />
		</KioskSettingDetailTabControlProvider>
	);
};

const KioskSettingDetailPageContent: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { t: translate } = useTranslation();
	const { setting, isLoading } = useKioskSettingDetail(id);
	const { breadcrumbs, actions, tabs, activeTab, onTabChange } = useKioskSettingDetailPageConfig({ setting });

	useDocumentTitle(setting?.name || translate('nikki.vendingMachine.kioskSettings.detail.title'));

	return (
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
				onTabChange={onTabChange}
			/>
		</PageContainer>
	);
};
