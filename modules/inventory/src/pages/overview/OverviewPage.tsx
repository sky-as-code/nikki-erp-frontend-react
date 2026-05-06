/* eslint-disable max-lines-per-function */
import {
	Avatar,
	Badge,
	Box,
	Card,
	Center,
	Divider,
	Grid,
	Group,
	Image,
	Paper,
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
	Title,
	Tooltip,
	ActionIcon,
} from '@mantine/core';
import {
	IconBox,
	IconCategory,
	IconRefresh,
	IconRuler2,
	IconTag,
	IconArrowRight,
} from '@tabler/icons-react';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import React from 'react';
import { useNavigate } from 'react-router';

import { productActions, selectProductList } from '../../appState/product';
import { productCategoryActions, selectProductCategoryList } from '../../appState/productCategory';
import { unitCategoryActions, selectUnitCategoryList } from '../../appState/unitCategory';
import { unitActions, selectUnitList } from '../../appState/unit';
import { PageContainer } from '../../components/PageContainer';
import { JsonToString } from '../../utils/serializer';

import type { InventoryDispatch } from '../../appState';
import type { Product } from '../../features/product/types';
import type { ProductCategory } from '../../features/productCategory/types';
import type { UnitCategory } from '../../features/unitCategory/types';
import type { Unit } from '../../features/unit/types';


// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
	label: string;
	value: number;
	icon: React.ReactNode;
	color: string;
	onClick?: () => void;
}

function StatCard({ label, value, icon, color, onClick }: StatCardProps) {
	return (
		<Paper
			p='md'
			withBorder
			style={{ cursor: onClick ? 'pointer' : 'default' }}
			onClick={onClick}
		>
			<Group justify='space-between' align='flex-start'>
				<Stack gap={4}>
					<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
						{label}
					</Text>
					<Title order={2}>{value}</Title>
				</Stack>
				<ThemeIcon color={color} variant='light' size='xl' radius='md'>
					{icon}
				</ThemeIcon>
			</Group>
		</Paper>
	);
}


// ─── Product Category Card ─────────────────────────────────────────────────────

interface ProductCategoryCardProps {
	category: ProductCategory;
	products: Product[];
	onClick: () => void;
}

const PLACEHOLDER_IMAGE = 'https://placehold.co/64x64?text=No+Image';

function ProductCategoryCard({ category, products, onClick }: ProductCategoryCardProps) {
	const categoryName = JsonToString(category.name);
	const productCount = products.length;

	const thumbnails = React.useMemo(() => {
		return products
			.filter((p) => !!p.thumbnailURL)
			.slice(0, 4)
			.map((p) => p.thumbnailURL as string);
	}, [products]);

	return (
		<Card
			withBorder
			padding='md'
			radius='md'
			style={{ cursor: 'pointer' }}
			onClick={onClick}
		>
			<Stack gap='sm'>
				<Group justify='space-between' align='center'>
					<Text fw={600} size='sm' lineClamp={1} style={{ flex: 1 }}>
						{categoryName}
					</Text>
					<Badge size='sm' color='blue' variant='light'>
						{productCount} products
					</Badge>
				</Group>

				{thumbnails.length > 0 ? (
					<Group gap={6}>
						{thumbnails.map((url, idx) => (
							<Tooltip key={idx} label={products.filter((p) => p.thumbnailURL === url)[0]?.name
								? JsonToString(products.filter((p) => p.thumbnailURL === url)[0].name)
								: ''
							}>
								<Image
									src={url}
									alt='product'
									w={52}
									h={52}
									radius='sm'
									fit='cover'
									fallbackSrc={PLACEHOLDER_IMAGE}
								/>
							</Tooltip>
						))}
					</Group>
				) : (
					<Center h={52}>
						<Text size='xs' c='dimmed'>No product images</Text>
					</Center>
				)}

				<Group justify='flex-end'>
					<ActionIcon variant='subtle' color='blue' size='sm' aria-label='View category'>
						<IconArrowRight size={14} />
					</ActionIcon>
				</Group>
			</Stack>
		</Card>
	);
}


// ─── Unit Category Card ────────────────────────────────────────────────────────

interface UnitCategoryCardProps {
	category: UnitCategory;
	units: Unit[];
	onClick: () => void;
}

function UnitCategoryCard({ category, units, onClick }: UnitCategoryCardProps) {
	const categoryName = JsonToString(category.name);
	const unitCount = units.length;

	return (
		<Card
			withBorder
			padding='md'
			radius='md'
			style={{ cursor: 'pointer' }}
			onClick={onClick}
		>
			<Stack gap='sm'>
				<Group justify='space-between' align='center'>
					<Group gap='xs'>
						<Avatar color='teal' radius='sm' size='sm'>
							<IconRuler2 size={14} />
						</Avatar>
						<Text fw={600} size='sm' lineClamp={1}>
							{categoryName}
						</Text>
					</Group>
					<Badge size='sm' color='teal' variant='light'>
						{unitCount} units
					</Badge>
				</Group>

				{unitCount > 0 ? (
					<Group gap={6} wrap='wrap'>
						{units.slice(0, 6).map((unit) => (
							<Badge key={unit.id} size='xs' variant='outline' color='gray'>
								{JsonToString(unit.name)}{unit.symbol ? ` (${unit.symbol})` : ''}
							</Badge>
						))}
						{unitCount > 6 && (
							<Badge size='xs' variant='outline' color='gray'>
								+{unitCount - 6} more
							</Badge>
						)}
					</Group>
				) : (
					<Text size='xs' c='dimmed'>No units assigned</Text>
				)}

				<Group justify='flex-end'>
					<ActionIcon variant='subtle' color='teal' size='sm' aria-label='View unit category'>
						<IconArrowRight size={14} />
					</ActionIcon>
				</Group>
			</Stack>
		</Card>
	);
}


// ─── Section Header ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
	title: string;
	subtitle?: string;
	action?: React.ReactNode;
}

function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
	return (
		<Group justify='space-between' align='flex-end'>
			<Stack gap={2}>
				<Text fw={700} size='lg'>{title}</Text>
				{subtitle && <Text size='xs' c='dimmed'>{subtitle}</Text>}
			</Stack>
			{action}
		</Group>
	);
}


// ─── Skeleton Grid ─────────────────────────────────────────────────────────────

function SkeletonCards({ count = 4 }: { count?: number }) {
	return (
		<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }}>
			{Array.from({ length: count }).map((_, i) => (
				<Card key={i} withBorder padding='md' radius='md'>
					<Stack gap='sm'>
						<Skeleton height={16} width='60%' />
						<Skeleton height={52} />
						<Skeleton height={12} width='40%' />
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	);
}


// ─── Overview Page Body ────────────────────────────────────────────────────────

export const OverviewPageBody: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const listProduct = useMicroAppSelector(selectProductList);
	const listProductCategory = useMicroAppSelector(selectProductCategoryList);
	const listUnitCategory = useMicroAppSelector(selectUnitCategoryList);
	const listUnit = useMicroAppSelector(selectUnitList);

	const products = (listProduct.data ?? []) as Product[];
	const productCategories = (listProductCategory.data ?? []) as ProductCategory[];
	const unitCategories = (listUnitCategory.data ?? []) as UnitCategory[];
	const units = (listUnit.data ?? []) as Unit[];

	const isLoadingProducts = listProduct.status === 'pending';
	const isLoadingProductCategories = listProductCategory.status === 'pending';
	const isLoadingUnitCategories = listUnitCategory.status === 'pending';
	const isLoadingUnits = listUnit.status === 'pending';

	const handleRefresh = React.useCallback(() => {
		dispatch(productActions.listProducts({ orgId }));
		dispatch(productCategoryActions.listProductCategories(orgId));
		dispatch(unitCategoryActions.listUnitCategories(orgId));
		dispatch(unitActions.listUnits(orgId));
	}, [dispatch, orgId]);

	React.useEffect(() => {
		handleRefresh();
	}, [handleRefresh]);

	// Map products by productCategoryId
	const productsByCategory = React.useMemo(() => {
		const map = new Map<string, Product[]>();
		for (const product of products) {
			for (const categoryId of product.productCategoryIds ?? []) {
				if (!map.has(categoryId)) {
					map.set(categoryId, []);
				}
				map.get(categoryId)!.push(product);
			}
		}
		return map;
	}, [products]);

	// Map units by categoryId
	const unitsByCategory = React.useMemo(() => {
		const map = new Map<string, Unit[]>();
		for (const unit of units) {
			const categoryId = unit.categoryId ?? '__uncategorized__';
			if (!map.has(categoryId)) {
				map.set(categoryId, []);
			}
			map.get(categoryId)!.push(unit);
		}
		return map;
	}, [units]);

	const breadcrumbs = [
		{ title: 'Overview', href: '#' },
	];

	return (
		<PageContainer breadcrumbs={breadcrumbs}>
			<Stack gap='xl'>
				{/* ── Stat Cards ─────────────────────────────────────── */}
				<SimpleGrid cols={{ base: 2, sm: 2, md: 4 }}>
					<StatCard
						label='Products'
						value={products.length}
						icon={<IconBox size={20} />}
						color='blue'
						onClick={() => navigate('products')}
					/>
					<StatCard
						label='Product Categories'
						value={productCategories.length}
						icon={<IconCategory size={20} />}
						color='violet'
						onClick={() => navigate('product-categories')}
					/>
					<StatCard
						label='Units'
						value={units.length}
						icon={<IconRuler2 size={20} />}
						color='teal'
						onClick={() => navigate('units')}
					/>
					<StatCard
						label='Unit Categories'
						value={unitCategories.length}
						icon={<IconTag size={20} />}
						color='orange'
						onClick={() => navigate('unit-categories')}
					/>
				</SimpleGrid>

				<Divider />

				{/* ── Product Categories ─────────────────────────────── */}
				<Stack gap='md'>
					<SectionHeader
						title='Product Categories'
						subtitle='Categories with linked product thumbnails'
						action={
							<ActionIcon
								variant='subtle'
								color='gray'
								size='sm'
								onClick={handleRefresh}
								aria-label='Refresh'
							>
								<IconRefresh size={14} />
							</ActionIcon>
						}
					/>

					{isLoadingProductCategories || isLoadingProducts ? (
						<SkeletonCards count={4} />
					) : productCategories.length === 0 ? (
						<Paper p='lg' withBorder>
							<Center>
								<Stack align='center' gap='xs'>
									<ThemeIcon color='gray' variant='light' size='xl' radius='md'>
										<IconCategory size={20} />
									</ThemeIcon>
									<Text c='dimmed' size='sm'>No product categories found</Text>
								</Stack>
							</Center>
						</Paper>
					) : (
						<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }}>
							{productCategories.map((category) => (
								<ProductCategoryCard
									key={category.id}
									category={category}
									products={productsByCategory.get(category.id) ?? []}
									onClick={() => navigate(`product-categories/${category.id}`)}
								/>
							))}
						</SimpleGrid>
					)}
				</Stack>

				<Divider />

				{/* ── Unit Categories ────────────────────────────────── */}
				<Stack gap='md'>
					<SectionHeader
						title='Unit Categories'
						subtitle='Measurement unit groupings'
					/>

					{isLoadingUnitCategories || isLoadingUnits ? (
						<SkeletonCards count={3} />
					) : unitCategories.length === 0 ? (
						<Paper p='lg' withBorder>
							<Center>
								<Stack align='center' gap='xs'>
									<ThemeIcon color='gray' variant='light' size='xl' radius='md'>
										<IconTag size={20} />
									</ThemeIcon>
									<Text c='dimmed' size='sm'>No unit categories found</Text>
								</Stack>
							</Center>
						</Paper>
					) : (
						<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
							{unitCategories.map((category) => (
								<UnitCategoryCard
									key={category.id}
									category={category}
									units={unitsByCategory.get(category.id) ?? []}
									onClick={() => navigate(`unit-categories/${category.id}`)}
								/>
							))}
						</SimpleGrid>
					)}
				</Stack>
			</Stack>
		</PageContainer>
	);
};

export const OverviewPage = withWindowTitle('Inventory Overview', OverviewPageBody);
