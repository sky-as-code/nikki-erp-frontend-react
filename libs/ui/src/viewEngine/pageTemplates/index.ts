export type { IPageTemplate, PageRenderRuntime } from './IPageTemplate';
export {
	getPageTemplate, registerPageTemplate, RESOURCE_DETAIL_TEMPLATE, RESOURCE_LIST_TEMPLATE,
	RESOURCE_SPLIT_VIEW_TEMPLATE,
} from './registry';
import './registerPageTemplates';
