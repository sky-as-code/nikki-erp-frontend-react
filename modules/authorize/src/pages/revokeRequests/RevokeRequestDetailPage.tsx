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

import { RevokeRequestFormFields, revokeRequestSchema, useRevokeRequestDetail } from '@/features/revokeRequests';


function RevokeRequestDetailPageBody(): React.ReactNode {
	const { revokeRequest, isLoading } = useRevokeRequestDetail.detail();
	const { isSubmitting } = useRevokeRequestDetail.handlers(revokeRequest);
	const { t: translate } = useTranslation();
	const schema = revokeRequestSchema as ModelSchema;

	if (isLoading) {
		return <LoadingState messageKey='nikki.general.messages.loading' />;
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
				<NotFound
					onGoBack={() => {}}
					messageKey='nikki.authorize.revoke_request.messages.not_found'
					showBackButton={false}
				/>
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

			<FormContainer title={targetName}>
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
			</FormContainer>
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

