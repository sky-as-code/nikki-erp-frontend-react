import { Breadcrumbs, Stack, Typography } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { selectOrganizationDetail } from '../../appState/organization';
import { OrganizationDetailForm } from '../../features/organization/components';
import { useOrganizationDetailHandlers } from '../../features/organization/hooks';
import organizationSchema from '../../schemas/organization-schema.json';


export const OrganizationDetailPageBody: React.FC = () => {
	const organizationDetail = useMicroAppSelector(selectOrganizationDetail);
	const schema = organizationSchema as ModelSchema;
	const { t } = useTranslation();

	const { isLoadingDetail, handleUpdate, handleDelete } = useOrganizationDetailHandlers();

	return (
		<Stack gap='md'>
			<Breadcrumbs>
				<Typography>
					<Link to='..'>
						<h4>{t('nikki.identity.organization.title')}</h4>
					</Link>
				</Typography>
			</Breadcrumbs>
			<OrganizationDetailForm
				schema={schema}
				organizationDetail={organizationDetail?.data}
				isLoading={isLoadingDetail}
				onSubmit={handleUpdate}
				onDelete={handleDelete}
			/>
		</Stack>
	);
};

export const OrganizationDetailPage: React.FC = withWindowTitle('Organization Detail', OrganizationDetailPageBody);

