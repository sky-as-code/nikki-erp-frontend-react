import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { variantActions } from '../../../appState/variant';
import {
	selectVariantDetail,
	selectUpdateVariant,
	selectDeleteVariant,
} from '../../../appState/variant';

import { productActions, type InventoryDispatch } from '../../../appState';
import { selectProductDetail } from '../../../appState/product';


function toOptionalTrimmedString(value: unknown): string | undefined {
	if (typeof value !== 'string') {
		return undefined;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}


export function useVariantDetailHandlers() {
	const { productId, variantId } = useParams();
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';
	const variantDetail = useMicroAppSelector(selectVariantDetail);
	const productDetail = useMicroAppSelector(selectProductDetail);
	const updateCommand = useMicroAppSelector(selectUpdateVariant);
	const deleteCommand = useMicroAppSelector(selectDeleteVariant);

	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const isLoadingDetail = variantDetail.status === 'pending' || updateCommand.status === 'pending' || deleteCommand.status === 'pending';

	React.useEffect(() => {
		if (updateCommand.status === 'success') {
			notification.showInfo(
				t('nikki.inventory.variant.messages.updateSuccess'), '',
			);
			navigate('../..', { relative: 'path' });
			dispatch(variantActions.resetUpdateVariant());
		}
		if (updateCommand.status === 'error') {
			notification.showError(
				t('nikki.inventory.variant.messages.updateError'), '',
			);
			dispatch(variantActions.resetUpdateVariant());
		}
	}, [updateCommand.status, dispatch, navigate, notification, t]);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			notification.showInfo(
				t('nikki.inventory.variant.messages.deleteSuccess'), '',
			);
			navigate('../..', { relative: 'path' });
			dispatch(variantActions.resetDeleteVariant());
		}
		if (deleteCommand.status === 'error') {
			notification.showError(
				t('nikki.inventory.variant.messages.deleteError'), '',
			);
			dispatch(variantActions.resetDeleteVariant());
		}
	}, [deleteCommand.status, dispatch, navigate, notification, t]);

	const handleUpdate = (data: any) => {
		console.log('Updating variant with data:', data);
		if (variantDetail?.data?.id && productId) {
			const dataWithTag = {
				id: variantDetail.data.id,
				etag: variantDetail.data.etag,
				sku: toOptionalTrimmedString(data.sku),
				barcode: toOptionalTrimmedString(data.barcode),
				imageURL: toOptionalTrimmedString(data.imageURL),
				status: toOptionalTrimmedString(data.status),
				proposedPrice: typeof data.proposedPrice === 'number' ? data.proposedPrice : undefined,
				attributes: typeof data.attributes === 'object' && data.attributes !== null
					? data.attributes as Record<string, unknown>
					: undefined,
			};
			dispatch(variantActions.updateVariant({
				orgId,
				productId,
				data: dataWithTag as any,
			}));
		}
	};

	const handleDelete = () => {
		if (variantDetail?.data?.id && productId) {
			dispatch(variantActions.deleteVariant({ orgId, productId, variantId: variantDetail.data.id }));
		}
	};

	const handleGoBack = () => {
		navigate("..", { relative: 'path' });
	}

	React.useEffect(() => {
		if (variantId && productId) {
			dispatch(variantActions.getVariant({ orgId, variantId, productId }));
			dispatch(productActions.getProduct({ orgId, id :productId }));
		}
	}, [variantId, productId, orgId, dispatch]);

	return {
		isLoadingDetail,
		handleUpdate,
		handleDelete,
		handleGoBack,
		productDetail,
		variantDetail,
	};
}
