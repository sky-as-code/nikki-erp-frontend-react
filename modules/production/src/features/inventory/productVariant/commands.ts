// Proxy copy of the command names in commerce/src/features/inventory/productVariant/commands.ts, without its
// register function: the commerce micro-app owns the handlers and services, and the command bus
// lazy-loads it on first use.
import { resourceCommands } from '@nikkierp/common/dynamicModel';

import { INVENTORY_MODULE, PRODUCT_VARIANT_SCHEMA_NAME } from '../../../constants/inventory';


const PREFIX = `${INVENTORY_MODULE}.${PRODUCT_VARIANT_SCHEMA_NAME}`;

export const ProductVariantCommands = Object.freeze({
	...resourceCommands(PRODUCT_VARIANT_SCHEMA_NAME),
	GET_EFFECTIVE: `${PREFIX}.get_effective`,
} as const);
