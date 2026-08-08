import { useLocalize } from '@nikkierp/ui/i18n';
import { defineComponent } from '@nikkierp/viewengine/metadata';
import { MetaComponent } from '@nikkierp/viewengine/render';
import { PageContainer, PageHeaderProvider } from '@nikkierp/viewkit-mantine';
import { collapsibleSectionNode, pageHeaderNode } from '@nikkierp/viewkit-mantine/props';
import React from 'react';
import { useNavigate } from 'react-router';

import {
	RoleAssignmentContextProvider, RoleAssignmentContextValue, useRoleAssignmentContext,
} from './roleAssignmentContext';
import { useRoleAssignment } from './useRoleAssignment';
import {
	ASSIGNMENT_CHANGE_SUMMARY, ENTITLEMENT_CHANGE_LIST, ROLE_ASSIGNMENT_ACKNOWLEDGE,
	ROLE_ASSIGNMENT_ACTIONS, ROLE_ASSIGNMENT_ERROR, ROLE_PICKER,
} from '../ids';

import type { RoleAssignmentProps } from '../props';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';
import type { PageHeaderContextValue } from '@nikkierp/viewkit-mantine';


/**
 * Two-stage role assignment.
 *
 * The stage lives in React state rather than the route: the requirement is that the URL does
 * not change between picking roles and confirming them, so the template contributes no extra
 * route segment.
 *
 * The page itself is only a shell — provider, container, and a node tree rebuilt from the
 * context on every change. Everything visible is a registered component.
 */
export function RoleAssignmentPage({ props }: { props: RoleAssignmentProps }): React.ReactNode {
	return (
		<RoleAssignmentProvider params={props}>
			<PageContainer>
				<RoleAssignmentContent />
			</PageContainer>
		</RoleAssignmentProvider>
	);
}

function RoleAssignmentProvider({ params, children }: {
	params: RoleAssignmentProps,
	children: React.ReactNode,
}): React.ReactNode {
	const navigate = useNavigate();
	const localize = useLocalize(params.translationNs);
	const state = useRoleAssignment(params);
	const [acknowledged, setAcknowledged] = React.useState(false);

	// Re-reading the entitlements is the point of the checkbox, so a trip back to stage 1
	// invalidates the acknowledgement.
	React.useEffect(() => setAcknowledged(false), [state.stage]);

	const value = React.useMemo(
		(): RoleAssignmentContextValue => ({
			...state,
			params,
			acknowledged,
			setAcknowledged,
			// Back on stage 2 returns to the picker with the selection intact; on stage 1 it leaves.
			// `relative: 'path'` because `backRoutePath` counts URL segments, not routes.
			onBack: () => state.stage === 'confirm'
				? state.goBack()
				: navigate(params.backRoutePath, { relative: 'path' }),
		}),
		[state, params, acknowledged, navigate],
	);

	const headerContext = React.useMemo(
		(): PageHeaderContextValue => ({
			translationNs: params.translationNs,
			titleParams: { name: localize(state.principalDisplay) },
		}),
		[params.translationNs, localize, state.principalDisplay],
	);

	return (
		<RoleAssignmentContextProvider value={value}>
			<PageHeaderProvider value={headerContext}>{children}</PageHeaderProvider>
		</RoleAssignmentContextProvider>
	);
}

function RoleAssignmentContent(): React.ReactNode {
	const context = useRoleAssignmentContext();
	const nodes = React.useMemo(() => buildRoleAssignmentNodes(context), [context]);

	return <MetaComponent node={nodes} />;
}

/**
 * The stage is a plain branch here rather than a component, because the context it branches on
 * is what the memo already depends on — an `if` component would only move the same condition
 * behind an id nobody can read from the page definition.
 */
function buildRoleAssignmentNodes(context: RoleAssignmentContextValue): ComponentNode[] {
	return [
		pageHeaderNode(
			{ titleLvl1: { textKey: context.params.titleKey } },
			[defineComponent({ component: ROLE_ASSIGNMENT_ACTIONS })],
		),
		...(context.error != null ? [defineComponent({ component: ROLE_ASSIGNMENT_ERROR })] : []),
		...(context.stage === 'select' ? buildSelectNodes() : buildConfirmNodes()),
	];
}

function buildSelectNodes(): ComponentNode[] {
	return [
		collapsibleSectionNode({ collapsible: false }, [
			defineComponent({ component: ASSIGNMENT_CHANGE_SUMMARY }),
		]),
		collapsibleSectionNode({ collapsible: false }, [
			defineComponent({ component: ROLE_PICKER }),
		]),
	];
}

function buildConfirmNodes(): ComponentNode[] {
	return [
		defineComponent({ component: ROLE_ASSIGNMENT_ACKNOWLEDGE }),
		collapsibleSectionNode({ collapsible: false }, [
			defineComponent({ component: ENTITLEMENT_CHANGE_LIST }),
		]),
	];
}
