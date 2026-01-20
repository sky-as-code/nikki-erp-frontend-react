import { Breadcrumbs, Stack, Typography } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';

import { IdentityDispatch, organizationActions } from '../../appState';
import { selectOrganizationState } from '../../appState/organization';
import { OrganizationDetailForm } from '../../features/organization/components';
import { useOrganizationDetailHandlers } from '../../features/organization/hooks';
import organizationSchema from '../../schemas/organization-schema.json';


export const OrganizationDetailPageBody: React.FC = () => {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const { slug } = useParams();
	const { organizationDetail, isLoading } = useMicroAppSelector(selectOrganizationState);
	const schema = organizationSchema as ModelSchema;
	const { t } = useTranslation();

	React.useEffect(() => {
		if (slug) {
			dispatch(organizationActions.getOrganization(slug));
		}
	}, [slug, dispatch]);

	const { handleUpdate, handleDelete } = useOrganizationDetailHandlers(
		organizationDetail?.id,
		slug!,
		organizationDetail?.etag);

	return (
		<Stack gap='md'>
			<Breadcrumbs>
				<Typography>
					<Link to='..'>
						<h4>{t('nikki.identity.organization.title')}</h4>
					</Link>
				</Typography>
				{organizationDetail?.slug && (
					<Typography>
						<h5>{organizationDetail.slug}</h5>
					</Typography>
				)}
			</Breadcrumbs>
			<OrganizationDetailForm
				schema={schema}
				organizationDetail={organizationDetail}
				isLoading={isLoading}
				onSubmit={handleUpdate}
				onDelete={handleDelete}
			/>
		</Stack>
	);
};

export const OrganizationDetailPage: React.FC = withWindowTitle('Organization Detail', OrganizationDetailPageBody);

