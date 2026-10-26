import { resourceCommands } from '@nikkierp/common/dynamicModel';

import { INVOICE_LINE_SCHEMA_NAME, INVOICE_SCHEMA_NAME, ORDER_SCHEMA_NAME, PAYMENTINVOICE_MODULE, PAYMENT_METHOD_SCHEMA_NAME, TRANSACTION_SCHEMA_NAME } from '../../constants/paymentinvoice';


/**
 * Command names of the paymentinvoice resources the proxy pages publish, copied from
 * `nikkierp/modules/paymentinvoice/src/features/<resource>/commands.ts` without their `register*` functions: the paymentinvoice
 * micro-app owns the handlers and services, and the command bus lazy-loads it on first use.
 */
const INVOICE_PREFIX = `${PAYMENTINVOICE_MODULE}.${INVOICE_SCHEMA_NAME}`;
export const InvoiceCommands = Object.freeze({
	...resourceCommands(INVOICE_SCHEMA_NAME),
	ISSUE: `${INVOICE_PREFIX}.issue`,
} as const);

export const InvoiceLineCommands = Object.freeze(resourceCommands(INVOICE_LINE_SCHEMA_NAME));

const ORDER_PREFIX = `${PAYMENTINVOICE_MODULE}.${ORDER_SCHEMA_NAME}`;
export const OrderCommands = Object.freeze({
	...resourceCommands(ORDER_SCHEMA_NAME),
	CREATE_PAYMENT: `${ORDER_PREFIX}.create_payment`,
	REFUND: `${ORDER_PREFIX}.refund`,
} as const);

export const PaymentMethodCommands = Object.freeze(resourceCommands(PAYMENT_METHOD_SCHEMA_NAME));

export const TransactionCommands = Object.freeze(resourceCommands(TRANSACTION_SCHEMA_NAME));
