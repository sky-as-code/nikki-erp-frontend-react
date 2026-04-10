import { IconBox } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ControlPanel } from '@/components';
import { DetailLayout } from '@/components/DetailLayout';
import { PageContainer } from '@/components/PageContainer';
import { useKioskModelDetail } from '@/features/kioskModels';
import {
	KioskModelDetailTabId,
	useKioskModelDetailPageConfig,
	KioskModelDetailTabControlProvider,
} from '@/features/kioskModels/components/KioskModelDetail';
import { KioskModelNotFound } from '@/features/kioskModels/components/KioskModelNotFound';


export const KioskModelDetailPage: React.FC = () => {
	return (
		<KioskModelDetailTabControlProvider>
			<KioskModelDetailPageContent />
		</KioskModelDetailTabControlProvider>
	);
};

const KioskModelDetailPageContent: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { t: translate } = useTranslation();
	const { model, isLoading } = useKioskModelDetail(id);
	const { breadcrumbs, actions, tabs, activeTab, onTabChange } = useKioskModelDetailPageConfig({ model });

	return (
		<PageContainer
			documentTitle={model?.name ?? translate('nikki.vendingMachine.kioskModels.detail.title')}
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel actions={actions} />]}
			isLoading={isLoading && !model}
			isNotFound={!model && !isLoading}
			notFoundContent={<KioskModelNotFound />}
		>
			<DetailLayout
				header={{
					title: model?.name || '',
					subtitle: model?.referenceCode || '',
					avatar: <IconBox size={46} />,
				}}
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={(value) => onTabChange(value as KioskModelDetailTabId)}
			/>
		</PageContainer>
	);
};
