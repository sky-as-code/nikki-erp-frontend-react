import React from 'react';

import { InvalidProps, UnknownComponent } from './diagnostics';
import { ComponentDepthProvider, MAX_COMPONENT_DEPTH, useComponentDepth, usePageContext } from './PageContext';
import { validateProps } from './validateProps';
import { useViewEngine } from './ViewEngineContext';

import type { ComponentNode } from '../metadata/types';


export type MetaComponentProps = {
	node: ComponentNode | ComponentNode[] | undefined,
};

/**
 * Render one or more `"type": "component"` metadata nodes. Each component is
 * validated to be inside a page via the page context; its props are validated
 * against the renderer's own schema before the renderer runs.
 */
export function MetaComponent({ node }: MetaComponentProps): React.ReactNode {
	if (!node) {
		return null;
	}
	if (Array.isArray(node)) {
		if (node.length === 0) {
			return null;
		}
		return (
			<>
				{node.map((item, index) => <SingleComponent key={index} node={item} />)}
			</>
		);
	}
	return <SingleComponent node={node} />;
}

/**
 * Split out from {@link MetaComponent} so hooks run unconditionally: the public
 * entry point returns early for arrays and empty nodes, and a hook must not sit
 * behind those branches.
 */
function SingleComponent({ node }: { node: ComponentNode }): React.ReactNode {
	const engine = useViewEngine();
	const page = usePageContext();
	const depth = useComponentDepth();

	if (!page) {
		console.warn(`Component "${node.component}" rendered outside a page; skipped.`);
		return null;
	}
	if (depth >= MAX_COMPONENT_DEPTH) {
		console.error(`Component tree exceeded ${MAX_COMPONENT_DEPTH} levels at "${node.component}"; skipped.`);
		return null;
	}

	const renderer = engine.getComponentRenderer(node.component);
	if (!renderer) {
		console.warn(`No component renderer registered for "${node.component}".`);
		return <UnknownComponent type={node.component} />;
	}

	let props: unknown = node.props ?? {};
	if (renderer.propsSchema) {
		const parsed = validateProps(renderer.propsSchema, props, node.component);
		if (parsed.issues) {
			return <InvalidProps contributionId={node.component} issues={parsed.issues} />;
		}
		props = parsed.value;
	}

	return (
		<ComponentDepthProvider depth={depth + 1}>
			{renderer.render(props, { children: node.children, engine })}
		</ComponentDepthProvider>
	);
}
