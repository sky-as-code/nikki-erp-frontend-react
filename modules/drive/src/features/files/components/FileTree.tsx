import { ActionIcon, Button, Flex, Group, Loader, RenderTreeNodePayload, Stack, Text, Tree, useTree } from '@mantine/core';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import {
	IconFolder,
	IconFolderFilled,
	IconShare,
	IconStarFilled,
	IconTrash,
	IconFile,
	IconChevronDown,
	IconChevronRight,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { driveFileActions, selectTreeExpandedState, selectTreePaging, selectTreeRootItems } from '@/appState/file';

import { useMinimumLoading, useTreeNode } from '../hooks';
import { treeRootItemsToTreeData } from '../utils';

import type { MouseEvent } from 'react';


interface FileIconProps {
	isFolder: boolean;
	expanded: boolean;
	value: string;
}

function FileIcon({ value, isFolder }: FileIconProps) {
	if (value === 'my-files') {
		return <IconFolderFilled color='var(--mantine-color-yellow-9)' size={18} stroke={2.5} />;
	}
	if (value === 'shared-with-me') {
		return <IconShare color='var(--mantine-color-yellow-9)' size={18} stroke={2.5} />;
	}
	if (value === 'starred') {
		return <IconStarFilled color='var(--mantine-color-yellow-9)' size={18} stroke={2.5} />;
	}
	if (value === 'trash') {
		return <IconTrash color='var(--mantine-color-yellow-9)' size={18} stroke={2.5} />;
	}

	if (isFolder) {
		return <IconFolder color='var(--mantine-color-yellow-9)' size={18} stroke={2.5} />;
	}
	else {
		return <IconFile color='var(--mantine-color-yellow-9)' size={18} stroke={2.5} />;
	}
}


interface LoadMoreLeafProps {
	node: RenderTreeNodePayload['node'];
	elementProps: RenderTreeNodePayload['elementProps'];
	isLoading?: boolean;
	onLoadMore?: (parentId: string, nodeValue: string) => void;
}

function LoadMoreLeaf({
	node,
	elementProps,
	isLoading,
	onLoadMore,
}: LoadMoreLeafProps) {
	const handleLoadMoreClick = (e: MouseEvent) => {
		e.stopPropagation();
		const parentId = (node.nodeProps as any)?.parentId ?? '';
		onLoadMore?.(parentId, node.value);
	};

	return (
		<Group {...elementProps} onClick={handleLoadMoreClick} mb={'xs'}>
			<Flex
				direction='row'
				gap={'xs'}
				align='center'
				justify='flex-start'
				w={'100%'}
				style={{ cursor: 'pointer' }}
				title='Load more folders'
			>
				{isLoading
					? <Loader size={14} />
					: <Text size='sm' c='blue'>Load more folders</Text>}
			</Flex>
		</Group>
	);
}


function Leaf({
	node,
	expanded,
	elementProps,
	tree,
	onNodeClick,
	onLoad,
	currentFolderId,
	isLoading,
	onLoadMore,
}: RenderTreeNodePayload & {
	onNodeClick?: (value: string) => void;
	tree: ReturnType<typeof useTree>;
	onLoad?: (value: string) => void;
	isLoading?: boolean;
	onLoadMore?: (parentId: string, nodeValue: string) => void;
	currentFolderId?: string;
}) {
	const type = node.nodeProps?.type;
	const isFolder = type === 'folder';
	const isLoadMore = type === 'load-more';

	const handleToggle = (e: MouseEvent) => {
		e.stopPropagation();
		if (!expanded && !isLoading) {
			onLoad?.(node.value);
		}
		tree.toggleExpanded(node.value);
	};

	const handleClick = (_: MouseEvent) => {
		onNodeClick?.(node.value);
	};

	if (isLoadMore) {
		return (
			<LoadMoreLeaf
				node={node}
				elementProps={elementProps}
				isLoading={isLoading}
				onLoadMore={onLoadMore}
			/>
		);
	}

	return (
		<Group {...elementProps} onClick={handleClick} mb={'xs'}>
			<Flex
				direction='row'
				gap={'xs'}
				align='center'
				justify='flex-start'
				w={'100%'}
				style={{ cursor: 'pointer' }}
				title='Open folder'
				bg={currentFolderId === node.value ? 'var(--mantine-color-gray-3)' : 'transparent'}
			>
				<FileIcon value={node.value} isFolder={isFolder} expanded={expanded} />
				<Text size='md' fw={'bold'}>{node.label}</Text>
				<ActionIcon variant='transparent' onClick={handleToggle}>
					{
						isLoading ? <Loader size={14} /> :
							expanded
								? <IconChevronDown size={14} title='Collapse' />
								: <IconChevronRight size={14} title='Expand' />
					}
				</ActionIcon>
			</Flex>
		</Group>
	);
}

export interface FileTreeProps {
	onClick?: (value: string) => void;
}

export function FileTree({ onClick }: FileTreeProps) {
	const dispatch = useMicroAppDispatch();
	const treeExpandedState = useMicroAppSelector(selectTreeExpandedState);
	const tree = useTree({ initialExpandedState: treeExpandedState });
	const { load, isLoading } = useTreeNode('');
	const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);
	const isShowingLoading = useMinimumLoading(isLoading, 300);
	const treeRootItems = useMicroAppSelector(selectTreeRootItems);
	const treePaging = useMicroAppSelector(selectTreePaging);
	const navigate = useNavigate();
	const currentFolderId = useParams<{ driveFileId: string }>().driveFileId;

	useEffect(() => {
		dispatch(driveFileActions.setTreeExpandedState(tree.expandedState));
	}, [tree.expandedState, dispatch]);

	const handleLoad = (value: string) => {
		const parentId = value === 'my-files' ? '' : value;
		setLoadingNodeId(value);
		load(parentId, 0, 20);
	};

	const handleLoadMore = (parentId: string, nodeValue: string) => {
		const pagingInfo = treePaging[parentId];
		const nextPage = pagingInfo ? pagingInfo.page + 1 : 1;
		setLoadingNodeId(nodeValue);
		load(parentId, nextPage, 20);
	};

	useEffect(() => {
		if (!isShowingLoading && loadingNodeId !== null) {
			setLoadingNodeId(null);
		}
	}, [isShowingLoading, loadingNodeId]);

	const handleNodeClick = (value: string) => {
		onClick?.(value);
		navigate(`../drive/folder/${value}`);
	};

	const treeData = useMemo(
		() => treeRootItemsToTreeData(treeRootItems, treePaging),
		[treeRootItems, treePaging],
	);

	return (
		<Stack
			gap={'sm'}
			w={'fit-content'}
			p={'lg'}
			bg={'white'}
			bdrs={'sm'}
			flex='0 0 auto'
			miw={'350px'}
			h={'fit-content'}
			mah='100%'
			style={{
				border: '1px solid var(--mantine-color-gray-3)',
				boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)',
			}}
		>
			<Button size='md' w={'100%'}>Add</Button>
			<Tree
				tree={tree}
				data={treeData}
				style={{ maxHeight: '100%', overflowY: 'auto' }}
				renderNode={(payload) =>
					<Leaf {...payload}
						tree={tree}
						isLoading={loadingNodeId === payload.node.value}
						onLoad={handleLoad}
						onLoadMore={handleLoadMore}
						onNodeClick={handleNodeClick}
						currentFolderId={currentFolderId}
					/>}
			/>
		</Stack>
	);
}
