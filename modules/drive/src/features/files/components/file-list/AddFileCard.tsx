import { Card, Divider, Stack, Text } from '@mantine/core';
import { IconFilePlus, IconFolderPlus } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useOpenCreateFileModal } from '../../hooks/useOpenCreateFileModal';


export function AddFileCard(): React.ReactNode {
	const openCreate = useOpenCreateFileModal();
	const { t } = useTranslation();

	return (
		<Card
			withBorder
			shadow='xs'
			radius='md'
			p='md'
			mih={140}
			h='100%'
		>
			<Stack gap='xs' h='100%' align='stretch' justify='center'>
				<Stack
					gap={4}
					align='center'
					justify='center'
					style={{ cursor: 'pointer' }}
					onClick={() => openCreate(true)}
				>
					<IconFolderPlus size={20} />
					<Text size='xs' c='dimmed'>
						{t('nikki.drive.createFile.createFolder')}
					</Text>
				</Stack>
				<Divider />
				<Stack
					gap={4}
					align='center'
					justify='center'
					style={{ cursor: 'pointer' }}
					onClick={() => openCreate(false)}
				>
					<IconFilePlus size={20} />
					<Text size='xs' c='dimmed'>
						{t('nikki.drive.createFile.createFile')}
					</Text>
				</Stack>
			</Stack>
		</Card>
	);
}
