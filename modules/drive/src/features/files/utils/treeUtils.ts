import type { DriveFile } from '../types';
import type { TreeNodeData } from '@mantine/core';
import { DRIVE_TABS } from '@/constants/driveTabs';


export type DriveTreeTranslate = (key: string) => string;


export type DriveTreeTranslate = (key: string) => string;


type DriveFileApi = DriveFile & { is_folder?: boolean };

type TreePagingState = Record<string, {
	total?: number;
	loaded?: number;
}>;

/** API có thể trả is_folder (snake_case), chuẩn hóa để lấy isFolder. */
function isFolder(item: DriveFileApi): boolean {
	return item.isFolder === true || item.is_folder === true;
}

/** Convert DriveFile → TreeNodeData (đệ quy theo children). Chỉ hiển thị folder. */
export function driveFileToTreeNode(
	file: DriveFile,
	paging?: TreePagingState,
	t?: DriveTreeTranslate,
): TreeNodeData {
	const baseChildren = (file.children ?? [])
		.filter((c) => isFolder(c as DriveFileApi))
		.map((child) => driveFileToTreeNode(child, paging, t));

	const parentPaging = paging?.[file.id];
	const hasMore = !!parentPaging
		&& parentPaging.total !== undefined
		&& parentPaging.loaded !== undefined
		&& parentPaging.loaded < parentPaging.total;

	const loadMoreLabel = t ? t('nikki.drive.loadMoreFolders') : 'Load more folders';
	const folderChildren: TreeNodeData[] = hasMore
		? [
			...baseChildren,
			{
				label: loadMoreLabel,
				value: `${file.id}::load-more`,
				nodeProps: { type: 'load-more', parentId: file.id },
				children: [],
			},
		]
		: baseChildren;

	return {
		label: file.name,
		value: file.id,
		nodeProps: { type: isFolder(file as DriveFileApi) ? 'folder' : 'file' },
		children: folderChildren,
	};
}

function getStaticTreeNodes(t?: DriveTreeTranslate): TreeNodeData[] {
	const shared = t ? t('nikki.drive.sharedWithMe') : 'Shared with me';
	const starred = t ? t('nikki.drive.starred') : 'Starred';
	const trash = t ? t('nikki.drive.trash') : 'Trash';
	return [
		{ label: shared, value: DRIVE_TABS.SHARED_WITH_ME, nodeProps: { type: 'folder' } },
		{ label: starred, value: DRIVE_TABS.STARRED, nodeProps: { type: 'folder' } },
		{ label: trash, value: DRIVE_TABS.TRASH, nodeProps: { type: 'folder' } },
	];
}

/** Convert treeRootItems (DriveFile[]) thành data cho Mantine Tree. Chỉ hiển thị folder. */
export function treeRootItemsToTreeData(
	treeRootItems: DriveFile[],
	paging?: TreePagingState,
	t?: DriveTreeTranslate,
): TreeNodeData[] {
	const loadMoreLabel = t ? t('nikki.drive.loadMoreFolders') : 'Load more folders';
	const myFilesLabel = t ? t('nikki.drive.myFiles') : 'My files';

	const baseChildren = treeRootItems
		.filter((f) => isFolder(f as DriveFileApi))
		.map((file) => driveFileToTreeNode(file, paging, t));

	const rootPaging = paging?.[''];
	const hasMoreAtRoot = !!rootPaging
		&& rootPaging.total !== undefined
		&& rootPaging.loaded !== undefined
		&& rootPaging.loaded < rootPaging.total;

	const myFilesChildren: TreeNodeData[] = hasMoreAtRoot
		? [
			...baseChildren,
			{
				label: loadMoreLabel,
				value: 'root::load-more',
				nodeProps: { type: 'load-more', parentId: '' },
				children: [],
			},
		]
		: baseChildren;

	const myFilesNode: TreeNodeData = {
		label: myFilesLabel,
		value: DRIVE_TABS.MY_FILES,
		nodeProps: { type: 'folder' },
		children: myFilesChildren,
	};
	return [myFilesNode, ...getStaticTreeNodes(t)];
}
