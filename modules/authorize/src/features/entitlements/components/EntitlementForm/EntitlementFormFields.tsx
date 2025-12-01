import { Select, Text } from '@mantine/core';
import { useId } from '@mantine/hooks';
import { AutoField, useFormField, useFieldData } from '@nikkierp/ui/components/form';
import { BaseFieldWrapper } from '@nikkierp/ui/components/form';
import React from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Action } from '../../../actions';
import { Resource } from '../../../resources';


interface EntitlementFormFieldsProps {
	isCreate: boolean;
	resources?: Resource[];
	actions?: Action[];
}

type FieldData = ReturnType<typeof useFieldData>;

export const EntitlementFormFields: React.FC<EntitlementFormFieldsProps> = ({
	isCreate,
	resources,
	actions,
}) => {
	const { t: translate } = useTranslation();
	const { control } = useFormField();
	const resourceFieldData = useFieldData('resourceId');
	const actionFieldData = useFieldData('actionId');
	const resourceInputId = useId();
	const actionInputId = useId();

	const resourceOptions = React.useMemo(() => {
		if (!resources) return [];
		return resources.map((r) => ({
			value: r.id,
			label: r.name,
		}));
	}, [resources]);

	// Get selected resourceId and actionId from form using useWatch
	const selectedResourceId = useWatch({
		control,
		name: 'resourceId',
	}) as string | undefined;
	const currentActionId = useWatch({
		control,
		name: 'actionId',
	}) as string | undefined;

	// Reset actionId when resourceId changes
	React.useEffect(() => {
		if (selectedResourceId === undefined) {
			// Reset actionId when resourceId is cleared
			if (currentActionId !== undefined) {
				control._formValues.actionId = undefined;
			}
		}
		else if (currentActionId && actions) {
			// Check if current actionId belongs to selected resource
			const currentAction = actions.find((a) => a.id === currentActionId);
			if (currentAction && currentAction.resourceId !== selectedResourceId) {
				// Reset actionId if it doesn't belong to selected resource
				control._formValues.actionId = undefined;
			}
		}
	}, [selectedResourceId, currentActionId, control, actions]);

	const availableActions = React.useMemo(() => {
		if (!actions || !selectedResourceId) return [];
		return actions.filter((a) => a.resourceId === selectedResourceId);
	}, [actions, selectedResourceId]);

	const actionOptions = React.useMemo(() => {
		return availableActions.map((a) => ({
			value: a.id,
			label: a.name,
		}));
	}, [availableActions]);

	const hasActions = availableActions.length > 0;

	if (!resourceFieldData || !actionFieldData) {
		return null;
	}

	const renderResourceSelect = () => (
		<BaseFieldWrapper
			inputId={resourceInputId}
			label={translate(resourceFieldData.label)}
			description={translate(resourceFieldData.description ?? '')}
			isRequired={resourceFieldData.isRequired}
			error={translate(resourceFieldData.error ?? '')}
		>
			<Controller
				name='resourceId'
				control={control}
				rules={{ required: resourceFieldData.isRequired }}
				render={({ field }) => (
					<Select
						id={resourceInputId}
						placeholder={translate(resourceFieldData.placeholder || '')}
						data={resourceOptions}
						value={field.value || null}
						onChange={(val) => {
							field.onChange(val === null ? undefined : val);
						}}
						searchable
						clearable
						required={resourceFieldData.isRequired}
					/>
				)}
			/>
		</BaseFieldWrapper>
	);

	const renderActionSelect = () => (
		<BaseFieldWrapper
			inputId={actionInputId}
			label={translate(actionFieldData.label)}
			description={translate(actionFieldData.description ?? '')}
			isRequired={actionFieldData.isRequired}
			error={translate(actionFieldData.error ?? '')}
		>
			<Controller
				name='actionId'
				control={control}
				rules={{ required: actionFieldData.isRequired }}
				render={({ field }) => (
					<>
						<Select
							id={actionInputId}
							placeholder={
								!selectedResourceId
									? translate('nikki.authorize.entitlement.placeholders.select_resource_first')
									: !hasActions
										? translate('nikki.authorize.entitlement.placeholders.no_actions_available')
										: translate(actionFieldData.placeholder || '')
							}
							data={actionOptions}
							value={field.value || null}
							onChange={(val) => {
								field.onChange(val === null ? undefined : val);
							}}
							searchable
							clearable
							required={actionFieldData.isRequired}
							disabled={!selectedResourceId || !hasActions}
						/>
						{selectedResourceId && !hasActions && (
							<Text size='sm' c='dimmed' mt={4}>
								{translate('nikki.authorize.entitlement.messages.no_actions_for_resource')}
							</Text>
						)}
					</>
				)}
			/>
		</BaseFieldWrapper>
	);

	return (
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
			{isCreate ? (
				<>
					{renderResourceSelect()}
					{renderActionSelect()}
				</>
			) : (
				<>
					<AutoField
						name='resourceId'
						inputProps={{ disabled: true }}
						htmlProps={{ readOnly: true }}
					/>
					<AutoField
						name='actionId'
						inputProps={{ disabled: true }}
						htmlProps={{ readOnly: true }}
					/>
				</>
			)}
			<AutoField name='scopeRef' />
		</>
	);
};

