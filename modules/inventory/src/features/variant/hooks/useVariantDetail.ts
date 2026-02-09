import { useUIState } from '@nikkierp/shell/contexts';
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

import type { InventoryDispatch } from '../../../appState';


export function useVariantDetailHandlers() {
	const { productId, variantId } = useParams();
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const variantDetail = useMicroAppSelector(selectVariantDetail);
	const updateCommand = useMicroAppSelector(selectUpdateVariant);
	const deleteCommand = useMicroAppSelector(selectDeleteVariant);

	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const isLoadingDetail = updateCommand.status === 'pending' || deleteCommand.status === 'pending';

	React.useEffect(() => {
		if (updateCommand.status === 'success') {
			notification.showInfo(
				t('nikki.inventory.variant.messages.updateSuccess'), '',
			);
			navigate('..', { relative: 'path' });
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
			navigate('..', { relative: 'path' });
			dispatch(variantActions.resetDeleteVariant());
		}
		if (deleteCommand.status === 'error') {
			notification.showError(
				t('nikki.inventory.variant.messages.deleteError'), '',
			);
			dispatch(variantActions.resetDeleteVariant());
		}
	}, [deleteCommand.status, dispatch, navigate, notification, t]);

	const handleUpdate = (data: Record<string, unknown>) => {
		if (variantDetail?.data?.id && productId) {
			const dataWithTag = { ...data, etag: variantDetail.data.etag };
			dispatch(variantActions.updateVariant({
				productId,
				data: {
					id: variantDetail.data.id,
					...dataWithTag,
				} as any,
			}));
		}
	};

	const handleDelete = () => {
		if (variantDetail?.data?.id && productId) {
			dispatch(variantActions.deleteVariant({ productId, variantId: variantDetail.data.id }));
		}
	};

	React.useEffect(() => {
		if (variantId && productId) {
			dispatch(variantActions.getVariant({ variantId, productId }));
		}
	}, [variantId, productId, dispatch]);

	return {
		isLoadingDetail,
		handleUpdate,
		handleDelete,
	};
}
