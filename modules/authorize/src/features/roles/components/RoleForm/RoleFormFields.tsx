import { AutoField, useFormField } from '@nikkierp/ui/components/form';
import React from 'react';


function useFieldReadOnly(fieldName: string): boolean {
	const { getFieldDef, formVariant } = useFormField();
	const fieldDef = getFieldDef(fieldName);
	
	if (!fieldDef?.readOnly) return false;
	
	return fieldDef.readOnly[formVariant] === true;
}

export const RoleFormFields: React.FC<{ isCreate: boolean }> = ({ isCreate }) => {
	const isRequestableReadOnly = useFieldReadOnly('isRequestable');
	const isRequiredAttachmentReadOnly = useFieldReadOnly('isRequiredAttachment');
	const isRequiredCommentReadOnly = useFieldReadOnly('isRequiredComment');
	
	return (
		<>
			{!isCreate && <AutoField name='id' />}
			<AutoField name='name' autoFocused />
			<AutoField name='description' />
			<AutoField
				name='ownerType'
				inputProps={{
					disabled: !isCreate,
				}}
				htmlProps={!isCreate ? {
					readOnly: true,
				} : undefined}
			/>
			<AutoField
				name='ownerRef'
				inputProps={{
					disabled: !isCreate,
				}}
				htmlProps={!isCreate ? {
					readOnly: true,
				} : undefined}
			/>
			<AutoField 
				name='isRequestable'
				inputProps={{
					disabled: isRequestableReadOnly,
				}}
			/>
			<AutoField 
				name='isRequiredAttachment'
				inputProps={{
					disabled: isRequiredAttachmentReadOnly,
				}}
			/>
			<AutoField 
				name='isRequiredComment'
				inputProps={{
					disabled: isRequiredCommentReadOnly,
				}}
			/>
			<AutoField
				name='orgId'
				inputProps={{
					disabled: !isCreate,
				}}
				htmlProps={!isCreate ? {
					readOnly: true,
				} : undefined}
			/>
		</>
	);
};

