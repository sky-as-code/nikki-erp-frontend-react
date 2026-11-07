// Proxy copy of the command names in commerce/src/features/inventory/productTemplate/commands.ts, without its
// register function: the commerce micro-app owns the handlers and services, and the command bus
// lazy-loads it on first use.
import { resourceCommands } from '@nikkierp/common/dynamicModel';

import { INVENTORY_MODULE, PRODUCT_TEMPLATE_SCHEMA_NAME } from '../../../constants/inventory';


const PREFIX = `${INVENTORY_MODULE}.${PRODUCT_TEMPLATE_SCHEMA_NAME}`;

export const ProductTemplateCommands = Object.freeze({
	...resourceCommands(PRODUCT_TEMPLATE_SCHEMA_NAME),
	GENERATE_VARIANTS: `${PREFIX}.generate_variants`,
	RESOLVE_SELECTION: `${PREFIX}.resolve_selection`,
	PREVIEW_ATTRIBUTE_CONFIGURATION: `${PREFIX}.preview_attribute_configuration`,
	DUPLICATE: `${PREFIX}.duplicate`,
} as const);
