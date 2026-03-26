/* eslint-disable max-lines-per-function */
import { Box, Button, Collapse, Divider, Flex, Paper, Stack, Tooltip } from '@mantine/core';
import {
	IconChevronDown,
	IconChevronRight,
	IconFolderFilled,
	IconLayoutSidebar,
	IconShare,
	IconStarFilled,
	IconTrash,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';


import { DriveFileTree } from './DriveFileTree';
import { useDriveSidebarActiveRoutes } from '../../hooks/useDriveSidebarActiveRoutes';
import { useDriveSidebarTree } from '../../hooks/useDriveSidebarTree';
import { useLocalStorage } from '../../hooks/useLocalStorage';

import type { ReactNode } from 'react';

import { DRIVE_TABS } from '@/constants/driveTabs';


export interface DriveSidebarProps {
	onClick?: (value: string) => void;
}

const SIDEBAR_SHOW_KEY = 'drive_sidebarShow';

type SidebarNavButtonProps = {
	show: boolean;
	label: string;
	to: string;
	active: boolean;
	leftSection: ReactNode;
	buttonColor?: string;
	variant?: 'light' | 'default' | 'subtle';
	onClick?: () => void;
};

function SidebarNavButton({
	show,
	label,
	to,
	active,
	leftSection,
	buttonColor,
	variant = 'default',
	onClick,
}: SidebarNavButtonProps): ReactNode {
	return (
		<Tooltip label={label} disabled={show}>
			<Button
				size={show ? 'md' : 'xs'}
				variant={active ? 'light' : variant}
				bg={active ? 'light' : 'transparent'}
				bd='0px'
				fullWidth
				justify='left'
				leftSection={leftSection}
				component={Link}
				to={to}
				color={buttonColor}
				onClick={onClick}
			>
				{show && label}
			</Button>
		</Tooltip>
	);
}

type MyFilesSectionProps = {
	show: boolean;
	myFilesOpen: boolean;
	setMyFilesOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
	isMyFilesActive: boolean;
	t: (key: string) => string;
	tree: ReturnType<typeof useDriveSidebarTree>['tree'];
	myFilesTreeData: ReturnType<typeof useDriveSidebarTree>['myFilesTreeData'];
	loadingNodeId: ReturnType<typeof useDriveSidebarTree>['loadingNodeId'];
	handleLoad: ReturnType<typeof useDriveSidebarTree>['handleLoad'];
	handleLoadMore: ReturnType<typeof useDriveSidebarTree>['handleLoadMore'];
	handleNodeClick: ReturnType<typeof useDriveSidebarTree>['handleNodeClick'];
	currentFolderId: ReturnType<typeof useDriveSidebarTree>['currentFolderId'];
};

function MyFilesSection({
	show,
	myFilesOpen,
	setMyFilesOpen,
	isMyFilesActive,
	t,
	tree,
	myFilesTreeData,
	loadingNodeId,
	handleLoad,
	handleLoadMore,
	handleNodeClick,
	currentFolderId,
}: MyFilesSectionProps): ReactNode {
	return (
		<Stack style={{ overflowX: 'hidden' }} miw={0} w='100%'>
			<Flex justify='space-between' gap='xs' w='100%'>
				<SidebarNavButton
					show={show}
					label={t('nikki.drive.myFiles')}
					to={DRIVE_TABS.MY_FILES}
					active={isMyFilesActive}
					leftSection={<IconFolderFilled size={16} />}
					variant='default'
					onClick={() => setMyFilesOpen(true)}
				/>
				{show && (
					<Button
						variant={myFilesOpen ? 'light' : 'default'}
						bg={myFilesOpen ? 'light' : 'transparent'}
						bd='0px'
						w='fit-content'
						h='100%'
						aria-label={myFilesOpen ? t('nikki.drive.collapseMyFilesTree') : t('nikki.drive.expandMyFilesTree')}
						onClick={() => setMyFilesOpen((prev) => !prev)}
					>
						{myFilesOpen ? <IconChevronDown size={32} /> : <IconChevronRight size={32} />}
					</Button>
				)}
			</Flex>
			{show && (
				<Box miw={0} w='310px' style={{ overflowY: 'auto', overflowX: 'hidden' }}>
					<Collapse in={myFilesOpen}>
						<Box miw={0} w='100%' pl='md'>
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
			)}
		</Stack>
	);
}

type SidebarNavLinksProps = {
	show: boolean;
	isSharedActive: boolean;
	isStarredActive: boolean;
	isTrashActive: boolean;
	t: (key: string) => string;
};

function SidebarNavLinks({
	show,
	isSharedActive,
	isStarredActive,
	isTrashActive,
	t,
}: SidebarNavLinksProps): ReactNode {
	return (
		<>
			<SidebarNavButton
				show={show}
				label={t('nikki.drive.sharedWithMe')}
				to={DRIVE_TABS.SHARED_WITH_ME}
				active={isSharedActive}
				leftSection={<IconShare size={16} />}
			/>
			<SidebarNavButton
				show={show}
				label={t('nikki.drive.starred')}
				to={DRIVE_TABS.STARRED}
				active={isStarredActive}
				leftSection={<IconStarFilled size={16} />}
			/>
			<SidebarNavButton
				show={show}
				label={t('nikki.drive.trash')}
				to={DRIVE_TABS.TRASH}
				active={isTrashActive}
				leftSection={<IconTrash size={16} />}
				variant='subtle'
				buttonColor='red'
			/>
		</>
	);
}

export function DriveSidebar({ onClick }: DriveSidebarProps) {
	const { t } = useTranslation();
	const [expanded, setExpanded] = useLocalStorage<boolean>(
		SIDEBAR_SHOW_KEY,
		true,
		{
			parse: (raw) => raw === 'true',
			serialize: (value) => String(value),
		},
	);
	const [show, setShow] = useState(expanded);
	const [myFilesOpen, setMyFilesOpen] = useState(true);

	const sidebarTree = useDriveSidebarTree(onClick);
	const { tree,
		loadingNodeId,
		myFilesTreeData,
		handleLoad,
		handleLoadMore,
		handleNodeClick,
		load,
		isShowingLoading,
		currentFolderId,
	} = sidebarTree;

	const { isMyFilesActive, isSharedActive, isStarredActive, isTrashActive } = useDriveSidebarActiveRoutes();

	useEffect(() => {
		if (myFilesOpen && myFilesTreeData.length === 0 && !isShowingLoading) {
			load('', 0, 20);
		}
	}, [myFilesOpen, myFilesTreeData.length, isShowingLoading, load]);

	useEffect(() => {
		setShow(expanded);
	}, [expanded]);

	return (
		<Paper h='100%' w='fit-content'>
			<Stack
				gap='sm'
				bdrs='sm'
				flex='0 0 auto'
				h='100%'
				mah='100%'
				pos='relative'
				w={show ? '350px' : '55px'}
				p={show ? 'lg' : 'xs'}
				style={{ boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)', transition: 'all 0.5s ease-in-out' }}
			>
				<Button
					w={'fit-content'}
					variant={expanded ? 'light' : 'subtle'}
					color={!expanded ? 'dark' : 'blue'}
					px={'xs'}
					onClick={() => { setExpanded(pre => !pre); }}
				>
					<IconLayoutSidebar size={16} />
				</Button>
				<Divider />
				<Stack gap='xs' mah='100%'>
					<MyFilesSection
						show={show}
						myFilesOpen={myFilesOpen}
						setMyFilesOpen={setMyFilesOpen}
						isMyFilesActive={isMyFilesActive}
						t={t}
						tree={tree}
						myFilesTreeData={myFilesTreeData}
						loadingNodeId={loadingNodeId}
						handleLoad={handleLoad}
						handleLoadMore={handleLoadMore}
						handleNodeClick={handleNodeClick}
						currentFolderId={currentFolderId}
					/>
					<SidebarNavLinks
						show={show}
						isSharedActive={isSharedActive}
						isStarredActive={isStarredActive}
						isTrashActive={isTrashActive}
						t={t}
					/>
				</Stack>
			</Stack>
		</Paper >
	);
}

export type FileTreeProps = DriveSidebarProps;
export const FileTree = DriveSidebar;
