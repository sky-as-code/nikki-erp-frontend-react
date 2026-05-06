import { MenuBarItem, useSetMenuBarItems } from '@nikkierp/ui/appState/layoutSlice';
import { initMicroAppStateContext, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, MicroAppRouter,
} from '@nikkierp/ui/microApp';
import React from 'react';
import { Navigate } from 'react-router';

import { reducer } from './appState';
import { OverviewPage } from './pages/overview/OverviewPage';
import { ProductCreatePage } from './pages/product/ProductCreatePage';
import { ProductDetailPage } from './pages/product/ProductDetailPage';
import { ProductListPage } from './pages/product/ProductListPage';
import { ProductCategoryCreatePage } from './pages/productCategory/ProductCategoryCreatePage';
import { ProductCategoryDetailPage } from './pages/productCategory/ProductCategoryDetailPage';
import { ProductCategoryListPage } from './pages/productCategory/ProductCategoryListPage';
import { UnitCreatePage } from './pages/unit/UnitCreatePage';
import { UnitDetailPage } from './pages/unit/UnitDetailPage';
import { UnitListPage } from './pages/unit/UnitListPage';
import { UnitCategoryCreatePage } from './pages/unitCategory/UnitCategoryCreatePage';
import { UnitCategoryDetailPage } from './pages/unitCategory/UnitCategoryDetailPage';
import { UnitCategoryListPage } from './pages/unitCategory/UnitCategoryListPage';
import { VariantCreatePage } from './pages/variant/VariantCreatePage';
import { VariantDetailPage } from './pages/variant/VariantDetailPage';
import { VariantListPage } from './pages/variant/VariantListPage';
import { AttributeCreatePage } from './pages/attribute/AttributeCreatePage';
import { AttributeDetailPage } from './pages/attribute/AttributeDetailPage';
import { AttributeListPage } from './pages/attribute/AttributeListPage';
import { VendingMachineLayout } from './layouts';


const menuBarItems: MenuBarItem[] = [
	{
		label: 'Overview',
		link: `/overview`,
	},
	{
		label: 'Product',
		items: [
			{
				label: 'Products',
				link: `/products`,
			},
			{
				label: 'Product Categories',
				link: `/product-categories`,
			},
			{
				label: 'Product Variants',
				link: `/product-variants`,
			},
		],
	},
	{
		label: 'Unit',
		items: [
			{
				label: 'Units',
				link: `/units`,
			},
			{
				label: 'Unit Categories',
				link: `/unit-categories`,
			},
		],
	},
];

function Main(props: MicroAppProps) {
	const dispatch = useMicroAppDispatch();
	useSetMenuBarItems(menuBarItems, dispatch);

	return (
		<MicroAppProvider {...props}>
			<MicroAppRouter
				domType={props.domType}
				basePath={props.routing.basePath}
				widgetName={props.widgetName}
				widgetProps={props.widgetProps}
			>
				<AppRoutes>
					<AppRoute element={<VendingMachineLayout />}>
							<AppRoute index element={<Navigate to='overview' replace />} />
							<AppRoute path='overview' element={<OverviewPage />} />

							<AppRoute path='units' element={<UnitListPage />} />
							<AppRoute path='units/create' element={<UnitCreatePage />} />
							<AppRoute path='units/:unitId' element={<UnitDetailPage />} />
							<AppRoute path='unit-categories' element={<UnitCategoryListPage />} />
							<AppRoute path='unit-categories/create' element={<UnitCategoryCreatePage />} />
							<AppRoute path='unit-categories/:categoryId' element={<UnitCategoryDetailPage />} />

							<AppRoute path='products' element={<ProductListPage />} />
							<AppRoute path='products/create' element={<ProductCreatePage />} />
							<AppRoute path='products/:productId' element={<ProductDetailPage />} />
							
							<AppRoute path='product-categories' element={<ProductCategoryListPage />} />
							<AppRoute path='product-categories/create' element={<ProductCategoryCreatePage />} />
							<AppRoute path='product-categories/:categoryId' element={<ProductCategoryDetailPage />} /> 

							<AppRoute path='products/:productId/attributes' element={<AttributeListPage />} />
							<AppRoute path='products/:productId/attributes/create' element={<AttributeCreatePage />} />
							<AppRoute path='products/:productId/attributes/:attributeId' element={<AttributeDetailPage />} />

							<AppRoute path='products/:productId/variants' element={<VariantListPage />} />
							<AppRoute path='product-variants/create' element={<VariantCreatePage />} />
							<AppRoute path='products/:productId/variants/create' element={<VariantCreatePage />} />
							<AppRoute path='products/:productId/variants/:variantId' element={<VariantDetailPage />} />
							<AppRoute path='product-variants' element={<VariantListPage />} /> 
					</AppRoute>
				</AppRoutes>
			</MicroAppRouter>
		</MicroAppProvider>
	);
}

const bundle: MicroAppBundle = {
	init({ htmlTag, registerReducer }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, {
			htmlTag,
			domType,
		});

		const result = registerReducer(reducer);
		initMicroAppStateContext(result);

		return {
			domType,
		};
	},
};

export default bundle;
