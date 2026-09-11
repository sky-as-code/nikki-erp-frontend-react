import { componentAttrs } from '@nikkierp/viewengine/core';
import { MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';
import { z } from 'zod';

import { useResourceGenericPageContext } from './resourceGenericPageContext';
import { PageHeader } from '../../components/pageHeader/PageHeader';
import { PageHeaderProvider } from '../../components/pageHeader/pageHeaderContext';
import { pageHeaderPropsSchema } from '../../components/pageHeader/props';
import { RESOURCE_GENERIC_PAGE_HEADER } from '../../ids';

import type { PageHeaderContextValue } from '../../components/pageHeader/pageHeaderContext';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export const genericPageHeaderPropsSchema = pageHeaderPropsSchema;

export type GenericPageHeaderProps = z.infer<typeof genericPageHeaderPropsSchema>;

/**
 * The header of a `resourceGenericPage`.
 *
 * Same three-row layout as the resource-detail header, and it resolves its back link against the
 * page's schema the same way, so an import wizard sits under "< Products" without repeating the
 * resource name. What it does *not* inherit is the action row: a generic page's buttons are its
 * own, so they arrive as child nodes and render in the sticky actions row exactly where the
 * detail page's Update/Save/Cancel would be.
 */
export const genericPageHeaderRenderer: IComponentRenderer<GenericPageHeaderProps> = {
	type: RESOURCE_GENERIC_PAGE_HEADER,
	propsSchema: genericPageHeaderPropsSchema,
	render(props, runtime) {
		return <GenericPageHeader {...props} childrenNodes={runtime.children} />;
	},
};

function GenericPageHeader(
	props: GenericPageHeaderProps & { childrenNodes?: ComponentNode[] },
): React.ReactNode {
	const context = useResourceGenericPageContext();
	const modelSchema = context?.schemaPack?.modelSchema;
	const headerContext = React.useMemo(
		(): PageHeaderContextValue => ({
			translationNs: context?.translationNs ?? '',
			modelSchema,
			titleParams: context?.titleParams,
			testId: context?.testId,
		}),
		[context?.translationNs, modelSchema, context?.titleParams, context?.testId],
	);
	// Held back until the schema resolves, exactly as the detail header does: the link's default
	// label *is* the model's plural label, so rendering it early shows a bare, unlabelled anchor.
	const backLinkTitle = props.backLinkTitle && (modelSchema || props.backLinkTitle.textKey)
		? props.backLinkTitle
		: undefined;
	const children = props.childrenNodes;

	return (
		<PageHeaderProvider value={headerContext}>
			<PageHeader
				{...componentAttrs(RESOURCE_GENERIC_PAGE_HEADER)}
				titleLvl1={props.titleLvl1}
				titleLvl2={props.titleLvl2}
				backLinkTitle={backLinkTitle}
				actions={children?.length ? <MetaComponent node={children} /> : undefined}
			/>
		</PageHeaderProvider>
	);
}
