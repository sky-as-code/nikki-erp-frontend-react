import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { variantActions } from '../../../appState';
import { selectCreateVariant } from '../../../appState/variant';
import { toLocalizedText } from '../../localizedText';

import type { InventoryDispatch } from '../../../appState';
import type { CreateVariantRequest } from '../types';


type VariantCreateInput = Pick<CreateVariantRequest, 'name' | 'sku' | 'barcode' | 'proposedPrice' | 'status'>;

interface UseVariantCreateHandlersOptions {
	productId?: string;
	onSuccess?: () => void | Promise<void>;
}

export function useVariantCreateHandlers({
	productId: productIdProp,
	onSuccess,
}: UseVariantCreateHandlersOptions = {}) {
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const { productId: productIdParam } = useParams();
	const productId = productIdProp ?? productIdParam;
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();

	const createCommand = useMicroAppSelector(selectCreateVariant);
	const isLoading = createCommand.status === 'pending';

	const handleCreateVariant = React.useCallback(async (data: Record<string, unknown>) => {
		if (!productId) {
			return;
		}

		const values = data as VariantCreateInput;
		const normalizedName = typeof values.name === 'string'
			? toLocalizedText(values.name)
			: values.name;
		if (!normalizedName) {
			return;
		}
		try {
			const proposedPrice = values.proposedPrice ?? 0;
			const result = await dispatch(variantActions.createVariant({
				productId,
				name: normalizedName,
				sku: values.sku,
				barcode: values.barcode,
				proposedPrice,
				status: values.status,
			})).unwrap();

			notification.showInfo(
				t('nikki.inventory.variant.messages.createSuccess', { name: result.id }),
				'',
			);
			dispatch(variantActions.resetCreateVariant());
			dispatch(variantActions.listVariants(productId));

			if (onSuccess) {
				await onSuccess();
			}
			else {
				navigate('..', { relative: 'path' });
			}
		}
		catch (error) {
			notification.showError(
				error instanceof Error ? error.message : t('nikki.inventory.variant.messages.createError'),
				'',
			);
			dispatch(variantActions.resetCreateVariant());
		}
	}, [dispatch, navigate, notification, onSuccess, productId, t]);

	return {
		isLoading,
		onSubmit: handleCreateVariant,
		handleCreateVariant,
	};
}
