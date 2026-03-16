import { Box, Button, Card, Flex, Group, Stack, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';

import { FileActionMenu } from '@/features/files/components';
import { fileService } from '@/features/files/fileService';
import { useDriveFileActions } from '@/features/files/hooks';
import type { DriveFile } from '@/features/files/types';


export const DriveSearchBar: React.FC = () => {
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<DriveFile[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!query.trim()) {
			setResults([]);
			setTotal(0);
			setError(null);
			return;
		}

		let cancelled = false;
		const timeout = setTimeout(async () => {
			setLoading(true);
			setError(null);
			try {
				const graph = {
					and: [
						{ if: ['status', '!=', 'in-trash'] },
						{ if: ['name', '*', query.trim()] },
					],
				};
				const res = await fileService.searchDriveFile({
					page: 0,
					size: 5,
					graph,
				});
				if (!cancelled) {
					const items = res.items ?? [];
					setResults(items);
					setTotal(res.total ?? items.length);
				}
			}
			catch (e) {
				if (!cancelled) {
					setError(e instanceof Error ? e.message : 'Failed to search files');
					setResults([]);
					setTotal(0);
				}
			}
			finally {
				if (!cancelled) setLoading(false);
			}
		}, 300);

		return () => {
			cancelled = true;
			clearTimeout(timeout);
		};
	}, [query]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
				event.preventDefault();
				searchInputRef.current?.focus();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	return (
		<Box pos='relative' h='fit-content' bdrs={'md'}>
			<Card p='0px'>
				<TextInput
					ref={searchInputRef}
					size='md'
					w='100%'
					variant='unstyled'
					bd='1px solid var(--mantine-color-gray-3)'
					style={{ boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)', overflow: 'hidden' }}
					placeholder='Search files and folders... (Ctrl + K)'
					leftSection={<IconSearch size={16} />}
					value={query}
					onChange={(e) => setQuery(e.currentTarget.value)}
				/>
			</Card>
			{(loading || error || query.trim()) && (
				<Card
					p='xs'
					pos='absolute'
					mt='xs'
					w='100%'
					shadow='lg'
					withBorder
					style={{ zIndex: 20 }}
				>
					<Stack gap='xs'>
						{loading && (
							<Text size='sm' c='dimmed'>
								Searching...
							</Text>
						)}
						{!loading && error && (
							<Text size='sm' c='red'>
								{error}
							</Text>
						)}
						{!loading && !error && results.length === 0 && query.trim() && (
							<Text size='sm' c='dimmed'>
								No results
							</Text>
						)}
						{!loading && !error && results.length > 0 && (
							<Stack gap='xs'>
								{results.map((file) => (
									<SearchResultItem key={file.id} file={file} />
								))}
							</Stack>
						)}
						{!loading && !error && query.trim() && (
							<Group justify='flex-end' pt='xs'>
								<Button size='xs' variant='filled'>
									View all ({total})
								</Button>
							</Group>
						)}
					</Stack>
				</Card>
			)}
		</Box>
	);
};

function SearchResultItem({ file }: { file: DriveFile }): React.ReactNode {
	const { openFolder, previewFile } = useDriveFileActions(file);

	const handleClick = () => {
		if (file.isFolder) {
			openFolder();
		}
		else {
			previewFile();
		}
	};

	return (
		<Flex
			align='center'
			justify='space-between'
			gap='xs'
		>
			<Box
				onClick={handleClick}
				style={{ cursor: 'pointer' }}
			>
				<Text size='sm' fw={500} lineClamp={1}>
					{file.name}
				</Text>
				<Text size='xs' c='dimmed' lineClamp={1}>
					{file.isFolder ? 'Folder' : 'File'} · {file.id}
				</Text>
			</Box>
			<Box
				onClick={(e) => e.stopPropagation()}
			>
				<FileActionMenu file={file} />
			</Box>
		</Flex>
	);
}


