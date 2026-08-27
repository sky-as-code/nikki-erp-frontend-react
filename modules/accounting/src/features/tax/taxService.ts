import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { storeService } from '@nikkierp/ui/appState/store';

import { OrgScopedCrudService } from '../../common/service/OrgScopedCrudService';
import * as c from '../../constants';
import { accountingStore } from '../../store';


/**
 * CRUD over `accounting_tax` — the stable business identity of a tax — plus the two engine
 * endpoints that hang off it.
 *
 * Calculate and simulate are not operations on a tax record: they price a document the caller
 * owns, reading many resources to do it. They live here because `accounting_tax` is the resource
 * whose permissions gate them, not because they mutate a tax.
 */
@storeService('TaxService', accountingStore)
export class TaxService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: c.ACCOUNTING_MODULE, schemaName: c.TAX_SCHEMA_NAME });
	}

	/**
	 * Prices a whole document.
	 *
	 * No business side effects whatsoever: no invoice, no posting, no change to tax master data,
	 * so calling it twice with the same input produces the same answer and changes nothing
	 * (AC-TAX-35). That is what lets a draft order recalculate on every edit.
	 */
	public calculate(request: TaxCalculationRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.TAX_CALCULATE_PATH);
	}

	/**
	 * Runs the same pipeline and additionally returns the trace of how it got there.
	 *
	 * Separate from calculate because the explanation is expensive to assemble and pointless on
	 * the hot path: an order being priced needs the number, a tax administrator debugging a rule
	 * needs the reasoning (BR-TAX-ESS-051). Gated on its own `accounting_tax:simulate`
	 * entitlement, because it explains the whole rule base rather than one order.
	 */
	public simulate(request: TaxCalculationRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.TAX_SIMULATE_PATH);
	}

	/**
	 * Posts to an absolute engine path rather than to a sub-path of this resource.
	 *
	 * It goes through `manageM2m` because that is the only base-class method that posts to an
	 * arbitrary path; the name is about its usual caller, not a constraint on the path.
	 */
	private postAction(
		request: Record<string, unknown>, action: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.manageM2m(request as dyn.RestManageM2mRequest, action);
	}
}

/**
 * One line of a document to be taxed.
 *
 * Money and quantities are strings, never numbers. A JSON number is parsed as a float64 by the
 * backend's decoder and a float64 cannot hold a decimal fraction exactly — on a tax figure that is
 * not academic: an invoice total that disagrees with the sum of its lines by a cent is a defect an
 * auditor will find.
 */
export type TaxCalculationLine = {
	line_reference: string,
	product_reference?: string,
	product_tax_classification?: string,
	quantity?: string,
	uom_id?: string,
	unit_price?: string,
	discount_amount?: string,
	commercial_base_amount: string,
	candidate_tax_ids?: string[],
	override_tax_ids?: string[],
	override_reason?: string,
};

/** One side of a transaction, as the tax context sees it. */
export type TaxPartyInput = {
	party_reference?: string,
	party_tax_classification?: string,
	primary_jurisdiction_id?: string,
	tax_registrations?: {
		jurisdiction_id?: string,
		registration_type?: string,
		is_registered?: boolean,
	}[],
};

/**
 * A whole document's worth of tax to compute.
 *
 * Document-level rather than line-level because rounding may be document-scoped, and a per-line
 * API could only fake that by rounding each line and summing — a different number, and not the one
 * the law asks for.
 */
export type TaxCalculationRequest = {
	/** Mandatory, and never defaulted from the clock (BR-TAX-ESS-SUP-020). */
	tax_date: string,
	operation_type: string,
	currency_code: string,
	price_mode?: string,
	rounding_policy_code?: string,
	seller?: TaxPartyInput,
	buyer?: TaxPartyInput,
	ship_from_jurisdiction_id?: string,
	ship_to_jurisdiction_id?: string,
	business_channel_code?: string,
	outlet_reference?: string,
	lines: TaxCalculationLine[],
};

export const taxService = new TaxService();
