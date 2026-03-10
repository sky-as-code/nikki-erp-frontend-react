/* eslint-disable max-lines-per-function */
import { Box, Button, Card, Group, Image, SimpleGrid, Stack, Text } from '@mantine/core';
import React from 'react';

import { Ad } from '../../types';


export interface AdPreviewHorizontalProps {
	ad: Ad;
	primaryColor?: string; // Optional primary color for theme consistency
	imageUrl?: string; // Optional image URL for the ad
}

// Mock product data for preview
const mockProducts = [
	{ id: '1', name: 'Aquafina', price: '11.000 ₫', stock: 29, image: 'https://via.placeholder.com/150' },
	{ id: '2', name: 'Revive Chanh Muối', price: '15.000 ₫', stock: 15, image: 'https://via.placeholder.com/150' },
	{ id: '3', name: 'NutriBoost Orange', price: '20.000 ₫', stock: 8, image: 'https://via.placeholder.com/150' },
	{ id: '4', name: 'Sting Energy', price: '12.000 ₫', stock: 22, image: 'https://via.placeholder.com/150' },
];

const primaryColor = '#1E90FF'; // Default blue color

/**
 * Horizontal ad preview component
 * Similar to ThemePreview but with ad displayed in the footer area
 * (replacing the mascot/branding section)
 */
export const AdPreviewHorizontal: React.FC<AdPreviewHorizontalProps> = ({
	ad,
	primaryColor: themeColor = primaryColor,
	imageUrl,
}) => {
	return (
		<Box
			style={{
				background: `linear-gradient(180deg, ${themeColor}15 0%, #F0F8FF 100%)`,
				minHeight: 600,
				padding: 20,
			}}
		>
			{/* Header */}
			<Box
				style={{
					backgroundColor: themeColor,
					padding: '16px 24px',
					borderRadius: '8px 8px 0 0',
					marginBottom: 16,
				}}
			>
				<Group justify='space-between' align='center'>
					<Group gap='xs'>
						<Text
							c='white'
							fw={700}
							size='xl'
							style={{
								color: '#FFD700',
							}}
						>
							Core+
						</Text>
						<Text c='white' fw={600} size='lg'>
							Mart Mini
						</Text>
					</Group>
					<Group gap='xs'>
						<Box
							style={{
								width: 32,
								height: 32,
								borderRadius: '50%',
								backgroundColor: 'rgba(255,255,255,0.2)',
								cursor: 'pointer',
							}}
						/>
						<Box
							style={{
								width: 32,
								height: 32,
								borderRadius: '50%',
								backgroundColor: 'rgba(255,255,255,0.2)',
								cursor: 'pointer',
							}}
						/>
					</Group>
				</Group>
			</Box>

			{/* Categories */}
			<Box
				style={{
					backgroundColor: `${themeColor}20`,
					padding: '12px 16px',
					borderRadius: 8,
					marginBottom: 20,
				}}
			>
				<Group gap='xs'>
					<Button
						size='sm'
						style={{
							backgroundColor: themeColor,
							color: 'white',
						}}
					>
						Tất Cả
					</Button>
					<Button
						variant='outline'
						size='sm'
						style={{
							borderColor: themeColor,
							color: themeColor,
						}}
					>
						Dừa
					</Button>
					<Button
						variant='outline'
						size='sm'
						style={{
							borderColor: themeColor,
							color: themeColor,
						}}
					>
						Nước Tinh Khiết
					</Button>
					<Button
						variant='outline'
						size='sm'
						style={{
							borderColor: themeColor,
							color: themeColor,
						}}
					>
						Trà
					</Button>
				</Group>
			</Box>

			{/* Products Grid */}
			<SimpleGrid cols={4} spacing='md' mb='xl'>
				{mockProducts.map((product) => (
					<Card
						key={product.id}
						shadow='sm'
						padding='md'
						radius='md'
						withBorder
						style={{
							backgroundColor: 'white',
							borderRadius: 8,
						}}
					>
						<Stack gap='xs'>
							<Image
								src={product.image}
								alt={product.name}
								height={120}
								fit='contain'
							/>
							<Text fw={500} size='sm'>
								{product.name}
							</Text>
							<Text
								fw={600}
								size='md'
								style={{
									color: '#FF6B6B',
								}}
							>
								{product.price}
							</Text>
							<Text size='xs' c='dimmed'>
								Còn lại: {product.stock}
							</Text>
							<Group gap={4}>
								{[2, 3, 4].map((qty) => (
									<Button
										key={qty}
										size='xs'
										style={{
											backgroundColor: '#FF6B6B',
											color: 'white',
											minWidth: 32,
											height: 32,
											padding: 0,
										}}
									>
										{qty}
									</Button>
								))}
							</Group>
						</Stack>
					</Card>
				))}
			</SimpleGrid>

			{/* Footer with Ad (replacing mascot/branding) */}
			<Box
				style={{
					position: 'relative',
					backgroundColor: `${themeColor}30`,
					padding: 0,
					borderRadius: 8,
					marginTop: 20,
					overflow: 'hidden',
					minHeight: 120,
				}}
			>
				{imageUrl ? (
					<Image
						src={imageUrl}
						alt={ad.name}
						fit='cover'
						style={{
							width: '100%',
							height: '100%',
							minHeight: 120,
							objectFit: 'cover',
						}}
					/>
				) : (
					<Stack
						justify='center'
						align='center'
						gap='xs'
						style={{
							width: '100%',
							height: '100%',
							minHeight: 300,
							padding: 20,
							background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}80 100%)`,
						}}
					>
						<Text
							fw={700}
							size='lg'
							c='white'
							ta='center'
							style={{
								textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
							}}
						>
							{ad.name}
						</Text>
						{ad.description && (
							<Text
								size='sm'
								c='white'
								ta='center'
								style={{
									textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
									opacity: 0.9,
								}}
							>
								{ad.description}
							</Text>
						)}
						<Box
							style={{
								marginTop: 8,
								padding: '4px 12px',
								backgroundColor: 'rgba(255,255,255,0.2)',
								borderRadius: 12,
								backdropFilter: 'blur(10px)',
							}}
						>
							<Text size='xs' c='white' fw={500}>
								{ad.code}
							</Text>
						</Box>
					</Stack>
				)}
			</Box>
		</Box>
	);
};
