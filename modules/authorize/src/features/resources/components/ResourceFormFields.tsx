import { Badge, Button, Group, Loader, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { AutoField } from '@nikkierp/ui/components/form';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import React from 'react';

import { Action } from '../../actions';


interface BackButtonProps {
	onClick: () => void;
	label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, label = 'Back to Resources' }) => (
	<Group>
		<Button variant='subtle' leftSection={<IconArrowLeft size={16} />} onClick={onClick}>
			{label}
		</Button>
	</Group>
);

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

export const ResourceActionsField: React.FC<ResourceActionsFieldProps> = ({ actions }) => (
	<div>
		<TextInput
			label='Actions'
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
			<Text size='sm' c='dimmed'>No actions defined</Text>
		)}
	</div>
);

interface ResourceFormActionsProps {
	isSubmitting: boolean;
	onCancel: () => void;
	isCreate: boolean;
}

export const ResourceFormActions: React.FC<ResourceFormActionsProps> = ({
	isSubmitting,
	onCancel,
	isCreate,
}) => (
	<Group mt='xl'>
		<Button type='submit' leftSection={<IconCheck size={16} />} loading={isSubmitting}>
			{isCreate ? 'Create' : 'Update'}
		</Button>
		<Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
			Cancel
		</Button>
	</Group>
);

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

export const ResourceLoadingState: React.FC = () => (
	<Stack align='center' justify='center' h={400}>
		<Loader size='lg' />
		<Text c='dimmed'>Loading resource...</Text>
	</Stack>
);

interface ResourceNotFoundProps {
	onGoBack: () => void;
}

export const ResourceNotFound: React.FC<ResourceNotFoundProps> = ({ onGoBack }) => (
	<Stack gap='md'>
		<BackButton onClick={onGoBack} />
		<Paper p='lg'>
			<Text c='dimmed'>Resource not found</Text>
		</Paper>
	</Stack>
);
