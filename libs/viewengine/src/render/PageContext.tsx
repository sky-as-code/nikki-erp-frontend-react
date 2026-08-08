import React from 'react';


/**
 * Shared context that every page template wraps its subtree with. Component
 * renderers read it to validate they are mounted inside a page.
 */
export type PageContextValue = {
	templateId?: string,
	routePath?: string,
};

const PageContext = React.createContext<PageContextValue | null>(null);

export type PageContextProviderProps = {
	value: PageContextValue,
	children: React.ReactNode,
};

export function PageContextProvider({ value, children }: PageContextProviderProps): React.ReactNode {
	return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}

export function usePageContext(): PageContextValue | null {
	return React.useContext(PageContext);
}

/** Guards against a malformed metadata tree blowing the stack. */
export const MAX_COMPONENT_DEPTH = 32;

const ComponentDepthContext = React.createContext(0);

export function useComponentDepth(): number {
	return React.useContext(ComponentDepthContext);
}

export function ComponentDepthProvider({ depth, children }: {
	depth: number,
	children: React.ReactNode,
}): React.ReactNode {
	return <ComponentDepthContext.Provider value={depth}>{children}</ComponentDepthContext.Provider>;
}
