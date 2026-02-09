import { AutoField, EntityDisplayField, EntitySelectField } from '@nikkierp/ui/components/form';
import React from 'react';

import type { Resource } from '@/features/resources';


interface ActionFormFieldsProps {
	isCreate: boolean;
	resources?: Resource[];
}

export const ActionFormFields: React.FC<ActionFormFieldsProps> = ({
	isCreate,
	resources,
}) => {
	return (
		<>
			{!isCreate && <AutoField name='id' />}
			<AutoField
				name='name'
				autoFocused
				htmlProps={!isCreate ? {
					readOnly: true,
				} : undefined}
			/>
			<AutoField name='description' />
			{isCreate ? (
				<EntitySelectField
					fieldName='resourceId'
					entities={resources}
					getEntityId={(r) => r.id}
					getEntityName={(r) => r.name}
				/>
			) : (
				<EntityDisplayField
					fieldName='resourceId'
					entities={resources}
					getEntityId={(r) => r.id}
					getEntityName={(r) => r.name}
				/>
			)}
		</>
	);
};
