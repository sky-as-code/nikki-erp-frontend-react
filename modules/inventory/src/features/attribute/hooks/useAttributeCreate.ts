import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { attributeActions } from '../../../appState';
import { selectCreateAttribute } from '../../../appState/attribute';
import { toLocalizedText } from '../../localizedText';

import type { InventoryDispatch } from '../../../appState';

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
	const { t } = useTranslation();
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const createCommand = useMicroAppSelector(selectCreateAttribute);
	const isLoading = createCommand.status === 'pending';

	React.useEffect(() => {
		if (createCommand.status === 'success') {
			notification.showInfo(t('nikki.inventory.attribute.messages.createSuccess'), '');
			dispatch(attributeActions.resetCreateAttribute());
			if (productId) {
				dispatch(attributeActions.listAttributes({ orgId, productId }));
			}
			navigate('../..', { relative: 'path' });
		}

		if (createCommand.status === 'error') {
			notification.showError(
				createCommand.error instanceof Error ? createCommand.error.message : t('nikki.inventory.attribute.messages.createError'),
				'',
			);
			dispatch(attributeActions.resetCreateAttribute());
		}
	}, [createCommand.status, dispatch, navigate, notification, onSuccess, orgId, productId]);

	const handleCreateAttribute = React.useCallback((data: any) => {
		if (!productId) {
			return;
		}

		const displayName = toLocalizedText(data.displayName as string | Record<string, string> | null | undefined);
		const codeName = toOptionalString(data.codeName);
		const dataType = toOptionalString(data.dataType);

		if (!displayName || !codeName || !dataType) {
			return;
		}

		dispatch(attributeActions.createAttribute({
			orgId,
			data: {
				productId,
				displayName: displayName as Record<string, string>,
				codeName,
				dataType,
				isRequired: Boolean(data.isRequired),
				isEnum: Boolean(data.isEnum),
				enumValue: Array.isArray(data.enumValue) ? data.enumValue : undefined,
				sortIndex: toOptionalNumber(data.sortIndex),
			},
		}));
	}, [dispatch, orgId, productId]);

	return {
		isLoading,
		onSubmit: handleCreateAttribute,
		handleCreateAttribute,
	};
}
