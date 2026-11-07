import { Alert } from '@mantine/core';
import { LoadingState } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import { MicroAppHostContext } from '@nikkierp/ui/microApp';
import React from 'react';


type GateState = 'loading' | 'ready' | 'failed';

/**
 * Renders a proxy page only once the micro-app owning the copied page is loaded and initialized: its
 * `init` installs the view-kit components, services and schemas the copy relies on (a product
 * template's Attributes section, for instance). Loading is idempotent, so revisiting costs nothing.
 */
export function OwnerMicroAppGate({ ownerSlug, children }: {
	ownerSlug: string,
	children: React.ReactNode,
}): React.ReactNode {
	const state = useOwnerLoaded(ownerSlug);
	const t = useTranslate('common');
	if (state === 'loading') {
		return <LoadingState />;
	}
	if (state === 'failed') {
		return (
			<Alert color='red' m='md'>
				{t('messages.module_load_failed', { defaultValue: 'This page could not be loaded. Try again later.' })}
			</Alert>
		);
	}
	return children;
}

/** Loads the owner through the host's micro-app manager; without a host (tests, storybook) it is ready. */
export function useOwnerLoaded(ownerSlug: string): GateState {
	const host = React.useContext(MicroAppHostContext);
	const [state, setState] = React.useState<GateState>(host ? 'loading' : 'ready');
	React.useEffect(() => {
		if (!host) {
			return;
		}
		let active = true;
		host.manager.ensureLoaded(ownerSlug).then(
			() => active && setState('ready'),
			() => active && setState('failed'),
		);
		return () => {
			active = false;
		};
	}, [host, ownerSlug]);
	return state;
}
