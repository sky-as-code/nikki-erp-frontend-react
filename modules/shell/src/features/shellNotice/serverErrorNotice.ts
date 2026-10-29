import { EventBus } from '@nikkierp/common/eventBus';
import { SERVER_ERROR_TOPIC } from '@nikkierp/common/request';
import { escapeHtml } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import React from 'react';

import type { ShellNoticeStore } from './shellNoticeStore';
import type { IEventBus } from '@nikkierp/common/eventBus';


/**
 * Answers every 5xx with the general error notice, one at a time: while it is still on screen,
 * further failures — a page firing several requests at a sick server — add nothing.
 */
export function subscribeServerErrorNotice(
	bus: IEventBus, store: ShellNoticeStore, message: () => string,
): () => void {
	let shownId: string | null = null;
	return bus.subscribe(SERVER_ERROR_TOPIC, () => {
		if (shownId && store.getSnapshot().error.some(notice => notice.id === shownId)) {
			return;
		}
		shownId = store.push('error', escapeHtml(message()));
	});
}

export function useServerErrorNotice(store: ShellNoticeStore): void {
	const t = useTranslate('common');
	const translateRef = React.useRef(t);
	translateRef.current = t;
	React.useEffect(() => {
		const bus = EventBus.instance;
		if (!bus) {
			return undefined;
		}
		return subscribeServerErrorNotice(bus, store, () => translateRef.current('common:error.serverError', {
			defaultValue: 'Something went wrong on the server. Please try again later.',
		}));
	}, [store]);
}
