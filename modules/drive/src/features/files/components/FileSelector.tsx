/* eslint-disable max-lines-per-function */
import { Anchor, Badge, Box, Button, Flex, Loader, SimpleGrid, Stack, Text } from '@mantine/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { fileService } from '@/features/files/fileService';
import { DriveFileStatus } from '@/features/files/types';

import type { DriveFile } from '../types';


export type FileSelectorMode = 'file' | 'folder';

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

type TabKey = 'my-files' | 'shared-with-me';

export function FileSelector({
	parentId = '',
	multiple = false,
	mode = 'file',
	onSelect,
}: FileSelectorProps): React.ReactNode {
	const [activeTab, setActiveTab] = useState<TabKey>('my-files');
	const [currentParentId, setCurrentParentId] = useState<string>(parentId);
	const [items, setItems] = useState<DriveFile[]>([]);
	const [ancestors, setAncestors] = useState<DriveFile[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const isFolderMode = mode === 'folder';

	const loadList = useCallback(
		async (parent: string) => {
			setLoading(true);
			setError(null);
			try {
				const res = await fileService.getDriveFileByParent(parent, {
					page: 0,
					size: 200,
					graph: {
						if: ['status', '!=', DriveFileStatus.IN_TRASH],
					},
				});
				setItems(res.items ?? []);
			}
			catch (e) {
				const msg = e instanceof Error ? e.message : 'Failed to load files';
				setError(msg);
				setItems([]);
			}
			finally {
				setLoading(false);
			}
		},
		[],
	);

	const loadAncestors = useCallback(
		async (parent: string) => {
			if (!parent) {
				setAncestors([]);
				return;
			}
			try {
				const chain = await fileService.getDriveFileAncestors(parent);
				setAncestors(chain ?? []);
			}
			catch {
				setAncestors([]);
			}
		},
		[],
	);

	useEffect(() => {
		if (activeTab !== 'my-files') return;
		setCurrentParentId(parentId);
	}, [activeTab, parentId]);

	useEffect(() => {
		if (activeTab !== 'my-files') return;
		void loadList(currentParentId);
		void loadAncestors(currentParentId);
	}, [activeTab, currentParentId, loadList, loadAncestors]);

	useEffect(() => {
		if (!isFolderMode) return;
		if (activeTab !== 'my-files') return;
		// Khi mở selector ở chế độ chọn folder, mặc định coi root (currentParentId) là folder đang được chọn.
		onSelect(currentParentId);
	}, [isFolderMode, activeTab, currentParentId, onSelect]);

	const visibleItems = useMemo(() => {
		if (isFolderMode) {
			return items.filter((f) => f.isFolder);
		}
		return items;
	}, [items, isFolderMode]);

	const handleOpenFolder = (folder: DriveFile) => {
		if (!folder.isFolder) return;
		if (isFolderMode) {
			onSelect(folder.id);
		}
		setCurrentParentId(folder.id);
	};

	const handleSelectFile = (file: DriveFile) => {
		if (file.isFolder) {
			handleOpenFolder(file);
			return;
		}

		if (multiple && !isFolderMode) {
			onSelect([file.id]);
		}
		else {
			onSelect(file.id);
		}
	};

	const breadcrumbItems = useMemo(() => {
		if (activeTab !== 'my-files') return [];
		const base = [{ id: '', name: 'My files' }];
		return [...base, ...ancestors];
	}, [activeTab, ancestors]);

	return (
		<Box
			p='md'
			bg='white'
			w='100%'
			style={{
				minWidth: 980,
				boxSizing: 'border-box',
			}}
		>
			{loading && (
				<Flex align='center' justify='center' mih={240}>
					<Loader size='md' />
				</Flex>
			)}

			{!loading && error && (
				<Flex align='center' justify='center' mih={240}>
					<Text c='red' size='sm'>{error}</Text>
				</Flex>
			)}

			{!loading && !error && (
				<Flex gap='md'>
					<Stack gap='xs'>
						<Button
							variant={activeTab === 'my-files' ? 'light' : 'subtle'}
							fullWidth
							onClick={() => setActiveTab('my-files')}
						>
							My files
						</Button>
						<Button
							variant={activeTab === 'shared-with-me' ? 'light' : 'subtle'}
							fullWidth
							disabled
						>
							Shared with me
						</Button>
					</Stack>

					<Stack flex={1} gap='sm'>
						{activeTab === 'my-files' && (
							<>
								<Flex justify='space-between' align='center'>
									<Flex gap='xs' align='center' wrap='wrap'>
										{breadcrumbItems.map((crumb, index) => {
											const isLast = index === breadcrumbItems.length - 1;
											return (
												<Flex key={crumb.id || 'root'} align='center' gap={4}>
													{index > 0 && <Text size='sm'>/</Text>}
													{isLast ? (
														<Text size='sm' fw={500}>{crumb.name}</Text>
													) : (
														<Anchor
															size='sm'
															onClick={() => setCurrentParentId(crumb.id)}
														>
															{crumb.name}
														</Anchor>
													)}
												</Flex>
											);
										})}
									</Flex>
								</Flex>

								<Box
									mt='xs'
									style={{
										maxHeight: 320,
										overflowY: 'auto',
										paddingRight: 4,
									}}
								>
									{visibleItems.length === 0 ? (
										<Text size='sm' c='dimmed'>No items</Text>
									) : (
										<SimpleGrid
											cols={3}
											spacing='md'
										>
											{visibleItems.map((file) => (
												<Box
													key={file.id}
													onClick={() =>
														isFolderMode && file.isFolder
															? handleOpenFolder(file)
															: handleSelectFile(file)
													}
													style={{
														border: '1px solid var(--mantine-color-gray-2)',
														borderRadius: 'var(--mantine-radius-md)',
														padding: '14px 16px',
														cursor: 'pointer',
														backgroundColor: 'var(--mantine-color-gray-0)',
														transition: 'background-color 120ms ease, box-shadow 120ms ease, transform 120ms ease',
														minHeight: 80,
														display: 'flex',
														flexDirection: 'column',
														justifyContent: 'space-between',
													}}
													onMouseEnter={(e) => {
														e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)';
														e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.16)';
														e.currentTarget.style.transform = 'translateY(-2px)';
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
														e.currentTarget.style.boxShadow = 'none';
														e.currentTarget.style.transform = 'none';
													}}
												>
													<Flex justify='space-between' align='center' mb={6}>
														<Text size='sm' fw={600} lineClamp={2}>
															{file.name}
														</Text>
														<Badge size='sm' variant='light' radius='sm'>
															{file.isFolder ? 'Folder' : 'File'}
														</Badge>
													</Flex>
													<Text size='xs' c='dimmed' lineClamp={1}>
														ID: {file.id}
													</Text>
												</Box>
											))}
										</SimpleGrid>
									)}
								</Box>
							</>
						)}

						{activeTab === 'shared-with-me' && (
							<Text size='sm' c='dimmed'>
								Shared with me is not implemented yet.
							</Text>
						)}
					</Stack>
				</Flex>
			)}
		</Box>
	);
}
