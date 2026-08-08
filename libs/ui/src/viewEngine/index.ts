/**
 * @deprecated The view engine no longer lives in `@nikkierp/ui`.
 *
 * - Engine, metadata types and registries -> `@nikkierp/viewengine`
 * - Built-in Mantine templates / renderers / prop builders -> `@nikkierp/viewkit-mantine`
 * - Generic table plumbing -> `@nikkierp/ui/components/DataTable`
 *
 * This shim exists only to keep downstream packages compiling across the
 * migration and re-exports types and pure values *only*: it registers nothing.
 * It must never re-export from a view kit -- `@nikkierp/ui` sits *below* every
 * kit in the dependency graph, and importing one here would create a cycle.
 *
 * The old `registerPageTemplate` / `getPageTemplate` / `registerComponentRenderer`
 * / `getComponentRenderer` / `registerFieldRenderer` / `resolveFieldRendererMap`
 * functions are deliberately NOT re-exported. They wrote into module-level
 * singletons; re-exporting them would let code keep compiling while registering
 * into a `Map` the host never reads -- a silent runtime failure, which is worse
 * than a build error. The class-based props (`ResourceListTemplateProps` and
 * friends) are gone by design: props are plain JSON now.
 */
export type {
	ComponentNode, MetadataNode, PageNode, TemplateRef, FieldRendererSpec,
	ConditionExpression, ConditionOperator,
} from '@nikkierp/viewengine/metadata';
export { compilePage, evaluateCondition, definePage, defineComponent } from '@nikkierp/viewengine/metadata';

export type {
	IComponentRenderer, IPageTemplate, IViewEngine, IViewKit, IViewRegistry, IViewResolver,
	IFieldRenderer, FieldRendererMap, RenderResult,
} from '@nikkierp/viewengine/core';

export { MetaComponent, MetaPage, useViewEngine, useFieldRenderers } from '@nikkierp/viewengine/render';
