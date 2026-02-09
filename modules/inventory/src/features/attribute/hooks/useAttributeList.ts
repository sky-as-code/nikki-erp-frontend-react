import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate, useParams } from 'react-router';

import type { InventoryDispatch } from '../../../appState';
import { attributeActions } from '../../../appState/attribute';

export function useAttributeListHandlers() {
	const navigate = useNavigate();
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const { productId } = useParams();

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = () => {
		if (productId) {
			dispatch(attributeActions.listAttributes(productId));
		}
	};

	React.useEffect(() => {
		if (productId) {
			dispatch(attributeActions.listAttributes(productId));
		}
	}, [dispatch, productId]);

	return {
		handleCreate,
		handleRefresh,
	};
}
