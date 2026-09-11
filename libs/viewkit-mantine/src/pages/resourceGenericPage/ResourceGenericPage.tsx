import { useDynamicModel } from '@nikkierp/ui/hookhoc';
import { defineComponent } from '@nikkierp/viewengine/metadata';
import { MetaComponent, usePageContext } from '@nikkierp/viewengine/render';
import React from 'react';

import { ResourceGenericPageProvider } from './resourceGenericPageContext';
import { PageContainer } from '../../components/PageContainer';
import { RESOURCE_GENERIC_PAGE_HEADER } from '../../ids';
import { resourceTestIdPrefix } from '../../testIds';

import type { ResourceGenericPageProps } from './props';
import type { ResourceGenericPageContextValue } from './resourceGenericPageContext';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export type ResourceGenericPageViewProps = {
	/** Validated page params, passed as-is from the page metadata. */
	params: ResourceGenericPageProps,
	/** Body of the page, below the header. */
	childrenNodes?: ComponentNode[],
	/** Rendered in the header's actions row. */
	actionNodes?: ComponentNode[],
	/** View-engine page segment (e.g. `product_templates/import`). */
	routePath?: string,
	/** Test-id `part` this page contributes, e.g. `Import`. */
	part?: Parameters<typeof resourceTestIdPrefix>[0]['part'],
};

/**
 * The shell for a page that belongs to one resource without being its CRUD form.
 *
 * Structurally the resource-detail page minus the record: it loads the same schema pack, renders
 * the same `PageContainer`, and builds its subtree from a node tree through the component
 * registry — but it opens no update context and issues no commands, because a generic page owns
 * whatever it does. The header's action row comes from `actionNodes` rather than from a command
 * set, which is the one seam the detail page cannot offer.
 */
export const ResourceGenericPage = React.memo(ResourceGenericPageView);

function ResourceGenericPageView({
	params, childrenNodes, actionNodes, routePath, part,
}: ResourceGenericPageViewProps): React.ReactNode {
	const pack = useDynamicModel(params.schemaName);
	const pageRoutePath = usePageContext()?.routePath ?? routePath;
	const testId = resourceTestIdPrefix({
		testId: params.testId,
		routePath: pageRoutePath,
		schemaName: params.schemaName,
		part: part ?? 'Detail',
	});
	const value = React.useMemo(
		(): ResourceGenericPageContextValue => ({
			translationNs: params.translationNs,
			schemaPack: pack,
			titleParams: params.titleParams,
			testId,
		}),
		[params.translationNs, pack, params.titleParams, testId],
	);
	const nodes = React.useMemo(
		() => buildGenericPageNodes(params, childrenNodes, actionNodes),
		[params, childrenNodes, actionNodes],
	);

	return (
		<ResourceGenericPageProvider value={value}>
			<PageContainer>
				<MetaComponent node={nodes} />
			</PageContainer>
		</ResourceGenericPageProvider>
	);
}

function buildGenericPageNodes(
	params: ResourceGenericPageProps,
	childrenNodes: ComponentNode[] | undefined,
	actionNodes: ComponentNode[] | undefined,
): ComponentNode[] {
	return [
		defineComponent({
			component: RESOURCE_GENERIC_PAGE_HEADER,
			props: {
				titleLvl1: params.titleLvl1,
				titleLvl2: params.titleLvl2,
				backLinkTitle: params.backLinkTitle,
			},
			children: actionNodes,
		}),
		...(childrenNodes ?? []),
	];
}
