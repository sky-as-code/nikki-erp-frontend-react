
import { Box, Image, Stack, Text } from '@mantine/core';
import React from 'react';

import { normalizePlaylistObjectFit, type ObjectFit, type Playlist } from '../../types';


export interface MediaPlaylistPreviewVerticalProps {
	playlist: Playlist;
	primaryColor?: string;
	imageUrl?: string;
	mediaType?: 'image' | 'video';
	/** `object-fit` cho clip đang xem; mặc định contain. */
	mediaObjectFit?: ObjectFit | null;
}

const defaultPrimaryColor = '#1E90FF';

export const MediaPlaylistPreviewVertical: React.FC<MediaPlaylistPreviewVerticalProps> = ({
	playlist,
	primaryColor: themeColor = defaultPrimaryColor,
	imageUrl,
	mediaType = 'image',
	mediaObjectFit,
}) => {
	const fit = normalizePlaylistObjectFit(mediaObjectFit);
	return (
		<Box
			bg={`linear-gradient(180deg, ${themeColor}15 0%, #F0F8FF 100%)`}
			style={{
				aspectRatio: '9 / 16',
				width: 'auto',
				height: '100%',
				maxHeight: 700,
				position: 'relative',
				overflow: 'hidden',
				boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
			}}
		>
			{imageUrl && mediaType === 'video' ? (
				<video
					key={imageUrl}
					src={imageUrl}
					controls
					muted
					playsInline
					autoPlay
					style={{
						width: '100%',
						height: '100%',
						objectFit: fit,
					}}
				/>
			) : imageUrl ? (
				<Image
					src={imageUrl}
					alt={playlist?.name}
					fit={fit}
					style={{
						width: '100%',
						height: '100%',
						objectFit: fit,
					}}
				/>
			) : (
				<Stack
					justify='center'
					align='center'
					gap='md'
					style={{
						width: '100%',
						height: '100%',
						padding: 40,
						background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					}}
				>
					<Text
						fw={700}
						size='xl'
						c='white'
						ta='center'
						style={{
							textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
						}}
					>
						{playlist?.name}
					</Text>
				</Stack>
			)}
		</Box>
	);
};
