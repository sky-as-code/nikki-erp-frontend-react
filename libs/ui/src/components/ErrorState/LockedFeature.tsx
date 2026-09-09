import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { EventBus } from '@nikkierp/common/eventBus';
import { PERMISSION_DENIED_TOPIC, type PermissionDeniedEvent } from '@nikkierp/common/service';
import { testAttrs } from '@nikkierp/common/utils';
import { IconLock } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { InsufficientPermissionContent } from './InsufficientPermission';


export type LockedFeatureModalProps = {
	opened: boolean,
	onClose: () => void,
	missing: string[],
	testId?: string,
};

/**
 * The refusal a locked control shows when clicked. Follows the controlled-component convention of
 * `ConfirmModal` rather than the imperative `@mantine/modals` manager, which this codebase does
 * not otherwise use.
 */
export function LockedFeatureModal(props: LockedFeatureModalProps): React.ReactElement {
	const { t: translate } = useTranslation();
	const prefix = props.testId ?? 'ui.lockedFeature';

	return (
		<Modal
			opened={props.opened}
			onClose={props.onClose}
			title={
				<Group gap='xs'>
					<IconLock size={20} />
					<Text fw={700} fz='lg'>{translate('insufficient_permission_title')}</Text>
				</Group>
			}
			size='md'
			centered
			{...testAttrs(prefix, 'modal')}
		>
			<Stack gap='md'>
				<InsufficientPermissionContent missing={props.missing} />
				<Group justify='flex-end'>
					<Button variant='outline' color='gray' onClick={props.onClose} {...testAttrs(prefix, 'close')}>
						{translate('action.close')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}

type LockedFeatureContextValue = {
	/** Opens the refusal for the given entitlements. */
	show: (missing: string[]) => void,
};

const LockedFeatureContext = React.createContext<LockedFeatureContextValue | null>(null);

/**
 * Mounts one modal for the whole app.
 *
 * A locked control can only refuse one thing at a time, so a single mounted modal driven by
 * context is preferable to `useState` in every gated Button, MenuItem and Select.
 */
export function LockedFeatureProvider(props: { children: React.ReactNode }): React.ReactElement {
	const [missing, setMissing] = React.useState<string[] | null>(null);

	const value = React.useMemo<LockedFeatureContextValue>(
		() => ({ show: entitlements => setMissing(entitlements) }),
		[],
	);

	// The backstop for what the client-side check missed. A page gates the actions it declares;
	// when the server refuses something it did not, that refusal is the authority and is shown
	// here with the entitlements the server itself named.
	//
	// Subscribed inside the provider rather than higher up because this is where the modal state
	// lives — a subscriber above it would only reach the no-op `useShowLockedFeature`.
	React.useEffect(
		() => EventBus.instance?.subscribe(
			PERMISSION_DENIED_TOPIC,
			(event: PermissionDeniedEvent) => setMissing(event.entitlements),
		),
		[],
	);

	return (
		<LockedFeatureContext.Provider value={value}>
			{props.children}
			<LockedFeatureModal
				opened={missing != null}
				onClose={() => setMissing(null)}
				missing={missing ?? []}
			/>
		</LockedFeatureContext.Provider>
	);
}

/**
 * Shows the insufficient-permission refusal.
 *
 * Returns a no-op when no provider is mounted, so a component using it still renders — a missing
 * provider must not crash a page, it just means the click does nothing visible.
 */
export function useShowLockedFeature(): (missing: string[]) => void {
	const context = React.useContext(LockedFeatureContext);
	return context?.show ?? noop;
}

function noop(): void {
	// No provider mounted; see useShowLockedFeature.
}
