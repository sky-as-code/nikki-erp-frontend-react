import { Breadcrumbs, Group, Stack, TagsInput, Typography } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { selectOrganizationState } from '../../appState';
import { ListActionListPage } from '../../components/ListActionBar';
import { OrganizationTable } from '../../features/organization/components';
import { useOrganizationListHandlers } from '../../features/organization/hooks';
import organizationSchema from '../../schemas/organization-schema.json';


export function OrganizationListPageBody(): React.ReactElement {
	const { organizations, isLoadingList } = useMicroAppSelector(selectOrganizationState);
	const schema = organizationSchema as ModelSchema;
	const columns = ['displayName', 'legalName', 'phoneNumber', 'status', 'createdAt', 'updatedAt'];
	const { t } = useTranslation();

	const { handleCreate, handleRefresh } = useOrganizationListHandlers();

	return (
		<Stack gap='md'>
			<Group>
				<Breadcrumbs style={{ minWidth: '30%' }}>
					<Typography>
						<h4>{t('nikki.identity.organization.title')}</h4>
					</Typography>
				</Breadcrumbs>
				<TagsInput
					placeholder={t('nikki.identity.organization.searchPlaceholder')}
					w='500px'
				/>
			</Group>
			<ListActionListPage
				onCreate={handleCreate}
				onRefresh={handleRefresh}
			/>
			<OrganizationTable
				columns={columns}
				organizations={organizations}
				isLoading={isLoadingList}
				schema={schema}
			/>
		</Stack>
	);
}

export const OrganizationListPage: React.FC = withWindowTitle('Organization List', OrganizationListPageBody);
