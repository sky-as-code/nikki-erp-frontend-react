import React from 'react';

import { InvalidProps, UnknownTemplate } from './diagnostics';
import { PageContextProvider } from './PageContext';
import { MetaComponent } from './renderComponent';
import { validateProps } from './validateProps';
import { useViewEngine } from './ViewEngineContext';

import type { RenderResult } from '../core/renderResult';
import type { PageNode } from '../metadata/types';


/**
 * Render a `"type": "page"` metadata node. A page either references a registered
 * `template` (with optional appended `children`) or is fully custom (no
 * `template`, only `children`).
 */
export function MetaPage({ node }: { node: PageNode }): RenderResult {
	const body = node.template
		? <TemplatePage node={node} />
		: <CustomPage node={node} />;
	return (
		<PageContextProvider value={{ templateId: node.template, routePath: node.routePath }}>
			{body}
		</PageContextProvider>
	);
}

function TemplatePage({ node }: { node: PageNode }): RenderResult {
	const engine = useViewEngine();
	const templateId = node.template!;
	const template = engine.getPageTemplate(templateId);

	if (!template) {
		return <UnknownTemplate templateId={templateId} />;
	}

	const parsed = validateProps(template.propsSchema, node.props, templateId);
	if (parsed.issues) {
		return <InvalidProps contributionId={templateId} issues={parsed.issues} kind='page' />;
	}

	const params = template.createProps
		? template.createProps(parsed.value, node.children)
		: parsed.value;

	return template.render(params, {
		routePath: node.routePath,
		childrenNodes: node.children,
		engine,
	});
}

function CustomPage({ node }: { node: PageNode }): React.ReactNode {
	return (
		<div
			className='absolute top-0 left-0 right-0 bottom-0 p-0 m-0 px-4 pb-4 flex flex-col gap-4 overflow-auto'
			// A template-less page has no contribution id to name, so it identifies itself by the
			// route it was defined on. Template pages carry their template id instead.
			data-page={node.routePath}
		>
			<MetaComponent node={node.children ?? []} />
		</div>
	);
}
