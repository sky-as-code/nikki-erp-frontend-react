import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';


export type ArchiveRestoreModalType = 'archive' | 'restore';

export type ArchiveKioskModelModalProps = {
	opened: boolean;
	onClose: () => void;
	onConfirm: () => void;
	type: ArchiveRestoreModalType;
	name: string;
};

export const ArchiveKioskModelModal: React.FC<ArchiveKioskModelModalProps> = ({
	opened,
	onClose,
	onConfirm,
	type,
	name,
}) => {
	const { t: translate } = useTranslation();

	const isArchive = type === 'archive';

	return (
		<ConfirmModal
			title={isArchive
				? translate('nikki.vendingMachine.kioskModels.messages.archive_modal_title')
				: translate('nikki.vendingMachine.kioskModels.messages.restore_modal_title')}
			opened={opened}
			onClose={onClose}
			onConfirm={onConfirm}
			message={
				<Trans
					i18nKey={isArchive
						? 'nikki.vendingMachine.kioskModels.messages.archive_confirm'
						: 'nikki.vendingMachine.kioskModels.messages.restore_confirm'}
					values={{ name }}
					components={{ strong: <strong /> }}
				/>
			}
			confirmLabel={isArchive
				? translate('nikki.general.actions.archive')
				: translate('nikki.general.actions.restore')}
			confirmColor={isArchive ? 'orange' : 'blue'}
		/>
	);
};
