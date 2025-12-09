import { Stack } from '@mantine/core';
import { cleanFormData } from '@nikkierp/common/utils';
import { BreadcrumbsHeader, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import { AuthorizeDispatch, actionActions, selectActionState } from '@/appState';
import actionSchema from '@/features/actions/action-schema.json';
import {
	ActionNotFound,
	ActionFormActions,
	ActionFormContainer,
	ActionFormFields,
	ActionLoadingState,
} from '@/features/actions/components';

import { useUIState } from '../../../../shell/src/context/UIProviders';

import type { Action } from '@/features/actions';


function useActionDetailData() {
	const { actionId } = useParams<{ actionId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { actions, isLoadingList, actionDetail, isLoadingDetail } = useMicroAppSelector(selectActionState);

	const action = React.useMemo(() => {
		if (!actionId) return undefined;
		const fromList = actions.find((a: Action) => a.id === actionId);

		if (fromList) return fromList;

		return actionDetail?.id === actionId ? actionDetail : undefined;
	}, [actionId, actions, actionDetail]);

	React.useEffect(() => {
		if (actionId && !action) {
			dispatch(actionActions.getAction({ actionId }));
		}
	}, [dispatch, actionId, action]);

	React.useEffect(() => {
		if (actions.length === 0) {
			dispatch(actionActions.listActions(undefined));
		}
	}, [dispatch, actions.length]);

	return { action, isLoading: isLoadingList || isLoadingDetail, actionId };
}

function useActionDetailHandlers(action: Action | undefined) {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleCancel = React.useCallback(() => {
		const parent = resolvePath('..', location.pathname).pathname;
		navigate(parent);
	}, [navigate, location]);

	const handleSubmit = React.useCallback(async (data: unknown) => {
		if (!action) return;

		const formData = cleanFormData(data as Partial<Action>);
		setIsSubmitting(true);

		const newDescription = formData.description ?? null;
		const originalDescription = action.description ?? null;

		if (newDescription === originalDescription) {
			notification.showError(
				translate('nikki.authorize.resource.errors.description_not_changed'),
				translate('nikki.general.messages.no_changes'),
			);
			setIsSubmitting(false);
			return;
		}

		const result = await dispatch(actionActions.updateAction({
			actionId: action.id,
			etag: action.etag || '',
			description: newDescription ?? undefined,
		}));

		if (result.meta.requestStatus === 'fulfilled') {
			notification.showInfo(
				translate('nikki.authorize.action.messages.update_success', { name: action.name }),
				translate('nikki.general.messages.success'),
			);
			const parent = resolvePath('..', location.pathname).pathname;
			navigate(parent);
		}
		else {
			const errorMessage = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.update_failed');
			notification.showError(errorMessage, translate('nikki.general.messages.error'));
		}

		setIsSubmitting(false);
	}, [dispatch, notification, action, navigate, location, translate]);

	return { isSubmitting, handleCancel, handleSubmit };
}

function ActionDetailPageBody(): React.ReactNode {
	const { action, isLoading } = useActionDetailData();
	const { isSubmitting, handleCancel, handleSubmit } = useActionDetailHandlers(action);
	const { t: translate } = useTranslation();
	const schema = actionSchema as ModelSchema;

	if (isLoading) {
		return <ActionLoadingState />;
	}

	if (!action) {
		return <ActionNotFound onGoBack={handleCancel} />;
	}

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.action.title_detail')}
				autoBuild={true}
				segmentKey='actions'
				parentTitle={translate('nikki.authorize.action.title')}
			/>

			<ActionFormContainer title={action.name}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={action as unknown as Record<string, unknown>}
						modelLoading={isSubmitting}
					>
						{({ handleSubmit: formHandleSubmit }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data))} noValidate>
								<Stack gap='xs'>
									<ActionFormActions
										isSubmitting={isSubmitting}
										onCancel={handleCancel}
										isCreate={false}
									/>
									<ActionFormFields isCreate={false} />
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</ActionFormContainer>
		</Stack>
	);
}

const ActionDetailPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.action.title_detail');
	}, [translate]);
	return <ActionDetailPageBody />;
};

export const ActionDetailPage: React.FC = ActionDetailPageWithTitle;

