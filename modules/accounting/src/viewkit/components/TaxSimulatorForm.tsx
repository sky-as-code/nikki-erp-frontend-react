import { Grid, Group, Stack, TextInput } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Button, Select } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import React from 'react';
import { z } from 'zod';

import * as c from '../../constants';
import { TAX_SIMULATOR_FORM } from '../ids';
import { useTaxSimulatorContext } from '../pages/taxSimulatorContext';

import type { SimulatorInput, SimulatorState } from '../pages/useTaxSimulator';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const taxSimulatorFormRenderer: IComponentRenderer<Record<string, never>> = {
	type: TAX_SIMULATOR_FORM,
	propsSchema: z.object({}).strict(),
	render() {
		return (
			<ComponentAnchor id={TAX_SIMULATOR_FORM}>
				<TaxSimulatorForm />
			</ComponentAnchor>
		);
	},
};

/**
 * The inputs BR-TAX-ESS-051 names: tax date, operation type, classifications, jurisdictions,
 * quantity, price and price mode.
 *
 * Every field is free text or a fixed-choice select. The pickers that would resolve a jurisdiction
 * or a tax to a readable name take an id here instead, because the simulator is a diagnostic tool
 * used by someone who already has the id in front of them from the configuration pages — and a
 * relation picker that silently filters by org would hide exactly the misconfiguration being
 * chased.
 */
function TaxSimulatorForm(): React.ReactNode {
	const { params, state } = useTaxSimulatorContext();
	const translate = useTranslate(params.translationNs);

	return (
		<Stack gap='md'>
			<Grid>
				<DocumentFields state={state} translate={translate} />
				<PartyFields state={state} translate={translate} />
				<LineFields state={state} translate={translate} />
			</Grid>

			<Group justify='flex-end'>
				<Button
					onClick={() => state.run()}
					loading={state.isRunning}
					{...testAttrs('accounting', 'taxSimulator', 'run')}
				>
					{translate('actions.simulate')}
				</Button>
			</Group>
		</Stack>
	);
}

type SectionProps = {
	state: SimulatorState,
	translate: (key: string, options?: Record<string, unknown>) => string,
};

/**
 * A plain text field bound to one input.
 *
 * TextInput comes straight from Mantine: `@nikkierp/ui`'s Input wrapper is the unlabelled
 * primitive and covers no labelled variant, which is the documented case for reaching past the
 * wrapper set.
 */
function Field({ name, labelKey, state, translate }: SectionProps & {
	name: keyof SimulatorInput,
	labelKey: string,
}): React.ReactNode {
	return (
		<TextInput
			label={translate(labelKey)}
			value={state.input[name]}
			onChange={event => state.setField(name, event.currentTarget.value)}
			{...testAttrs('accounting', 'taxSimulator', name)}
		/>
	);
}

/** The document's own terms: when it happened, what kind it is, and how it is priced and rounded. */
function DocumentFields({ state, translate }: SectionProps): React.ReactNode {
	return (
		<>
			<Grid.Col span={{ base: 12, md: 4 }}>
				{/*
				  * The tax date decides which configuration is in force and is mandatory. It is
				  * never defaulted server-side (BR-TAX-ESS-SUP-020), so the form seeds today and
				  * the user is free to move it — which is exactly how a rate change is checked
				  * before it takes effect.
				  */}
				<Field name='taxDate' labelKey='fields.tax_date' state={state} translate={translate} />
			</Grid.Col>
			<Grid.Col span={{ base: 12, md: 4 }}>
				<Select
					label={translate('fields.operation_type')}
					value={state.input.operationType}
					onChange={value => state.setField('operationType', value ?? c.OPERATION_SALE)}
					data={[
						{ value: c.OPERATION_SALE, label: translate('operation_type.sale') },
						{ value: c.OPERATION_SALE_REFUND, label: translate('operation_type.sale_refund') },
					]}
					{...testAttrs('accounting', 'taxSimulator', 'operationType')}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 12, md: 4 }}>
				<Select
					label={translate('fields.price_inclusion_mode')}
					value={state.input.priceMode}
					onChange={value => state.setField('priceMode', value ?? c.PRICE_MODE_EXCLUDED)}
					data={[
						{ value: c.PRICE_MODE_EXCLUDED, label: translate('price_inclusion_mode.excluded') },
						{ value: c.PRICE_MODE_INCLUDED, label: translate('price_inclusion_mode.included') },
					]}
					{...testAttrs('accounting', 'taxSimulator', 'priceMode')}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 12, md: 6 }}>
				{/*
				  * Without a policy the engine does not know how to round and answers `unresolved`
				  * rather than guessing a scale, which the result panel shows as
				  * `rounding_policy_missing`. That is a real outcome worth being able to reproduce,
				  * so the field is deliberately not defaulted.
				  */}
				<Field
					name='roundingPolicyCode' labelKey='fields.rounding_policy_code'
					state={state} translate={translate}
				/>
			</Grid.Col>
		</>
	);
}

/** Who is trading, and where — the facts a rule condition may test. */
function PartyFields({ state, translate }: SectionProps): React.ReactNode {
	const fields: { name: keyof SimulatorInput, labelKey: string }[] = [
		{ name: 'buyerClassification', labelKey: 'fields.party_tax_classification' },
		{ name: 'sellerJurisdictionId', labelKey: 'fields.seller_jurisdiction_id' },
		{ name: 'buyerJurisdictionId', labelKey: 'fields.buyer_jurisdiction_id' },
		{ name: 'shipFromJurisdictionId', labelKey: 'fields.ship_from_jurisdiction_id' },
		{ name: 'shipToJurisdictionId', labelKey: 'fields.ship_to_jurisdiction_id' },
	];

	return (
		<>
			{fields.map(({ name, labelKey }) => (
				<Grid.Col key={name} span={{ base: 12, md: 6 }}>
					<Field name={name} labelKey={labelKey} state={state} translate={translate} />
				</Grid.Col>
			))}
		</>
	);
}

/** The line being priced: what it is, how much of it, and at what price. */
function LineFields({ state, translate }: SectionProps): React.ReactNode {
	return (
		<>
			<Grid.Col span={{ base: 12, md: 6 }}>
				<Field
					name='productClassification' labelKey='fields.product_tax_classification'
					state={state} translate={translate}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 12, md: 6 }}>
				<Field
					name='candidateTaxId' labelKey='fields.candidate_tax_id'
					state={state} translate={translate}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 12, md: 4 }}>
				<Field name='quantity' labelKey='fields.quantity' state={state} translate={translate} />
			</Grid.Col>
			<Grid.Col span={{ base: 12, md: 4 }}>
				<Field name='unitPrice' labelKey='fields.unit_price' state={state} translate={translate} />
			</Grid.Col>
			<Grid.Col span={{ base: 12, md: 4 }}>
				{/*
				  * Left blank, quantity times price is used. Filled in, it wins: Sales computes the
				  * base net of discount and Tax takes it as given rather than deriving it.
				  */}
				<Field
					name='commercialBaseAmount' labelKey='fields.commercial_base_amount'
					state={state} translate={translate}
				/>
			</Grid.Col>
		</>
	);
}
