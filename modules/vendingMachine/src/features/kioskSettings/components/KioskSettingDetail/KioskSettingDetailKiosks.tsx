import { Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AssignedKioskList, KioskSelectModal } from '@/components/AssignKiosks';

import { KioskSetting } from '../../types';
import { useKioskSettingKiosksTab } from './hooks/useKioskSettingKiosksTab';


export type KioskSettingDetailKiosksProps = {
	setting: KioskSetting;
};

export const KioskSettingDetailKiosks: React.FC<KioskSettingDetailKiosksProps> = ({
	setting,
}) => {
	const {
		kiosks,
		kioskSelectModalOpened,
		onAddKiosks,
		onCloseKioskSelectModal,
		onRemoveKiosk,
		onSelectKiosks,
		isEditing,
	} = useKioskSettingKiosksTab({ setting });
	const { t: translate } = useTranslation();

	return (
		<Stack gap='md'>
			<Text size='sm' c='dimmed' fw={500}>
				{translate('nikki.vendingMachine.kioskSettings.fields.kiosks')}
			</Text>

			<AssignedKioskList
				kiosks={kiosks}
				onAddKiosks={isEditing ? onAddKiosks : undefined}
				onRemoveKiosk={isEditing ? onRemoveKiosk : undefined}
			/>

			<KioskSelectModal
				opened={kioskSelectModalOpened}
				onClose={onCloseKioskSelectModal}
				onSelectKiosks={onSelectKiosks}
				selectedKioskIds={kiosks.map((kiosk) => kiosk.id)}
			/>
		</Stack>
	);
};
