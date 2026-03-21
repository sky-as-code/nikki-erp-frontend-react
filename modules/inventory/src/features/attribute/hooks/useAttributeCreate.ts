import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate, useParams } from 'react-router';

import { attributeActions } from '../../../appState';
import { selectCreateAttribute } from '../../../appState/attribute';
import { toLocalizedText } from '../../localizedText';

import type { InventoryDispatch } from '../../../appState';
import type { CreateAttributeRequest } from '../types';


type AttributeCreateInput = Pick<
CreateAttributeRequest,
'codeName' | 'dataType' | 'displayName' | 'isEnum' | 'isRequired' | 'sortIndex'
>;

interface UseAttributeCreateHandlersOptions {
	productId?: string;
	onSuccess?: () => void | Promise<void>;
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

export function useAttributeCreateHandlers({
	productId: productIdProp,
	onSuccess,
}: UseAttributeCreateHandlersOptions = {}) {
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const { productId: productIdParam } = useParams();
	const productId = productIdProp ?? productIdParam;
	const navigate = useNavigate();
	const { notification } = useUIState();
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const createCommand = useMicroAppSelector(selectCreateAttribute);
	const isLoading = createCommand.status === 'pending';

	const handleCreateAttribute = React.useCallback(async (data: Record<string, unknown>) => {
		if (!productId) {
			return;
		}

		const values = data as AttributeCreateInput;
		const displayName = toLocalizedText(values.displayName);
		const codeName = toOptionalString(values.codeName);

		if (!displayName || !codeName) {
			return;
		}

		try {
			const result = await dispatch(attributeActions.createAttribute({
				orgId,
				data: {
					productId,
					displayName,
					codeName,
					dataType: toOptionalString(values.dataType),
					isEnum: Boolean(values.isEnum),
					isRequired: Boolean(values.isRequired),
					sortIndex: toOptionalNumber(values.sortIndex),
				},
			})).unwrap();

			notification.showInfo(`Attribute ${result.id} created successfully`, '');
			dispatch(attributeActions.resetCreateAttribute());
			dispatch(attributeActions.listAttributes({ orgId, productId }));

			if (onSuccess) {
				await onSuccess();
			}
			else {
				navigate('..', { relative: 'path' });
			}
		}
		catch (error) {
			notification.showError(
				error instanceof Error ? error.message : 'Failed to create attribute',
				'',
			);
			dispatch(attributeActions.resetCreateAttribute());
		}
	}, [dispatch, navigate, notification, onSuccess, orgId, productId]);

	return {
		isLoading,
		onSubmit: handleCreateAttribute,
		handleCreateAttribute,
	};
}