import { Box } from '@mantine/core';
import * as TablerIcons from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';

import { DriveFileType as DriveFileTypeConst, type DriveFileType as DriveFileTypeUnion } from '../../types';


export type DriveFileIconProps = {
	type: DriveFileTypeUnion;
	/** Only used for image types to render preview. */
	url?: string | null;
	size?: number;
};

function getIconByNames(names: string[], fallbackName: string) {
	const icons: Record<string, unknown> = TablerIcons as unknown as Record<string, unknown>;
	for (const name of names) {
		if (icons[name]) return icons[name] as React.ComponentType<any>;
	}
	return icons[fallbackName] as React.ComponentType<any>;
}

const TYPE_ICON_CONFIG: Partial<Record<DriveFileTypeUnion, { icons: string[]; color: string }>> = {
	[DriveFileTypeConst.FOLDER]: {
		icons: ['IconFolder', 'IconFolderFilled'],
		color: 'var(--mantine-color-yellow-7)',
	},
	[DriveFileTypeConst.PDF]: {
		icons: ['IconFileTypePdf', 'IconFileDescription', 'IconFileText'],
		color: 'var(--mantine-color-red-7)',
	},
	[DriveFileTypeConst.DOCUMENT]: {
		icons: ['IconFileTypeWord', 'IconFileDescription', 'IconFileText'],
		color: 'var(--mantine-color-blue-7)',
	},
	[DriveFileTypeConst.SPREADSHEET]: {
		icons: ['IconFileSpreadsheet', 'IconFileTypeXls', 'IconFileText'],
		color: 'var(--mantine-color-teal-7)',
	},
	[DriveFileTypeConst.PRESENTATION]: {
		icons: ['IconPresentation', 'IconFileTypePpt', 'IconFileText'],
		color: 'var(--mantine-color-orange-7)',
	},
	[DriveFileTypeConst.VIDEO]: {
		icons: ['IconFileVideo', 'IconVideo', 'IconPlayerPlay'],
		color: 'var(--mantine-color-purple-7)',
	},
	[DriveFileTypeConst.AUDIO]: {
		icons: ['IconFileAudio', 'IconMusic', 'IconMicrophone'],
		color: 'var(--mantine-color-cyan-7)',
	},
	[DriveFileTypeConst.TEXT]: {
		icons: ['IconFileText', 'IconFileDescription', 'IconText'],
		color: 'var(--mantine-color-gray-7)',
	},
	[DriveFileTypeConst.CODE]: {
		icons: ['IconCode', 'IconBrandGithub', 'IconFileCode'],
		color: 'var(--mantine-color-blue-7)',
	},
	[DriveFileTypeConst.ARCHIVE]: {
		icons: ['IconArchive', 'IconBox', 'IconFileZip'],
		color: 'var(--mantine-color-gray-7)',
	},
	[DriveFileTypeConst.OTHER]: {
		icons: ['IconFile'],
		color: 'var(--mantine-color-blue-7)',
	},
};

export function DriveFileIcon({
	type,
	url,
	size = 32,
}: DriveFileIconProps): React.ReactNode {
	const isImage = type === DriveFileTypeConst.IMAGE;
	const [imgError, setImgError] = useState(false);

	useEffect(() => {
		setImgError(false);
	}, [isImage, url]);

	const typeCfg = TYPE_ICON_CONFIG[type];

	const { IconComp, iconColor } = useMemo(() => {
		if (isImage) return { IconComp: null, iconColor: 'var(--mantine-color-blue-7)' };
		const icons = typeCfg?.icons ?? ['IconFile'];
		const color = typeCfg?.color ?? 'var(--mantine-color-blue-7)';
		return {
			IconComp: getIconByNames(icons, 'IconFile'),
			iconColor: color,
		};
	}, [isImage, typeCfg]);

	if (isImage) {
		if (!url) {
			return (
				<Box
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						width: size,
						height: size,
					}}
				>
					<TablerIcons.IconPhoto size={size} stroke={2} color='var(--mantine-color-gray-6)' />
				</Box>
			);
		}

		if (imgError) {
			const BrokenIcon = getIconByNames(['IconPhotoOff', 'IconPhoto'], 'IconFile');
			return (
				<Box
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						width: size,
						height: size,
					}}
				>
					<BrokenIcon size={size} stroke={2} color='var(--mantine-color-gray-6)' />
				</Box>
			);
		}

		return (
			<Box
				style={{
					width: size,
					height: size,
					borderRadius: 6,
					overflow: 'hidden',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: 'var(--mantine-color-gray-0)',
				}}
			>
				<img
					src={url}
					alt=''
					style={{ width: '100%', height: '100%', objectFit: 'cover' }}
					onError={() => setImgError(true)}
				/>
			</Box>
		);
	}

	if (!IconComp) return null;

	return (
		<Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
			<IconComp size={size} stroke={2} color={iconColor} />
		</Box>
	);
}

