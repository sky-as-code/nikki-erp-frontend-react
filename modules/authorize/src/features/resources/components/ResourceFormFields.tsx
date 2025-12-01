import { Badge, Button, Group, Loader, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { AutoField } from '@nikkierp/ui/components/form';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Action } from '../../actions';


interface BackButtonProps {
	onClick: () => void;
	label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, label }) => {
	const { t: translate } = useTranslation();
	const defaultLabel = translate('nikki.general.actions.back');
	return (
		<Group>
			<Button variant='subtle' leftSection={<IconArrowLeft size={16} />} onClick={onClick}>
				{label || defaultLabel}
			</Button>
		</Group>
	);
};

export const ResourceFormFields: React.FC<{ isCreate: boolean }> = ({ isCreate }) => (
	<>
		{!isCreate && <AutoField name='id' />}
		<AutoField
			name='name'
			autoFocused
			inputProps={{
				disabled: !isCreate,
			}}
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
		<AutoField name='description' />
		<AutoField
			name='resourceType'
			inputProps={{
				disabled: !isCreate,
			}}
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
		<AutoField
			name='resourceRef'
			inputProps={{
				disabled: !isCreate,
			}}
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
		<AutoField
			name='scopeType'
			inputProps={{
				disabled: !isCreate,
			}}
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
	</>
);

interface ResourceActionsFieldProps {
	actions?: Action[];
}

export const ResourceActionsField: React.FC<ResourceActionsFieldProps> = ({ actions }) => {
	const { t } = useTranslation();
	return (
		<div>
			<TextInput
				label={t('nikki.authorize.resource.messages.actions')}
				value=''
				readOnly
				styles={{ input: { display: 'none' } }}
			/>
			{actions && actions.length > 0 ? (
				<Group gap='xs' mt='xs'>
					{actions.map((action) => (
						<Badge key={action.id} color='blue' variant='light' size='sm'>
							{action.name}
						</Badge>
					))}
				</Group>
			) : (
				<Text size='sm' c='dimmed'>{t('nikki.authorize.resource.messages.no_actions_defined')}</Text>
			)}
		</div>
	);
};

interface ResourceFormActionsProps {
	isSubmitting: boolean;
	onCancel: () => void;
	isCreate: boolean;
}

export const ResourceFormActions: React.FC<ResourceFormActionsProps> = ({
	isSubmitting,
	onCancel,
	isCreate,
}) => {
	const { t } = useTranslation();
	return (
		<Group mt='xl'>
			<Button type='submit' leftSection={<IconCheck size={16} />} loading={isSubmitting}>
				{isCreate ? t('nikki.general.actions.create') : t('nikki.general.actions.update')}
			</Button>
			<Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
				{t('nikki.general.actions.cancel')}
			</Button>
		</Group>
	);
};

interface ResourceFormContainerProps {
	title: string;
	children: React.ReactNode;
}

export const ResourceFormContainer: React.FC<ResourceFormContainerProps> = ({ title, children }) => (
	<Paper p='lg'>
		<Title order={3} mb='lg'>{title}</Title>
		{children}
	</Paper>
);

export const ResourceLoadingState: React.FC = () => {
	const { t } = useTranslation();
	return (
		<Stack align='center' justify='center' h={400}>
			<Loader size='lg' />
			<Text c='dimmed'>{t('nikki.authorize.resource.messages.loading')}</Text>
		</Stack>
	);
};

interface ResourceNotFoundProps {
	onGoBack: () => void;
}

export const ResourceNotFound: React.FC<ResourceNotFoundProps> = ({ onGoBack }) => {
	const { t } = useTranslation();
	return (
		<Stack gap='md'>
			<BackButton onClick={onGoBack} />
			<Paper p='lg'>
				<Text c='dimmed'>{t('nikki.authorize.resource.messages.not_found')}</Text>
			</Paper>
		</Stack>
	);
};
