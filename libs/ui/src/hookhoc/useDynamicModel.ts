import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';

import { useCommandBus } from '../microApp';


/**
 * Resolves a {@link dyn.SchemaPack} for `schemaName` by publishing the
 * `core.dynamic_model.get_schema` command, so consumers stay decoupled from the
 * concrete schema registry. Returns `null` until resolved (or on error).
 */
export function useDynamicModel(schemaName: string): dyn.SchemaPack | null {
	const commandBus = useCommandBus();
	const [schemaPack, setSchemaPack] = React.useState<dyn.SchemaPack | null>(null);

	React.useEffect(() => {
		if (!schemaName) {
			return;
		}
		let active = true;
		void dyn.publishGetSchema(commandBus, schemaName).then((pack) => {
			if (active) {
				setSchemaPack(pack);
			}
		});
		return () => {
			active = false;
		};
	}, [commandBus, schemaName]);

	return schemaPack;
}
