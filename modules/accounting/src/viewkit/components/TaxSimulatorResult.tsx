import { Alert, Badge, Group, Stack, Table, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import { IconAlertTriangle } from '@tabler/icons-react';
import React from 'react';
import { z } from 'zod';

import * as c from '../../constants';
import { TAX_SIMULATOR_RESULT } from '../ids';
import { useTaxSimulatorContext } from '../pages/taxSimulatorContext';

import type { LineResult } from '../pages/useTaxSimulator';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const taxSimulatorResultRenderer: IComponentRenderer<Record<string, never>> = {
	type: TAX_SIMULATOR_RESULT,
	propsSchema: z.object({}).strict(),
	render() {
		return (
			<ComponentAnchor id={TAX_SIMULATOR_RESULT}>
				<TaxSimulatorResult />
			</ComponentAnchor>
		);
	},
};

const STATUS_COLOURS: Record<string, string> = {
	[c.DETERMINATION_RESOLVED]: 'green',
	[c.DETERMINATION_NO_TAX_APPLICABLE]: 'blue',
	[c.DETERMINATION_UNRESOLVED]: 'red',
};

function TaxSimulatorResult(): React.ReactNode {
	const { params, state } = useTaxSimulatorContext();
	const translate = useTranslate(params.translationNs);

	if (state.error) {
		return (
			<Alert color='red' icon={<IconAlertTriangle />} title={translate('tax.requestFailed')}>
				{state.error}
			</Alert>
		);
	}
	if (state.rejection) {
		return (
			<Alert color='orange' icon={<IconAlertTriangle />} title={translate('tax.requestRefused')}>
				{state.rejection}
			</Alert>
		);
	}

	const calculation = state.outcome?.calculation;
	if (!calculation) {
		return null;
	}

	const line = calculation.lines[0];
	return (
		<Stack gap='md' {...testAttrs('accounting', 'taxSimulator', 'result')}>
			<Group gap='sm'>
				<Badge
					color={STATUS_COLOURS[calculation.status] ?? 'gray'}
					{...testAttrs('accounting', 'taxSimulator', 'status')}
				>
					{translate(`determination_status.${calculation.status}`)}
				</Badge>
				<Text size='sm' c='dimmed'>
					{translate('tax.totals', {
						excluded: calculation.total_excluded,
						tax: calculation.total_tax,
						included: calculation.total_included,
					})}
				</Text>
			</Group>

			{line && <LineOutcome line={line} translate={translate} />}
		</Stack>
	);
}

/**
 * One line's outcome.
 *
 * An unresolved line renders its error code and NOTHING else — no components, no zero. The
 * distinction is the point: the engine could not decide, and showing a zero would be indis-
 * tinguishable from a lawful nil charge (TAX-INV-07). A `no_tax_applicable` line, by contrast, is
 * a real answer and shows its treatment.
 */
function LineOutcome({ line, translate }: {
	line: LineResult,
	translate: (key: string, options?: Record<string, unknown>) => string,
}): React.ReactNode {
	if (line.status === c.DETERMINATION_UNRESOLVED) {
		return (
			<Alert
				color='red'
				icon={<IconAlertTriangle />}
				title={translate('determination_status.unresolved')}
				{...testAttrs('accounting', 'taxSimulator', 'unresolved')}
			>
				{/*
				  * The error code, not a message: it is what the backend branches on and what a
				  * user reports when asking why a line would not price. The i18n lookup falls back
				  * to the raw code so a newly added one is still legible.
				  */}
				{translate(`tax_error.${line.error_code}`, { defaultValue: line.error_code ?? '' })}
			</Alert>
		);
	}

	if (line.components.length === 0) {
		return (
			<Alert color='blue' title={translate(`determination_status.${line.status}`)}>
				{line.treatment
					? translate(`tax_treatment.${line.treatment}`)
					: translate('tax.noComponents')}
			</Alert>
		);
	}

	return (
		<Table striped withTableBorder {...testAttrs('accounting', 'taxSimulator', 'components')}>
			<Table.Thead>
				<Table.Tr>
					<Table.Th>{translate('fields.tax_code')}</Table.Th>
					<Table.Th>{translate('fields.calculation_type')}</Table.Th>
					<Table.Th>{translate('fields.rate')}</Table.Th>
					<Table.Th>{translate('fields.taxable_base')}</Table.Th>
					<Table.Th>{translate('fields.tax_amount')}</Table.Th>
					<Table.Th>{translate('fields.legal_reference')}</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{line.components.map(component => (
					<Table.Tr
						key={`${component.tax_id}-${component.sequence}`}
						{...testAttrs('accounting', 'taxSimulator', 'component', component.tax_id)}
					>
						<Table.Td>
							<Group gap={6}>
								<Text size='sm'>{component.tax_code}</Text>
								<Badge size='xs' variant='light'>
									{translate(`tax_treatment.${component.treatment}`)}
								</Badge>
							</Group>
						</Table.Td>
						<Table.Td>{translate(`calculation_type.${component.calculation_type}`)}</Table.Td>
						{/*
						  * Every figure is printed exactly as the backend sent it. They arrive as
						  * strings and are never parsed into a JS number, which could not hold them
						  * exactly — the whole reason the contract is string-typed end to end.
						  */}
						<Table.Td>{component.rate}</Table.Td>
						<Table.Td>{component.taxable_base}</Table.Td>
						<Table.Td>{component.tax_amount}</Table.Td>
						<Table.Td>
							<Text size='xs' c='dimmed'>{component.legal_reference ?? ''}</Text>
						</Table.Td>
					</Table.Tr>
				))}
			</Table.Tbody>
		</Table>
	);
}
