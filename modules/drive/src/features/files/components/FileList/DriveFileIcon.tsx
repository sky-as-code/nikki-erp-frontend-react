import { Box } from '@mantine/core';
import {
	IconArchive,
	IconCode,
	IconFile,
	IconFileDescription,
	IconFileSpreadsheet,
	IconFileText,
	IconFileTypePdf,
	IconFolder,
	IconMusic,
	IconPhoto,
	IconPhotoOff,
	IconPresentation,
	IconVideo,
} from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';

import { DriveFileType as DriveFileTypeConst, type DriveFileType as DriveFileTypeUnion } from '../../types';


export type DriveFileIconProps = {
	type: DriveFileTypeUnion;
	/** Only used for image types to render preview. */
	url?: string | null;
	size?: number;
};

type IconComponent = React.ComponentType<{
	size?: number;
	stroke?: number;
	color?: string;
}>;

const TYPE_ICON_CONFIG: Partial<Record<DriveFileTypeUnion, { Icon: IconComponent; color: string }>> = {
	[DriveFileTypeConst.FOLDER]: {
		Icon: IconFolder,
		color: 'var(--mantine-color-yellow-7)',
	},
	[DriveFileTypeConst.PDF]: {
		Icon: IconFileTypePdf,
		color: 'var(--mantine-color-red-7)',
	},
	[DriveFileTypeConst.DOCUMENT]: {
		Icon: IconFileDescription,
		color: 'var(--mantine-color-blue-7)',
	},
	[DriveFileTypeConst.SPREADSHEET]: {
		Icon: IconFileSpreadsheet,
		color: 'var(--mantine-color-teal-7)',
	},
	[DriveFileTypeConst.PRESENTATION]: {
		Icon: IconPresentation,
		color: 'var(--mantine-color-orange-7)',
	},
	[DriveFileTypeConst.VIDEO]: {
		Icon: IconVideo,
		color: 'var(--mantine-color-violet-7)',
	},
	[DriveFileTypeConst.AUDIO]: {
		Icon: IconMusic,
		color: 'var(--mantine-color-cyan-7)',
	},
	[DriveFileTypeConst.TEXT]: {
		Icon: IconFileText,
		color: 'var(--mantine-color-gray-7)',
	},
	[DriveFileTypeConst.CODE]: {
		Icon: IconCode,
		color: 'var(--mantine-color-blue-7)',
	},
	[DriveFileTypeConst.ARCHIVE]: {
		Icon: IconArchive,
		color: 'var(--mantine-color-gray-7)',
	},
	[DriveFileTypeConst.OTHER]: {
		Icon: IconFile,
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
		if (isImage) return { IconComp: null as IconComponent | null, iconColor: 'var(--mantine-color-blue-7)' };
		const IconCompLocal = typeCfg?.Icon ?? IconFile;
		const color = typeCfg?.color ?? 'var(--mantine-color-blue-7)';
		return {
			IconComp: IconCompLocal,
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
					<IconPhoto size={size} stroke={2} color='var(--mantine-color-gray-6)' />
				</Box>
			);
		}

		if (imgError) {
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
					<IconPhotoOff size={size} stroke={2} color='var(--mantine-color-gray-6)' />
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

