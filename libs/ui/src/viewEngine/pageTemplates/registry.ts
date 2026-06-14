import type { IPageProps } from '../core';
import type { IPageTemplate } from './IPageTemplate';


export const RESOURCE_LIST_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceList.v1';
export const RESOURCE_DETAIL_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceDetails.v1';
export const RESOURCE_SPLIT_VIEW_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceSplitView.v1';

const pageTemplateRegistry = new Map<string, IPageTemplate<IPageProps>>();

export function registerPageTemplate<TProps extends IPageProps>(template: IPageTemplate<TProps>): void {
	pageTemplateRegistry.set(template.id, template as IPageTemplate<IPageProps>);
}

export function getPageTemplate(id: string): IPageTemplate<IPageProps> | undefined {
	return pageTemplateRegistry.get(id);
}
