import { Card, Group, Stack, Text, Badge, Divider, Skeleton, ActionIcon } from '@mantine/core';
import { IconCopy, IconFile, IconFolder } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { DriveFile, DriveFileVisibility, getDriveFileStatusBadge } from '../../../types';
import { formatSize } from '../../../utils';

import { useDbDateTime, useDriveStreamUrl } from '@/hooks';


type FilePropertiesCardProps = {
	file?: DriveFile | null;
};

function useFormatVisibility(): (visibility: DriveFileVisibility) => string {
	const { t } = useTranslation();
	return (visibility: DriveFileVisibility) => {
		const labels: Record<DriveFileVisibility, string> = {
			[DriveFileVisibility.PUBLIC]: t('nikki.drive.propertiesCard.visibilityPublic'),
			[DriveFileVisibility.OWNER]: t('nikki.drive.propertiesCard.visibilityOwner'),
			[DriveFileVisibility.SHARED]: t('nikki.drive.propertiesCard.visibilityPrivate'),
		};
		return labels[visibility] ?? visibility;
	};
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

export function FilePropertiesModalContent({ file }: FilePropertiesCardProps): React.ReactNode {
	const { formatDateTime, formatRelative } = useDbDateTime();
	const formatVisibility = useFormatVisibility();

	const content = !file ? (
		<FilePropertiesCardSkeleton />
	) : (
		<FilePropertiesCardContent
			file={file}
			formatDateTime={formatDateTime}
			formatRelative={formatRelative}
			formatVisibility={formatVisibility}
		/>
	);

	return content;
}

type FilePropertiesCardContentProps = {
	file: DriveFile;
	formatDateTime: (d: Date | string) => string;
	formatRelative: (d: Date | string) => string;
	formatVisibility: (v: DriveFileVisibility) => string;
};

function FileIdentity({ file, buildStreamUrl }: {
	file: DriveFile; buildStreamUrl: ReturnType<typeof useDriveStreamUrl> }) {
	const { t } = useTranslation();
	const isFolder = file.isFolder;
	return (
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
							title={t('nikki.drive.propertiesCard.copyStreamUrl')}
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
	);
}

function FileMetaList({ file, formatDateTime, formatRelative, formatVisibility }: FilePropertiesCardContentProps) {
	const { t } = useTranslation();
	const isFolder = file.isFolder;
	return (
		<Stack gap='xs'>
			<Group justify='space-between'>
				<Text size='xs' c='dimmed'>{t('nikki.drive.propertiesCard.type')}</Text>
				<Text size='xs'>{file.mime || (isFolder ? '—' : t('nikki.drive.propertiesCard.unknown'))}</Text>
			</Group>
			<Group justify='space-between'>
				<Text size='xs' c='dimmed'>{t('nikki.drive.propertiesCard.size')}</Text>
				<Text size='xs'>{isFolder ? '—' : formatSize(file.size)}</Text>
			</Group>
			<Group justify='space-between'>
				<Text size='xs' c='dimmed'>{t('nikki.drive.propertiesCard.visibility')}</Text>
				<Text size='xs'>{formatVisibility(file.visibility)}</Text>
			</Group>
			<Group justify='space-between'>
				<Text size='xs' c='dimmed'>{t('nikki.drive.propertiesCard.status')}</Text>
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
					<Text size='xs' c='dimmed'>{t('nikki.drive.propertiesCard.owner')}</Text>
					<Text size='xs'>{file.ownerRef}</Text>
				</Group>
			)}
			<Group justify='space-between'>
				<Text size='xs' c='dimmed'>{t('nikki.drive.propertiesCard.createdAt')}</Text>
				<Stack gap={0} align='flex-end'>
					<Text size='xs'>{formatDateTime(file.createdAt)}</Text>
					<Text size='xs' c='dimmed'>
						{formatRelative(file.createdAt)}
					</Text>
				</Stack>
			</Group>
			<Group justify='space-between'>
				<Text size='xs' c='dimmed'>{t('nikki.drive.propertiesCard.updatedAt')}</Text>
				<Stack gap={0} align='flex-end'>
					<Text size='xs'>{formatDateTime(file.updatedAt)}</Text>
					<Text size='xs' c='dimmed'>
						{formatRelative(file.updatedAt)}
					</Text>
				</Stack>
			</Group>
		</Stack>
	);
}

function FilePropertiesCardContent(
	{ file, formatDateTime, formatRelative, formatVisibility }: FilePropertiesCardContentProps,
): React.ReactNode {
	const { t } = useTranslation();
	const isFolder = file.isFolder;
	const buildStreamUrl = useDriveStreamUrl();
	return (
		<Card bg='inherit'>
			<Group justify='space-between' mb='sm'>
				<FileIdentity file={file} buildStreamUrl={buildStreamUrl} />
				<Badge radius='sm' variant='light'>
					{isFolder ? t('nikki.drive.propertiesCard.folder') : t('nikki.drive.propertiesCard.file')}
				</Badge>
			</Group>
			<Divider my='sm' />
			<FileMetaList
				file={file}
				formatDateTime={formatDateTime}
				formatRelative={formatRelative}
				formatVisibility={formatVisibility}
			/>
		</Card>
	);
}
