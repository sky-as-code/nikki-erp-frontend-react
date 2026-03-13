import { ActionIcon, Group, Menu, Text } from '@mantine/core';
import { IconArrowBackUp, IconArrowBackUpDouble, IconDotsVertical, IconFileShredder, IconFolder, IconInfoCircle, IconPencil } from '@tabler/icons-react';
import { IconDownload } from '@tabler/icons-react';
import { IconTrash } from '@tabler/icons-react';
import React from 'react';

import { useDriveFileActions, type DriveFileActions } from '../hooks';
import { DriveFileStatus, type DriveFile } from '../types';


const DEFAULT_ACTIONS = [
	PropertiesItem,
	EditMetadataItem,
	DeleteItem,
];

const FOLDER_ACTIONS = [
	OpenFolderItem,
];

const FILE_ACTIONS = [
	DownloadItem,
];

const ACTIVE_STATUS_ACTIONS = [
	MoveToTrashItem,
];

const TRASHED_STATUS_ACTIONS = [
	Restore,
	RestoreTo,
];

const PARENT_IN_TRASH_STATUS_ACTIONS = [
	RestoreTo,
];

const actionOrder = new Map<React.FC<any>, number>([
	[PropertiesItem, 0],
	[EditMetadataItem, 1],
	[DownloadItem, 2],
	[OpenFolderItem, 3],
	[MoveToTrashItem, 4],
	[Restore, 5],
	[RestoreTo, 6],
	[DeleteItem, 7],
]);

const getActions = (file: DriveFile): React.FC<any>[] => {
	const actions: React.FC<any>[] = [...DEFAULT_ACTIONS];
	if (file.isFolder){
		actions.push(...FOLDER_ACTIONS);
	}
	else {
		actions.push(...FILE_ACTIONS);
	}

	switch (file.status) {
		case DriveFileStatus.ACTIVE:
			actions.push(...ACTIVE_STATUS_ACTIONS);
			break;
		case DriveFileStatus.IN_TRASH:
			actions.push(...TRASHED_STATUS_ACTIONS);
			break;
		case DriveFileStatus.PARENT_IN_TRASH:
			actions.push(...PARENT_IN_TRASH_STATUS_ACTIONS);
			break;
	}

	return actions.sort((a, b) => (actionOrder.get(a) ?? 0) - (actionOrder.get(b) ?? 0));
};

export function FileActionMenu({ file }: { file: DriveFile }): React.ReactNode {
	const actions: DriveFileActions = useDriveFileActions(file);
	const menuActions = {
		...actions,
	};
	const actionsComponents = getActions(file);

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
				{actionsComponents.map((ActionComponent) => (
					<ActionComponent key={ActionComponent.name ?? 'unknown'} {...menuActions} />
				))}
			</Menu.Dropdown>
		</Menu>
	);
}

function PropertiesItem({ openProperties }: { openProperties: () => void }): React.ReactNode {
	return (
		<Menu.Item color='blue' onClick={openProperties}>
			<Group align='center' gap='xs'>
				<IconInfoCircle size={16} />
				<Text>Properties</Text>
			</Group>
		</Menu.Item>
	);
}

function MoveToTrashItem({ moveToTrash }: { moveToTrash: () => void }): React.ReactNode {
	return (
		<Menu.Item color='red' onClick={moveToTrash}>
			<Group align='center' gap='xs'>
				<IconTrash size={16} />
				<Text>Move to trash</Text>
			</Group>
		</Menu.Item>
	);
}

function OpenFolderItem({ openFolder }: { openFolder: () => void }): React.ReactNode {
	return (
		<Menu.Item onClick={openFolder}>
			<Group align='center' gap='xs'>
				<IconFolder size={16} />
				<Text>Open</Text>
			</Group>
		</Menu.Item>
	);
}

function DownloadItem({ download }: { download: () => void }): React.ReactNode {
	return (
		<Menu.Item onClick={download}>
			<Group align='center' gap='xs'>
				<IconDownload size={16} />
				<Text>Download</Text>
			</Group>
		</Menu.Item>
	);
}

function EditMetadataItem({ editMetadata }: { editMetadata: () => void }): React.ReactNode {
	return (
		<Menu.Item onClick={editMetadata}>
			<Group align='center' gap='xs'>
				<IconPencil size={16} />
				<Text>Edit metadata</Text>
			</Group>
		</Menu.Item>
	);
}

function Restore({ restoreFromTrash }: { restoreFromTrash: () => void }): React.ReactNode {
	return (
		<Menu.Item color='green' onClick={() => restoreFromTrash()}>
			<Group align='center' gap='xs'>
				<IconArrowBackUp size={16} />
				<Text>Restore</Text>
			</Group>
		</Menu.Item>
	);
}

function RestoreTo({restoreTo}: {restoreTo: () => void}):React.ReactNode {
	return (
		<Menu.Item color='green' onClick={() => restoreTo()}>
			<Group align='center' gap='xs'>
				<IconArrowBackUpDouble size={16} />
				<Text>Restore to</Text>
			</Group>
		</Menu.Item>
	);
}

function DeleteItem({ confirmDelete }: { confirmDelete: () => void }): React.ReactNode {
	return (
		<Menu.Item color='red' onClick={confirmDelete}>
			<Group align='center' gap='xs'>
				<IconFileShredder size={16} />
				<Text>Delete</Text>
			</Group>
		</Menu.Item>
	);
}
