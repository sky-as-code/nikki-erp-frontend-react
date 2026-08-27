import { CommandBus } from '@nikkierp/common/commandBus';
import React from 'react';

import * as c from '../../constants';

import type { TaxSimulatorProps } from '../props';


/**
 * What the user has filled in. Every money and quantity field is a string, deliberately.
 *
 * They stay strings from the input box to the backend without ever becoming a JS number: a
 * `number` cannot hold a decimal fraction exactly, and a tax figure that is off in the sixteenth
 * decimal place is a total that disagrees with the sum of its own components.
 */
export type SimulatorInput = {
	taxDate: string,
	operationType: string,
	priceMode: string,
	roundingPolicyCode: string,
	productClassification: string,
	buyerClassification: string,
	sellerJurisdictionId: string,
	buyerJurisdictionId: string,
	shipFromJurisdictionId: string,
	shipToJurisdictionId: string,
	candidateTaxId: string,
	quantity: string,
	unitPrice: string,
	commercialBaseAmount: string,
};

/** One stage of the pipeline, as the backend reported it happening. */
export type TraceStep = {
	stage: string,
	detail: string,
	tax_ids?: string[],
	rule_ids?: string[],
};

/** One tax applied to the simulated line, with the configuration that produced it. */
export type ComponentResult = {
	tax_id: string,
	tax_code: string,
	tax_name: string,
	tax_definition_version_id: string,
	tax_definition_version_no: number,
	tax_rate_version_id: string,
	tax_rate_version_no: number,
	rate: string,
	fixed_amount: string,
	treatment: string,
	jurisdiction_id?: string,
	calculation_type: string,
	sequence: number,
	taxable_base: string,
	unrounded_tax_amount: string,
	tax_amount: string,
	rounding_adjustment: string,
	legal_reference?: string,
};

export type LineResult = {
	line_reference: string,
	status: string,
	error_code?: string,
	treatment?: string,
	base_amount: string,
	total_excluded: string,
	total_tax: string,
	total_included: string,
	components: ComponentResult[],
};

export type SimulationOutcome = {
	calculation: {
		status: string,
		total_excluded: string,
		total_tax: string,
		total_included: string,
		rounding_adjustment: string,
		applied_rule_ids?: string[] | null,
		applied_mapping_ids?: string[] | null,
		lines: LineResult[],
	},
	trace: TraceStep[],
};

export type SimulatorState = {
	input: SimulatorInput,
	setField: (field: keyof SimulatorInput, value: string) => void,
	run: () => void,
	isRunning: boolean,
	outcome: SimulationOutcome | null,
	/** A refusal the user can act on — a missing date, an unsupported operation. */
	rejection: string | null,
	/** A failure of the request itself, as distinct from a business refusal. */
	error: string | null,
};

/** Today, as a calendar date. The user may change it; nothing defaults it server-side. */
function todayIso(): string {
	const now = new Date();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${now.getFullYear()}-${month}-${day}`;
}

const EMPTY_INPUT: SimulatorInput = {
	taxDate: todayIso(),
	operationType: c.OPERATION_SALE,
	priceMode: c.PRICE_MODE_EXCLUDED,
	roundingPolicyCode: '',
	productClassification: '',
	buyerClassification: '',
	sellerJurisdictionId: '',
	buyerJurisdictionId: '',
	shipFromJurisdictionId: '',
	shipToJurisdictionId: '',
	candidateTaxId: '',
	quantity: '1',
	unitPrice: '',
	commercialBaseAmount: '',
};

/**
 * Drives one simulation.
 *
 * The simulator creates no transaction of any kind: it posts to the simulate endpoint, which has
 * no business side effects and is safely repeatable, and it holds the answer in React state
 * (AC-TAX-35). Nothing here writes.
 */
export function useTaxSimulator(props: TaxSimulatorProps): SimulatorState {
	const [input, setInput] = React.useState<SimulatorInput>(EMPTY_INPUT);
	const [isRunning, setRunning] = React.useState(false);
	const [outcome, setOutcome] = React.useState<SimulationOutcome | null>(null);
	const [rejection, setRejection] = React.useState<string | null>(null);
	const [error, setError] = React.useState<string | null>(null);

	const setField = React.useCallback((field: keyof SimulatorInput, value: string) => {
		setInput(previous => ({ ...previous, [field]: value }));
	}, []);

	const run = React.useCallback(() => {
		let cancelled = false;
		setRunning(true);
		setRejection(null);
		setError(null);

		const bus = CommandBus.instance;
		if (!bus) {
			setError('CommandBus is not initialized; the Shell installs it when the host mounts.');
			setRunning(false);
			return;
		}

		bus.publish<SimulationOutcome>({
			name: props.simulateCommand,
			payload: buildRequest(input, props.defaultCurrencyCode),
		}).then(response => {
			if (cancelled) {
				return;
			}
			// A business refusal arrives as client errors with no data — a missing tax date, an
			// operation the engine does not implement. It is the user's to fix, so it is surfaced
			// as a message beside the form rather than thrown.
			const clientErrors = response.result?.clientErrors;
			if (clientErrors && clientErrors.length > 0) {
				setRejection(clientErrors.map(item => item.message ?? item.key).join('\n'));
				setOutcome(null);
				return;
			}
			setOutcome(response.result?.data ?? null);
		}).catch((reason: unknown) => {
			if (!cancelled) {
				setError(reason instanceof Error ? reason.message : String(reason));
				setOutcome(null);
			}
		}).finally(() => {
			if (!cancelled) {
				setRunning(false);
			}
		});

		return () => { cancelled = true; };
	}, [input, props.simulateCommand, props.defaultCurrencyCode]);

	return { input, setField, run, isRunning, outcome, rejection, error };
}

/**
 * Turns the form into the document the engine prices.
 *
 * One line, because a simulation answers "what would this line be taxed" — a user comparing two
 * products runs it twice. The base amount falls back to quantity times price so the common case
 * needs one number rather than three, but an explicit base wins: Sales computes it net of
 * discount and Tax takes it as given (TAX-INV-17).
 */
function buildRequest(input: SimulatorInput, currencyCode: string): Record<string, unknown> {
	return {
		tax_date: input.taxDate,
		operation_type: input.operationType,
		currency_code: currencyCode,
		price_mode: input.priceMode,
		rounding_policy_code: input.roundingPolicyCode || undefined,
		seller: {
			primary_jurisdiction_id: input.sellerJurisdictionId || undefined,
		},
		buyer: {
			party_tax_classification: input.buyerClassification || undefined,
			primary_jurisdiction_id: input.buyerJurisdictionId || undefined,
		},
		ship_from_jurisdiction_id: input.shipFromJurisdictionId || undefined,
		ship_to_jurisdiction_id: input.shipToJurisdictionId || undefined,
		lines: [{
			line_reference: 'SIM-1',
			product_tax_classification: input.productClassification || undefined,
			quantity: input.quantity || undefined,
			unit_price: input.unitPrice || undefined,
			commercial_base_amount: baseAmountOf(input),
			candidate_tax_ids: input.candidateTaxId ? [input.candidateTaxId] : undefined,
		}],
	};
}

/**
 * The taxable base, as a string throughout.
 *
 * The multiplication is done in string arithmetic rather than with `Number`, for the same reason
 * every other figure here stays a string: `0.1 * 3` is not `0.3` in binary floating point, and a
 * base computed that way would be wrong before the engine ever saw it.
 */
function baseAmountOf(input: SimulatorInput): string {
	if (input.commercialBaseAmount) {
		return input.commercialBaseAmount;
	}
	return multiplyDecimalStrings(input.quantity || '0', input.unitPrice || '0');
}

/**
 * Multiplies two decimal strings exactly, using integer arithmetic on the digits.
 *
 * BigInt rather than Number: the product of two prices can exceed the range a double represents
 * exactly, and the whole point of keeping these as strings is that no rounding happens before the
 * engine's own, policy-driven one.
 */
export function multiplyDecimalStrings(left: string, right: string): string {
	const leftParts = splitDecimal(left);
	const rightParts = splitDecimal(right);
	if (!leftParts || !rightParts) {
		return '0';
	}

	const product = leftParts.digits * rightParts.digits;
	const scale = leftParts.scale + rightParts.scale;
	const negative = product < 0n;
	const magnitude = (negative ? -product : product).toString().padStart(scale + 1, '0');

	const whole = magnitude.slice(0, magnitude.length - scale) || '0';
	const fraction = scale > 0 ? magnitude.slice(magnitude.length - scale).replace(/0+$/, '') : '';
	const sign = negative ? '-' : '';
	return fraction ? `${sign}${whole}.${fraction}` : `${sign}${whole}`;
}

function splitDecimal(value: string): { digits: bigint, scale: number } | null {
	const trimmed = value.trim();
	if (!/^-?\d*(\.\d*)?$/.test(trimmed) || trimmed === '' || trimmed === '-') {
		return null;
	}
	const [whole, fraction = ''] = trimmed.split('.');
	const digits = BigInt((whole === '' || whole === '-' ? `${whole}0` : whole) + fraction);
	return { digits, scale: fraction.length };
}
