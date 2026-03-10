import { ActionIcon, Group, Menu, Text } from '@mantine/core';
import { IconDotsVertical, IconFolder, IconInfoCircle, IconPencil } from '@tabler/icons-react';
import { IconDownload } from '@tabler/icons-react';
import { IconTrash } from '@tabler/icons-react';
import React, { useState } from 'react';

import { useDriveFileActions, type DriveFileActions } from '../hooks';
import { UpdateFileMetadataModal } from './UpdateFileMetadataModal';

import type { DriveFile } from '../types';


export function FileActionMenu({ file }: { file: DriveFile }): React.ReactNode {
	const [openUpdateModal, setOpenUpdateModal] = useState(false);
	const actions: DriveFileActions = useDriveFileActions(file);
	const { openFolder, openProperties, download, moveToTrash } = actions;

	return (
		<Menu withinPortal position='bottom-end' shadow='sm'>
			<Menu.Target>
				<ActionIcon
					variant='subtle'
					size='sm'
					radius='xl'
					styles={{
						root: {
							color: 'var(--mantine-color-gray-5)',
							transition: 'background-color 150ms ease, color 150ms ease',
							'&:hover': {
								backgroundColor: 'var(--mantine-color-gray-1)',
								color: 'var(--mantine-color-gray-9)',
							},
						},
					}}
					aria-label='File actions'
				>
					<IconDotsVertical size={16} />
				</ActionIcon>
			</Menu.Target>
			<Menu.Dropdown onClick={(e) => e.stopPropagation()}>
				<Menu.Item onClick={openProperties}>
					<Group align='center' gap='xs'>
						<IconInfoCircle size={16} />
						<Text>Properties</Text>
					</Group>
				</Menu.Item>
				<Menu.Item onClick={() => setOpenUpdateModal(true)}>
					<Group align='center' gap='xs'>
						<IconPencil size={16} />
						<Text>Edit metadata</Text>
					</Group>
				</Menu.Item>
				{
					file.isFolder ? (
						<Menu.Item onClick={openFolder}>
							<Group align='center' gap='xs'>
								<IconFolder size={16} />
								<Text>Open</Text>
							</Group>
						</Menu.Item>
					) : (
						<Menu.Item onClick={download}>
							<Group align='center' gap='xs'>
								<IconDownload size={16} />
								<Text>Download</Text>
							</Group>
						</Menu.Item>
					)
				}
				<Menu.Item color='red' onClick={moveToTrash}>
					<Group align='center' gap='xs'>
						<IconTrash size={16} />
						<Text>Move to trash</Text>
					</Group>
				</Menu.Item>
			</Menu.Dropdown>
			<UpdateFileMetadataModal
				opened={openUpdateModal}
				onClose={() => setOpenUpdateModal(false)}
				file={file}
			/>
		</Menu>
	);
}
