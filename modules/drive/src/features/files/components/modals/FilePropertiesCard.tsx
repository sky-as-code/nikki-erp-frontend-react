import { Card, Group, Stack, Text, Badge, Divider, Skeleton, ActionIcon } from '@mantine/core';
import { IconCopy, IconFile, IconFolder } from '@tabler/icons-react';
import React from 'react';

import { useDbDateTime, useDriveStreamUrl } from '@/hooks';

import { DriveFile, DriveFileVisibility, getDriveFileStatusBadge } from '../../types';



type FilePropertiesCardProps = {
	file?: DriveFile | null;
};

function formatSize(bytes: number): string {
	if (!bytes || bytes < 0) return '—';
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatVisibility(visibility: DriveFileVisibility): string {
	const labels: Record<DriveFileVisibility, string> = {
		[DriveFileVisibility.PUBLIC]: 'Public',
		[DriveFileVisibility.OWNER]: 'Owner',
		[DriveFileVisibility.SHARED]: 'Private',
	};
	return labels[visibility] ?? visibility;
}

function FilePropertiesCardSkeleton(): React.ReactNode {
	return (
		<Card withBorder radius='md' padding='lg'>
			<Group justify='space-between' mb='sm'>
				<Group gap='sm'>
					<Skeleton height={20} circle />
					<Stack gap={4}>
						<Skeleton height={12} width={140} />
						<Skeleton height={10} width={200} />
					</Stack>
				</Group>
				<Skeleton height={20} width={60} radius='xl' />
			</Group>
			<Divider my='sm' />
			<Stack gap='xs'>
				{Array.from({ length: 6 }).map((_, index) => (
					<Group key={index} justify='space-between'>
						<Skeleton height={10} width={80} />
						<Skeleton height={10} width={140} />
					</Group>
				))}
			</Stack>
		</Card>
	);
}

export function FilePropertiesCard({ file }: FilePropertiesCardProps): React.ReactNode {
	const { formatDateTime, formatRelative } = useDbDateTime();

	const content = !file ? (
		<FilePropertiesCardSkeleton />
	) : (
		<FilePropertiesCardContent file={file} formatDateTime={formatDateTime} formatRelative={formatRelative} />
	);

	return content;
}

type FilePropertiesCardContentProps = {
	file: DriveFile;
	formatDateTime: (d: Date | string) => string;
	formatRelative: (d: Date | string) => string;
};

// eslint-disable-next-line max-lines-per-function
function FilePropertiesCardContent(
	{ file, formatDateTime, formatRelative }: FilePropertiesCardContentProps,
): React.ReactNode {
	const isFolder = file.isFolder;
	const buildStreamUrl = useDriveStreamUrl();

	return (
		<Card>
			<Group justify='space-between' mb='sm'>
				<Group gap='sm'>
					{isFolder ? <IconFolder size={20} /> : <IconFile size={20} />}
					<Stack gap={0}>
						<Text fw={600} size='sm'>
							{file.name}
						</Text>
						<Text size='xs' c='dimmed'>
							{file.id}
						</Text>
						{
							!isFolder && (
								<ActionIcon
									onClick={
										() => {
											navigator.clipboard.writeText(buildStreamUrl(file.id, false));
										}
									}
									variant='transparent'
									title='Copy stream URL'
									color='gray'
									styles={{
										root: {
											cursor: 'pointer',
										},
									}}
								>
									<IconCopy size={16} />
								</ActionIcon>)
						}
					</Stack>
				</Group>
				<Badge radius='sm' variant='light'>
					{isFolder ? 'Folder' : 'File'}
				</Badge>
			</Group>

			<Divider my='sm' />

			<Stack gap='xs'>
				<Group justify='space-between'>
					<Text size='xs' c='dimmed'>Type</Text>
					<Text size='xs'>{file.mime || (isFolder ? '—' : 'Unknown')}</Text>
				</Group>

				<Group justify='space-between'>
					<Text size='xs' c='dimmed'>Size</Text>
					<Text size='xs'>{isFolder ? '—' : formatSize(file.size)}</Text>
				</Group>

				<Group justify='space-between'>
					<Text size='xs' c='dimmed'>Visibility</Text>
					<Text size='xs'>{formatVisibility(file.visibility)}</Text>
				</Group>

				<Group justify='space-between'>
					<Text size='xs' c='dimmed'>Status</Text>
					<Badge
						size='sm'
						color={getDriveFileStatusBadge(file.status).color}
						variant='light'
					>
						{getDriveFileStatusBadge(file.status).label}
					</Badge>
				</Group>

				{file.ownerRef && (
					<Group justify='space-between'>
						<Text size='xs' c='dimmed'>Owner</Text>
						<Text size='xs'>{file.ownerRef}</Text>
					</Group>
				)}

				<Group justify='space-between'>
					<Text size='xs' c='dimmed'>Created at</Text>
					<Stack gap={0} align='flex-end'>
						<Text size='xs'>{formatDateTime(file.createdAt)}</Text>
						<Text size='xs' c='dimmed'>
							{formatRelative(file.createdAt)}
						</Text>
					</Stack>
				</Group>

				<Group justify='space-between'>
					<Text size='xs' c='dimmed'>Updated at</Text>
					<Stack gap={0} align='flex-end'>
						<Text size='xs'>{formatDateTime(file.updatedAt)}</Text>
						<Text size='xs' c='dimmed'>
							{formatRelative(file.updatedAt)}
						</Text>
					</Stack>
				</Group>
			</Stack>
		</Card>
	);
}

