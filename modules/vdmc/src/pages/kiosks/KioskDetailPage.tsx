import { Box, Stack, Tabs } from '@mantine/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { DetailControlPanel } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import { useKioskDetail } from '@/features/kiosks';
import { KioskActivity } from '@/features/kiosks/components/KioskDetail/KioskActivity';
import { KioskBasicInfo } from '@/features/kiosks/components/KioskDetail/KioskBasicInfo';
import { KioskDetailHeader } from '@/features/kiosks/components/KioskDetail/KioskDetailHeader';
import { KioskSetting } from '@/features/kiosks/components/KioskDetail/KioskSetting';
import { ProductGridView } from '@/features/kiosks/components/KioskDetail/ProductGridView';
import { ProductListView } from '@/features/kiosks/components/KioskDetail/ProductListView';


export const KioskDetailPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const { kiosk, isLoading } = useKioskDetail(id);
	const [isEditing, setIsEditing] = useState(false);

	const breadcrumbs = [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.kiosk.title'), href: '../kiosks' },
		{ title: kiosk?.name || translate('nikki.vendingMachine.kiosk.detail.title'), href: '#' },
	];

	if (isLoading || !kiosk) {
		return (
			<PageContainer
				breadcrumbs={breadcrumbs}
				sections={
					[
						<DetailControlPanel onSave={() => {}} onGoBack={() => {}} onDelete={() => {}} />,
					]
				}
			>
				<div>{translate('nikki.general.messages.loading')}</div>
			</PageContainer>
		);
	}

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[
				<DetailControlPanel onSave={() => {}} onGoBack={() => {}} onDelete={() => {}} />,
			]}
		>
			<DetailInfoContainer
				header={ <KioskDetailHeader kiosk={kiosk} isEditing={isEditing} setIsEditing={setIsEditing} />}
				sections={[
					{ title: translate('nikki.vendingMachine.kiosk.tabs.basicInfo'), content: <KioskBasicInfo kiosk={kiosk} isEditing={isEditing} /> },
					{ title: translate('nikki.vendingMachine.kiosk.tabs.kioskSetting'), content: <KioskSetting kiosk={kiosk} isEditing={isEditing} /> },
					{ title: translate('nikki.vendingMachine.kiosk.tabs.productsList'), content: <ProductListView kioskId={kiosk.id} /> },
					{ title: translate('nikki.vendingMachine.kiosk.tabs.productsGrid'), content: <ProductGridView kioskId={kiosk.id} isEditing={isEditing} /> },
					{ title: translate('nikki.vendingMachine.kiosk.tabs.activity'), content: <KioskActivity /> },
				]}
			/>
		</PageContainer>
	);
};



type DetailInfoContainerProps = {
	header: React.ReactNode;
	sections: {
		title: string;
		content: React.ReactNode;
	}[];
};
const DetailInfoContainer: React.FC<DetailInfoContainerProps> = ({ header, sections }) => {
	return (
		<Stack gap='sm'>
			{header}
			<Box>
				{sections.length > 0 &&
				(<Tabs defaultValue='0'>
					<Tabs.List>
						{sections.map((section, index) => (
							<Tabs.Tab value={index.toString()}>
								{section.title}
							</Tabs.Tab>
						))}
					</Tabs.List>

					{sections.map((section, index) => (
						<Tabs.Panel value={index.toString()} py='md'>
							{section.content}
						</Tabs.Panel>
					))}
				</Tabs>)
				}
			</Box>
		</Stack>
	);
};