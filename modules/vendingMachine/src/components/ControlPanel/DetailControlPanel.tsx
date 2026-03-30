import { IconArrowLeft, IconDeviceFloppy, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanel } from './ControlPanel';


export interface DetailControlPanelProps {
	onSave?: () => void;
	onGoBack?: () => void;
	onDelete?: () => void;
}

//! @deprecated Use ControlPanel.sections with ControlPanelAction instead
export const DetailControlPanel: React.FC<DetailControlPanelProps> = ({
	onSave,
	onGoBack,
	onDelete,
}) => {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();

	return (
		<ControlPanel
			actions={[
				{
					label: translate('nikki.general.actions.back'),
					leftSection: <IconArrowLeft size={16} />,
					onClick: onGoBack ?? (() => navigate(-1)),
					variant: 'outline',
				},
				{
					label: translate('nikki.general.actions.save'),
					leftSection: <IconDeviceFloppy size={16} />,
					onClick: onSave ?? (() => {}),
					variant: 'filled',
				},
				{
					label: translate('nikki.general.actions.delete'),
					leftSection: <IconTrash size={16} />,
					onClick: onDelete ?? (() => {}),
					variant: 'outline',
					color: 'red',
				},
			]}
		/>
	);
};
