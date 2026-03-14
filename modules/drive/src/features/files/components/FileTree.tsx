/* eslint-disable max-lines-per-function */
import { ActionIcon, Box, Button, Collapse, Flex, Group, Loader, RenderTreeNodePayload, Stack, Text, Tree, useTree } from '@mantine/core';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import {
	IconChevronDown,
	IconChevronRight,
	IconCircleChevronLeftFilled,
	IconCircleChevronRightFilled,
	IconFile,
	IconFolder,
	IconFolderFilled,
	IconShare,
	IconStarFilled,
	IconTrash,
} from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

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

type DriveFileTreeProps = {
	tree: ReturnType<typeof useTree>;
	data: any[];
	loadingNodeId: string | null;
	onLoad: (value: string) => void;
	onLoadMore: (parentId: string, nodeValue: string) => void;
	onNodeClick: (value: string) => void;
	currentFolderId?: string;
};

function DriveFileTree({
	tree,
	data,
	loadingNodeId,
	onLoad,
	onLoadMore,
	onNodeClick,
	currentFolderId,
}: DriveFileTreeProps) {
	return (
		<Tree
			tree={tree}
			data={data}
			renderNode={(payload) => (
				<Leaf
					{...payload}
					tree={tree}
					isLoading={loadingNodeId === payload.node.value}
					onLoad={onLoad}
					onLoadMore={onLoadMore}
					onNodeClick={onNodeClick}
					currentFolderId={currentFolderId}
				/>
			)}
		/>
	);
}

export interface DriveSidebarProps {
	onClick?: (value: string) => void;
}

export function DriveSidebar({ onClick }: DriveSidebarProps) {
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
	const location = useLocation();

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
		if (value === 'my-files') {
			// Root My files
			navigate('my-files');
		}
		else if (
			value === 'shared-with-me'
			|| value === 'starred'
			|| value === 'trash'
		) {
			// Các node đặc biệt đã có button riêng, không navigate từ tree
			return;
		}
		else {
			// Folder cụ thể
			navigate(`folder/${value}`);
		}
	};

	const treeData = useMemo(
		() => treeRootItemsToTreeData(treeRootItems, treePaging),
		[treeRootItems, treePaging],
	);

	const SIDEBAR_SHOW_KEY = 'drive_sidebarShow';
	const [show, setShowState] = useState<boolean>(() => {
		try {
			const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(SIDEBAR_SHOW_KEY) : null;
			return stored === null ? true : stored === 'true';
		}
		catch {
			return true;
		}
	});
	const setShow = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
		setShowState((prev) => {
			const next = typeof value === 'function' ? value(prev) : value;
			try {
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem(SIDEBAR_SHOW_KEY, String(next));
				}
			}
			catch {
				return prev;
			}
			return next;
		});
	}, []);

	const [hovered, setHovered] = useState(false);
	const [myFilesOpen, setMyFilesOpen] = useState(true);

	const myFilesNode = treeData.find((node) => node.value === 'my-files');
	const myFilesTreeData = myFilesNode?.children ?? [];

	const isMyFilesActive = location.pathname.endsWith('/management/my-files');
	const isSharedActive = currentFolderId === 'shared-with-me';
	const isStarredActive = currentFolderId === 'starred';
	const isTrashActive = location.pathname.endsWith('/management/trash');

	// Đảm bảo FileTree được load root cho My files khi cần
	useEffect(() => {
		if (myFilesOpen && myFilesTreeData.length === 0 && !isShowingLoading) {
			load('', 0, 20);
		}
	}, [myFilesOpen, myFilesTreeData.length, isShowingLoading, load]);

	return (
		<Stack
			gap='sm'
			bg='gray.0'
			bdrs='lg'
			bd='none'
			flex='0 0 auto'
			h='100%'
			mah='100%'
			pos='relative'
			w={show ? '350px' : '0'}
			style={{
				border: '1px solid var(--mantine-color-gray-3)',
				boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)',
				transition: 'width 0.3s ease-in-out',
			}}
		>
			{show && (
				<Stack gap='xs' mah='100%' p='lg'>
					<Flex justify='space-between' gap='xs' w='100%'>
						<Button
							size='md'
							variant={isMyFilesActive ? 'light' : 'subtle'}
							fullWidth
							justify='left'
							leftSection={<IconFolderFilled size={16} />}
							onClick={() => {
								navigate('my-files');
								setMyFilesOpen(true);
							}}
						>
							My files
						</Button>
						<Button
							variant={myFilesOpen ? 'light' : 'subtle'}
							w='fit-content'
							h='100%'
							aria-label={myFilesOpen ? 'Collapse My files tree' : 'Expand My files tree'}
							onClick={() => setMyFilesOpen((prev) => !prev)}
						>
							{myFilesOpen ? <IconChevronDown size={32} /> : <IconChevronRight size={32} />}
						</Button>
					</Flex>
					<Box mah='100%' style={{ overflowY: 'auto' }}>
						<Collapse in={myFilesOpen}>
							<Box style={{ overflowY: 'auto' }} pl='xl'>
								<DriveFileTree
									tree={tree}
									data={myFilesTreeData}
									loadingNodeId={loadingNodeId}
									onLoad={handleLoad}
									onLoadMore={handleLoadMore}
									onNodeClick={handleNodeClick}
									currentFolderId={currentFolderId}
								/>
							</Box>
						</Collapse>
					</Box>
					<Button
						size='md'
						variant={isSharedActive ? 'light' : 'subtle'}
						fullWidth
						justify='left'
						leftSection={<IconShare size={16} />}
						onClick={() => navigate('folder/shared-with-me')}
					>
						Shared with me
					</Button>

					<Button
						size='md'
						variant={isStarredActive ? 'light' : 'subtle'}
						fullWidth
						justify='left'
						leftSection={<IconStarFilled size={16} />}
						onClick={() => navigate('folder/starred')}
					>
						Starred
					</Button>

					<Button
						size='md'
						variant={isTrashActive ? 'light' : 'subtle'}
						color='red'
						fullWidth
						justify='left'
						leftSection={<IconTrash size={16} />}
						onClick={() => navigate('trash')}
					>
						Trash
					</Button>
				</Stack>
			)}

			<Button
				w='fit-content'
				size='xs'
				p={0}
				h='fit-content'
				variant='transparent'
				pos='absolute'
				top='24px'
				right='-18px'
				style={{
					transform: 'translateY(-50%)',
					transition: 'opacity 120ms ease-in-out, box-shadow 120ms ease-in-out',
					boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
					borderRadius: '999px',
					opacity: hovered ? 1 : 0.35,
				}}
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				onClick={() => setShow((prev) => !prev)}
			>
				{
					show ? <IconCircleChevronLeftFilled color='var(--mantine-color-gray-6)' size={32} /> : <IconCircleChevronRightFilled color='var(--mantine-color-gray-6)' size={32} />
				}
			</Button>
		</Stack>
	);
}

export type FileTreeProps = DriveSidebarProps;
export const FileTree = DriveSidebar;
