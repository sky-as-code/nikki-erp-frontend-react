import { ConfirmModal } from '@nikkierp/ui/components';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ControlPanel } from '@/components';
import { DetailLayout } from '@/components/DetailLayout';
import { KioskNotFound } from '@/components/KioskNotFound';
import { PageContainer } from '@/components/PageContainer';
import { useKioskDelete, useKioskDetail } from '@/features/kiosks';
import { TabId, useKioskDetailPageConfig } from '@/features/kiosks/components/KioskDetail/hooks';


export const KioskDetailPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { t: translate } = useTranslation();
	const [activeTab, setActiveTab] = useState<TabId>('basicInfo');

	const {
		isOpenDeleteModal,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		kioskToDelete,
		handleDelete: handleDeleteKiosk,
	} = useKioskDelete();

	const { kiosk, isLoading } = useKioskDetail(id);
	const { breadcrumbs, actions, tabs } = useKioskDetailPageConfig({
		kiosk,
		activeTab,
		onOpenDeleteKiosk: handleOpenDeleteModal,
	});

	return (
		<>
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

			<ConfirmModal
				title={translate('nikki.general.messages.delete_confirm')}
				opened={!!kioskToDelete && isOpenDeleteModal}
				onClose={handleCloseDeleteModal}
				onConfirm={() => handleDeleteKiosk(kioskToDelete?.id || '')}
				message={<Trans i18nKey='nikki.vendingMachine.kiosk.messages.delete_confirm'
					values={{ name: kioskToDelete?.name || '' }}
					components={{ strong: <strong /> }}
				/>}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>
		</>
	);
};
