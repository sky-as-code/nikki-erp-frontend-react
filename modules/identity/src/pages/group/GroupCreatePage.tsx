import { Stack } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { useUIState } from '../../../../shell/src/context/UIProviders';
import { IdentityDispatch, groupActions, selectGroupState } from '../../appState';
import { HeaderCreatePage } from '../../components/HeaderCreatePage/HeaderCreatePage';
import { GroupCreateForm } from '../../features/group/components';
import groupSchema from '../../schemas/group-schema.json';


function useGroupCreateHandlers() {
	const navigate = useNavigate();
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const { orgSlug } = useParams<{ orgSlug: string }>();
	const { notification } = useUIState();
	const { t } = useTranslation();

	const handleCreate = React.useCallback((data: any) => {
		dispatch(groupActions.createGroup({ orgSlug: orgSlug!, data }))
			.unwrap()
			.then(() => {
				notification.showInfo(t('nikki.identity.group.messages.createSuccess'), '');
				navigate('..', { relative: 'path' });
			})
			.catch(() => {
				notification.showError(t('nikki.identity.group.messages.createError'), '');
			});
	}, [dispatch, navigate, orgSlug, notification]);

	return {
		handleCreate,
	};
}

export const GroupCreatePageBody: React.FC = () => {
	const { isCreatingGroup } = useMicroAppSelector(selectGroupState);
	const schema = groupSchema as ModelSchema;

	const { handleCreate } = useGroupCreateHandlers();

	return (
		<Stack gap='md'>
			<HeaderCreatePage title='nikki.identity.group.actions.createNew' />
			<GroupCreateForm
				schema={schema}
				isCreating={isCreatingGroup}
				onSubmit={handleCreate}
			/>
		</Stack>
	);
};

export const GroupCreatePage = withWindowTitle('Create Group', GroupCreatePageBody);
