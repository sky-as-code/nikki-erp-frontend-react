import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';


export type DeleteKioskModelModalProps = {
	opened: boolean;
	onClose: () => void;
	onConfirm: () => void;
	/** Name shown in the confirmation message */
	name: string;
};

export const DeleteKioskModelModal: React.FC<DeleteKioskModelModalProps> = ({
	opened,
	onClose,
	onConfirm,
	name,
}) => {
	const { t: translate } = useTranslation();

	return (
		<ConfirmModal
			title={translate('nikki.general.messages.delete_confirm')}
			opened={opened}
			onClose={onClose}
			onConfirm={onConfirm}
			message={
				<Trans
					i18nKey='nikki.vendingMachine.kioskModels.messages.delete_confirm'
					values={{ name }}
					components={{ strong: <strong /> }}
				/>
			}
			confirmLabel={translate('nikki.general.actions.delete')}
			confirmColor='red'
		/>
	);
};
