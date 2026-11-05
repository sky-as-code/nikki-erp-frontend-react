import { showShellNotice } from '@nikkierp/common/service';
import { escapeHtml } from '@nikkierp/common/utils';
import { useClientErrorTranslate, useTranslate } from '@nikkierp/ui/i18n';
import React from 'react';

import { SALES_MODULE } from '../../../constants/sales';

import type { ClientErrorItem } from '@nikkierp/common/types';


export const TEST_ID_MODULE = 'sales';

export type SalesText = {
	t: (key: string, options?: Record<string, unknown>) => string,
	translateError: (item: ClientErrorItem) => string,
};

/** Sales' own namespace with `common` behind it, for the hand-written promotion components. */
export function useSalesText(): SalesText {
	const t = useTranslate([SALES_MODULE, 'common']);
	const translateError = useClientErrorTranslate([SALES_MODULE, 'common']);
	return React.useMemo(() => ({ t, translateError }), [t, translateError]);
}

/** One Shell notice for a failed or successful action; the text is escaped, the notice injects HTML. */
export function notify(type: 'info' | 'error', text: string): void {
	void showShellNotice(type, escapeHtml(text));
}

/** The client errors of a response, translated, or a generic text when it failed with none. */
export function failureText(
	text: SalesText, clientErrors: ClientErrorItem[], failed: boolean, genericKey: string,
): string | null {
	if (clientErrors.length > 0) {
		return clientErrors.map(text.translateError).join(' ');
	}
	return failed ? text.t(genericKey) : null;
}
