import { AutoField } from '@nikkierp/ui/components/form';
import React from 'react';


export const GrantRequestFormFields: React.FC<{ isCreate: boolean }> = ({ isCreate }) => (
	<>
		{!isCreate && <AutoField name='id' />}
		<AutoField
			name='targetType'
			inputProps={{
				disabled: !isCreate,
			}}
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
		<AutoField
			name='targetRef'
			autoFocused
			inputProps={{
				disabled: !isCreate,
			}}
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
		<AutoField
			name='receiverType'
			inputProps={{
				disabled: !isCreate,
			}}
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
		<AutoField
			name='receiverId'
			inputProps={{
				disabled: !isCreate,
			}}
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
		<AutoField
			name='requestorId'
			inputProps={{
				disabled: !isCreate,
			}}
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
		<AutoField name='comment' />
		<AutoField name='attachmentUrl' />
		{!isCreate && <AutoField name='status' />}
		{!isCreate && <AutoField name='orgId' />}
		{!isCreate && <AutoField name='createdAt' />}
	</>
);

