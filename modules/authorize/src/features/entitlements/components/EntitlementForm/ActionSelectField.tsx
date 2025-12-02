import { Select } from '@mantine/core';
import { useId } from '@mantine/hooks';
import { useFormField, useFieldData } from '@nikkierp/ui/components/form';
import { BaseFieldWrapper } from '@nikkierp/ui/components/form';
import React from 'react';
import { Control, Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Action } from '../../../actions';
import { ALL_ACTIONS_VALUE, ALL_RESOURCES_VALUE } from '../../validation/entitlementFormValidation';


type AnyControl = Control<any>;

function useSelectedResourceIdAndResetAction(
	control: AnyControl,
	actions?: Action[],
) {
	const selectedResourceId = useWatch({
		control,
		name: 'resourceId',
	}) as string | undefined;

	const currentActionId = useWatch({
		control,
		name: 'actionId',
	}) as string | undefined;

	React.useEffect(() => {
		if (selectedResourceId === undefined) {
			if (currentActionId !== undefined) {
				(control as any)._formValues.actionId = undefined;
			}
			return;
		}

		if (selectedResourceId === ALL_RESOURCES_VALUE) {
			if (currentActionId !== undefined) {
				(control as any)._formValues.actionId = undefined;
			}
			return;
		}

		if (currentActionId && currentActionId !== ALL_ACTIONS_VALUE && actions) {
			const currentAction = actions.find((a) => a.id === currentActionId);
			if (currentAction && currentAction.resourceId !== selectedResourceId) {
				(control as any)._formValues.actionId = undefined;
			}
		}
	}, [selectedResourceId, currentActionId, control, actions]);

	return selectedResourceId;
}


export const ActionSelectField: React.FC<{ actions?: Action[] }> = ({ actions }) => {
	const { t: translate } = useTranslation();
	const { control } = useFormField();
	const fieldData = useFieldData('actionId');
	const inputId = useId();

	const selectedResourceId = useSelectedResourceIdAndResetAction(control, actions);
	const isAllResources = selectedResourceId === ALL_RESOURCES_VALUE;

	const availableActions = React.useMemo(
		() => (actions && selectedResourceId && !isAllResources
			? actions.filter((a) => a.resourceId === selectedResourceId)
			: []),
		[actions, selectedResourceId, isAllResources],
	);

	const options = React.useMemo(() => {
		const base = availableActions.map((a) => ({ value: a.id, label: a.name }));

		if (!selectedResourceId || isAllResources || base.length === 0) {
			return base;
		}

		return [
			{
				value: ALL_ACTIONS_VALUE,
				label: translate('nikki.authorize.entitlement.fields.action_all'),
			},
			...base,
		];
	}, [availableActions, selectedResourceId, isAllResources, translate]);

	const hasActions = availableActions.length > 0;

	if (!fieldData) {
		return null;
	}

	const shouldDisable = !selectedResourceId || isAllResources || !hasActions;

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={translate(fieldData.label)}
			description={translate(fieldData.description ?? '')}
			isRequired={fieldData.isRequired}
			error={translate(fieldData.error ?? '')}
		>
			<Controller
				name='actionId'
				control={control}
				rules={{ required: fieldData.isRequired }}
				render={({ field }) => (
					<>
						<Select
							id={inputId}
							placeholder={
								!selectedResourceId
									? translate('nikki.authorize.entitlement.placeholders.select_resource_first')
									: !hasActions
										? translate('nikki.authorize.entitlement.placeholders.no_actions_available')
										: translate(fieldData.placeholder || '')
							}
							data={options}
							value={shouldDisable ? null : (field.value || null)}
							onChange={(val) => {
								field.onChange(val === null ? undefined : val);
							}}
							searchable
							clearable
							required={fieldData.isRequired}
							disabled={shouldDisable}
						/>
					</>
				)}
			/>
		</BaseFieldWrapper>
	);
};