import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { useUIState } from '../../../../../shell/src/context/UIProviders';
import { IdentityDispatch, organizationActions } from '../../../appState';
import { selectDeleteOrganization, selectUpdateOrganization, selectOrganizationDetail } from '../../../appState/organization';

// eslint-disable-next-line max-lines-per-function
export function useOrganizationDetailHandlers() {
	const { slug } = useParams();
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const organizationDetail = useMicroAppSelector(selectOrganizationDetail);

	const updateCommand = useMicroAppSelector(selectUpdateOrganization);
	const deleteCommand = useMicroAppSelector(selectDeleteOrganization);
	const isLoadingDetail = updateCommand.status === 'pending' || deleteCommand.status === 'pending';

	React.useEffect(() => {
		if (updateCommand.status === 'success') {
			notification.showInfo(
				t('nikki.identity.organization.messages.updateSuccess'), '',
			);
			dispatch(organizationActions.resetUpdateOrganization());
			navigate('..', { relative: 'path' });
		}

		if (updateCommand.status === 'error') {
			notification.showError(
				t('nikki.identity.organization.messages.updateError'), '',
			);
			dispatch(organizationActions.resetUpdateOrganization());
		}
	}, [updateCommand.status, dispatch, navigate, notification, t]);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			notification.showInfo(
				t('nikki.identity.organization.messages.deleteSuccess'), '',
			);
			dispatch(organizationActions.resetDeleteOrganization());
			navigate('..', { relative: 'path' });
		}

		if (deleteCommand.status === 'error') {
			notification.showError(
				t('nikki.identity.organization.messages.deleteError'), '',
			);
			dispatch(organizationActions.resetDeleteOrganization());
		}
	}, [deleteCommand.status, dispatch, navigate, notification, t]);

	const handleUpdate = (data: any) => {
		if (organizationDetail?.data.id && slug) {
			const dataWithTag = { ...data, etag: organizationDetail.data.etag };
			dispatch(organizationActions.updateOrganization({
				...dataWithTag,
				slug,
				id: organizationDetail.data.id,
			}));
		}
	};

	const handleDelete = () => {
		if (slug) {
			dispatch(organizationActions.deleteOrganization(slug));
		}
	};

	React.useEffect(() => {
		if (!slug) return;

		dispatch(organizationActions.getOrganization(slug));
	}, [slug, dispatch]);

	return {
		isLoadingDetail,
		handleDelete,
		handleUpdate,
	};
}
