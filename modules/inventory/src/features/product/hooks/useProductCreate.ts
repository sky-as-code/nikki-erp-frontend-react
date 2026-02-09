import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { unitActions, productActions } from '../../../appState';
import { selectCreateProduct } from '../../../appState/product';
import { selectUnitList } from '../../../appState/unit';
import { toLocalizedText } from '../../localizedText';

import type { InventoryDispatch } from '../../../appState';
import type { ProductCreateSubmitPayload } from '../components/ProductCreateForm/ProductCreateForm';


export function useProductCreateHandlers() {
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const navigate = useNavigate();
	const { notification } = useUIState();
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const createCommand = useMicroAppSelector(selectCreateProduct);
	const unitList = useMicroAppSelector(selectUnitList);

	const isLoading = createCommand.status === 'pending';
	const units = unitList.data ?? [];

	React.useEffect(() => {
		dispatch(unitActions.listUnits());
	}, [dispatch]);

	const handleCreate = React.useCallback(async (data: ProductCreateSubmitPayload) => {
		const normalizedName = typeof data.name === 'string'
			? toLocalizedText(data.name)
			: data.name;
		const normalizedDescription = typeof data.description === 'string'
			? toLocalizedText(data.description)
			: data.description;
		if (!normalizedName) {
			return;
		}

		try {
			const createdProduct = await dispatch(productActions.createProduct({
				...data,
				name: normalizedName,
				description: normalizedDescription,
				orgId,
			})).unwrap();

			notification.showInfo(`Created product ${createdProduct.id}`, '');
			dispatch(productActions.resetCreateProduct());
			dispatch(productActions.listProducts({ orgId }));
			navigate('..', { relative: 'path' });
		}
		catch (error) {
			notification.showError(
				error instanceof Error ? error.message : 'Failed to create product',
				'',
			);
			dispatch(productActions.resetCreateProduct());
		}
	}, [dispatch, navigate, notification, orgId]);

	return {
		isLoading,
		units,
		onSubmit: handleCreate,
	};
}
