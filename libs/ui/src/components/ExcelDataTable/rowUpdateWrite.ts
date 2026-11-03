import { UI_OPERATIONS } from '@nikkierp/common';
import React from 'react';

import { useExcelDataTableContext } from './context';
import { publishTraced } from '../../hookhoc/tracedPublish';
import { useCommandBus } from '../../microApp/MicroAppProvider';

import type { ClientErrorItem } from '@nikkierp/common/types';


/** Resolves the write's client errors, `[]` for a failure without any, or `null` on success. */
export function useRowUpdateWrite(): (data: Record<string, unknown>) => Promise<ClientErrorItem[] | null> {
	const { sinks } = useExcelDataTableContext();
	const commandBus = useCommandBus();
	return React.useCallback(async (data) => {
		if (sinks.updateCommand) {
			const response = await publishTraced<unknown>(
				commandBus, { name: sinks.updateCommand, payload: data }, UI_OPERATIONS.FORM_SAVE,
			);
			const clientErrors = response.result?.clientErrors ?? [];
			return response.error != null || clientErrors.length > 0 ? clientErrors : null;
		}
		if (sinks.onUpdated) {
			return (await sinks.onUpdated(data)) === false ? [] : null;
		}
		return [];
	}, [commandBus, sinks]);
}
