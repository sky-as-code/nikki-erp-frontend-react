import { Stack } from '@mantine/core';
import { BreadcrumbsHeader, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	GrantRequestDetailActions,
	GrantRequestFormContainer,
	GrantRequestFormFields,
	GrantRequestLoadingState,
	GrantRequestNotFound,
} from '@/features/grant_requests/components';
import grantRequestSchema from '@/features/grant_requests/grant-request-schema.json';

import { useGrantRequestDetailData, useGrantRequestDetailHandlers } from './hooks';




function GrantRequestDetailPageBody(): React.ReactNode {
	const { grantRequest, isLoading } = useGrantRequestDetailData();
	const {
		isSubmitting,
		handleBack,
		handleApprove,
		handleReject,
	} = useGrantRequestDetailHandlers(grantRequest);
	const { t: translate } = useTranslation();
	const schema = grantRequestSchema as ModelSchema;

	if (isLoading) return <GrantRequestLoadingState />;
	if (!grantRequest) return <GrantRequestNotFound onGoBack={handleBack} />;

	const targetName = grantRequest.target?.name || grantRequest.targetRef;

	const flatModelValue = React.useMemo(() => ({
		...grantRequest,
		targetName: grantRequest.target?.name || '',
		receiverName: grantRequest.receiver?.name || '',
		requestorName: grantRequest.requestor?.name || '',
	}), [grantRequest]);

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.grant_request.title_detail')}
				autoBuild={true}
				segmentKey='grant-requests'
				parentTitle={translate('nikki.authorize.grant_request.title')}
			/>

			<GrantRequestFormContainer title={targetName}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={flatModelValue}
						modelLoading={isSubmitting}
					>
						{() => (
							<Stack gap='xs'>
								<GrantRequestDetailActions
									grantRequest={grantRequest}
									isSubmitting={isSubmitting}
									onCancel={handleBack}
									onApprove={handleApprove}
									onReject={handleReject}
								/>

								<GrantRequestFormFields isCreate={false} />

							</Stack>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</GrantRequestFormContainer>
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
