import { Breadcrumbs, Group, Stack, TagsInput, Typography } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { selectGroupList } from '../../appState/group';
import { ListActionListPage } from '../../components/ListActionBar';
import { GroupTable } from '../../features/group/components';
import { useGroupListHandlers } from '../../features/group/hooks/useGroupList';
import groupSchema from '../../schemas/group-schema.json';


export function GroupListPageBody(): React.ReactNode {
	const schema = groupSchema as ModelSchema;
	const columns = ['id', 'name', 'description', 'createdAt', 'updatedAt'];
	const { t } = useTranslation();
	const listGroup = useMicroAppSelector(selectGroupList);
	const isLoadingList = listGroup.status === 'pending';

	const { handleCreate, handleRefresh } = useGroupListHandlers();
	return (
		<Stack gap='md'>
			<Group>
				<Breadcrumbs style={{ minWidth: '30%' }}>
					<Typography>
						<h4>{t('nikki.identity.group.title')}</h4>
					</Typography>
				</Breadcrumbs>
				<TagsInput
					placeholder={t('nikki.identity.group.searchPlaceholder')}
					w='500px'
				/>
			</Group>
			<ListActionListPage
				onCreate={handleCreate}
				onRefresh={handleRefresh}
			/>
			<GroupTable
				columns={columns}
				groups={listGroup?.data}
				isLoading={isLoadingList}
				schema={schema}
			/>
		</Stack>
	);
}

export const GroupListPage: React.FC = withWindowTitle('Group List', GroupListPageBody);
