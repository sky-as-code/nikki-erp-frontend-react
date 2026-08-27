import { Badge, Group, Stack, Text, Timeline } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import React from 'react';
import { z } from 'zod';

import { TAX_SIMULATOR_TRACE } from '../ids';
import { useTaxSimulatorContext } from '../pages/taxSimulatorContext';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const taxSimulatorTraceRenderer: IComponentRenderer<Record<string, never>> = {
	type: TAX_SIMULATOR_TRACE,
	propsSchema: z.object({}).strict(),
	render() {
		return (
			<ComponentAnchor id={TAX_SIMULATOR_TRACE}>
				<TaxSimulatorTrace />
			</ComponentAnchor>
		);
	},
};

/**
 * The explain trace: how the engine reached its answer, stage by stage.
 *
 * This is the whole reason the simulator exists. An amount alone tells a tax administrator nothing
 * about *why* a rule fired or a mapping substituted; the trace is what BR-TAX-ESS-051 requires be
 * displayed — matched rules, then the mapping, then the applicable taxes and their rates.
 *
 * The steps render in the order the backend reported them, which is the order they happened. They
 * are deliberately not re-sorted or grouped: the sequence is the explanation.
 */
function TaxSimulatorTrace(): React.ReactNode {
	const { params, state } = useTaxSimulatorContext();
	const translate = useTranslate(params.translationNs);

	const trace = state.outcome?.trace ?? [];
	if (trace.length === 0) {
		return null;
	}

	return (
		<Stack gap='sm' {...testAttrs('accounting', 'taxSimulator', 'trace')}>
			<Text fw={600}>{translate('tax.explainTrace')}</Text>
			<Timeline active={trace.length} bulletSize={18} lineWidth={2}>
				{trace.map((step, index) => (
					<Timeline.Item
						// The index is a stable key here and only here: the trace is rendered
						// exactly as received and is never sorted or filtered, so position does not
						// move between renders.
						key={`${step.stage}-${index}`}
						title={translate(`tax.stage.${step.stage}`, { defaultValue: step.stage })}
						{...testAttrs('accounting', 'taxSimulator', 'traceStep', step.stage)}
					>
						<Text size='sm' c='dimmed'>{step.detail}</Text>
						{step.rule_ids && step.rule_ids.length > 0 && (
							<Group gap='xs' mt={4}>
								{step.rule_ids.map(ruleId => (
									<Badge key={ruleId} size='sm' variant='light' color='grape'>
										{ruleId}
									</Badge>
								))}
							</Group>
						)}
						{step.tax_ids && step.tax_ids.length > 0 && (
							<Group gap='xs' mt={4}>
								{step.tax_ids.map(taxId => (
									<Badge key={taxId} size='sm' variant='light' color='blue'>
										{taxId}
									</Badge>
								))}
							</Group>
						)}
					</Timeline.Item>
				))}
			</Timeline>
		</Stack>
	);
}
