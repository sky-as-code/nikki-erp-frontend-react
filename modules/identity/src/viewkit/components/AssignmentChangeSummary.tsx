import { Pill, PillGroup, Stack, Text } from '@mantine/core';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import React from 'react';
import { z } from 'zod';

import { ASSIGNMENT_CHANGE_SUMMARY } from '../ids';
import { useRoleAssignmentContext } from '../pages/roleAssignmentContext';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export type AssignmentChange = {
	id: string,
	label: string,
};

export type AssignmentChangeSummaryProps = {
	added: AssignmentChange[],
	removed: AssignmentChange[],
	translationNs: string,
	/** Reverts a single pending change, identified by role id. */
	onRevert: (id: string) => void,
};

export const assignmentChangeSummaryRenderer: IComponentRenderer<Record<string, never>> = {
	type: ASSIGNMENT_CHANGE_SUMMARY,
	propsSchema: z.object({}).strict(),
	render() {
		// Anchored: the summary renders a different root per branch — pills, or the empty-state text.
		return (
			<ComponentAnchor id={ASSIGNMENT_CHANGE_SUMMARY}>
				<ContextAssignmentChangeSummary />
			</ComponentAnchor>
		);
	},
};

/** Resolves role ids to labels; the wizard's context is the only place that knows them. */
function ContextAssignmentChangeSummary(): React.ReactNode {
	const context = useRoleAssignmentContext();
	const localize = useLocalize(context.params.translationNs);
	const label = (id: string): AssignmentChange => ({
		id,
		label: localize(context.rolesById.get(id)?.name) || id,
	});

	return (
		<AssignmentChangeSummary
			added={context.added.map(label)}
			removed={context.removed.map(label)}
			translationNs={context.params.translationNs}
			onRevert={context.revert}
		/>
	);
}

/**
 * The pending add/remove delta, as two rows of removable pills. Both rows are derived from the
 * selection rather than stored, so reverting a pill is just a selection toggle and the two can
 * never disagree.
 */
export function AssignmentChangeSummary(props: AssignmentChangeSummaryProps): React.ReactNode {
	const t = useTranslate(props.translationNs);
	const isEmpty = props.added.length === 0 && props.removed.length === 0;

	if (isEmpty) {
		return <Text c='dimmed' size='sm'>{t('assignment.noChangesYet')}</Text>;
	}
	return (
		<Stack gap='xs'>
			<ChangeRow changes={props.added} color='green' onRevert={props.onRevert} />
			<ChangeRow changes={props.removed} color='red' onRevert={props.onRevert} />
		</Stack>
	);
}

function ChangeRow({ changes, color, onRevert }: {
	changes: AssignmentChange[],
	color: string,
	onRevert: (id: string) => void,
}): React.ReactNode {
	if (changes.length === 0) {
		return null;
	}
	return (
		<PillGroup>
			{changes.map(change => (
				<Pill
					key={change.id}
					withRemoveButton
					onRemove={() => onRevert(change.id)}
					styles={{
						root: {
							backgroundColor: `var(--mantine-color-${color}-light)`,
							color: `var(--mantine-color-${color}-light-color)`,
						},
					}}
				>
					{change.label}
				</Pill>
			))}
		</PillGroup>
	);
}
