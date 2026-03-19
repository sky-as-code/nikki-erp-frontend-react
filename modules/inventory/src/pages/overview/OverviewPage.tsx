import { Anchor, Badge, Box, Divider, Group, Image, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import {
	IconArrowRight,
	IconArrowUpRight,
	IconBox,
	IconCategory,
	IconRulerMeasure,
	IconVersions,
} from '@tabler/icons-react';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { Link, useNavigate } from 'react-router';

import {
	mockProductCategoriesData,
	mockProductsData,
	mockUnitCategoriesData,
	mockUnitsData,
	mockVariantsData,
} from '../../mockData';

type ShowcaseItem = {
	id: string;
	title: string;
	to: string;
	imageUrl?: string;
	accent: string;
};

type ShowcaseCardTone = 'rose' | 'sage' | 'sun';

type ShowcaseCardData = {
	title: string;
	description: string;
	seeMoreLabel: string;
	seeMoreTo: string;
	items: ShowcaseItem[];
	tone: ShowcaseCardTone;
};

const ACCENT_COLORS = ['#f8d6ce', '#dce9df', '#f9e1cc', '#f6df7d', '#d8e8f8', '#efe8d7'];

type DashboardTone = 'slate' | 'sand' | 'mist';

const DASHBOARD_TONE: Record<DashboardTone, { background: string; border: string; iconBg: string }> = {
	slate: {
		background: 'linear-gradient(140deg, rgba(228, 235, 243, 0.92) 0%, rgba(249, 250, 251, 1) 62%)',
		border: 'rgba(25, 30, 35, 0.14)',
		iconBg: 'rgba(33, 37, 41, 0.92)',
	},
	sand: {
		background: 'linear-gradient(140deg, rgba(246, 236, 222, 1) 0%, rgba(250, 250, 249, 1) 62%)',
		border: 'rgba(25, 30, 35, 0.14)',
		iconBg: 'rgba(122, 71, 8, 0.92)',
	},
	mist: {
		background: 'linear-gradient(140deg, rgba(224, 243, 237, 1) 0%, rgba(248, 250, 249, 1) 62%)',
		border: 'rgba(25, 30, 35, 0.14)',
		iconBg: 'rgba(16, 102, 77, 0.92)',
	},
};

const CARD_TONE_BACKGROUND: Record<ShowcaseCardTone, string> = {
	rose: '#f2f3f5',
	sage: '#eef1ee',
	sun: '#f4f2ea',
};

function formatCount(value: number): string {
	return value.toLocaleString();
}

function toDisplayText(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}

	if (value && typeof value === 'object') {
		const localized = value as Record<string, string>;
		return localized.en ?? Object.values(localized)[0] ?? '';
	}

	return '';
}

function chunkItems<T>(items: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let index = 0; index < items.length; index += size) {
		chunks.push(items.slice(index, index + size));
	}
	return chunks;
}

function getProductItems(): ShowcaseItem[] {
	return mockProductCategoriesData.map((category, index) => {
		const title = toDisplayText(category.name) || category.id;
		const product = mockProductsData.find((item) => item.productCategoryIds?.includes(category.id));
		return {
			id: category.id,
			title,
			to: `../product-categories/${category.id}`,
			imageUrl: product?.thumbnailURL,
			accent: ACCENT_COLORS[index % ACCENT_COLORS.length],
		};
	});
}

function getUnitItems(): ShowcaseItem[] {
	return mockUnitCategoriesData.map((category, index) => {
		const title = toDisplayText(category.name) || category.id;
		return {
			id: category.id,
			title,
			to: `../unit-categories/${category.id}`,
			accent: ACCENT_COLORS[(index + 2) % ACCENT_COLORS.length],
		};
	});
}

type OverviewAction = {
	label: string;
	to: string;
};

type OverviewStatCardProps = {
	id: string;
	title: string;
	description: string;
	value: string;
	meta: Array<{ label: string; value: string }>;
	onOpen: () => void;
	actions: OverviewAction[];
	icon: React.ReactNode;
	tone: DashboardTone;
	isHovered: boolean;
	onHoverChange: (next: boolean) => void;
};

const OverviewStatCard: React.FC<OverviewStatCardProps> = ({
	title,
	description,
	value,
	meta,
	onOpen,
	actions,
	icon,
	tone,
	isHovered,
	onHoverChange,
}) => {
	const toneTokens = DASHBOARD_TONE[tone];

	return (
		<Paper
			p='lg'
			radius={0}
			tabIndex={0}
			role='link'
			onClick={onOpen}
			onKeyDown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					onOpen();
				}
			}}
			onMouseEnter={() => onHoverChange(true)}
			onMouseLeave={() => onHoverChange(false)}
			onFocus={() => onHoverChange(true)}
			onBlur={() => onHoverChange(false)}
			style={{
				cursor: 'pointer',
				height: '100%',
				background: toneTokens.background,
				border: `1px solid ${toneTokens.border}`,
				boxShadow: isHovered
					? '0 14px 32px rgba(15, 18, 20, 0.14)'
					: '0 10px 24px rgba(15, 18, 20, 0.09)',
				transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
				transition: 'transform 160ms ease, box-shadow 160ms ease',
				outline: isHovered ? '2px solid rgba(33, 37, 41, 0.18)' : 'none',
				outlineOffset: 2,
			}}
		>
			<Stack gap='sm' h='100%'>
				<Group justify='space-between' align='flex-start' gap='sm' wrap='nowrap'>
					<Stack gap={4}>
						<Group gap='sm' wrap='nowrap'>
							<ThemeIcon
								size={34}
								radius={0}
								style={{ background: toneTokens.iconBg, color: 'white', boxShadow: '0 10px 20px rgba(0, 0, 0, 0.18)' }}
							>
								{icon}
							</ThemeIcon>
							<Stack gap={0}>
								<Text size='xs' tt='uppercase' fw={800} style={{ letterSpacing: '0.08em' }}>
									{title}
								</Text>
								<Text size='xs' c='dimmed'>
									{description}
								</Text>
							</Stack>
						</Group>
					</Stack>
					<Group gap={6} wrap='nowrap' align='baseline'>
						<Text fw={900} fz={34} style={{ letterSpacing: '-0.03em', lineHeight: 1 }}>
							{value}
						</Text>
						<IconArrowUpRight size={16} style={{ opacity: 0.75 }} />
					</Group>
				</Group>

				<Group gap='sm' wrap='wrap'>
					{meta.map((item) => (
						<Badge key={item.label} variant='light' color='gray'>
							{item.label}: {item.value}
						</Badge>
					))}
				</Group>

				<Divider style={{ opacity: 0.55 }} />

				<Group gap='md' mt='auto' wrap='wrap'>
					{actions.map((action) => (
						<Anchor
							key={action.to}
							component={Link}
							to={action.to}
							fw={700}
							size='sm'
							onClick={(event) => event.stopPropagation()}
							style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
						>
							<Text span inherit>
								{action.label}
							</Text>
							<IconArrowRight size={14} />
						</Anchor>
					))}
				</Group>
			</Stack>
		</Paper>
	);
};

type QuickLinkTone = 'ink' | 'lime' | 'clay';

const QUICK_LINK_TONE: Record<QuickLinkTone, { background: string; border: string; iconBg: string }> = {
	ink: {
		background: 'linear-gradient(135deg, rgba(235, 238, 242, 1) 0%, rgba(249, 250, 251, 1) 70%)',
		border: 'rgba(25, 30, 35, 0.14)',
		iconBg: 'rgba(33, 37, 41, 0.92)',
	},
	lime: {
		background: 'linear-gradient(135deg, rgba(229, 245, 236, 1) 0%, rgba(249, 251, 250, 1) 70%)',
		border: 'rgba(25, 30, 35, 0.14)',
		iconBg: 'rgba(16, 102, 77, 0.92)',
	},
	clay: {
		background: 'linear-gradient(135deg, rgba(248, 233, 215, 1) 0%, rgba(251, 250, 249, 1) 70%)',
		border: 'rgba(25, 30, 35, 0.14)',
		iconBg: 'rgba(122, 71, 8, 0.92)',
	},
};

type QuickLinkItem = {
	id: string;
	label: string;
	description: string;
	to: string;
	icon: React.ReactNode;
	tone: QuickLinkTone;
};

const QuickLinkCard: React.FC<{
	item: QuickLinkItem;
	isHovered: boolean;
	onHoverChange: (next: boolean) => void;
}> = ({ item, isHovered, onHoverChange }) => {
	const toneTokens = QUICK_LINK_TONE[item.tone];

	return (
		<Anchor
			component={Link}
			to={item.to}
			underline='never'
			c='inherit'
			onMouseEnter={() => onHoverChange(true)}
			onMouseLeave={() => onHoverChange(false)}
			onFocus={() => onHoverChange(true)}
			onBlur={() => onHoverChange(false)}
			style={{ display: 'block' }}
		>
			<Paper
				p='md'
				radius={0}
				style={{
					background: toneTokens.background,
					border: `1px solid ${toneTokens.border}`,
					boxShadow: isHovered ? '0 12px 22px rgba(15, 18, 20, 0.12)' : '0 8px 16px rgba(15, 18, 20, 0.08)',
					transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
					transition: 'transform 160ms ease, box-shadow 160ms ease',
				}}
			>
				<Group justify='space-between' align='center' wrap='nowrap'>
					<Group gap='sm' wrap='nowrap' style={{ minWidth: 0 }}>
						<ThemeIcon size={34} radius={0} style={{ background: toneTokens.iconBg, color: 'white' }}>
							{item.icon}
						</ThemeIcon>
						<Stack gap={0} style={{ minWidth: 0 }}>
							<Text fw={800} size='sm' lineClamp={1}>
								{item.label}
							</Text>
							<Text size='xs' c='dimmed' lineClamp={1}>
								{item.description}
							</Text>
						</Stack>
					</Group>
					<IconArrowUpRight size={16} style={{ opacity: 0.75, flex: '0 0 auto' }} />
				</Group>
			</Paper>
		</Anchor>
	);
};

const TileCard: React.FC<{ item: ShowcaseItem }> = ({ item }) => {
	return (
		<Anchor
			component={Link}
			to={item.to}
			underline='never'
			c='inherit'
			style={{
				display: 'block',
				padding: 6,
				borderRadius: 6,
				transition: 'background-color 150ms ease',
			}}
		>
			<Stack gap={6}>
				<Box
					style={{
						height: 124,
						borderRadius: 4,
						overflow: 'hidden',
						background: `linear-gradient(145deg, ${item.accent} 0%, #f9f9f9 100%)`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.04)',
					}}
				>
					{item.imageUrl ? (
						<Image src={item.imageUrl} alt={item.title} h='100%' w='100%' fit='cover' />
					) : (
						<Text fw={800} size='lg' c='dark'>
							{item.title.charAt(0).toUpperCase()}
						</Text>
					)}
				</Box>
				<Text size='sm' fw={500} lineClamp={1}>{item.title}</Text>
			</Stack>
		</Anchor>
	);
};

const ShowcaseCard: React.FC<ShowcaseCardData> = ({
	title,
	description,
	seeMoreLabel,
	seeMoreTo,
	items,
	tone,
}) => {
	return (
		<Paper p='lg' radius={0} style={{ background: CARD_TONE_BACKGROUND[tone] }}>
			<Stack h='100%' gap='md'>
				<Group justify='space-between' align='flex-start' gap='sm'>
					<Stack gap={2}>
						<Title order={3} fw={800} style={{ letterSpacing: '-0.02em' }}>{title}</Title>
						<Text size='xs' c='dimmed'>{description}</Text>
					</Stack>
					<Badge variant='light' color='gray'>{items.length} items</Badge>
				</Group>
				<SimpleGrid cols={2} spacing='sm'>
					{items.map((item) => (
						<TileCard key={item.id} item={item} />
					))}
				</SimpleGrid>
				<Anchor component={Link} to={seeMoreTo} fw={600} size='sm' mt='auto'>
					<Group gap={4} wrap='nowrap'>
						<Text span inherit>{seeMoreLabel}</Text>
						<IconArrowRight size={14} />
					</Group>
				</Anchor>
			</Stack>
		</Paper>
	);
};

export const OverviewPageBody: React.FC = () => {
	const navigate = useNavigate();
	const [hoveredStatCard, setHoveredStatCard] = React.useState<string | null>(null);
	const [hoveredQuickLink, setHoveredQuickLink] = React.useState<string | null>(null);

	const productItemGroups = React.useMemo(() => chunkItems(getProductItems(), 4), []);
	const unitItems = React.useMemo(() => getUnitItems().slice(0, 4), []);
	const counts = React.useMemo(() => {
		return {
			products: mockProductsData.length,
			productCategories: mockProductCategoriesData.length,
			variants: mockVariantsData.length,
			units: mockUnitsData.length,
			unitCategories: mockUnitCategoriesData.length,
		};
	}, []);

	const cards = React.useMemo<ShowcaseCardData[]>(() => {
		const result: ShowcaseCardData[] = [];

		if (productItemGroups[0]?.length) {
			result.push({
				title: 'Shop Product Categories',
				description: 'Browse the most used product groups for quick access.',
				seeMoreLabel: 'See more',
				seeMoreTo: '../product-categories',
				items: productItemGroups[0],
				tone: 'rose',
			});
		}

		if (productItemGroups[1]?.length) {
			result.push({
				title: 'More Product Categories',
				description: 'Continue exploring additional product groups.',
				seeMoreLabel: 'Discover more',
				seeMoreTo: '../product-categories',
				items: productItemGroups[1],
				tone: 'sage',
			});
		}

		if (unitItems.length) {
			result.push({
				title: 'Shop Unit Categories',
				description: 'Open measurement groups to manage units faster.',
				seeMoreLabel: 'See more',
				seeMoreTo: '../unit-categories',
				items: unitItems,
				tone: 'sun',
			});
		}

		return result;
	}, [productItemGroups, unitItems]);

	type StatCardModel = Omit<OverviewStatCardProps, 'isHovered' | 'onHoverChange' | 'onOpen'> & { to: string };

	const statCards = React.useMemo<StatCardModel[]>(() => {
		return [
			{
				id: 'products',
				title: 'Products',
				description: 'Items you sell and stock.',
				value: formatCount(counts.products),
				meta: [
					{ label: 'Categories', value: formatCount(counts.productCategories) },
					{ label: 'Variants', value: formatCount(counts.variants) },
				],
				to: '../products',
				actions: [
					{ label: 'Manage categories', to: '../product-categories' },
				],
				icon: <IconBox size={18} />,
				tone: 'slate',
			},
			{
				id: 'variants',
				title: 'Variants',
				description: 'SKUs and attribute combinations.',
				value: formatCount(counts.variants),
				meta: [
					{ label: 'Products', value: formatCount(counts.products) },
					{ label: 'Scope', value: 'All' },
				],
				to: '../product-variants',
				actions: [
					{ label: 'View variants', to: '../product-variants' },
				],
				icon: <IconVersions size={18} />,
				tone: 'sand',
			},
			{
				id: 'units',
				title: 'Units',
				description: 'Measurements and conversions.',
				value: formatCount(counts.units),
				meta: [
					{ label: 'Unit categories', value: formatCount(counts.unitCategories) },
					{ label: 'Status', value: 'Ready' },
				],
				to: '../units',
				actions: [
					{ label: 'Manage categories', to: '../unit-categories' },
				],
				icon: <IconRulerMeasure size={18} />,
				tone: 'mist',
			},
		];
	}, [counts.productCategories, counts.products, counts.unitCategories, counts.units, counts.variants]);

	const quickLinks = React.useMemo<QuickLinkItem[]>(() => {
		return [
			{
				id: 'ql-create-product',
				label: 'Create Product',
				description: 'Add a new product to catalog',
				to: '../products/create',
				icon: <IconBox size={18} />,
				tone: 'ink',
			},
			{
				id: 'ql-product-categories',
				label: 'Product Categories',
				description: 'Organize product groups',
				to: '../product-categories',
				icon: <IconCategory size={18} />,
				tone: 'clay',
			},
			{
				id: 'ql-variants',
				label: 'Product Variants',
				description: 'Manage SKUs across products',
				to: '../product-variants',
				icon: <IconVersions size={18} />,
				tone: 'lime',
			},
			{
				id: 'ql-units',
				label: 'Units',
				description: 'View and edit measurement units',
				to: '../units',
				icon: <IconRulerMeasure size={18} />,
				tone: 'ink',
			},
			{
				id: 'ql-unit-categories',
				label: 'Unit Categories',
				description: 'Group units by measurement type',
				to: '../unit-categories',
				icon: <IconCategory size={18} />,
				tone: 'clay',
			},
			{
				id: 'ql-products',
				label: 'Product Management',
				description: 'Search and update products',
				to: '../products',
				icon: <IconBox size={18} />,
				tone: 'lime',
			},
		];
	}, []);

	return (
		<Stack gap='md'>
			<Paper
				p='lg'
				radius={0}
				style={{
					background: [
						'radial-gradient(1100px circle at 8% 20%, rgba(248, 214, 206, 0.55) 0%, transparent 52%)',
						'radial-gradient(900px circle at 86% 10%, rgba(216, 232, 248, 0.75) 0%, transparent 45%)',
						'linear-gradient(130deg, #e8ecef 0%, #f6f7f8 70%)',
					].join(', '),
					border: '1px solid #d6dbe0',
				}}
			>
				<Stack gap={4}>
					<Title order={2} fw={800}>Inventory Overview</Title>
					<Text c='dimmed' size='sm'>
						Jump into Products, Variants, Units, and your most used categories.
					</Text>
				</Stack>
			</Paper>

			<SimpleGrid cols={{ base: 1, md: 3 }} spacing='md'>
				{statCards.map((card) => (
					<OverviewStatCard
						key={card.id}
						id={card.id}
						title={card.title}
						description={card.description}
						value={card.value}
						meta={card.meta}
						actions={card.actions}
						icon={card.icon}
						tone={card.tone}
						onOpen={() => navigate(card.to, { relative: 'path' })}
						isHovered={hoveredStatCard === card.id}
						onHoverChange={(next) => setHoveredStatCard(next ? card.id : null)}
					/>
				))}
			</SimpleGrid>

			<Paper p='md' radius={0} style={{ background: '#dfe2e5' }}>
				<Group justify='space-between' align='flex-end' wrap='wrap' mb='md'>
					<Stack gap={2}>
						<Title order={3} fw={800} style={{ letterSpacing: '-0.02em' }}>
							Explore Categories
						</Title>
						<Text size='xs' c='dimmed'>
							Open your most used product and unit groups.
						</Text>
					</Stack>
					<Badge variant='light' color='gray'>
						{cards.length} panels
					</Badge>
				</Group>
				<SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing='md'>
					{cards.map((card) => (
						<ShowcaseCard
							key={card.title}
							title={card.title}
							description={card.description}
							seeMoreLabel={card.seeMoreLabel}
							seeMoreTo={card.seeMoreTo}
							items={card.items}
							tone={card.tone}
						/>
					))}
				</SimpleGrid>
			</Paper>
		</Stack>
	);
};

export const OverviewPage: React.FC = withWindowTitle('Inventory Overview', OverviewPageBody);
