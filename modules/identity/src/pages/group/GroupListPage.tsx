import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { selectGroupList } from '../../appState/group';
import { ListPageLayout } from '../../components/ListPageLayout';
import { GroupTable } from '../../features/group/components';
import { useGroupListHandlers } from '../../features/group/hooks/useGroupList';
import { useIdentityPermissions } from '../../hooks';


export function GroupListPageBody(): React.ReactNode {
	const { t } = useTranslation();
	const listGroup = useMicroAppSelector(selectGroupList);
	const isLoadingList = listGroup.status === 'pending';
	const permissions = useIdentityPermissions();

	const { handleCreate, handleRefresh } = useGroupListHandlers();
	return (
		<ListPageLayout
			title={t('nikki.identity.group.title')}
			searchPlaceholder={t('nikki.identity.group.searchPlaceholder')}
			onCreate={permissions.group.canCreate ? handleCreate : undefined}
			onRefresh={handleRefresh}
		>
			{() => (
				<GroupTable
					groups={listGroup?.data}
					isLoading={isLoadingList}
				/>
			)}
		</ListPageLayout>
	);
}

export const GroupListPage: React.FC = withWindowTitle('Group List', GroupListPageBody);
