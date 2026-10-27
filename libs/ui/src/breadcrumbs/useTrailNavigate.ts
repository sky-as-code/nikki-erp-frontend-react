import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useLinkModeScope, withNavMode } from './NavHistoryProvider';

import type { LinkMode } from './trail';
import type { NavigateOptions, To } from 'react-router-dom';


export type TrailNavigateOptions = NavigateOptions & {
	mode?: LinkMode,
	isHistoryRoot?: boolean,
};

/** `useNavigate` that tags the navigation with a {@link LinkMode}, like the `Link` wrapper does. */
export function useTrailNavigate(): (to: To | number, options?: TrailNavigateOptions) => void {
	const navigate = useNavigate();
	const scopeMode = useLinkModeScope();

	return React.useCallback((to: To | number, options?: TrailNavigateOptions) => {
		if (typeof to === 'number') {
			void navigate(to);
			return;
		}
		const { mode, isHistoryRoot, state, ...rest } = options ?? {};
		void navigate(to, { ...rest, state: withNavMode(state, isHistoryRoot ? 'root' : (mode ?? scopeMode)) });
	}, [navigate, scopeMode]);
}
