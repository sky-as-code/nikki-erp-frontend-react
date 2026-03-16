import { Box, Button, Collapse, Flex, Paper, Stack } from '@mantine/core';
import {
	IconChevronDown,
	IconChevronRight,
	IconCircleChevronLeftFilled,
	IconCircleChevronRightFilled,
	IconFolderFilled,
	IconShare,
	IconStarFilled,
	IconTrash,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useDriveSidebarActiveRoutes } from '../../hooks/useDriveSidebarActiveRoutes';
import { useDriveSidebarTree } from '../../hooks/useDriveSidebarTree';

import { DriveFileTree } from './DriveFileTree';

export interface DriveSidebarProps {
	onClick?: (value: string) => void;
}

const SIDEBAR_SHOW_KEY = 'drive_sidebarShow';

export function DriveSidebar({ onClick }: DriveSidebarProps) {
	const { t } = useTranslation();
	const [show, setShow] = useLocalStorage(SIDEBAR_SHOW_KEY, true);
	const [hovered, setHovered] = useState(false);
	const [myFilesOpen, setMyFilesOpen] = useState(true);

	const {
		tree,
		loadingNodeId,
		myFilesTreeData,
		handleLoad,
		handleLoadMore,
		handleNodeClick,
		load,
		isShowingLoading,
		currentFolderId,
	} = useDriveSidebarTree(onClick);

	const {
		isMyFilesActive,
		isSharedActive,
		isStarredActive,
		isTrashActive,
	} = useDriveSidebarActiveRoutes();

	useEffect(() => {
		if (myFilesOpen && myFilesTreeData.length === 0 && !isShowingLoading) {
			load('', 0, 20);
		}
	}, [myFilesOpen, myFilesTreeData.length, isShowingLoading, load]);

	return (
		<Paper h={'100%'} w={'fit-content'}>
			<Stack
				gap='sm'
				bdrs='sm'
				flex='0 0 auto'
				h='100%'
				mah='100%'
				pos='relative'
				w={show ? '350px' : '0'}
				style={{ boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)', transition: 'width 0.3s ease-in-out' }}
			>
				{show && (
					<Stack gap='xs' mah='100%' p='lg'>
						<Flex justify='space-between' gap='xs' w='100%'>
							<Button
								size='md'
								variant={isMyFilesActive ? 'light' : 'default'}
								bg={isMyFilesActive ? 'light' : 'transparent'}
								bd={'0px'}
								fullWidth
								justify='left'
								leftSection={<IconFolderFilled size={16} />}
								component={Link}
								to='my-files'
								onClick={() => {
									setMyFilesOpen(true);
								}}
							>
								{t('nikki.drive.myFiles')}
							</Button>
							<Button
								variant={myFilesOpen ? 'light' : 'default'}
								bg={myFilesOpen ? 'light' : 'transparent'}
								bd={'0px'}
								w='fit-content'
								h='100%'
								aria-label={myFilesOpen ? t('nikki.drive.collapseMyFilesTree') : t('nikki.drive.expandMyFilesTree')}
								onClick={() => setMyFilesOpen((prev) => !prev)}
							>
								{myFilesOpen ? <IconChevronDown size={32} /> : <IconChevronRight size={32} />}
							</Button>
						</Flex>
						<Box mah='100%' style={{ overflow: 'auto' }}>
							<Collapse in={myFilesOpen}>
								<Box style={{ overflow: 'auto' }} pl='xl'>
									<DriveFileTree
										tree={tree}
										data={myFilesTreeData}
										loadingNodeId={loadingNodeId}
										onLoad={handleLoad}
										onLoadMore={handleLoadMore}
										onNodeClick={handleNodeClick}
										currentFolderId={currentFolderId}
										t={t}
									/>
								</Box>
							</Collapse>
						</Box>
						<Button
							size='md'
							variant={isSharedActive ? 'light' : 'default'}
							bg={isSharedActive ? 'light' : 'transparent'}
							bd={'0px'}
							fullWidth
							justify='left'
							leftSection={<IconShare size={16} />}
							component={Link}
							to='shared-with-me'
						>
							{t('nikki.drive.sharedWithMe')}
						</Button>

						<Button
							size='md'
							variant={isStarredActive ? 'light' : 'default'}
							bg={isStarredActive ? 'light' : 'transparent'}
							bd={'0px'}
							fullWidth
							justify='left'
							leftSection={<IconStarFilled size={16} />}
							component={Link}
							to='starred'
						>
							{t('nikki.drive.starred')}
						</Button>

						<Button
							size='md'
							variant={isTrashActive ? 'light' : 'subtle'}
							color='red'
							fullWidth
							justify='left'
							leftSection={<IconTrash size={16} />}
							component={Link}
							to='trash'
						>
							{t('nikki.drive.trash')}
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
					bdrs='999px'
					opacity={hovered ? 1 : 0.35}
					style={{
						transform: 'translateY(-50%)',
						transition: 'opacity 120ms ease-in-out, box-shadow 120ms ease-in-out',
						boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
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
		</Paper>
	);
}

export type FileTreeProps = DriveSidebarProps;
export const FileTree = DriveSidebar;
