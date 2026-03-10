import type { DriveFile } from '../types';
import type { TreeNodeData } from '@mantine/core';


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
): TreeNodeData {
	const baseChildren = (file.children ?? [])
		.filter((c) => isFolder(c as DriveFileApi))
		.map((child) => driveFileToTreeNode(child, paging));

	const parentPaging = paging?.[file.id];
	const hasMore = !!parentPaging
		&& parentPaging.total !== undefined
		&& parentPaging.loaded !== undefined
		&& parentPaging.loaded < parentPaging.total;

	const folderChildren: TreeNodeData[] = hasMore
		? [
			...baseChildren,
			{
				label: 'Load more folders',
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

const STATIC_TREE_NODES: TreeNodeData[] = [
	{ label: 'Shared with me', value: 'shared-with-me', nodeProps: { type: 'folder' } },
	{ label: 'Starred', value: 'starred', nodeProps: { type: 'folder' } },
	{ label: 'Trash', value: 'trash', nodeProps: { type: 'folder' } },
];

/** Convert treeRootItems (DriveFile[]) thành data cho Mantine Tree. Chỉ hiển thị folder. */
export function treeRootItemsToTreeData(
	treeRootItems: DriveFile[],
	paging?: TreePagingState,
): TreeNodeData[] {
	const baseChildren = treeRootItems
		.filter((f) => isFolder(f as DriveFileApi))
		.map((file) => driveFileToTreeNode(file, paging));

	const rootPaging = paging?.[''];
	const hasMoreAtRoot = !!rootPaging
		&& rootPaging.total !== undefined
		&& rootPaging.loaded !== undefined
		&& rootPaging.loaded < rootPaging.total;

	const myFilesChildren: TreeNodeData[] = hasMoreAtRoot
		? [
			...baseChildren,
			{
				label: 'Load more folders',
				value: 'root::load-more',
				nodeProps: { type: 'load-more', parentId: '' },
				children: [],
			},
		]
		: baseChildren;

	const myFilesNode: TreeNodeData = {
		label: 'My files',
		value: 'my-files',
		nodeProps: { type: 'folder' },
		children: myFilesChildren,
	};
	return [myFilesNode, ...STATIC_TREE_NODES];
}
