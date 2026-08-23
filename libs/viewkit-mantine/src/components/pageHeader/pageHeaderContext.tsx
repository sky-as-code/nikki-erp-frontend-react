import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';


/**
 * What a page supplies so `page_header` can resolve its title specs.
 *
 * This is the adapter seam that makes the header reusable: the header knows *which* title to
 * show from its JSON props, and *what to put in it* from whichever page it happens to be
 * rendering inside. A resource page fills in `record` + `modelSchema`; a wizard with no record
 * fills in `titleParams` and nothing else.
 */
export type PageHeaderContextValue = {
	translationNs: string,
	/** Record that `{ schemaField }` title specs read from. Absent on non-resource pages. */
	record?: Record<string, unknown>,
	/** Schema used to format a `schemaField` value and to label `backLinkTitle`. */
	modelSchema?: dyn.ModelSchema,
	/** Interpolation values for `{ textKey }` title specs. */
	titleParams?: Record<string, string>,
	/** `{module}.{component}` prefix for the `data-testid` of the header's own links. */
	testId?: string,
};

const PageHeaderContext = React.createContext<PageHeaderContextValue | null>(null);

export type PageHeaderProviderProps = {
	value: PageHeaderContextValue,
	children: React.ReactNode,
};

export function PageHeaderProvider({ value, children }: PageHeaderProviderProps): React.ReactNode {
	return <PageHeaderContext.Provider value={value}>{children}</PageHeaderContext.Provider>;
}

/**
 * Non-throwing on purpose. A header rendered without a provider is a page that has not been
 * wired up yet; it should render its static parts and leave the dynamic ones blank rather than
 * blank the whole route with an error boundary.
 */
export function usePageHeader(): PageHeaderContextValue | null {
	return React.useContext(PageHeaderContext);
}
