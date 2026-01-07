import {
	Paper,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { ConfirmModal } from '@nikkierp/ui/components';
import {
	FormStyleProvider,
	FormFieldProvider,
	AutoField,
} from '@nikkierp/ui/components/form';
import { FieldConstraint, FieldDefinition } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AvatarProfile } from './AvatarProfile';
import { ListBadge } from '../../../../components/Badge';
import { ListActionDetailPage } from '../../../../components/ListActionBar';


interface UserFieldsProps {
	userDetail: any;
	isLoading: boolean;
}

function UserFields({ userDetail, isLoading }: UserFieldsProps) {
	const { t } = useTranslation();

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
				<ListBadge
					items={userDetail?.groups}
					emptyText=''
					color='blue'
					variant='light'
					size='lg'
				/>
			</div>
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
}

export function UserDetailForm({
	schema,
	userDetail,
	isLoading,
	onSubmit,
	onDelete,
}: UserDetailFormProps): React.ReactElement {
	const { t } = useTranslation();
	const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
	const [showSaveConfirm, setShowSaveConfirm] = React.useState(false);
	const [pendingData, setPendingData] = React.useState<any>(null);

	const handleAvatarChange = (file: File | null) => {
		setAvatarFile(file);
	};

	const handleFormSubmit = (data: any) => {
		setPendingData(data);
		setShowSaveConfirm(true);
	};

	const handleConfirmSave = () => {
		setShowSaveConfirm(false);
		if (pendingData) {
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
										onDelete={onDelete}
										isLoading={isLoading}
										disableSave={!form.formState.isDirty}
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
