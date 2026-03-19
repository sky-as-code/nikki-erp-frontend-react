import { useTree } from '@mantine/core';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import {
	driveFileActions,
	selectTreeExpandedState,
	selectTreePaging,
	selectTreeRootItems,
} from '@/appState/file';
import { DRIVE_TABS } from '@/constants/driveTabs';
import { useOrgModulePath } from '@/hooks/useRootPath';

import { useMinimumLoading } from './useMinimumLoading';
import { useTreeNode } from './useTreeNode';
import { treeRootItemsToTreeData } from '../utils';


function useDriveSidebarTreeData() {
	const { t } = useTranslation();
	const treeRootItems = useMicroAppSelector(selectTreeRootItems);
	const treePaging = useMicroAppSelector(selectTreePaging);
	const myFilesTreeData = useMemo(() => {
		const treeData = treeRootItemsToTreeData(treeRootItems, treePaging, t);
		const myFilesNode = treeData.find((node) => node.value === DRIVE_TABS.MY_FILES);
		return myFilesNode?.children ?? [];
	}, [treeRootItems, treePaging, t]);
	return { myFilesTreeData, t };
}

function useTreeLoadState(
	load: (parentId: string, page: number, size: number) => void,
	isLoading: boolean,
	treePaging: Record<string, { page: number }>,
) {
	const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);
	const isShowingLoading = useMinimumLoading(isLoading, 300);

	const handleLoad = useCallback((value: string) => {
		const parentId = value === DRIVE_TABS.MY_FILES ? '' : value;
		setLoadingNodeId(value);
		load(parentId, 0, 20);
	}, [load]);

	const handleLoadMore = useCallback((parentId: string, nodeValue: string) => {
		const pagingInfo = treePaging[parentId];
		const nextPage = pagingInfo ? pagingInfo.page + 1 : 1;
		setLoadingNodeId(nodeValue);
		load(parentId, nextPage, 20);
	}, [treePaging, load]);

	useEffect(() => {
		if (!isShowingLoading && loadingNodeId !== null) {
			setLoadingNodeId(null);
		}
	}, [isShowingLoading, loadingNodeId]);

	return { loadingNodeId, handleLoad, handleLoadMore, isShowingLoading };
}

export function useDriveSidebarTree(onClick?: (value: string) => void) {
	const dispatch = useMicroAppDispatch();
	const treeExpandedState = useMicroAppSelector(selectTreeExpandedState);
	const tree = useTree({ initialExpandedState: treeExpandedState });
	const { load, isLoading } = useTreeNode('');
	const treePaging = useMicroAppSelector(selectTreePaging);
	const navigate = useNavigate();
	const path = useOrgModulePath();
	const currentFolderId = useParams<{ driveFileId: string }>().driveFileId;

	const { myFilesTreeData, t } = useDriveSidebarTreeData();
	const { loadingNodeId, handleLoad, handleLoadMore, isShowingLoading } = useTreeLoadState(
		load,
		isLoading,
		treePaging,
	);

	useEffect(() => {
		dispatch(driveFileActions.setTreeExpandedState(tree.expandedState));
	}, [tree.expandedState, dispatch]);

	const handleNodeClick = useCallback((value: string) => {
		onClick?.(value);
		if (value === DRIVE_TABS.MY_FILES) {
			navigate(`${path}/management/${DRIVE_TABS.MY_FILES}`);
		}
		else if (
			value !== DRIVE_TABS.SHARED_WITH_ME
			&& value !== DRIVE_TABS.STARRED
			&& value !== DRIVE_TABS.TRASH
		) {
			navigate(`${path}/management/folder/${value}`);
		}
	}, [navigate, onClick]);

	return {
		tree,
		loadingNodeId,
		myFilesTreeData,
		handleLoad,
		handleLoadMore,
		handleNodeClick,
		load,
		isShowingLoading,
		currentFolderId,
		t,
	};
}
