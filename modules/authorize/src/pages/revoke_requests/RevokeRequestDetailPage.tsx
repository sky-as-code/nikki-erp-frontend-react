import { Stack } from '@mantine/core';
import { BreadcrumbsHeader, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	RevokeRequestFormContainer,
	RevokeRequestFormFields,
} from '@/features/revoke_requests/components';
import revokeRequestSchema from '@/features/revoke_requests/revoke-request-schema.json';

import { useRevokeRequestDetailData, useRevokeRequestDetailHandlers } from './hooks';


function RevokeRequestDetailPageBody(): React.ReactNode {
	const { revokeRequest, isLoading } = useRevokeRequestDetailData();
	const {
		isSubmitting,
	} = useRevokeRequestDetailHandlers(revokeRequest);
	const { t: translate } = useTranslation();
	const schema = revokeRequestSchema as ModelSchema;

	if (isLoading) {
		return <div>Loading...</div>;
	}
	if (!revokeRequest) {
		return (
			<Stack gap='md'>
				<BreadcrumbsHeader
					currentTitle={translate('nikki.authorize.revoke_request.title_detail')}
					autoBuild={true}
					segmentKey='revoke-requests'
					parentTitle={translate('nikki.authorize.revoke_request.title')}
				/>
				<div>Revoke Request not found</div>
			</Stack>
		);
	}

	const targetName = revokeRequest.target?.name || revokeRequest.targetRef;

	const flatModelValue = React.useMemo(() => ({
		...revokeRequest,
		targetName: revokeRequest.target?.name || '',
		receiverName: revokeRequest.receiver?.name || '',
		requestorName: revokeRequest.requestor?.name || '',
	}), [revokeRequest]);

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.revoke_request.title_detail')}
				autoBuild={true}
				segmentKey='revoke-requests'
				parentTitle={translate('nikki.authorize.revoke_request.title')}
			/>

			<RevokeRequestFormContainer title={targetName}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={flatModelValue}
						modelLoading={isSubmitting}
					>
						{() => (
							<Stack gap='xs'>
								<RevokeRequestFormFields isCreate={false} />
							</Stack>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</RevokeRequestFormContainer>
		</Stack>
	);
}

const RevokeRequestDetailPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.revoke_request.title_detail');
	}, [translate]);
	return <RevokeRequestDetailPageBody />;
};

export const RevokeRequestDetailPage: React.FC = RevokeRequestDetailPageWithTitle;

