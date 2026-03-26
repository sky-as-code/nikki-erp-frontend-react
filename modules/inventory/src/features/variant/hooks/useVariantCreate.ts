import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { variantActions } from '../../../appState';
import { selectCreateVariant } from '../../../appState/variant';
import type { InventoryDispatch } from '../../../appState';
import { productActions, selectProductList } from '../../../appState/product';
import { Product } from '../../product';

export function useVariantCreateHandlers(onSuccess?: () => void) {
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const navigate = useNavigate();

	const { productId } = useParams();
	const { notification } = useUIState();
	const { t } = useTranslation();

	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? '';
	const listProduct = useMicroAppSelector(selectProductList)

	const createCommand = useMicroAppSelector(selectCreateVariant);
	const isLoading = createCommand.status === 'pending';

	React.useEffect(() => {
		if (createCommand.status === 'success') {
			notification.showInfo(
				t('nikki.inventory.variant.messages.createSuccess'),
				'',
			);
			dispatch(variantActions.resetCreateVariant());

			if (onSuccess) {
				onSuccess();
			} else {
				navigate('..', { relative: 'path' });
			}
		}
		if (createCommand.status === 'error') {
			notification.showError(
				t('nikki.inventory.variant.messages.createError'),
				'',
			);
			dispatch(variantActions.resetCreateVariant());
		}
	}, [createCommand.status, dispatch, navigate, notification, t, onSuccess]);

	const handleCreate = (data: any) => {

		dispatch(variantActions.createVariant({
			orgId,
			data
		}));
	};

	React.useEffect(() => {
		dispatch(productActions.listProducts({ orgId }));
	}, [dispatch, orgId]);

	const handleCancel = React.useCallback(() => {
		navigate('..', { relative: 'path' });
	}, [navigate]);

	return {
		isLoading,
		productId,
		products: (listProduct.data ?? []) as Product[],
		handleCreate,
		handleCancel,
	};
}
