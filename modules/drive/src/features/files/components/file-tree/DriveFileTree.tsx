import { ActionIcon, Box, Flex, Group, Loader, RenderTreeNodePayload, Text, Tree, useTree } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconFile, IconFolder, IconFolderOpen } from '@tabler/icons-react';

import type { MouseEvent } from 'react';


interface FileIconProps {
	isFolder: boolean;
	expanded: boolean;
}

function FileIcon({ isFolder, expanded }: FileIconProps) {
	if (isFolder) {
		if (expanded) {
			return <IconFolderOpen color='var(--mantine-color-yellow-9)' size={18} stroke={2.5} />;
		}
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

type LeafProps = RenderTreeNodePayload & {
	onNodeClick?: (value: string) => void;
	tree: ReturnType<typeof useTree>;
	onLoad?: (value: string) => void;
	isLoading?: boolean;
	onLoadMore?: (parentId: string, nodeValue: string) => void;
	currentFolderId?: string;
	t?: (key: string) => string;
};

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

function FileNodeLeaf({
	node,
	expanded,
	elementProps,
	isLoading,
	onNodeClick,
	onToggle,
	currentFolderId,
	collapseLabel,
	expandLabel,
}: {
	node: RenderTreeNodePayload['node'];
	expanded: boolean;
	elementProps: RenderTreeNodePayload['elementProps'];
	isLoading?: boolean;
	onNodeClick?: (value: string) => void;
	onToggle: (e: MouseEvent) => void;
	currentFolderId?: string;
	collapseLabel: string;
	expandLabel: string;
}) {
	const isFolder = node.nodeProps?.type === 'folder';
	const background =
		currentFolderId === node.value
			? 'var(--mantine-color-default-hover)'
			: 'transparent';
	const chevron = isLoading
		? <Loader size={14} />
		: expanded
			? <IconChevronDown size={14} title={collapseLabel} />
			: <IconChevronRight size={14} title={expandLabel} />;

	return (
		<Group {...elementProps} onClick={() => onNodeClick?.(node.value)} mb='xs'>
			<Box w='100%' bdrs='sm' bg={background}>
				<Flex
					direction='row'
					gap='xs'
					align='center'
					justify='flex-start'
					w='100%'
					style={{ cursor: 'pointer' }}
				>
					<FileIcon isFolder={isFolder} expanded={expanded} />
					<Text size='sm' fw={500}>
						{node.label}
					</Text>
					<ActionIcon variant='transparent' onClick={onToggle}>
						{chevron}
					</ActionIcon>
				</Flex>
			</Box>
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
}: LeafProps) {
	const type = node.nodeProps?.type;
	const isLoadMore = type === 'load-more';
	const collapseLabel = t ? t('nikki.drive.collapse') : 'Collapse';
	const expandLabel = t ? t('nikki.drive.expand') : 'Expand';

	const handleToggle = (e: MouseEvent) => {
		e.stopPropagation();
		if (!expanded && !isLoading) {
			onLoad?.(node.value);
		}
		tree.toggleExpanded(node.value);
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
		<FileNodeLeaf
			node={node}
			expanded={expanded}
			elementProps={elementProps}
			isLoading={isLoading}
			onNodeClick={onNodeClick}
			onToggle={handleToggle}
			currentFolderId={currentFolderId}
			collapseLabel={collapseLabel}
			expandLabel={expandLabel}
		/>
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
