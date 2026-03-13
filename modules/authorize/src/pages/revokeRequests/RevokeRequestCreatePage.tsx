import { Button, Stack } from '@mantine/core';
import { BreadcrumbsHeader } from '@nikkierp/ui/components';
import { FormContainer, FormActions } from '@nikkierp/ui/components/form';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ReceiverType } from '@/features/grantRequests/types';
import {
	RevokeRequestAssignmentsList,
	RevokeRequestFilter,
	RevokeRequestFormFields,
	useRevokeRequestCreate,
} from '@/features/revokeRequests';
import { useAuthorizePermissions } from '@/hooks/useAuthorizePermissions';


type RevokeCreatePageData = ReturnType<typeof useRevokeRequestCreate>;

interface RevokeRequestCreateFormProps {
	pageData: RevokeCreatePageData;
	canCreate: boolean;
	canSubmit: boolean;
}

function RevokeRequestCreateForm({ pageData, canCreate, canSubmit }: RevokeRequestCreateFormProps) {
	const { t: translate } = useTranslation();

	return (
		<FormContainer>
			<Stack gap='md'>
				<FormActions
					isSubmitting={pageData.isSubmitting}
					onCancel={pageData.handleCancel}
					isCreate
					showSubmit={false}
					additionalActions={
						canCreate ? (
							<Button
								type='button'
								disabled={!canSubmit}
								loading={pageData.isSubmitting}
								onClick={() => pageData.handleSubmit()}
							>
								{translate('nikki.authorize.revoke_request.actions.revoke_selected')}
							</Button>
						) : undefined
					}
				/>
				<RevokeRequestFormFields
					isCreate
					showTargetReceiver={false}
					comment={pageData.comment}
					attachmentUrl={pageData.attachmentUrl}
					onCommentChange={pageData.setComment}
					onAttachmentUrlChange={pageData.setAttachmentUrl}
				/>
				<RevokeRequestFilter
					receiverType={pageData.receiverType}
					onReceiverTypeChange={(value) => pageData.setReceiverType(value as ReceiverType)}
					receiverId={pageData.receiverId}
					onReceiverIdChange={pageData.setReceiverId}
					users={pageData.users}
					groups={pageData.groups}
				/>
				<RevokeRequestAssignmentsList
					assignments={pageData.assignments}
					selectedAssignments={pageData.selectedAssignments}
					onSelectionChange={pageData.onSelectionChange}
					onSelectAll={pageData.onSelectAll}
					onDeselectAll={pageData.onDeselectAll}
					isLoading={pageData.isLoading}
				/>
			</Stack>
		</FormContainer>
	);
}

function RevokeRequestCreatePageBody(): React.ReactNode {
	const { t: translate } = useTranslation();
	const pageData = useRevokeRequestCreate();
	const permissions = useAuthorizePermissions();
	const canCreate = permissions.revokeRequest.canCreate;
	const canSubmit = canCreate
		&& pageData.selectedAssignments.size > 0
		&& !pageData.isSubmitting;

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.revoke_request.title_create')}
				autoBuild={true}
				segmentKey='revoke-requests'
				parentTitle={translate('nikki.authorize.revoke_request.title')}
			/>
			<RevokeRequestCreateForm pageData={pageData} canCreate={canCreate} canSubmit={canSubmit} />
		</Stack>
	);
}

const RevokeRequestCreatePageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.revoke_request.title_create');
	}, [translate]);
	return <RevokeRequestCreatePageBody />;
};

export const RevokeRequestCreatePage: React.FC = RevokeRequestCreatePageWithTitle;

