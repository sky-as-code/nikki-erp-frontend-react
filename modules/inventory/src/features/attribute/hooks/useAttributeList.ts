import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate, useParams } from 'react-router';

import type { InventoryDispatch } from '../../../appState';
import { attributeActions } from '../../../appState/attribute';

export function useAttributeListHandlers() {
	const navigate = useNavigate();
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const { productId } = useParams();
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = () => {
		if (productId) {
			dispatch(attributeActions.listAttributes({ orgId, productId }));
		}
	};

	React.useEffect(() => {
		if (productId) {
			dispatch(attributeActions.listAttributes({ orgId, productId }));
		}
	}, [dispatch, productId, orgId]);

	return {
		handleCreate,
		handleRefresh,
	};
}
