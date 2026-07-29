import React from 'react';

import { InvalidProps, UnknownTemplate } from './diagnostics';
import { validateProps } from './validateProps';

import type { PageRenderRuntime, RenderResult } from '../core';
import type { TemplateRef } from '../metadata/types';


/**
 * Renders a nested template invocation carried inside another template's props.
 *
 * This is what turns split-view from a special case into ordinary composition:
 * the outer template resolves whatever template the ref names through the same
 * engine, so a third party can put their list template in our split view's
 * primary pane.
 */
export function renderTemplateRef(
	ref: TemplateRef | undefined,
	runtime: PageRenderRuntime,
): RenderResult {
	if (!ref) {
		return null;
	}
	const template = runtime.engine.getPageTemplate(ref.template);
	if (!template) {
		return <UnknownTemplate templateId={ref.template} />;
	}

	const parsed = validateProps(template.propsSchema, ref.props, ref.template);
	if (parsed.issues) {
		return <InvalidProps contributionId={ref.template} issues={parsed.issues} />;
	}

	const params = template.createProps ? template.createProps(parsed.value) : parsed.value;
	return template.render(params, runtime);
}
