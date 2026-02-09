import { Anchor, Badge, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import {
	IconChevronRight,
	IconColumns,
	IconLayoutGrid,
	IconList,
	IconTimeline,
} from '@tabler/icons-react';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';


type OverviewNavigationCard = {
	title: string;
	description: string;
	label: string;
	to: string;
	color: string;
	icon: React.ReactNode;
};


export const OverviewPageBody: React.FC = () => {
	const { t } = useTranslation();
	const openLabel = t('nikki.inventory.overview.quickLinks.open', {
		defaultValue: 'Open',
	});

	const cards: OverviewNavigationCard[] = [
		{
			title: t('nikki.inventory.overview.quickLinks.productCategories.title', {
				defaultValue: 'Product Categories',
			}),
			description: t('nikki.inventory.overview.quickLinks.productCategories.description', {
				defaultValue: 'Organize products into clear category trees for better discovery.',
			}),
			label: t('nikki.inventory.overview.quickLinks.productCategories.label', {
				defaultValue: 'Catalog',
			}),
			to: '../product-categories',
			color: 'blue',
			icon: <IconColumns size={18} />,
		},
		{
			title: t('nikki.inventory.overview.quickLinks.unitCategories.title', {
				defaultValue: 'Unit Categories',
			}),
			description: t('nikki.inventory.overview.quickLinks.unitCategories.description', {
				defaultValue: 'Group measurement units by domain to keep conversions consistent.',
			}),
			label: t('nikki.inventory.overview.quickLinks.unitCategories.label', {
				defaultValue: 'Measurement',
			}),
			to: '../unit-categories',
			color: 'teal',
			icon: <IconLayoutGrid size={18} />,
		},
		{
			title: t('nikki.inventory.overview.quickLinks.products.title', {
				defaultValue: 'Products',
			}),
			description: t('nikki.inventory.overview.quickLinks.products.description', {
				defaultValue: 'Manage product records, details, and related variants in one place.',
			}),
			label: t('nikki.inventory.overview.quickLinks.products.label', {
				defaultValue: 'Items',
			}),
			to: '../products',
			color: 'grape',
			icon: <IconList size={18} />,
		},
		{
			title: t('nikki.inventory.overview.quickLinks.units.title', {
				defaultValue: 'Units',
			}),
			description: t('nikki.inventory.overview.quickLinks.units.description', {
				defaultValue: 'Create and maintain unit definitions used across inventory operations.',
			}),
			label: t('nikki.inventory.overview.quickLinks.units.label', {
				defaultValue: 'Standards',
			}),
			to: '../units',
			color: 'orange',
			icon: <IconTimeline size={18} />,
		},
	];

	return (
		<Stack gap='xl'>
			<Paper
				p='xl'
				radius='lg'
				withBorder
				style={{
					background:
						'linear-gradient(120deg, var(--mantine-color-blue-0) 0%, var(--mantine-color-cyan-0) 55%, var(--mantine-color-white) 100%)',
				}}
			>
				<Stack gap='sm'>
					<Badge
						variant='light'
						w='fit-content'
						size='md'
						color='indigo'
					>
						{t('nikki.inventory.overview.badge', { defaultValue: 'Inventory Hub' })}
					</Badge>
					<Title order={1}>{t('nikki.inventory.overview.title', { defaultValue: 'Inventory Overview' })}</Title>
					<Text size='md' c='dimmed' maw={780}>
						{t('nikki.inventory.overview.description', {
							defaultValue:
								'Centralize products, categories, units, and variants with fast access to key areas.',
						})}
					</Text>
				</Stack>
			</Paper>

			<Stack gap='md'>
				<Group justify='space-between' align='flex-end'>
					<Title order={3}>{t('nikki.inventory.overview.quickLinks.title', { defaultValue: 'Quick Links' })}</Title>
					<Text size='sm' c='dimmed'>
						{t('nikki.inventory.overview.quickLinks.subtitle', {
							defaultValue: 'Jump directly to the area you want to work on.',
						})}
					</Text>
				</Group>
				<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
					{cards.map((card) => (
						<Paper
							key={card.to}
							p='lg'
							radius='md'
							withBorder
							style={{
								borderTop: `3px solid var(--mantine-color-${card.color}-5)`,
								background:
									`linear-gradient(160deg, var(--mantine-color-${card.color}-0) 0%, var(--mantine-color-white) 62%)`,
							}}
						>
							<Stack h='100%' gap='sm'>
								<Group justify='space-between' align='flex-start' wrap='nowrap'>
									<Group gap='sm' wrap='nowrap'>
										<ThemeIcon color={card.color} variant='light' size={42} radius='md'>
											{card.icon}
										</ThemeIcon>
										<Stack gap={2}>
											<Text fw={700}>{card.title}</Text>
											<Badge size='xs' variant='light' color={card.color} w='fit-content'>
												{card.label}
											</Badge>
										</Stack>
									</Group>
									<Anchor component={Link} to={card.to} size='sm' fw={600}>
										{openLabel}
									</Anchor>
								</Group>
								<Text size='sm' c='dimmed'>
									{card.description}
								</Text>
								<Anchor component={Link} to={card.to} size='sm' fw={600} mt='auto'>
									<Group gap={4} wrap='nowrap'>
										<Text span inherit>{openLabel}</Text>
										<IconChevronRight size={14} />
									</Group>
								</Anchor>
							</Stack>
						</Paper>
					))}
				</SimpleGrid>
			</Stack>
		</Stack>
	);
};

export const OverviewPage: React.FC = withWindowTitle('Inventory Overview', OverviewPageBody);
