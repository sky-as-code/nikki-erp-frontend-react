import { Button, Group } from '@mantine/core';
import { AutoField } from '@nikkierp/ui/components/form';
import { IconCheck } from '@tabler/icons-react';


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
		{!isCreate && (
			<AutoField
				name='actionsCount'
				inputProps={{
					disabled: !isCreate,
				}}
				htmlProps={{
					readOnly: true,
				}} />
		)}
	</>
);

export const ResourceFormActions: React.FC<{ isSubmitting: boolean; onCancel: () => void; isCreate: boolean }> = ({
	isSubmitting,
	onCancel,
	isCreate,
}) => (
	<Group mt='xl'>
		<Button
			type='submit'
			leftSection={<IconCheck size={16} />}
			loading={isSubmitting}
		>
			{isCreate ? 'Create' : 'Update'}
		</Button>
		<Button
			type='button'
			variant='outline'
			onClick={onCancel}
			disabled={isSubmitting}
		>
			Cancel
		</Button>
	</Group>
);
