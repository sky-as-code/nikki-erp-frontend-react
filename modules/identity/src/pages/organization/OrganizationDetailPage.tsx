import { Stack } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useNavigate, useParams } from 'react-router';

import { useUIState } from '../../../../shell/src/context/UIProviders';
import { IdentityDispatch, organizationActions } from '../../appState';
import { selectOrganizationState } from '../../appState/organizations';
import { HeaderDetailPage } from '../../components/HeaderDetailPage/HeaderDetailPage ';
import { OrganizationDetailForm } from '../../features/organizations/components';
import organizationSchema from '../../schemas/organization-schema.json';


function useOrganizationDetailHandlers(slug: string, etag: string) {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { notification } = useUIState();

	const handleUpdate = React.useCallback((data: any) => {
		const dataWithTag = { ...data, etag, slug };
		dispatch(organizationActions.updateOrganization(dataWithTag))
			.unwrap()
			.then(() => {
				notification.showInfo('Organization updated successfully', 'Success');
				navigate('..', { relative: 'path' });
			})
			.catch(() => {
				notification.showError('Failed to update organization. Please try again.', 'Error');
			});
	}, [slug, dispatch, etag, navigate, notification]);

	const handleDelete = React.useCallback(() => {
		dispatch(organizationActions.deleteOrganization(slug))
			.unwrap()
			.then(() => {
				notification.showInfo('Organization deleted successfully', 'Success');
				navigate('..', { relative: 'path' });
			})
			.catch(() => {
				notification.showError('Failed to delete organization. Please try again.', 'Error');
			});
	}, [slug, dispatch, navigate, notification]);

	React.useEffect(() => {
		dispatch(organizationActions.getOrganization(slug!));
	}, [slug, dispatch]);

	return {
		handleDelete,
		handleUpdate,
	};
}

export const OrganizationDetailPageBody: React.FC = () => {
	const { slug } = useParams();
	const { organizationDetail, isLoadingDetail } = useMicroAppSelector(selectOrganizationState);
	const schema = organizationSchema as ModelSchema;

	const handlers = useOrganizationDetailHandlers(slug!, organizationDetail?.etag);

	return (
		<Stack gap='md'>
			<HeaderDetailPage
				title='nikki.identity.organization.title'
				name={organizationDetail?.slug} />
			<OrganizationDetailForm
				schema={schema}
				organizationDetail={organizationDetail}
				isLoading={isLoadingDetail}
				onSubmit={handlers.handleUpdate}
				onDelete={handlers.handleDelete}
			/>
		</Stack>
	);
};

export const OrganizationDetailPage: React.FC = withWindowTitle('Organization Detail', OrganizationDetailPageBody);

