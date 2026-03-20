import { Box, Image, Text } from '@mantine/core';
import { IconPhoto, IconVideo } from '@tabler/icons-react';
import React from 'react';

import { SlideshowMedia } from '../../types';


export interface MediaPreviewProps {
	media: SlideshowMedia;
	size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
	sm: { width: 80, height: 60 },
	md: { width: 150, height: 100 },
	lg: { width: 200, height: 150 },
};

export const MediaPreview: React.FC<MediaPreviewProps> = ({ media, size = 'md' }) => {
	const dimensions = sizeMap[size];

	const formatDuration = (seconds?: number) => {
		if (!seconds) return '';
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<Box
			style={{
				position: 'relative',
				width: dimensions.width,
				height: dimensions.height,
				borderRadius: 8,
				overflow: 'hidden',
				border: '1px solid #ddd',
				backgroundColor: '#f5f5f5',
			}}
		>
			{media.type === 'image' ? (
				<Image
					src={media.url}
					alt={media.name}
					fit='cover'
					style={{
						width: '100%',
						height: '100%',
					}}
				/>
			) : (
				<>
					<Image
						src={media.thumbnailUrl || media.url}
						alt={media.name}
						fit='cover'
						style={{
							width: '100%',
							height: '100%',
							opacity: 0.7,
						}}
					/>
					<Box
						style={{
							position: 'absolute',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							color: 'white',
						}}
					>
						<IconVideo size={32} stroke={2} />
					</Box>
					{media.duration && (
						<Box
							style={{
								position: 'absolute',
								bottom: 4,
								right: 4,
								backgroundColor: 'rgba(0,0,0,0.7)',
								color: 'white',
								padding: '2px 6px',
								borderRadius: 4,
								fontSize: 10,
								fontWeight: 500,
							}}
						>
							{formatDuration(media.duration)}
						</Box>
					)}
				</>
			)}
			<Box
				style={{
					position: 'absolute',
					top: 4,
					left: 4,
					backgroundColor: 'rgba(0,0,0,0.6)',
					color: 'white',
					padding: '2px 6px',
					borderRadius: 4,
					display: 'flex',
					alignItems: 'center',
					gap: 4,
				}}
			>
				{media.type === 'image' ? (
					<IconPhoto size={12} />
				) : (
					<IconVideo size={12} />
				)}
			</Box>
		</Box>
	);
};
