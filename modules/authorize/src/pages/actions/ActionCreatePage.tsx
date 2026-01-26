import { Stack } from '@mantine/core';
import {
	BreadcrumbsHeader,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components';
import { FormContainer, FormActions } from '@nikkierp/ui/components/form';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AuthorizeDispatch, resourceActions, selectResourceList } from '@/appState';
import { ActionFormFields, actionSchema, useActionCreate } from '@/features/actions';


function ActionCreatePageBody(): React.ReactNode {
	const {
		isSubmitting,
		handleSubmit,
		handleCancel,
	} = useActionCreate();
	const { t: translate } = useTranslation();
	const schema = actionSchema as ModelSchema;
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const resourceListState = useMicroAppSelector(selectResourceList);
	const resources = resourceListState.data ?? [];

	React.useEffect(() => {
		if (resourceListState.status === 'idle' || (resourceListState.status === 'success' && resources.length === 0)) {
			dispatch(resourceActions.listResources());
		}
	}, [resourceListState, resources]);

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.action.title_create')}
				autoBuild={true}
				segmentKey='actions'
				parentTitle={translate('nikki.authorize.action.title')}
			/>

			<FormContainer>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data))} noValidate>
								<Stack gap='xs'>
									<FormActions isSubmitting={isSubmitting} onCancel={handleCancel} isCreate />
									<ActionFormFields
										isCreate
										resources={resources}
									/>
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</FormContainer>
		</Stack>
	);
}

const ActionCreatePageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.action.title_create');
	}, [translate]);
	return <ActionCreatePageBody />;
};

export const ActionCreatePage: React.FC = ActionCreatePageWithTitle;

