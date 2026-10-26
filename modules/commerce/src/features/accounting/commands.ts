import { resourceCommands } from '@nikkierp/common/dynamicModel';

import { ACCOUNTING_MODULE, TAX_COMPONENT_SCHEMA_NAME, TAX_DEFINITION_VERSION_SCHEMA_NAME, TAX_GROUP_SCHEMA_NAME, TAX_JURISDICTION_SCHEMA_NAME, TAX_MAPPING_LINE_SCHEMA_NAME, TAX_MAPPING_SCHEMA_NAME, TAX_PRODUCT_CLASSIFICATION_SCHEMA_NAME, TAX_RATE_VERSION_SCHEMA_NAME, TAX_ROUNDING_POLICY_SCHEMA_NAME, TAX_RULE_CONDITION_SCHEMA_NAME, TAX_RULE_RESULT_SCHEMA_NAME, TAX_RULE_SCHEMA_NAME, TAX_SCHEMA_NAME } from '../../constants/accounting';


/**
 * Command names of the accounting resources the proxy pages publish, copied from
 * `nikkierp/modules/accounting/src/features/<resource>/commands.ts` without their `register*` functions: the accounting
 * micro-app owns the handlers and services, and the command bus lazy-loads it on first use.
 */
const TAX_PREFIX = `${ACCOUNTING_MODULE}.${TAX_SCHEMA_NAME}`;
export const TaxCommands = Object.freeze({
	...resourceCommands(TAX_SCHEMA_NAME),
	CALCULATE: `${TAX_PREFIX}.calculate`,
	SIMULATE: `${TAX_PREFIX}.simulate`,
} as const);

export const TaxComponentCommands = Object.freeze({
	...resourceCommands(TAX_COMPONENT_SCHEMA_NAME),
} as const);

export const TaxDefinitionVersionCommands = Object.freeze({
	...resourceCommands(TAX_DEFINITION_VERSION_SCHEMA_NAME),
} as const);

export const TaxGroupCommands = Object.freeze({
	...resourceCommands(TAX_GROUP_SCHEMA_NAME),
} as const);

export const TaxJurisdictionCommands = Object.freeze({
	...resourceCommands(TAX_JURISDICTION_SCHEMA_NAME),
} as const);

export const TaxMappingCommands = Object.freeze({
	...resourceCommands(TAX_MAPPING_SCHEMA_NAME),
} as const);

export const TaxMappingLineCommands = Object.freeze({
	...resourceCommands(TAX_MAPPING_LINE_SCHEMA_NAME),
} as const);

export const TaxProductClassificationCommands = Object.freeze({
	...resourceCommands(TAX_PRODUCT_CLASSIFICATION_SCHEMA_NAME),
} as const);

export const TaxRateVersionCommands = Object.freeze({
	...resourceCommands(TAX_RATE_VERSION_SCHEMA_NAME),
} as const);

export const TaxRoundingPolicyCommands = Object.freeze({
	...resourceCommands(TAX_ROUNDING_POLICY_SCHEMA_NAME),
} as const);

export const TaxRuleCommands = Object.freeze({
	...resourceCommands(TAX_RULE_SCHEMA_NAME),
} as const);

export const TaxRuleConditionCommands = Object.freeze({
	...resourceCommands(TAX_RULE_CONDITION_SCHEMA_NAME),
} as const);

export const TaxRuleResultCommands = Object.freeze({
	...resourceCommands(TAX_RULE_RESULT_SCHEMA_NAME),
} as const);
