import { Stack } from '@mantine/core';
import {
	BreadcrumbsHeader,
	FormFieldProvider,
	FormStyleProvider,
	LoadingState,
	NotFound,
} from '@nikkierp/ui/components';
import { FormContainer } from '@nikkierp/ui/components/form';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	DetailActions,
	GrantRequestFormFields,
} from '@/features/grant_requests/components';
import grantRequestSchema from '@/features/grant_requests/grant-request-schema.json';

import { useGrantRequestDetailData, useGrantRequestDetailHandlers } from './hooks';


function GrantRequestDetailForm({
	grantRequest,
	handlers,
}: {
	grantRequest: NonNullable<ReturnType<typeof useGrantRequestDetailData>['grantRequest']>;
	handlers: ReturnType<typeof useGrantRequestDetailHandlers>;
}) {
	const schema = grantRequestSchema as ModelSchema;
	const targetName = grantRequest.target?.name || grantRequest.targetRef;

	const flatModelValue = React.useMemo(() => ({
		...grantRequest,
		targetName: grantRequest.target?.name || '',
		receiverName: grantRequest.receiver?.name || '',
		requestorName: grantRequest.requestor?.name || '',
	}), [grantRequest]);

	return (
		<FormContainer title={targetName}>
			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					formVariant='update'
					modelSchema={schema}
					modelValue={flatModelValue}
					modelLoading={handlers.isSubmitting}
				>
					{() => (
						<Stack gap='xs'>
							<DetailActions
								grantRequest={grantRequest}
								isSubmitting={handlers.isSubmitting}
								onCancel={handlers.handleBack}
								onApprove={handlers.handleApprove}
								onReject={handlers.handleReject}
							/>
							<GrantRequestFormFields isCreate={false} />
						</Stack>
					)}
				</FormFieldProvider>
			</FormStyleProvider>
		</FormContainer>
	);
}

function GrantRequestDetailPageBody(): React.ReactNode {
	const { grantRequest, isLoading } = useGrantRequestDetailData();
	const handlers = useGrantRequestDetailHandlers(grantRequest);
	const { t: translate } = useTranslation();

	if (isLoading) {
		return <LoadingState minHeight={200} />;
	}
	if (!grantRequest) {
		return (
			<NotFound
				onGoBack={handlers.handleBack}
				titleKey='nikki.general.messages.not_found'
				messageKey='nikki.authorize.grant_request.messages.not_found'
			/>
		);
	}

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.grant_request.title_detail')}
				autoBuild={true}
				segmentKey='grant-requests'
				parentTitle={translate('nikki.authorize.grant_request.title')}
			/>
			<GrantRequestDetailForm grantRequest={grantRequest} handlers={handlers} />
		</Stack>
	);
}

const GrantRequestDetailPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.grant_request.title_detail');
	}, [translate]);
	return <GrantRequestDetailPageBody />;
};

export const GrantRequestDetailPage: React.FC = GrantRequestDetailPageWithTitle;
