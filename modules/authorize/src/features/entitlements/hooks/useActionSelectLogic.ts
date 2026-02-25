import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { Action } from '@/features/actions';
import type { Resource } from '@/features/resources';

import { ALL_ACTIONS_VALUE, ALL_RESOURCES_VALUE } from '@/features/entitlements/helpers/entitlementFormValidation';


function resetActionId(control: Control<any>): void {
	if (control && '_formValues' in control) {
		(control as any)._formValues.actionId = undefined;
	}
}

function shouldResetActionId(
	selectedResourceId: string | undefined,
	currentActionId: string | undefined,
	availableActions: Action[],
): boolean {
	if (selectedResourceId === undefined) {
		return currentActionId !== undefined;
	}

	if (selectedResourceId === ALL_RESOURCES_VALUE) {
		return currentActionId !== undefined;
	}

	if (currentActionId && currentActionId !== ALL_ACTIONS_VALUE) {
		return !availableActions.some((a) => a.id === currentActionId);
	}

	return false;
}

function useActionResetEffect(
	selectedResourceId: string | undefined,
	currentActionId: string | undefined,
	control: Control<any> | undefined,
	availableActions: Action[],
): void {
	React.useEffect(() => {
		if (!control) return;

		if (shouldResetActionId(selectedResourceId, currentActionId, availableActions)) {
			resetActionId(control);
		}
	}, [selectedResourceId, currentActionId, control, availableActions]);
}

function useAvailableActions(
	resources: Resource[] | undefined,
	selectedResourceId: string | undefined,
): Action[] {
	return React.useMemo(() => {
		if (!resources || !selectedResourceId || selectedResourceId === ALL_RESOURCES_VALUE) {
			return [];
		}

		const selectedResource = resources.find((resource) => resource.id === selectedResourceId);
		return selectedResource?.actions ?? [];
	}, [resources, selectedResourceId]);
}

function useActionSelectPlaceholder(
	selectedResourceId: string | undefined,
	hasActions: boolean,
): string {
	const { t: translate } = useTranslation();

	return React.useMemo(() => {
		if (!selectedResourceId) {
			return translate('nikki.authorize.entitlement.placeholders.select_resource_first');
		}
		if (!hasActions) {
			return translate('nikki.authorize.entitlement.placeholders.no_actions_available');
		}
		return '';
	}, [selectedResourceId, hasActions, translate]);
}

export function useActionSelectLogic(resources?: Resource[], control?: Control<any>) {
	const selectedResourceId = useWatch({
		control,
		name: 'resourceId',
	}) as string | undefined;

	const currentActionId = useWatch({
		control,
		name: 'actionId',
	}) as string | undefined;

	const availableActions = useAvailableActions(resources, selectedResourceId);
	useActionResetEffect(selectedResourceId, currentActionId, control, availableActions);
	const isAllResources = selectedResourceId === ALL_RESOURCES_VALUE;
	const hasActions = availableActions.length > 0;
	const placeholder = useActionSelectPlaceholder(selectedResourceId, hasActions);

	return {
		availableActions,
		shouldDisable: !selectedResourceId || isAllResources || !hasActions,
		placeholder,
	};
}
