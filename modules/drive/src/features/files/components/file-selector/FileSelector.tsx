import { Anchor, Badge, Box, Button, Flex, Loader, SimpleGrid, Stack, Text, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useFileSelectorList } from '../../hooks/useFileSelectorList';


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
	const { t } = useTranslation();

	const {
		visibleItems,
		breadcrumbItems,
		loading,
		error,
		currentParentId,
		setCurrentParentId,
		handleOpenFolder,
		handleSelectFile,
		isFolderMode,
	} = useFileSelectorList({
		parentId,
		activeTab,
		mode,
		multiple,
		onSelect,
	});

	return (
		<Box
			p='md'
			w='100%'
			miw={980}
			style={{ boxSizing: 'border-box' }}
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
							{t('nikki.drive.myFiles')}
						</Button>
						<Button
							variant={activeTab === 'shared-with-me' ? 'light' : 'subtle'}
							fullWidth
							disabled
						>
							{t('nikki.drive.sharedWithMe')}
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
									mah={320}
									pr={4}
									style={{ overflow: 'auto' }}
								>
									{visibleItems.length === 0 ? (
										<Text size='sm' c='dimmed'>{t('nikki.drive.noItems')}</Text>
									) : (
										<SimpleGrid
											cols={3}
											spacing='md'
										>
											{visibleItems.map((file) => (
												<Flex
													key={file.id}
													direction='column'
													justify='space-between'
													onClick={() =>
														isFolderMode && file.isFolder
															? handleOpenFolder(file)
															: handleSelectFile(file)
													}
													bd='1px solid var(--mantine-color-gray-2)'
													bdrs='md'
													p='14px 16px'
													mih={80}
													style={{
														cursor: 'pointer',
														transition: 'background-color 120ms ease, box-shadow 120ms ease, transform 120ms ease',
													}}
													onMouseEnter={(e) => {
														e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.16)';
														e.currentTarget.style.transform = 'translateY(-2px)';
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.boxShadow = 'none';
														e.currentTarget.style.transform = 'none';
													}}
												>
													<Flex justify='space-between' align='center' mb={6}>
														<Text size='sm' fw={600} lineClamp={2}>
															{file.name}
														</Text>
														<Badge size='sm' variant='light' radius='sm'>
															{file.isFolder
																? t('nikki.drive.propertiesCard.folder')
																: t('nikki.drive.propertiesCard.file')}
														</Badge>
													</Flex>
													<Text size='xs' c='dimmed' lineClamp={1}>
														{t('nikki.drive.fields.id')}: {file.id}
													</Text>
												</Flex>
											))}
										</SimpleGrid>
									)}
								</Box>
							</>
						)}

						{activeTab === 'shared-with-me' && (
							<Text size='sm' c='dimmed'>
								{t('nikki.drive.sharedWithMe')} {t('nikki.common.notImplementedYet')}
							</Text>
						)}
					</Stack>
				</Flex>
			)}
		</Box>
	);
}
