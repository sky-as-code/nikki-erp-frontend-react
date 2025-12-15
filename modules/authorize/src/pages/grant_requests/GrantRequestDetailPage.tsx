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
} from '@/features/grant_requests/components/GrantRequestForm';
import grantRequestSchema from '@/features/grant_requests/grant-request-schema.json';

import { useGrantRequestDetailData, useGrantRequestDetailHandlers } from './hooks/useGrantRequestDetail';


function GrantRequestDetailPageBody(): React.ReactNode {
	const { grantRequest, isLoading } = useGrantRequestDetailData();
	const {
		isSubmitting,
		handleBack,
		handleApprove,
		handleReject,
		handleCancelRequest,
	} = useGrantRequestDetailHandlers(grantRequest?.id);
	const { t: translate } = useTranslation();
	const schema = grantRequestSchema as ModelSchema;

	if (isLoading) return <GrantRequestLoadingState />;
	if (!grantRequest) return <GrantRequestNotFound onGoBack={handleBack} />;

	const targetName = grantRequest.target?.name || grantRequest.targetRef;

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
						modelValue={grantRequest as unknown as Record<string, unknown>}
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
									onCancelRequest={handleCancelRequest}
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
