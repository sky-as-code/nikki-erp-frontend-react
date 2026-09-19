import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';

import { useCommandBus } from '../microApp';


export type DynamicModelState = {
	pack: dyn.SchemaPack | null,
	isPending: boolean,
	error?: string,
};

/**
 * Resolves a {@link dyn.SchemaPack} for `schemaName` by publishing the
 * `core.dynamic_model.get_schema` command, so consumers stay decoupled from the
 * concrete schema registry.
 *
 * `isPending` separates "not resolved yet" from "will never resolve" — without it a schema that
 * cannot be resolved is indistinguishable from one still in flight, which is how a permanently
 * empty relation picker passed for a loading one.
 */
export function useDynamicModel(schemaName: string): DynamicModelState {
	const commandBus = useCommandBus();
	const [state, setState] = React.useState<DynamicModelState>(
		() => ({ pack: null, isPending: Boolean(schemaName) }),
	);

	React.useEffect(() => {
		if (!schemaName) {
			setState({ pack: null, isPending: false });
			return;
		}
		let active = true;
		setState({ pack: null, isPending: true });
		dyn.publishGetSchema(commandBus, schemaName)
			.then((pack) => {
				if (!active) return;
				setState(pack
					? { pack, isPending: false }
					: { pack: null, isPending: false, error: `Schema '${schemaName}' could not be resolved.` });
			})
			.catch((error: unknown) => {
				if (!active) return;
				setState({ pack: null, isPending: false, error: String(error) });
			});
		return () => {
			active = false;
		};
	}, [commandBus, schemaName]);

	return state;
}
