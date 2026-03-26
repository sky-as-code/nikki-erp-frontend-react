import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { unitActions, productActions } from '../../../appState';
import { selectCreateProduct } from '../../../appState/product';
import { selectUnitList } from '../../../appState/unit';
import { StringToJson } from '../../../utils/serializer';

import type { InventoryDispatch } from '../../../appState';
import type { ProductCreateSubmitPayload } from '../components/ProductCreateForm';


export function useProductCreateHandlers() {
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const createCommand = useMicroAppSelector(selectCreateProduct);
	const unitList = useMicroAppSelector(selectUnitList);

	const isLoading = createCommand.status === 'pending';
	const units = unitList.data ?? [];

	React.useEffect(() => {
		dispatch(unitActions.listUnits(orgId));
	}, [dispatch, orgId]);

	React.useEffect(() => {
		if (createCommand.status === 'success') {
			notification.showInfo('Product created successfully', '');
			dispatch(productActions.resetCreateProduct());
			dispatch(productActions.listProducts({ orgId }));
			navigate('..', { relative: 'path' });
		}

		if (createCommand.status === 'error') {
			notification.showError(
				createCommand.error instanceof Error ? createCommand.error.message : 'Failed to create product',
				'',
			);
			dispatch(productActions.resetCreateProduct());
		}
	}, [createCommand.status, dispatch, navigate, notification, orgId]);

	const handleCreate = (data: any) => {
		dispatch(productActions.createProduct({
			...data,
			name: StringToJson(data.name),
			description: StringToJson(data.description),
			orgId,
		}));
	};

	return {
		isLoading,
		units,
		onSubmit: handleCreate,
	};
}
