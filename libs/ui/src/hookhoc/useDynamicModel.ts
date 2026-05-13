import * as dyn from '@nikkierp/common/dynamic_model';
import React from 'react';


export function useDynamicModel(schemaName: string): dyn.SchemaPack | null {
	const [schemaPack, setSchemaPack] = React.useState<dyn.SchemaPack | null>(null);

	React.useEffect(() => {
		if (schemaName) {
			dyn.schemaRegistry.get(schemaName).then((schemaPack) => {
				setSchemaPack(schemaPack);
			});
		}
	}, []);

	return schemaPack;
}