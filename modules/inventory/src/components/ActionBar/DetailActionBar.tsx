import { Button, Group } from '@mantine/core';
import { IconTrash, IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


export interface DetailActionBarProps {
	onSave: () => void;
	onGoBack: () => void;
	onDelete: () => void;
}

export const DetailActionBar: React.FC<DetailActionBarProps> = ({
	onSave,
	onGoBack,
	onDelete,
}) => {
	const { t: translate } = useTranslation();


	return (
		<Group justify='space-between' align='center' wrap='wrap'>
			<Group gap='md' wrap='wrap'>
				<Button
					variant='outline'
					leftSection={<IconArrowLeft size={16} />}
					onClick={onGoBack}
				>
					{translate('nikki.general.actions.back')}
				</Button>
				<Button
					variant='filled'
					leftSection={<IconDeviceFloppy size={16} />}
					onClick={onSave}
				>
					{translate('nikki.general.actions.save')}
				</Button>
				<Button
					variant='outline'
					color='red'
					leftSection={<IconTrash size={16} />}
					onClick={onDelete}
				>
					{translate('nikki.general.actions.delete')}
				</Button>
			</Group>

			<Group gap='md' wrap='wrap' align='flex-end'>
				{/*  */}
			</Group>
		</Group>
	);
};
