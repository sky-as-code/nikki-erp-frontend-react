
import { Tabs } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { DetailActionBar } from '@/components/ActionBar';
import { PageContainer } from '@/components/PageContainer';
import { useKioskDetail } from '@/features/kiosks';
import { ActivityLogTab } from '@/features/kiosks/components/KioskDetail/ActivityLogTab';
import { BasicInfoTab } from '@/features/kiosks/components/KioskDetail/BasicInfoTab';
import { ProductsTab } from '@/features/kiosks/components/KioskDetail/ProductsTab';


export const KioskDetailPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const { kiosk, isLoading } = useKioskDetail(id);

	const breadcrumbs = [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.kiosk.title'), href: '../kiosks' },
		{ title: kiosk?.name || translate('nikki.vendingMachine.kiosk.detail.title'), href: '#' },
	];

	if (isLoading || !kiosk) {
		return (
			<PageContainer
				breadcrumbs={breadcrumbs}
				actionBar={<div />}
			>
				<div>{translate('nikki.general.messages.loading')}</div>
			</PageContainer>
		);
	}

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			actionBar={<DetailActionBar
				onSave={() => {}}
				onGoBack={() => {}}
				onDelete={() => {}}
			/>}
		>
			<Tabs defaultValue='basic'>
				<Tabs.List>
					<Tabs.Tab value='basic'>
						{translate('nikki.vendingMachine.kiosk.tabs.basicInfo')}
					</Tabs.Tab>
					<Tabs.Tab value='products'>
						{translate('nikki.vendingMachine.kiosk.tabs.products')}
					</Tabs.Tab>
					<Tabs.Tab value='activity'>
						{translate('nikki.vendingMachine.kiosk.tabs.activity')}
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='basic' pt='md'>
					<BasicInfoTab kiosk={kiosk} />
				</Tabs.Panel>

				<Tabs.Panel value='products' pt='md'>
					<ProductsTab kioskId={kiosk.id} />
				</Tabs.Panel>

				<Tabs.Panel value='activity' pt='md'>
					<ActivityLogTab />
				</Tabs.Panel>
			</Tabs>
		</PageContainer>
	);
};
