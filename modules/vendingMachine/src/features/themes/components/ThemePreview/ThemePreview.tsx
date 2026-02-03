import { Box, Button, Card, Group, Image, SimpleGrid, Stack, Text } from '@mantine/core';
import React from 'react';

import { Theme } from '../../types';


export interface ThemePreviewProps {
	theme: Theme;
}

// Mock product data for preview
const mockProducts = [
	{ id: '1', name: 'Aquafina', price: '11.000 ₫', stock: 29, image: 'https://via.placeholder.com/150' },
	{ id: '2', name: 'Revive Chanh Muối', price: '15.000 ₫', stock: 15, image: 'https://via.placeholder.com/150' },
	{ id: '3', name: 'NutriBoost Orange', price: '20.000 ₫', stock: 8, image: 'https://via.placeholder.com/150' },
	{ id: '4', name: 'Sting Energy', price: '12.000 ₫', stock: 22, image: 'https://via.placeholder.com/150' },
];

const getBackgroundStyle = (background: string, primaryColor: string) => {
	switch (background) {
		case 'snow':
			return {
				background: `linear-gradient(180deg, ${primaryColor}15 0%, ${primaryColor}05 100%)`,
				position: 'relative' as const,
				overflow: 'hidden' as const,
			};
		case 'fireworks':
			return {
				background: `radial-gradient(circle, ${primaryColor}20 0%, ${primaryColor}05 100%)`,
				position: 'relative' as const,
				overflow: 'hidden' as const,
			};
		case 'particles':
			return {
				background: `linear-gradient(135deg, ${primaryColor}10 0%, ${primaryColor}05 50%, ${primaryColor}10 100%)`,
				position: 'relative' as const,
				overflow: 'hidden' as const,
			};
		case 'gradient':
			return {
				background: `linear-gradient(180deg, ${primaryColor} 0%, ${primaryColor}80 50%, ${primaryColor}40 100%)`,
				position: 'relative' as const,
			};
		default:
			return {
				background: `linear-gradient(180deg, ${primaryColor}15 0%, #F0F8FF 100%)`,
			};
	}
};

const getCardStyle = (style: string) => {
	switch (style) {
		case 'rounded':
			return { borderRadius: 16 };
		case 'minimal':
			return { borderRadius: 4, border: '1px solid #e0e0e0' };
		case 'elegant':
			return { borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
		case 'modern':
			return { borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' };
		default:
			return { borderRadius: 8 };
	}
};

const getFontFamily = (fontStyle: string) => {
	const fontMap: Record<string, string> = {
		roboto: "'Roboto', sans-serif",
		inter: "'Inter', sans-serif",
		poppins: "'Poppins', sans-serif",
		montserrat: "'Montserrat', sans-serif",
		custom: "'Custom Font', sans-serif",
	};
	return fontMap[fontStyle] || 'inherit';
};

export const ThemePreview: React.FC<ThemePreviewProps> = ({ theme }) => {
	const backgroundStyle = getBackgroundStyle(theme.appBackground, theme.primaryColor);
	const cardStyle = getCardStyle(theme.productCardStyle);
	const fontFamily = getFontFamily(theme.fontStyle);

	return (
		<Box
			style={{
				...backgroundStyle,
				minHeight: 600,
				padding: 20,
				fontFamily,
			}}
		>
			{/* Header */}
			<Box
				style={{
					backgroundColor: theme.primaryColor,
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
					backgroundColor: `${theme.primaryColor}20`,
					padding: '12px 16px',
					borderRadius: 8,
					marginBottom: 20,
				}}
			>
				<Group gap='xs'>
					<Button
						size='sm'
						style={{
							backgroundColor: theme.primaryColor,
							color: 'white',
						}}
					>
						Tất Cả
					</Button>
					<Button
						variant='outline'
						size='sm'
						style={{
							borderColor: theme.primaryColor,
							color: theme.primaryColor,
						}}
					>
						Dừa
					</Button>
					<Button
						variant='outline'
						size='sm'
						style={{
							borderColor: theme.primaryColor,
							color: theme.primaryColor,
						}}
					>
						Nước Tinh Khiết
					</Button>
					<Button
						variant='outline'
						size='sm'
						style={{
							borderColor: theme.primaryColor,
							color: theme.primaryColor,
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
							...cardStyle,
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

			{/* Footer with Mascot */}
			<Box
				style={{
					position: 'relative',
					backgroundColor: `${theme.primaryColor}30`,
					padding: 20,
					borderRadius: 8,
					marginTop: 20,
				}}
			>
				<Group justify='space-between' align='center'>
					<Stack gap={4}>
						<Text fw={600} size='sm' c={theme.primaryColor}>
							CoreVision
						</Text>
						<Text size='xs' c='dimmed'>
							Sản phẩm xanh Dịch vụ xanh
						</Text>
					</Stack>
					{theme.mascotImage && (
						<Image
							src={theme.mascotImage}
							alt='Mascot'
							width={80}
							height={80}
							fit='contain'
						/>
					)}
				</Group>
			</Box>
		</Box>
	);
};
