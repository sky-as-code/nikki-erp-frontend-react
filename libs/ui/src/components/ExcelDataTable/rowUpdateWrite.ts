import React from 'react';

import { useExcelDataTableContext } from './context';
import { useCommandBus } from '../../microApp/MicroAppProvider';

import type { ClientErrorItem } from '@nikkierp/common/types';


/** Resolves the write's client errors, `[]` for a failure without any, or `null` on success. */
export function useRowUpdateWrite(): (data: Record<string, unknown>) => Promise<ClientErrorItem[] | null> {
	const { sinks } = useExcelDataTableContext();
	const commandBus = useCommandBus();
	return React.useCallback(async (data) => {
		if (sinks.updateCommand) {
			const response = await commandBus.publish<unknown>({ name: sinks.updateCommand, payload: data });
			const clientErrors = response.result?.clientErrors ?? [];
			return response.error != null || clientErrors.length > 0 ? clientErrors : null;
		}
		if (sinks.onUpdated) {
			return (await sinks.onUpdated(data)) === false ? [] : null;
		}
		return [];
	}, [commandBus, sinks]);
}
