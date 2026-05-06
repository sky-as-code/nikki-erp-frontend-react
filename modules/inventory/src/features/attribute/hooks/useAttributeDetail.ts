import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

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
	const { t } = useTranslation();

	const isLoadingDetail = attributeDetail.status === 'pending'
		|| updateCommand.status === 'pending'
		|| deleteCommand.status === 'pending';

	React.useEffect(() => {
		if (attributeId && productId) {
			dispatch(attributeActions.getAttribute({ orgId, attributeId, productId }));
			dispatch(productActions.getProduct({ orgId, id: productId }));
		}
	}, [attributeId, dispatch, orgId, productId]);

	React.useEffect(() => {
		if (updateCommand.status === 'success') {
			notification.showInfo(t('nikki.inventory.attribute.messages.updateSuccess'), '');
			navigate('../..', { relative: 'path' });
			dispatch(attributeActions.resetUpdateAttribute());
		}
		if (updateCommand.status === 'error') {
			notification.showError(t('nikki.inventory.attribute.messages.updateError'), '');
			dispatch(attributeActions.resetUpdateAttribute());
		}
	}, [updateCommand.status, dispatch, navigate, notification, t]);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			notification.showInfo(t('nikki.inventory.attribute.messages.deleteSuccess'), '');
			navigate('../..', { relative: 'path' });
			dispatch(attributeActions.resetDeleteAttribute());
		}
		if (deleteCommand.status === 'error') {
			notification.showError(t('nikki.inventory.attribute.messages.deleteError'), '');
			dispatch(attributeActions.resetDeleteAttribute());
		}
	}, [deleteCommand.status, dispatch, navigate, notification, t]);

	const handleUpdate = React.useCallback((data: any) => {
		if (!attributeDetail.data?.id || !productId) return;

		dispatch(attributeActions.updateAttribute({
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
				...(data.enumValue !== undefined && { enumValue: data.enumValue as unknown[] }),
			},
		} as any));
	}, [attributeDetail.data, dispatch, orgId, productId]);

	const handleDelete = React.useCallback(() => {
		if (!attributeDetail.data?.id || !productId) return;

		dispatch(attributeActions.deleteAttribute({
			orgId,
			productId,
			attributeId: attributeDetail.data.id,
		}));
	}, [attributeDetail.data, dispatch, orgId, productId]);

	return {
		isLoadingDetail,
		handleUpdate,
		handleDelete,
	};
}