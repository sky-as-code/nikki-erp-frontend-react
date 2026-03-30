import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { ControlPanelProps } from '@/components/ControlPanel';

import type { TabId } from './types';


export type KioskDetailTabControlEntry = {
	actions: ControlPanelProps['actions'];
};

type Registry = Partial<Record<TabId, KioskDetailTabControlEntry>>;

type KioskDetailTabControlContextValue = {
	registry: Registry;
	registerTab: (tabId: TabId, entry: KioskDetailTabControlEntry) => void;
	unregisterTab: (tabId: TabId) => void;
};

const KioskDetailTabControlContext = React.createContext<KioskDetailTabControlContextValue | null>(null);

export const KioskDetailTabControlProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	const [registry, setRegistry] = useState<Registry>({});

	const registerTab = useCallback((tabId: TabId, entry: KioskDetailTabControlEntry) => {
		setRegistry((prev) => ({ ...prev, [tabId]: entry }));
	}, []);

	const unregisterTab = useCallback((tabId: TabId) => {
		setRegistry((prev) => {
			const next = { ...prev };
			delete next[tabId];
			return next;
		});
	}, []);

	const value = useMemo(
		() => ({ registry, registerTab, unregisterTab }),
		[registry, registerTab, unregisterTab],
	);

	return (
		<KioskDetailTabControlContext.Provider value={value}>
			{children}
		</KioskDetailTabControlContext.Provider>
	);
};

export function useKioskDetailTabControl(): KioskDetailTabControlContextValue {
	const ctx = React.useContext(KioskDetailTabControlContext);
	if (!ctx) {
		throw new Error('useKioskDetailTabControl must be used within KioskDetailTabControlProvider');
	}
	return ctx;
}

/** Đăng ký `actions` cho một tab khi mount; gỡ khi unmount hoặc khi `actions` đổi. */
export function useRegisterKioskDetailTab(tabId: TabId, actions: ControlPanelProps['actions']) {
	const { registerTab, unregisterTab } = useKioskDetailTabControl();
	useLayoutEffect(() => {
		registerTab(tabId, { actions });
		return () => unregisterTab(tabId);
	}, [tabId, actions, registerTab, unregisterTab]);
}
