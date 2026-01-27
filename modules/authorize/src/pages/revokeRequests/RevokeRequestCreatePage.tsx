import { Button, Group, Stack, TextInput, Textarea } from '@mantine/core';
import { BreadcrumbsHeader, FormContainer } from '@nikkierp/ui/components';
import { IconCheck } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ReceiverType } from '@/features/grantRequests/types';
import {
	RevokeRequestAssignmentsList,
	RevokeRequestFilter,
	useRevokeRequestCreate,
} from '@/features/revokeRequests';
import { useAuthorizePermissions } from '@/hooks/useAuthorizePermissions';


interface ActionButtonsProps {
	canSubmit: boolean;
	isSubmitting: boolean;
	onSubmit: () => void;
	onCancel: () => void;
	showSubmit?: boolean;
}

function ActionButtons({
	canSubmit,
	isSubmitting,
	onSubmit,
	onCancel,
	showSubmit = true,
}: ActionButtonsProps) {
	const { t: translate } = useTranslation();

	return (
		<Group>
			{showSubmit && (
				<Button
					leftSection={<IconCheck size={16} />}
					onClick={onSubmit}
					disabled={!canSubmit}
					loading={isSubmitting}
				>
					{translate('nikki.authorize.revoke_request.actions.revoke_selected')}
				</Button>
			)}
			<Button
				type='button'
				variant='outline'
				onClick={onCancel}
				disabled={isSubmitting}
			>
				{translate('nikki.general.actions.cancel')}
			</Button>
		</Group>
	);
}

interface FormFieldsProps {
	comment: string;
	setComment: (value: string) => void;
	attachmentUrl: string;
	setAttachmentUrl: (value: string) => void;
}

function FormFields({ comment, setComment, attachmentUrl, setAttachmentUrl }: FormFieldsProps) {
	const { t: translate } = useTranslation();

	return (
		<>
			<Textarea
				label={translate('nikki.authorize.revoke_request.fields.comment')}
				value={comment}
				onChange={(e) => setComment(e.currentTarget.value)}
				minRows={3}
			/>
			<TextInput
				label={translate('nikki.authorize.revoke_request.fields.attachment')}
				value={attachmentUrl}
				onChange={(e) => setAttachmentUrl(e.currentTarget.value)}
			/>
		</>
	);
}

interface FilterSectionProps {
	receiverType: ReceiverType | null;
	setReceiverType: (value: ReceiverType) => void;
	receiverId: string | null;
	setReceiverId: (value: string | null) => void;
	users: ReturnType<typeof useRevokeRequestCreate>['users'];
	groups: ReturnType<typeof useRevokeRequestCreate>['groups'];
}

function FilterSection({
	receiverType,
	setReceiverType,
	receiverId,
	setReceiverId,
	users,
	groups,
}: FilterSectionProps) {
	return (
		<RevokeRequestFilter
			receiverType={receiverType}
			onReceiverTypeChange={(value) => setReceiverType(value as ReceiverType)}
			receiverId={receiverId}
			onReceiverIdChange={setReceiverId}
			users={users}
			groups={groups}
		/>
	);
}

interface AssignmentsListProps {
	assignments: ReturnType<typeof useRevokeRequestCreate>['assignments'];
	selectedAssignments: Set<string>;
	onSelectionChange: (id: string, selected: boolean) => void;
	onSelectAll: () => void;
	onDeselectAll: () => void;
	isLoading: boolean;
}

function AssignmentsListSection({
	assignments,
	selectedAssignments,
	onSelectionChange,
	onSelectAll,
	onDeselectAll,
	isLoading,
}: AssignmentsListProps) {
	return (
		<RevokeRequestAssignmentsList
			assignments={assignments}
			selectedAssignments={selectedAssignments}
			onSelectionChange={onSelectionChange}
			onSelectAll={onSelectAll}
			onDeselectAll={onDeselectAll}
			showRevokeButton={false}
			isLoading={isLoading}
		/>
	);
}

function RevokeRequestCreatePageBody(): React.ReactNode {
	const { t: translate } = useTranslation();
	const pageData = useRevokeRequestCreate();
	const permissions = useAuthorizePermissions();
	const canSubmit = permissions.revokeRequest.canCreate
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

			<FormContainer>
				<Stack gap='md'>
					<ActionButtons
						canSubmit={canSubmit}
						isSubmitting={pageData.isSubmitting}
						onSubmit={() => {
							if (!permissions.revokeRequest.canCreate) return;
							pageData.handleSubmit();
						}}
						onCancel={pageData.handleCancel}
						showSubmit={permissions.revokeRequest.canCreate}
					/>

					<FormFields
						comment={pageData.comment}
						setComment={pageData.setComment}
						attachmentUrl={pageData.attachmentUrl}
						setAttachmentUrl={pageData.setAttachmentUrl}
					/>

					<FilterSection
						receiverType={pageData.receiverType}
						setReceiverType={pageData.setReceiverType}
						receiverId={pageData.receiverId}
						setReceiverId={pageData.setReceiverId}
						users={pageData.users}
						groups={pageData.groups}
					/>

					<AssignmentsListSection
						assignments={pageData.assignments}
						selectedAssignments={pageData.selectedAssignments}
						onSelectionChange={pageData.onSelectionChange}
						onSelectAll={pageData.onSelectAll}
						onDeselectAll={pageData.onDeselectAll}
						isLoading={pageData.isLoading}
					/>
				</Stack>
			</FormContainer>
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

