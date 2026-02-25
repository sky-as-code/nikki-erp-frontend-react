import { AutoField, EntityDisplayField, EntitySelectField, useFormField } from '@nikkierp/ui/components/form';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useActionSelectLogic } from '../../hooks/useActionSelectLogic';

import type { Resource } from '@/features/resources';

import { ALL_ACTIONS_VALUE, ALL_RESOURCES_VALUE } from '@/features/entitlements/helpers/entitlementFormValidation';


interface EntitlementFormFieldsProps {
	isCreate: boolean;
	resources?: Resource[];
}

export const EntitlementFormFields: React.FC<EntitlementFormFieldsProps> = ({
	isCreate,
	resources,
}) => {
	const { t: translate } = useTranslation();
	const { control } = useFormField();
	const actionLogic = useActionSelectLogic(resources, control);
	const allActions = React.useMemo(
		() => (resources ?? []).flatMap((resource) => resource.actions ?? []),
		[resources],
	);

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
				<>
					<EntitySelectField
						fieldName='resourceId'
						entities={resources}
						getEntityId={(r) => r.id}
						getEntityName={(r) => r.name}
						prependOptions={[{
							value: ALL_RESOURCES_VALUE,
							label: translate('nikki.authorize.entitlement.fields.resource_all'),
						}]}
					/>
					<EntitySelectField
						fieldName='actionId'
						entities={actionLogic.availableActions}
						getEntityId={(a) => a.id}
						getEntityName={(a) => a.name}
						prependOptions={actionLogic.availableActions.length > 0 ? [{
							value: ALL_ACTIONS_VALUE,
							label: translate('nikki.authorize.entitlement.fields.action_all'),
						}] : undefined}
						shouldDisable={actionLogic.shouldDisable}
						placeholder={actionLogic.placeholder}
					/>
				</>
			) : (
				<>
					<EntityDisplayField
						fieldName='resourceId'
						entities={resources}
						getEntityId={(r) => r.id}
						getEntityName={(r) => r.name}
						fallbackLabelKey='nikki.authorize.entitlement.fields.resource_all'
					/>
					<EntityDisplayField
						fieldName='actionId'
						entities={allActions}
						getEntityId={(a) => a.id}
						getEntityName={(a) => a.name}
						fallbackLabelKey='nikki.authorize.entitlement.fields.action_all'
					/>
				</>
			)}
		</>
	);
};
