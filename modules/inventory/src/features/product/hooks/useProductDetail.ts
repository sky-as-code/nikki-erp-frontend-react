import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import {
	attributeActions,
	productActions,
	unitActions,
	variantActions,
} from '../../../appState';
import { selectAttributeList } from '../../../appState/attribute';
import {
	selectDeleteProduct,
	selectProductDetail,
	selectUpdateProduct,
} from '../../../appState/product';
import { selectUnitList } from '../../../appState/unit';
import { selectVariantList } from '../../../appState/variant';

import type { InventoryDispatch } from '../../../appState';
import type { Unit } from '../../unit/types';
import type { UpdateProductRequest } from '../types';


interface UseProductDetailOptions {
	productId?: string;
}

export function useProductDetail({ productId }: UseProductDetailOptions = {}) {
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const productDetail = useMicroAppSelector(selectProductDetail);
	const variantList = useMicroAppSelector(selectVariantList);
	const attributeList = useMicroAppSelector(selectAttributeList);
	const unitList = useMicroAppSelector(selectUnitList);
	const updateCommand = useMicroAppSelector(selectUpdateProduct);
	const deleteCommand = useMicroAppSelector(selectDeleteProduct);

	const navigate = useNavigate();
	const { notification } = useUIState();
	const product = productDetail.data ?? null;
	const attributes = attributeList.data ?? [];
	const variants = variantList.data ?? [];
	const units = (unitList.data ?? []) as Unit[];

	const unitName = React.useMemo(() => {
		if (!product) {
			return '';
		}

		const unit = units.find((item) => item.id === product.unitId);
		const unitSymbol = unit?.symbol ?? unit?.code;
		return unit ? `${unit.name} (${unitSymbol ?? ''})` : product.unitId;
	}, [product, units]);

	const loadData = React.useCallback(async () => {
		if (!productId) {
			return;
		}

		try {
			await Promise.all([
				dispatch(productActions.getProduct(productId)).unwrap(),
				dispatch(variantActions.listVariants(productId)).unwrap(),
				dispatch(attributeActions.listAttributes(productId)).unwrap(),
				dispatch(unitActions.listUnits()).unwrap(),
			]);
		}
		catch (error) {
			notification.showError(
				typeof error === 'string' ? error : 'Failed to load product detail',
				'',
			);
		}
	}, [dispatch, notification, productId]);

	React.useEffect(() => {
		void loadData();
	}, [loadData]);

	const handleDeleteProduct = React.useCallback(async () => {
		if (!productId) {
			return;
		}

		try {
			await dispatch(productActions.deleteProduct(productId)).unwrap();
			notification.showInfo('Product deleted successfully', '');
			dispatch(productActions.resetDeleteProduct());
			navigate('..', { relative: 'path' });
		}
		catch (error) {
			notification.showError(
				error instanceof Error ? error.message : 'Failed to delete product',
				'',
			);
			dispatch(productActions.resetDeleteProduct());
		}
	}, [dispatch, navigate, notification, productId]);

	const handleUpdateProduct = React.useCallback(async (data: Omit<UpdateProductRequest, 'id' | 'etag'>) => {
		if (!product?.id || !product?.etag) {
			return;
		}

		try {
			await dispatch(productActions.updateProduct({ id: product.id, etag: product.etag, ...data })).unwrap();
			notification.showInfo('Product updated successfully', '');
			dispatch(productActions.resetUpdateProduct());
			await loadData();
		}
		catch (error) {
			notification.showError(
				error instanceof Error ? error.message : 'Failed to update product',
				'',
			);
			dispatch(productActions.resetUpdateProduct());
		}
	}, [dispatch, loadData, notification, product]);

	const isLoading = (Boolean(productId) && (
		productDetail.status === 'idle'
		|| attributeList.status === 'idle'
		|| variantList.status === 'idle'
		|| unitList.status === 'idle'
	))
		|| productDetail.status === 'pending'
		|| attributeList.status === 'pending'
		|| variantList.status === 'pending'
		|| unitList.status === 'pending'
		|| updateCommand.status === 'pending'
		|| deleteCommand.status === 'pending';

	return {
		isLoading,
		product,
		attributes,
		variants,
		unitName,
		loadData,
		handleDeleteProduct,
		handleUpdateProduct,
	};
}
