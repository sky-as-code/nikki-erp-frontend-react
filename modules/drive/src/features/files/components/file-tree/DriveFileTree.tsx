import { ActionIcon, Box, Flex, Group, Loader, RenderTreeNodePayload, Text, Tree, useTree } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconFile, IconFolder, IconFolderFilled, IconShare, IconStarFilled, IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

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
	return <IconFile color='var(--mantine-color-yellow-9)' size={18} stroke={2.5} />;
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
		<Group {...elementProps} onClick={handleLoadMoreClick} mb='xs'>
			<Flex
				direction='row'
				gap='xs'
				align='center'
				justify='flex-start'
				w='100%'
				style={{ cursor: 'pointer' }}
				title={node.label as string}
			>
				{isLoading
					? <Loader size={14} />
					: <Text size='sm' c='blue'>{node.label}</Text>}
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
	t,
}: RenderTreeNodePayload & {
	onNodeClick?: (value: string) => void;
	tree: ReturnType<typeof useTree>;
	onLoad?: (value: string) => void;
	isLoading?: boolean;
	onLoadMore?: (parentId: string, nodeValue: string) => void;
	currentFolderId?: string;
	t?: (key: string) => string;
}) {
	const type = node.nodeProps?.type;
	const isFolder = type === 'folder';
	const isLoadMore = type === 'load-more';
	const openFolderLabel = t ? t('nikki.drive.openFolder') : 'Open folder';
	const collapseLabel = t ? t('nikki.drive.collapse') : 'Collapse';
	const expandLabel = t ? t('nikki.drive.expand') : 'Expand';

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

	const buildHref = (value: string): string => {
		if (value === 'my-files') return 'my-files';
		if (value === 'shared-with-me') return 'shared-with-me';
		if (value === 'starred') return 'starred';
		if (value === 'trash') return 'trash';
		return `folder/${value}`;
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
		<Group {...elementProps} onClick={handleClick} mb='xs'>
			<Box
				w='100%'
				bdrs='sm'
				bg={currentFolderId === node.value ? 'var(--mantine-color-default-hover)' : 'transparent'}
			>
				<Flex
					direction='row'
					gap='xs'
					align='center'
					justify='flex-start'
					w='100%'
					style={{ cursor: 'pointer' }}
					title={openFolderLabel}
				>
					<FileIcon value={node.value} isFolder={isFolder} expanded={expanded} />
					<Text
						size='sm'
						fw={500}
						component={Link}
						to={buildHref(node.value)}
						onClick={(e) => {
							e.preventDefault();
							handleClick(e as unknown as MouseEvent);
						}}
					>
						{node.label}
					</Text>
					<ActionIcon variant='transparent' onClick={handleToggle}>
						{
							isLoading ? <Loader size={14} /> :
								expanded
									? <IconChevronDown size={14} title={collapseLabel} />
									: <IconChevronRight size={14} title={expandLabel} />
						}
					</ActionIcon>
				</Flex>
			</Box>
		</Group>
	);
}

export type DriveFileTreeProps = {
	tree: ReturnType<typeof useTree>;
	data: any[];
	loadingNodeId: string | null;
	onLoad: (value: string) => void;
	onLoadMore: (parentId: string, nodeValue: string) => void;
	onNodeClick: (value: string) => void;
	currentFolderId?: string;
	t?: (key: string) => string;
};

export function DriveFileTree({
	tree,
	data,
	loadingNodeId,
	onLoad,
	onLoadMore,
	onNodeClick,
	currentFolderId,
	t,
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
					t={t}
				/>
			)}
		/>
	);
}
