import { Box, Image, Stack, Text } from '@mantine/core';
import React from 'react';

import { Slideshow } from '../../types';


export interface SlideshowPreviewVerticalProps {
	slideshow: Slideshow;
	imageUrl?: string;
}

export const SlideshowPreviewVertical: React.FC<SlideshowPreviewVerticalProps> = ({ slideshow, imageUrl }) => {
	return (
		<Box
			style={{
				aspectRatio: '9 / 16',
				width: '100%',
				maxWidth: 360,
				height: 'auto',
				backgroundColor: '#000',
				position: 'relative',
				overflow: 'hidden',
				borderRadius: 8,
				border: '2px solid #ddd',
			}}
		>
			{imageUrl ? (
				<Image
					src={imageUrl}
					alt={slideshow.name}
					fit='cover'
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
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
						{slideshow.name}
					</Text>
					{slideshow.description && (
						<Text
							size='md'
							c='white'
							ta='center'
							style={{
								textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
								opacity: 0.9,
							}}
						>
							{slideshow.description}
						</Text>
					)}
					<Box
						style={{
							position: 'absolute',
							bottom: 20,
							left: '50%',
							transform: 'translateX(-50%)',
							padding: '8px 16px',
							backgroundColor: 'rgba(255,255,255,0.2)',
							borderRadius: 20,
							backdropFilter: 'blur(10px)',
						}}
					>
						<Text size='xs' c='white' fw={500}>
							{slideshow.code}
						</Text>
					</Box>
				</Stack>
			)}
		</Box>
	);
};
