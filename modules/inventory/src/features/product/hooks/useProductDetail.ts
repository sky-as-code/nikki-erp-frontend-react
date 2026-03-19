import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate, useParams } from 'react-router';

import { productActions, attributeActions, variantActions } from '../../../appState';
import {
	selectDeleteProduct,
	selectProductDetail,
	selectUpdateProduct,
} from '../../../appState/product';
import {
	selectAttributeList,
} from '../../../appState/attribute';
import {
	selectVariantList,
} from '../../../appState/variant';
import {selectUnitList, unitActions,
} from '../../../appState/unit';

import type { InventoryDispatch } from '../../../appState';
import type { Attribute } from '../../attribute/types';
import type { Variant } from '../../variant/types';
import type { UpdateProductRequest } from '../types';


export function useProductDetailHandlers() {
	const { productId } = useParams<{ productId?: string }>();
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const navigate = useNavigate();
	const { notification } = useUIState();
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const productDetail = useMicroAppSelector(selectProductDetail);
	const product = productDetail.data ?? null;

	const updateCommand = useMicroAppSelector(selectUpdateProduct);
	const deleteCommand = useMicroAppSelector(selectDeleteProduct);
	
	const attributeList = useMicroAppSelector(selectAttributeList);
	const variantList = useMicroAppSelector(selectVariantList);
	const unitList = useMicroAppSelector(selectUnitList)

	const isLoadingDetail = productDetail.status === 'pending';

	const attributes = (attributeList.data ?? []) as Attribute[];
	const variants = (variantList.data ?? []) as Variant[];
	const units: any[] = unitList.data ?? [];

	const unitName = React.useMemo(() => {
		if (!product || units.length === 0) {
			return '';
		}

		const unit = units.find((item) => item.id === product.unitId);
		const unitSymbol = unit?.symbol ?? unit?.code;
		return unit ? `${unit.name} (${unitSymbol ?? ''})` : product.unitId;
	}, [product, units]);

	React.useEffect(() => {
		if (updateCommand.status === 'success') {
			notification.showInfo('Product updated successfully', '');
			dispatch(productActions.resetUpdateProduct());
			if (productId) {
				dispatch(productActions.getProduct({ orgId, id: productId }));
			}
		}

		if (updateCommand.status === 'error') {
			notification.showError(
				updateCommand.error ?? 'Failed to update product',
				'',
			);
			dispatch(productActions.resetUpdateProduct());
		}
	}, [updateCommand.status, dispatch, notification, orgId, productId]);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			notification.showInfo('Product deleted successfully', '');
			dispatch(productActions.resetDeleteProduct());
			navigate('..', { relative: 'path' });
		}

		if (deleteCommand.status === 'error') {
			notification.showError(
				deleteCommand.error ?? 'Failed to delete product',
				'',
			);
			dispatch(productActions.resetDeleteProduct());
		}
	}, [deleteCommand.status, dispatch, navigate, notification]);

	const handleDeleteProduct = React.useCallback(async () => {
		if (!productId) {
			return;
		}

		dispatch(productActions.deleteProduct({ orgId, id: productId }));
	}, [dispatch, orgId, productId]);

	const handleUpdateProduct = React.useCallback((data: Omit<UpdateProductRequest, 'id' | 'etag'>) => {
		if (!product?.id || !product?.etag) {
			return;
		}

		dispatch(productActions.updateProduct({
			orgId,
			data: { id: product.id, etag: product.etag, ...data },
		}));
	}, [dispatch, orgId, product?.id, product?.etag]);

	React.useEffect(() => {
		if (!productId) return;

		dispatch(productActions.getProduct({ orgId, id: productId }));
		dispatch(attributeActions.listAttributes({ orgId, productId }));
		dispatch(variantActions.listVariants({ orgId, productId }));
		dispatch(unitActions.listUnits(orgId));
	}, [productId, dispatch, orgId]);

	return {
		isLoading: isLoadingDetail,
		product,
		attributes,
		variants,
		units,
		unitName,
		handleDeleteProduct,
		handleUpdateProduct,
	};
}
