import type { IComponentRenderer } from './IComponentRenderer';
import type { ContributionId } from './ids';
import type { FieldRendererFactory, FieldRendererMap, IFieldRenderer } from './IFieldRenderer';
import type { IPageTemplate } from './IPageTemplate';
import type { IViewKit } from './IViewKit';
import type { FieldRendererSpec } from '../metadata/types';


export type RegisterOptions = {
	/**
	 * Explicit opt-in to replace an existing contribution with the same id.
	 * Without it a duplicate id throws -- silent last-write-wins is the single
	 * worst failure mode in a plugin system.
	 */
	override?: boolean,
};

/** The narrow, write-only face handed to `IViewKit.contribute`. */
export interface IViewRegistry {
	registerPageTemplate<TParams>(template: IPageTemplate<TParams>, opts?: RegisterOptions): void;
	registerComponentRenderer<TProps>(renderer: IComponentRenderer<TProps>, opts?: RegisterOptions): void;
	registerFieldRenderer(name: string, factory: FieldRendererFactory<any>, opts?: RegisterOptions): void;
}

/** The read face used by `renderPage` / `renderComponent` / templates. */
export interface IViewResolver {
	getPageTemplate(id: ContributionId): IPageTemplate | undefined;
	getComponentRenderer(type: ContributionId): IComponentRenderer | undefined;
	resolveFieldRenderer(spec: FieldRendererSpec): IFieldRenderer | undefined;
	resolveFieldRenderers(specs?: Record<string, FieldRendererSpec>): FieldRendererMap | undefined;
}

export type ViewEngineManifest = {
	kits: { id: string, version: string }[],
	pageTemplates: ContributionId[],
	componentRenderers: ContributionId[],
	fieldRenderers: string[],
};

export interface IViewEngine extends IViewRegistry, IViewResolver {
	readonly instanceId: string;
	/** Engine API level this instance implements; kits assert against it. */
	readonly apiVersion: number;
	/** Installs a kit. Idempotent per `kit.id` -- a second call is a no-op. */
	use(kit: IViewKit): void;
	/** Introspection for devtools, diagnostics and a future visual page builder. */
	describe(): ViewEngineManifest;
}
