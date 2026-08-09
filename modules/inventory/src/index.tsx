import { initMicroAppStateContext } from '@nikkierp/ui/microApp';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, MicroAppRouter,
} from '@nikkierp/ui/microApp';
import React from 'react';
import { Navigate } from 'react-router';

import { reducer } from './appState';
import { VendingMachineLayout } from './layouts';
import { buildInventoryMenu } from './menu';
import { AttributeCreatePage } from './pages/attribute/AttributeCreatePage';
import { AttributeDetailPage } from './pages/attribute/AttributeDetailPage';
import { AttributeListPage } from './pages/attribute/AttributeListPage';
import { OverviewPage } from './pages/overview/OverviewPage';
import { ProductCreatePage } from './pages/product/ProductCreatePage';
import { ProductDetailPage } from './pages/product/ProductDetailPage';
import { ProductListPage } from './pages/product/ProductListPage';
import { ProductCategoryCreatePage } from './pages/productCategory/ProductCategoryCreatePage';
import { ProductCategoryDetailPage } from './pages/productCategory/ProductCategoryDetailPage';
import { ProductCategoryListPage } from './pages/productCategory/ProductCategoryListPage';
import { VariantCreatePage } from './pages/variant/VariantCreatePage';
import { VariantDetailPage } from './pages/variant/VariantDetailPage';
import { VariantListPage } from './pages/variant/VariantListPage';


function Main(props: MicroAppProps) {
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
						{/* <AppRoute index element={<Navigate to='overview' replace />} />
							<AppRoute path='overview' element={<OverviewPage />} /> */}

						{/* Unit-of-measure configuration moved to the Essential module, which owns
							the essential_uom / essential_uomcat resources (AC-UOM-32). */}

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
	init({ htmlTag, slug, registerReducer, host }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, {
			htmlTag,
			domType,
		});

		const result = registerReducer(reducer);
		initMicroAppStateContext(result);
		host.menuRegistry.register(buildInventoryMenu(slug));

		return {
			domType,
		};
	},
};

export default bundle;
