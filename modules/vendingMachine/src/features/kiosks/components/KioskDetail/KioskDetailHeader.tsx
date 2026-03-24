

import { Avatar, Box, Button, Group, Text } from '@mantine/core';
import { IconDeviceDesktop } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Kiosk } from '@/features/kiosks/types';


interface KioskDetailHeaderProps {
	kiosk: Kiosk;
	isEditing: boolean;
	setIsEditing: (value: boolean) => void;
}

export const KioskDetailHeader: React.FC<KioskDetailHeaderProps> = ({ kiosk, isEditing, setIsEditing }) => {
	const { t: translate } = useTranslation();

	const handleSave = () => {
		// TODO: Implement save logic
		setIsEditing(false);
	};

	const handleCancel = () => {
		setIsEditing(false);
	};

	return (
		<Group justify='space-between' mb='sm' align='start'>
			<Group gap='sm' align='start'>
				<Box>
					<Avatar
						// src={'https://placehold.co/100x100'}
						size={46}
						radius='md'
					>
						<IconDeviceDesktop size={46} />
					</Avatar>
				</Box>
				<Box>
					<Text fw={600} size='lg' lh={1} mb={'xs'}>{kiosk.name}</Text>
					<Text size='sm' c='dimmed'>
						{kiosk.code}
					</Text>
				</Box>
			</Group>
			{!isEditing ? (
				<Button size='xs' onClick={() => setIsEditing(true)}>
					{translate('nikki.general.actions.edit')}
				</Button>
			) : (
				<Group gap='xs'>
					<Button size='xs' onClick={handleSave}>
						{translate('nikki.general.actions.save')}
					</Button>
					<Button size='xs' variant='subtle' onClick={handleCancel}>
						{translate('nikki.general.actions.cancel')}
					</Button>
				</Group>
			)}
		</Group>
	);
};
