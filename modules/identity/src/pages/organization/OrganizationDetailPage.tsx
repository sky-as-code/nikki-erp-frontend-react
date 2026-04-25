import { Breadcrumbs, Stack, Typography } from '@mantine/core';
import { NotFound, withWindowTitle, LoadingState } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';

import { selectOrganizationDetail } from '../../appState/organization';
import { OrganizationForm } from '../../features/organization/components';
import { useIdentityPermissions } from '../../hooks';


export const OrganizationDetailPageBody: React.FC = () => {
	const { slug } = useParams();
	const organizationDetail = useMicroAppSelector(selectOrganizationDetail);
	const { t } = useTranslation();
	const permissions = useIdentityPermissions();
	const navigate = useNavigate();

	const isLoadingDetail = organizationDetail?.status;

	const handleGoBack = () => {
		navigate('..', { relative: 'path' });
	};

	if (isLoadingDetail === 'error' || isLoadingDetail === 'idle') {
		return (
			<NotFound
				onGoBack={handleGoBack}
				messageKey='nikki.identity.organization.messages.notFoundMessage'
			/>
		);
	}

	if (isLoadingDetail != 'success') {
		return <LoadingState messageKey='nikki.authorize.entitlement.messages.loading' />;
	}



	return (
		<Stack gap='md'>
			<Breadcrumbs>
				<Typography>
					<Link to='..'>
						<h4>{t('nikki.identity.organization.title')}</h4>
					</Link>
				</Typography>
			</Breadcrumbs>
			<OrganizationForm
				variant='update'
				slug={slug}
				canUpdate={permissions.organization.canUpdate}
				canDelete={permissions.organization.canDelete}
			/>
		</Stack>
	);
};

export const OrganizationDetailPage: React.FC = withWindowTitle('Organization Detail', OrganizationDetailPageBody);

