import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { selectOrganizationList } from '../../appState/organization';
import { ListPageLayout } from '../../components/ListPageLayout';
import { OrganizationTable } from '../../features/organization/components';
import { useOrganizationListHandlers } from '../../features/organization/hooks';
import { useIdentityPermissions } from '../../hooks';


export function OrganizationListPageBody(): React.ReactElement {
	const listOrganization = useMicroAppSelector(selectOrganizationList);
	const { t } = useTranslation();

	const isLoading = listOrganization.status === 'pending';
	const permissions = useIdentityPermissions();
	const { handleCreate, handleRefresh } = useOrganizationListHandlers();

	return (
		<ListPageLayout
			title={t('nikki.identity.organization.title')}
			searchPlaceholder={t('nikki.identity.organization.searchPlaceholder')}
			onCreate={permissions.organization.canCreate ? handleCreate : undefined}
			onRefresh={handleRefresh}
		>
			{() => (
				<OrganizationTable
					organizations={listOrganization?.data}
					isLoading={isLoading}
				/>
			)}
		</ListPageLayout>
	);
}

export const OrganizationListPage: React.FC = withWindowTitle('Organization List', OrganizationListPageBody);
