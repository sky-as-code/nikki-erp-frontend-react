import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ALL_ACTIONS_VALUE, ALL_RESOURCES_VALUE } from '@/features/entitlements/validation/entitlementFormValidation';

import type { Action } from '@/features/actions';


function resetActionId(control: Control<any>): void {
	if (control && '_formValues' in control) {
		(control as any)._formValues.actionId = undefined;
	}
}

function shouldResetActionId(
	selectedResourceId: string | undefined,
	currentActionId: string | undefined,
	actions?: Action[],
): boolean {
	if (selectedResourceId === undefined) {
		return currentActionId !== undefined;
	}

	if (selectedResourceId === ALL_RESOURCES_VALUE) {
		return currentActionId !== undefined;
	}

	if (currentActionId && currentActionId !== ALL_ACTIONS_VALUE && actions) {
		const currentAction = actions.find((a) => a.id === currentActionId);
		return currentAction ? currentAction.resourceId !== selectedResourceId : false;
	}

	return false;
}

function useActionResetEffect(
	selectedResourceId: string | undefined,
	currentActionId: string | undefined,
	control: Control<any> | undefined,
	actions?: Action[],
): void {
	React.useEffect(() => {
		if (!control) return;

		if (shouldResetActionId(selectedResourceId, currentActionId, actions)) {
			resetActionId(control);
		}
	}, [selectedResourceId, currentActionId, control, actions]);
}

function useAvailableActions(
	actions: Action[] | undefined,
	selectedResourceId: string | undefined,
): Action[] {
	return React.useMemo(
		() => (actions && selectedResourceId && selectedResourceId !== ALL_RESOURCES_VALUE
			? actions.filter((a) => a.resourceId === selectedResourceId)
			: []),
		[actions, selectedResourceId],
	);
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

export function useActionSelectLogic(actions?: Action[], control?: Control<any>) {
	const selectedResourceId = useWatch({
		control,
		name: 'resourceId',
	}) as string | undefined;

	const currentActionId = useWatch({
		control,
		name: 'actionId',
	}) as string | undefined;

	useActionResetEffect(selectedResourceId, currentActionId, control, actions);

	const availableActions = useAvailableActions(actions, selectedResourceId);
	const isAllResources = selectedResourceId === ALL_RESOURCES_VALUE;
	const hasActions = availableActions.length > 0;
	const placeholder = useActionSelectPlaceholder(selectedResourceId, hasActions);

	return {
		availableActions,
		shouldDisable: !selectedResourceId || isAllResources || !hasActions,
		placeholder,
	};
}
