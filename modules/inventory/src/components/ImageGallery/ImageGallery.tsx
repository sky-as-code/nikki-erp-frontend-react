import { AspectRatio, Box, Group, Image, Stack, Text, UnstyledButton } from '@mantine/core';
import React from 'react';


export interface ImageGalleryProps {
	title?: string;
	images: string[];
	selectedIndex: number;
	onSelect: (index: number) => void;
	altBase?: string;
	emptyText?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
	title = '',
	images,
	selectedIndex,
	onSelect,
	altBase = 'Image',
	emptyText = 'No image available',
}) => {
	const activeImage = images[selectedIndex] ?? '';

	return (
		<Stack gap='sm'>
			<Text fw={600}>{title}</Text>
			<AspectRatio ratio={16 / 10}>
				{activeImage ? (
					<Image src={activeImage} alt={altBase} radius='md' fit='cover' />
				) : (
					<Box
						style={{
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
								<Image
									src={image}
									alt={`${altBase} thumbnail ${index + 1}`}
									w='100%'
									h='100%'
									fit='cover'
								/>
							</Box>
						</UnstyledButton>
					))}
				</Group>
			)}
		</Stack>
	);
};
