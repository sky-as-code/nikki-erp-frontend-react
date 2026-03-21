import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate, useParams } from 'react-router';

import { attributeActions, productActions } from '../../../appState';
import {
	selectAttributeDetail,
	selectDeleteAttribute,
	selectUpdateAttribute,
} from '../../../appState/attribute';
import { toLocalizedText } from '../../localizedText';

import type { InventoryDispatch } from '../../../appState';


interface UseAttributeDetailHandlersOptions {
	productId?: string;
	attributeId?: string;
}

function toOptionalNumber(value: unknown): number | undefined {
	if (typeof value === 'number' && !Number.isNaN(value)) {
		return value;
	}

	if (typeof value === 'string') {
		const parsed = Number(value.trim());
		return Number.isNaN(parsed) ? undefined : parsed;
	}

	return undefined;
}

function toOptionalString(value: unknown): string | undefined {
	if (typeof value !== 'string') {
		return undefined;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

export function useAttributeDetailHandlers(options: UseAttributeDetailHandlersOptions = {}) {
	const { productId: productIdParam, attributeId: attributeIdParam } = useParams();
	const productId = options.productId ?? productIdParam;
	const attributeId = options.attributeId ?? attributeIdParam;
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';
	const attributeDetail = useMicroAppSelector(selectAttributeDetail);
	const updateCommand = useMicroAppSelector(selectUpdateAttribute);
	const deleteCommand = useMicroAppSelector(selectDeleteAttribute);

	const navigate = useNavigate();
	const { notification } = useUIState();

	React.useEffect(() => {
		if (attributeId && productId) {
			dispatch(attributeActions.getAttribute({ orgId, attributeId, productId }));
			dispatch(productActions.getProduct({ orgId, id :productId }));
		}
	}, [attributeId, dispatch, orgId, productId]);

	const isLoadingDetail = attributeDetail.status === 'pending'
		|| updateCommand.status === 'pending'
		|| deleteCommand.status === 'pending';

	const handleUpdate = React.useCallback(async (data: Record<string, unknown>) => {
		if (!attributeDetail.data?.id || !productId) {
			return;
		}

		try {
			await dispatch(attributeActions.updateAttribute({
				orgId,
				productId,
				data: {
					id: attributeDetail.data.id,
					etag: attributeDetail.data.etag,
					displayName: toLocalizedText(data.displayName as string | Record<string, string> | null | undefined),
					codeName: toOptionalString(data.codeName),
					dataType: toOptionalString(data.dataType),
					isEnum: Boolean(data.isEnum),
					isRequired: Boolean(data.isRequired),
					sortIndex: toOptionalNumber(data.sortIndex),
				},
			} as any)).unwrap();

			notification.showInfo('Attribute updated successfully', '');
			dispatch(attributeActions.resetUpdateAttribute());
			dispatch(attributeActions.listAttributes({ orgId, productId }));
			navigate('..', { relative: 'path' });
		}
		catch (error) {
			notification.showError(
				error instanceof Error ? error.message : 'Failed to update attribute',
				'',
			);
			dispatch(attributeActions.resetUpdateAttribute());
		}
	}, [attributeDetail.data, dispatch, navigate, notification, orgId, productId]);

	const handleDelete = React.useCallback(async () => {
		if (!attributeDetail.data?.id || !productId) {
			return;
		}

		try {
			await dispatch(attributeActions.deleteAttribute({
				orgId,
				productId,
				attributeId: attributeDetail.data.id,
			})).unwrap();

			notification.showInfo('Attribute deleted successfully', '');
			dispatch(attributeActions.resetDeleteAttribute());
			dispatch(attributeActions.listAttributes({ orgId, productId }));
			navigate('..', { relative: 'path' });
		}
		catch (error) {
			notification.showError(
				error instanceof Error ? error.message : 'Failed to delete attribute',
				'',
			);
			dispatch(attributeActions.resetDeleteAttribute());
		}
	}, [attributeDetail.data, dispatch, navigate, notification, orgId, productId]);

	return {
		isLoadingDetail,
		handleUpdate,
		handleDelete,
	};
}