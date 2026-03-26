import type { DriveFile } from '@/features/files/types';
import type { TreeNodeData } from '@mantine/core';

import { DRIVE_TABS } from '@/constants/driveTabs';


type DriveFileApi = DriveFile & { is_folder?: boolean };

/** API có thể trả is_folder (snake_case), chuẩn hóa để lấy isFolder. */
function isFolder(item: DriveFileApi): boolean {
	return item.isFolder === true || item.is_folder === true;
}

/** Convert DriveFile → TreeNodeData (đệ quy theo children). Chỉ hiển thị folder. */
export function driveFileToTreeNode(file: DriveFile): TreeNodeData {
	const folderChildren = (file.children ?? [])
		.filter((c) => isFolder(c as DriveFileApi))
		.map(driveFileToTreeNode);
	return {
		label: file.name,
		value: file.id,
		nodeProps: { type: isFolder(file as DriveFileApi) ? 'folder' : 'file' },
		children: folderChildren,
	};
}

const STATIC_TREE_NODES: TreeNodeData[] = [
	{ label: 'Shared with me', value: DRIVE_TABS.SHARED_WITH_ME, nodeProps: { type: 'folder' } },
	{ label: 'Starred', value: DRIVE_TABS.STARRED, nodeProps: { type: 'folder' } },
	{ label: 'Trash', value: DRIVE_TABS.TRASH, nodeProps: { type: 'folder' } },
];

/** Convert treeRootItems (DriveFile[]) thành data cho Mantine Tree. Chỉ hiển thị folder. */
export function treeRootItemsToTreeData(treeRootItems: DriveFile[]): TreeNodeData[] {
	const myFilesChildren = treeRootItems
		.filter((f) => isFolder(f as DriveFileApi))
		.map(driveFileToTreeNode);
	const myFilesNode: TreeNodeData = {
		label: 'My files',
		value: DRIVE_TABS.MY_FILES,
		nodeProps: { type: 'folder' },
		children: myFilesChildren,
	};
	return [myFilesNode, ...STATIC_TREE_NODES];
}
