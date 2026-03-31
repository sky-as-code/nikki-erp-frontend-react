import { Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AssignedKioskList } from '@/components/AssignKiosks';
import { KioskSelectModal } from '@/features/events/components/EventDetailDrawer/KioskSelectModal';
import { Kiosk } from '@/features/kiosks/types';


export type KioskSettingDetailKiosksProps = {
	kiosks: Kiosk[];
	/** Khi tắt, không hiển thị thêm / xóa kiosk. */
	kioskSelectModalOpened: boolean;
	onCloseKioskSelectModal: () => void;

	isEditing?: boolean;
	onAddKiosks: () => void;
	onRemoveKiosk: (kioskId: string) => void;
	onSelectKiosks: (kiosks: Kiosk[]) => void;
};

export const KioskSettingDetailKiosks: React.FC<KioskSettingDetailKiosksProps> = ({
	kiosks,
	isEditing = false,
	kioskSelectModalOpened,
	onCloseKioskSelectModal,
	onAddKiosks,
	onRemoveKiosk,
	onSelectKiosks,
}) => {
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
