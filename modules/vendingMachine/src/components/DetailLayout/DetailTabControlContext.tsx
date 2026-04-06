import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ControlPanelProps } from '@/components/ControlPanel';


export type DetailTabControlEntry = {
	actions: ControlPanelProps['actions'];
};

/**
 * Tạo Provider + hooks gắn với tập id tab cụ thể (union từ feature), ví dụ `createDetailTabControl<TabId>()`.
 */
export function createDetailTabControl<T extends string>() {
	type Registry = Partial<Record<T, DetailTabControlEntry>>;

	type DetailTabControlContextValue = {
		registry: Registry;
		registerTab: (tabId: T, entry: DetailTabControlEntry) => void;
		unregisterTab: (tabId: T) => void;
	};

	const DetailTabControlContext = React.createContext<DetailTabControlContextValue | null>(null);

	const DetailTabControlProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
		const [registry, setRegistry] = useState<Registry>({});

		const registerTab = useCallback((tabId: T, entry: DetailTabControlEntry) => {
			setRegistry((prev) => ({ ...prev, [tabId]: entry }));
		}, []);

		const unregisterTab = useCallback((tabId: T) => {
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
			<DetailTabControlContext.Provider value={value}>
				{children}
			</DetailTabControlContext.Provider>
		);
	};

	function useDetailTabControl(): DetailTabControlContextValue {
		const ctx = React.useContext(DetailTabControlContext);
		if (!ctx) {
			throw new Error('useDetailTabControl must be used within DetailTabControlProvider');
		}
		return ctx;
	}

	function useRegisterDetailTab(tabId: T, actions: ControlPanelProps['actions']) {
		const { registerTab, unregisterTab } = useDetailTabControl();
		// useLayoutEffect(() => {
		useEffect(() => {
			registerTab(tabId, { actions });
			return () => unregisterTab(tabId);
		}, [tabId, actions, registerTab, unregisterTab]);
	}

	return {
		DetailTabControlProvider,
		useDetailTabControl,
		useRegisterDetailTab,
	};
}

/** Mặc định không ràng buộc id tab (string). */
export const {
	DetailTabControlProvider,
	useDetailTabControl,
	useRegisterDetailTab,
} = createDetailTabControl<string>();
