import { AspectRatio, Box, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import React from 'react';


export interface ImageGalleryProps {
	title?: string;
	images: string[];
	selectedIndex: number;
	onSelect: (index: number) => void;
	altBase?: string;
	emptyText?: string;
	fillHeight?: boolean;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
	title = '',
	images,
	selectedIndex,
	onSelect,
	altBase = 'Image',
	emptyText = 'No image available',
	fillHeight = false,
}) => {
	const activeImage = images[selectedIndex] ?? '';
	const mainImageFrameStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		overflow: 'hidden',
		borderRadius: 'var(--mantine-radius-md)',
	};
	const coverImageStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		display: 'block',
	};

	return (
		<Stack
			gap='sm'
			style={fillHeight ? { height: '100%' } : undefined}
		>
			<Text fw={600}>{title}</Text>
			{fillHeight ? (
				<Box
					style={{
						width: '100%',
						minHeight: 600,
						height: 'clamp(320px, 44vh, 520px)',
					}}
				>
					{activeImage ? (
						<Box style={mainImageFrameStyle}>
							<img src={activeImage} alt={altBase} style={coverImageStyle} />
						</Box>
					) : (
						<Box
							style={{
								width: '100%',
								height: '100%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: 'var(--mantine-color-gray-1)',
								borderRadius: 'var(--mantine-radius-md)',
							}}
						>
							<Text c='dimmed'>{emptyText}</Text>
						</Box>
					)}
				</Box>
			) : (
				<AspectRatio ratio={16 / 10}>
					{activeImage ? (
						<Box style={mainImageFrameStyle}>
							<img src={activeImage} alt={altBase} style={coverImageStyle} />
						</Box>
					) : (
						<Box
							style={{
								width: '100%',
								height: '100%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: 'var(--mantine-color-gray-1)',
								borderRadius: 'var(--mantine-radius-md)',
							}}
						>
							<Text c='dimmed'>{emptyText}</Text>
						</Box>
					)}
				</AspectRatio>
			)}

			{images.length > 1 && (
				<Group wrap='wrap' gap='xs'>
					{images.map((image, index) => (
						<UnstyledButton
							key={`${image}-${index}`}
							onClick={() => onSelect(index)}
							aria-label={`View image ${index + 1}`}
						>
							<Box
								style={{
									width: 72,
									height: 72,
									overflow: 'hidden',
									borderRadius: 'var(--mantine-radius-sm)',
									border: selectedIndex === index
										? '2px solid var(--mantine-color-blue-6)'
										: '1px solid var(--mantine-color-gray-4)',
									boxShadow: selectedIndex === index
										? '0 0 0 1px var(--mantine-color-blue-2)'
										: 'none',
								}}
							>
									<img
										src={image}
										alt={`${altBase} thumbnail ${index + 1}`}
										style={coverImageStyle}
									/>
							</Box>
						</UnstyledButton>
					))}
				</Group>
			)}
		</Stack>
	);
};
