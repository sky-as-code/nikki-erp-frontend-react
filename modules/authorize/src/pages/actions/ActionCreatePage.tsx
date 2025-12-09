import { Stack } from '@mantine/core';
import { cleanFormData } from '@nikkierp/common/utils';
import { BreadcrumbsHeader, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { AuthorizeDispatch, actionActions, resourceActions, selectResourceState } from '@/appState';
import actionSchema from '@/features/actions/action-schema.json';
import {
	ActionFormActions,
	ActionFormContainer,
	ActionFormFields,
} from '@/features/actions/components';

import { useUIState } from '../../../../shell/src/context/UIProviders';

import type { Action } from '@/features/actions';


function useActionCreateHandlers() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleSubmit = React.useCallback(async (data: unknown) => {
		const formData = cleanFormData(data as Partial<Action>);
		setIsSubmitting(true);

		formData.createdBy = '01JWNNJGS70Y07MBEV3AQ0M526';
		const result = await dispatch(actionActions.createAction(
			formData as Omit<Action, 'id' | 'createdAt' | 'etag' | 'resources' | 'entitlementsCount'>,
		));

		if (result.meta.requestStatus === 'fulfilled') {
			notification.showInfo(
				translate('nikki.authorize.action.messages.create_success', { name: formData.name }),
				translate('nikki.general.messages.success'),
			);
			const parent = resolvePath('..', location.pathname).pathname;
			navigate(parent);
		}
		else {
			const errorMessage = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.create_failed');
			notification.showError(errorMessage, translate('nikki.general.messages.error'));
		}

		setIsSubmitting(false);
	}, [dispatch, notification, location, translate, navigate]);

	const handleCancel = React.useCallback(() => {
		const parent = resolvePath('..', location.pathname).pathname;
		navigate(parent);
	}, [navigate, location]);

	return { isSubmitting, handleSubmit, handleCancel };
}

function ActionCreatePageBody(): React.ReactNode {
	const {
		isSubmitting,
		handleSubmit,
		handleCancel,
	} = useActionCreateHandlers();
	const { t: translate } = useTranslation();
	const schema = actionSchema as ModelSchema;
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { resources } = useMicroAppSelector(selectResourceState);

	React.useEffect(() => {
		if (resources.length === 0) {
			dispatch(resourceActions.listResources());
		}
	}, [dispatch, resources.length]);

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.action.title_create')}
				autoBuild={true}
				segmentKey='actions'
				parentTitle={translate('nikki.authorize.action.title')}
			/>

			<ActionFormContainer>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data))} noValidate>
								<Stack gap='xs'>
									<ActionFormActions isSubmitting={isSubmitting} onCancel={handleCancel} isCreate />
									<ActionFormFields
										isCreate
										resources={resources}
									/>
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</ActionFormContainer>
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

