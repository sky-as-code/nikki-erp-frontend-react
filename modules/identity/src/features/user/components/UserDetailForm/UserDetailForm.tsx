import {
	Paper,
	Stack,
	Text,
	TextInput,
	Card,
	Group,
	Grid,
	Button,
} from '@mantine/core';
import { ConfirmModal } from '@nikkierp/ui/components';
import {
	FormStyleProvider,
	FormFieldProvider,
	AutoField,
} from '@nikkierp/ui/components/form';
import { FieldConstraint, FieldDefinition } from '@nikkierp/ui/model';
import { IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AvatarProfile } from './AvatarProfile';
import { ListBadge } from '../../../../components/Badge';
import { ListActionDetailPage } from '../../../../components/ListActionBar';
import { useManageOrganizationRemoveUsers } from '../../hooks/useManageOrganizationUsers';


interface UserFieldsProps {
	userDetail: any;
	isLoading: boolean;
}

// eslint-disable-next-line max-lines-per-function
function UserFields({ userDetail, isLoading }: UserFieldsProps) {
	const { t } = useTranslation();
	const { userOrganizations, isLoading: isLoadingRemove, onRemoveOrganization } = useManageOrganizationRemoveUsers();
	const [organizationToRemove, setOrganizationToRemove] = React.useState<
		{ id: string; name: string; etag: string } | null
	>(null);

	const handleRemoveClick = (orgId: string, displayName: string, etag: string) => {
		setOrganizationToRemove({ id: orgId, name: displayName, etag });
	};

	const handleConfirmRemove = () => {
		if (organizationToRemove) {
			onRemoveOrganization(organizationToRemove.id, organizationToRemove.etag);
			setOrganizationToRemove(null);
		}
	};

	return (
		<Stack gap='md'>
			<div>
				<Text size='sm' fw={500} mb='xs'>
					{t('nikki.identity.user.fields.email')}
				</Text>
				<TextInput
					value={userDetail?.email || ''}
					size='md'
					variant='filled'
					readOnly
				/>
			</div>
			<AutoField name='displayName' inputProps={{ disabled: isLoading }} />
			<AutoField name='status' inputProps={{ disabled: isLoading }} />
			<div>
				<Text size='sm' fw={500} mb='xs'>
					{t('nikki.identity.user.fields.hierarchy')}
				</Text>
				<TextInput
					value={userDetail?.hierarchy?.name || ''}
					size='md'
					variant='filled'
					readOnly
				/>
			</div>
			<div>
				<Text size='sm' fw={500} mb='xs'>
					{t('nikki.identity.user.fields.createdAt')}
				</Text>
				<TextInput
					value={
						userDetail?.createdAt
							? new Date(userDetail.createdAt).toLocaleString()
							: ''
					}
					size='md'
					variant='filled'
					readOnly
				/>
			</div>
			<div>
				<Text size='sm' fw={500} mb='xs'>
					{t('nikki.identity.user.fields.updatedAt')}
				</Text>
				<TextInput
					value={
						userDetail?.updatedAt
							? new Date(userDetail.updatedAt).toLocaleString()
							: ''
					}
					size='md'
					variant='filled'
					readOnly
				/>
			</div>
			<div>
				<Text size='sm' fw={500} mb='xs'>
					{t('nikki.identity.user.fields.groups')}
				</Text>
				{userDetail && userDetail.groups && userDetail.groups.length > 0 ? (
					<ListBadge
						items={userDetail?.groups}
						emptyText=''
						color='blue'
						variant='light'
						size='lg'
					/>
				) : (
					<Card withBorder padding='md' radius='md' bg='gray.0'>
						<Stack gap='sm' align='center'>
							<Text size='sm' c='dimmed' fw={500}>
								{t('nikki.identity.user.messages.noGroups') || 'Không có nhóm nào'}
							</Text>
						</Stack>
					</Card>
				)}
			</div>
			<div>
				<Text size='sm' fw={500} mb='xs'>
					{t('nikki.identity.overview.stats.organizations')}
				</Text>
				<Stack gap='md'>
					{userOrganizations && userOrganizations.length > 0 ? (
						<Grid gutter='md'>
							{userOrganizations.map((org) => (
								<Grid.Col key={org.id} span={{ base: 12, sm: 3, md: 2 }}>
									<Card
										withBorder
										padding='xs'
										radius='md'
										onMouseEnter={(e) => {
											e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
											e.currentTarget.style.transform = 'translateY(-2px)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.boxShadow = 'none';
											e.currentTarget.style.transform = 'translateY(0)';
										}}
									>
										<Group justify='space-between' gap='xs'>
											<Text fw={600} size='sm'>
												{org.displayName}
											</Text>

											<Button
												color='red'
												variant='light'
												onClick={() => handleRemoveClick(org.id, org.displayName, org.etag || '')}
												loading={isLoadingRemove}
												disabled={isLoading || isLoadingRemove}
												size='compact-sm'
												children={<IconTrash size={20} />}
											/>
										</Group>
									</Card>
								</Grid.Col>
							))}
						</Grid>
					) : (
						<Card withBorder padding='md' radius='md' bg='gray.0'>
							<Stack gap='sm' align='center'>
								<Text size='sm' c='dimmed' fw={500}>
									{t('nikki.identity.organization.messages.noOrganizations') || 'Không có tổ chức nào'}
								</Text>
							</Stack>
						</Card>
					)}
				</Stack>
			</div>

			<ConfirmModal
				opened={organizationToRemove !== null}
				onClose={() => setOrganizationToRemove(null)}
				onConfirm={handleConfirmRemove}
				title={t('nikki.identity.organization.actions.confirmRemoveUser')}
				message={t('nikki.identity.organization.messages.confirmDeleteUserMessage', {
					organization: organizationToRemove?.name,
				}) || `Bạn có chắc chắn muốn xóa người dùng khỏi ${organizationToRemove?.name}?`}
			/>
		</Stack>
	);
}

type UserSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

interface UserDetailFormProps {
	schema: UserSchema;
	userDetail: any;
	isLoading: boolean;
	onSubmit: (data: any) => void;
	onDelete: () => void;
	canUpdate?: boolean;
	canDelete?: boolean;
}

export function UserDetailForm({
	schema,
	userDetail,
	isLoading,
	onSubmit,
	onDelete,
	canUpdate = true,
	canDelete = true,
}: UserDetailFormProps): React.ReactElement {
	const { t } = useTranslation();
	const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
	const [showSaveConfirm, setShowSaveConfirm] = React.useState(false);
	const [pendingData, setPendingData] = React.useState<any>(null);

	const handleAvatarChange = (file: File | null) => {
		setAvatarFile(file);
	};

	const handleFormSubmit = (data: any) => {
		if (!canUpdate) return;
		setPendingData(data);
		setShowSaveConfirm(true);
	};

	const handleConfirmSave = () => {
		setShowSaveConfirm(false);
		if (pendingData && canUpdate) {
			onSubmit(pendingData);
			setPendingData(null);
		}
	};

	return (
		<>
			<Paper withBorder p='xl'>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={userDetail}
					>
						{({ handleSubmit, form }) => (
							<form
								onSubmit={handleSubmit(handleFormSubmit)}
								noValidate
							>
								<Stack gap='xl'>
									<ListActionDetailPage
										onDelete={canDelete ? onDelete : undefined}
										isLoading={isLoading}
										disableSave={!form.formState.isDirty || !canUpdate}
										disableDelete={!canDelete}
										titleDelete={t('nikki.identity.user.actions.confirmDelete')}
										titleConfirmDelete={t('nikki.identity.user.actions.delete')}
										messageConfirmDelete={t('nikki.identity.user.messages.confirmDeleteMessage')}
									/>
									<AvatarProfile
										avatarUrl={userDetail?.avatarUrl}
										displayName={userDetail?.displayName || userDetail?.email || 'User'}
										onAvatarChange={handleAvatarChange}
										disabled={isLoading}
										size={120}
									/>
									<UserFields
										userDetail={userDetail}
										isLoading={isLoading}
									/>
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</Paper>

			<ConfirmModal
				opened={showSaveConfirm}
				onClose={() => setShowSaveConfirm(false)}
				onConfirm={handleConfirmSave}
				title={t('nikki.identity.user.actions.confirmUpdate')}
				message={t('nikki.identity.user.messages.confirmUpdateMessage')}
				confirmLabel={t('nikki.identity.user.actions.save')}
			/>
		</>
	);
}
