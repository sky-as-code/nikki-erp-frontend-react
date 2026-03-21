/* eslint-disable max-lines-per-function */
import { ActionIcon, Anchor, Badge, Box, Button, Drawer, Flex, Loader, Stack, Text, TextInput } from '@mantine/core';
import { IconChevronLeft, IconSearch, IconSquare, IconSquareCheck, IconX } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useFileSelectorList } from '../../hooks/useFileSelectorList';

import type { DriveFile, FileSelectorMode } from '../../types';


export type { FileSelectorMode };

export type FileSelectorProps = {
	/** Parent folder id (empty = root/my-files). */
	parentId?: string;
	/** Allow selecting multiple files (only applies when mode = 'file'). */
	multiple?: boolean;
	/** Chọn file hay chọn folder. */
	mode?: FileSelectorMode;
	/** Called when user selects file(s) or folder. */
	onSelect: (ids: string[] | string) => void;
};

type RootSectionKey = 'my-files' | 'starred' | 'shared-with-me';

type SelectorListItem = {
	key: string;
	label: string;
	disabled?: boolean;
	/** để dành cho tương lai: có thể có item không cho chọn */
	selectable: boolean;
	selected: boolean;
	canOpen: boolean;
	onToggleSelect: () => void;
	onOpen?: () => void;
	rightBadge?: string;
};

type SelectedMeta = Record<string, { label: string }>;

function SelectorListRow({ item }: { item: SelectorListItem }): React.ReactNode {
	const { t } = useTranslation();
	const openHint = item.canOpen ? item.label : undefined;
	return (
		<Flex
			justify='space-between'
			align='center'
			px='sm'
			py={10}
			bdrs='md'
			bd={item.selected ? '1px solid var(--mantine-color-blue-5)' : '1px solid var(--mantine-color-gray-2)'}
			style={{
				cursor: item.disabled ? 'not-allowed' : (item.canOpen ? 'pointer' : item.selectable ? 'pointer' : 'default'),
				opacity: item.disabled ? 0.55 : 1,
				backgroundColor: item.selected ? 'var(--mantine-color-blue-0)' : 'transparent',
				transition: 'background-color 120ms ease, border-color 120ms ease',
			}}
			onClick={() => {
				if (item.disabled) return;
				// Ưu tiên: click row để đi vào bên trong (nếu có thể)
				if (item.canOpen) {
					item.onOpen?.();
					return;
				}
				// Nếu không open được thì toggle chọn
				if (item.selectable) {
					item.onToggleSelect();
				}
			}}
			title={openHint}
		>
			<Flex align='center' gap='sm' miw={0}>
				<Text size='sm' fw={600} lineClamp={1}>
					{item.label}
				</Text>
				{item.rightBadge && (
					<Badge size='sm' variant='light' radius='sm'>
						{item.rightBadge}
					</Badge>
				)}
			</Flex>

			{/* Nút bên phải: chọn/bỏ chọn */}
			{item.selectable && (
				<ActionIcon
					variant='subtle'
					color={item.selected ? 'blue' : 'gray'}
					disabled={item.disabled}
					onClick={(e) => {
						e.stopPropagation();
						if (item.disabled) return;
						item.onToggleSelect();
					}}
					aria-label={item.selected ? t('nikki.general.selected') : t('nikki.general.actions.select')}
				>
					{item.selected ? <IconSquareCheck size={16} /> : <IconSquare size={16} />}
				</ActionIcon>
			)}
		</Flex>
	);
}

function FileSelectorBreadcrumbs({
	breadcrumbItems,
	setCurrentParentId,
	t,
	isFolderMode: _isFolderMode,
	isCurrentFolderSelected: _isCurrentFolderSelected,
	onToggleSelectCurrentFolder: _onToggleSelectCurrentFolder,
	onBackToAll,
}: {
	breadcrumbItems: { id: string; name: string }[];
	setCurrentParentId: (parentId: string) => void;
	t: (key: string) => string;
	isFolderMode: boolean;
	isCurrentFolderSelected: boolean;
	onToggleSelectCurrentFolder: () => void;
	onBackToAll: () => void;
}): React.ReactNode {
	return (
		<Flex justify='space-between' align='center'>
			<Flex gap='xs' align='center' wrap='wrap'>
				<Anchor
					size='sm'
					onClick={onBackToAll}
					style={{ textDecoration: 'none' }}
				>
					<Flex align='center' gap={4}>
						<IconChevronLeft size={16} />
						<Text size='sm' fw={600}>
							{t('nikki.general.filters.all') ?? 'Tất cả'}
						</Text>
					</Flex>
				</Anchor>
				<Text size='sm'>/</Text>
				{breadcrumbItems.map((crumb, index) => {
					const isLast = index === breadcrumbItems.length - 1;
					return (
						<Flex key={crumb.id || 'root'} align='center' gap={4}>
							{index > 0 && <Text size='sm'>/</Text>}
							{isLast ? (
								<Text size='sm' fw={600}>
									{crumb.name}
								</Text>
							) : (
								<Anchor size='sm' onClick={() => setCurrentParentId(crumb.id)}>
									{crumb.name}
								</Anchor>
							)}
						</Flex>
					);
				})}
			</Flex>
		</Flex>
	);
}

export function FileSelector({
	parentId = '',
	multiple = false,
	mode = 'file',
	onSelect,
}: FileSelectorProps): React.ReactNode {
	return <FileSelectorInner parentId={parentId} multiple={multiple} mode={mode} onSelect={onSelect} />;
}

function FileSelectorInner({
	parentId,
	multiple,
	mode,
	onSelect,
}: {
	parentId: string;
	multiple: boolean;
	mode: FileSelectorMode;
	onSelect: (ids: string[] | string) => void;
}): React.ReactNode {
	const { t } = useTranslation();
	const [view, setView] = useState<'root' | 'my-files'>('root');
	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
	const [selectedMeta, setSelectedMeta] = useState<SelectedMeta>({});
	const [searchText, setSearchText] = useState('');
	const [selectedDrawerOpened, setSelectedDrawerOpened] = useState(false);

	const {
		visibleItems,
		breadcrumbItems,
		loading,
		error,
		currentParentId,
		setCurrentParentId,
		handleOpenFolder,
		isFolderMode,
	} = useFileSelectorList({
		parentId,
		mode,
		enabled: view === 'my-files',
	});

	useEffect(() => {
		if (selectedKeys.length === 0) {
			onSelect([]);
			return;
		}
		onSelect(multiple && !isFolderMode ? selectedKeys : selectedKeys[0]);
	}, [isFolderMode, multiple, onSelect, selectedKeys]);

	const selectedCount = selectedKeys.length;

	const updateSelectedMeta = (key: string, label: string, willSelect: boolean) => {
		setSelectedMeta((prev) => {
			if (!willSelect) {
				if (!(key in prev)) return prev;
				const next = { ...prev };
				delete next[key];
				return next;
			}
			if (prev[key]?.label === label) return prev;
			return { ...prev, [key]: { label } };
		});
	};

	const toggleSelect = (key: string, label: string) => {
		if (multiple && !isFolderMode) {
			setSelectedKeys((prev) => {
				const exists = prev.includes(key);
				const next = exists ? prev.filter((k) => k !== key) : [...prev, key];
				updateSelectedMeta(key, label, !exists);
				return next;
			});
			return;
		}
		setSelectedKeys((prev) => {
			const exists = prev[0] === key;
			const next = exists ? [] : [key];
			// In single-select, clean up previous meta for previous selected key
			if (!exists && prev[0] && prev[0] !== key) {
				updateSelectedMeta(prev[0], selectedMeta[prev[0]]?.label ?? prev[0], false);
			}
			updateSelectedMeta(key, label, !exists);
			return next;
		});
	};

	const deselectKey = (key: string) => {
		setSelectedKeys((prev) => prev.filter((k) => k !== key));
		setSelectedMeta((prev) => {
			if (!(key in prev)) return prev;
			const next = { ...prev };
			delete next[key];
			return next;
		});
	};

	const rootItems: SelectorListItem[] = useMemo(() => {
		const mkScopeKey = (scope: RootSectionKey) => `scope:${scope}`;
		return [
			{
				key: mkScopeKey('my-files'),
				label: t('nikki.drive.myFiles'),
				disabled: false,
				selectable: true,
				selected: selectedKeys.includes(mkScopeKey('my-files')),
				canOpen: true,
				onToggleSelect: () => toggleSelect(mkScopeKey('my-files'), t('nikki.drive.myFiles')),
				onOpen: () => {
					setView('my-files');
					setCurrentParentId(parentId);
				},
			},
			{
				key: mkScopeKey('starred'),
				label: t('nikki.drive.starred'),
				disabled: true,
				selectable: true,
				selected: selectedKeys.includes(mkScopeKey('starred')),
				canOpen: true,
				onToggleSelect: () => toggleSelect(mkScopeKey('starred'), t('nikki.drive.starred')),
				onOpen: () => { },
			},
			{
				key: mkScopeKey('shared-with-me'),
				label: t('nikki.drive.sharedWithMe'),
				disabled: true,
				selectable: true,
				selected: selectedKeys.includes(mkScopeKey('shared-with-me')),
				canOpen: true,
				onToggleSelect: () => toggleSelect(mkScopeKey('shared-with-me'), t('nikki.drive.sharedWithMe')),
				onOpen: () => { },
			},
		];
	}, [parentId, selectedKeys, t]);

	const listItems: SelectorListItem[] = useMemo(() => {
		if (view === 'root') return rootItems;
		return visibleItems.map((file: DriveFile) => ({
			key: file.id,
			label: file.name,
			disabled: false,
			selectable: true,
			selected: selectedKeys.includes(file.id),
			canOpen: file.isFolder,
			rightBadge: file.isFolder
				? t('nikki.drive.propertiesCard.folder')
				: t('nikki.drive.propertiesCard.file'),
			onToggleSelect: () => toggleSelect(file.id, file.name),
			onOpen: file.isFolder
				? () => {
					handleOpenFolder(file);
				}
				: undefined,
		}));
	}, [handleOpenFolder, rootItems, selectedKeys, t, view, visibleItems]);

	const selectedList = useMemo(() => {
		return selectedKeys.map((key) => ({
			key,
			label: selectedMeta[key]?.label ?? key,
		}));
	}, [selectedKeys, selectedMeta]);

	return (
		<>
			<Drawer
				opened={selectedDrawerOpened}
				onClose={() => setSelectedDrawerOpened(false)}
				position='right'
				size={450}
				withCloseButton={false}
				padding='md'
				styles={{
					body: { paddingBottom: 12 },
				}}
			>
				<Flex justify='space-between' align='center' mb='sm'>
					<Text fw={700} size='sm'>
						{t('nikki.general.selected')}{selectedCount ? ` (${selectedCount})` : ''}
					</Text>
					<ActionIcon
						variant='subtle'
						color='gray'
						onClick={() => setSelectedDrawerOpened(false)}
						aria-label={t('nikki.general.actions.close')}
					>
						<IconX size={16} />
					</ActionIcon>
				</Flex>

				{selectedList.length === 0 ? (
					<Text size='sm' c='dimmed'>
						{t('nikki.drive.noItems')}
					</Text>
				) : (
					<Stack gap='xs'>
						{selectedList.map((item) => (
							<Flex
								key={item.key}
								justify='space-between'
								align='center'
								px='sm'
								py={8}
								bdrs='md'
								bd='1px solid var(--mantine-color-gray-2)'
							>
								<Text size='sm' lineClamp={1}>
									{item.label}
								</Text>
								<ActionIcon
									variant='subtle'
									color='gray'
									onClick={() => deselectKey(item.key)}
									aria-label={t('nikki.general.actions.deselect')}
								>
									<IconX size={16} />
								</ActionIcon>
							</Flex>
						))}
					</Stack>
				)}
			</Drawer>

			<Box
				p='md'
				w='100%'
				miw={980}
				h={650}
				mah={650}
				style={{ boxSizing: 'border-box', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
			>
				<TextInput
					placeholder={t('nikki.general.search.placeholder')}
					value={searchText}
					onChange={(e) => setSearchText(e.currentTarget.value)}
					leftSection={<IconSearch size={16} />}
					size='sm'
					mb='sm'
				/>

				<Flex justify='flex-end' mb='sm'>
					<Button
						size='xs'
						variant='light'
						disabled={selectedCount === 0}
						onClick={() => setSelectedDrawerOpened(true)}
					>
						{t('nikki.general.selected')}{selectedCount ? ` (${selectedCount})` : ''}
					</Button>
				</Flex>

				{view === 'my-files' && (
					<FileSelectorBreadcrumbs
						breadcrumbItems={breadcrumbItems}
						setCurrentParentId={(id) => {
							setCurrentParentId(id);
						}}
						t={t}
						isFolderMode={isFolderMode}
						isCurrentFolderSelected={selectedKeys.length === 1 && selectedKeys[0] === currentParentId}
						onToggleSelectCurrentFolder={() => {
							toggleSelect(currentParentId, selectedMeta[currentParentId]?.label ?? currentParentId);
						}}
						onBackToAll={() => {
							setView('root');
						}}
					/>
				)}

				{view === 'my-files' && loading && (
					<Flex align='center' justify='center' mih={240}>
						<Loader size='md' />
					</Flex>
				)}

				{!loading && error && (
					<Flex align='center' justify='center' mih={240}>
						<Text c='red' size='sm'>
							{error}
						</Text>
					</Flex>
				)}

				{!loading && !error && (
					<Stack
						mt={view === 'my-files' ? 'xs' : 0}
						gap='xs'
						flex={1}
						mih={0}
						pr={4}
						style={{ overflow: 'auto' }}
					>
						{listItems.length === 0 ? (
							<Text size='sm' c='dimmed'>
								{t('nikki.drive.noItems')}
							</Text>
						) : (
							listItems.map((item) => <SelectorListRow key={item.key} item={item} />)
						)}
					</Stack>
				)}
			</Box>
		</>
	);
}
