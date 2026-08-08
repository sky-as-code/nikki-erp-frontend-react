import { ReservedVendorError, ViewEngineConflictError } from '../core/errors';
import { RESERVED_VENDOR, vendorOf } from '../core/ids';
import { VIEW_ENGINE_API_VERSION } from '../core/IViewKit';

import type {
	ContributionId, FieldRendererFactory, FieldRendererMap, IComponentRenderer, IFieldRenderer,
	IPageTemplate, IViewEngine, IViewKit, RegisterOptions, ViewEngineManifest, ViewKitContext,
} from '../core';
import type { FieldRendererSpec } from '../metadata/types';


export type ViewEngineOptions = {
	instanceId: string,
	hostInfo?: Readonly<Record<string, unknown>>,
};

/**
 * Host-owned registry of view contributions.
 *
 * This is deliberately an instance, not a module singleton: a separately-built
 * micro-app bundle gets its own copy of this module, so a singleton `Map` here
 * would be invisible to the host. The Shell creates one instance and hands it to
 * every micro-app through `MicroAppBundleInitOptions.host.viewEngine`.
 */
export class ViewEngine implements IViewEngine {
	public readonly instanceId: string;
	public readonly apiVersion = VIEW_ENGINE_API_VERSION;

	readonly #pageTemplates = new Map<ContributionId, IPageTemplate>();
	readonly #componentRenderers = new Map<ContributionId, IComponentRenderer>();
	readonly #fieldRenderers = new Map<string, FieldRendererFactory>();
	readonly #owners = new Map<string, string>();
	readonly #kits = new Map<string, IViewKit>();
	readonly #hostInfo: Readonly<Record<string, unknown>>;

	#currentKitId?: string;

	constructor(opts: ViewEngineOptions) {
		this.instanceId = opts.instanceId;
		this.#hostInfo = opts.hostInfo ?? {};
	}

	public use(kit: IViewKit): void {
		if (this.#kits.has(kit.id)) {
			return;
		}
		if (!kit.engineApiVersions.includes(this.apiVersion)) {
			throw new Error(
				`View kit "${kit.id}" supports engine API [${kit.engineApiVersions.join(', ')}]`
				+ ` but this engine is API ${this.apiVersion}.`,
			);
		}
		const ctx: ViewKitContext = { engineApiVersion: this.apiVersion, hostInfo: this.#hostInfo };
		this.#kits.set(kit.id, kit);
		this.#currentKitId = kit.id;
		try {
			kit.contribute(this, ctx);
		}
		finally {
			this.#currentKitId = undefined;
		}
	}

	public registerPageTemplate<TParams>(template: IPageTemplate<TParams>, opts?: RegisterOptions): void {
		this.#put(this.#pageTemplates, 'Page template', template.id, template as IPageTemplate, opts);
	}

	public registerComponentRenderer<TProps>(renderer: IComponentRenderer<TProps>, opts?: RegisterOptions): void {
		this.#put(this.#componentRenderers, 'Component renderer', renderer.type, renderer as IComponentRenderer, opts);
	}

	public registerFieldRenderer(name: string, factory: FieldRendererFactory<any>, opts?: RegisterOptions): void {
		this.#put(this.#fieldRenderers, 'Field renderer', name, factory, opts);
	}

	public getPageTemplate(id: ContributionId): IPageTemplate | undefined {
		return this.#pageTemplates.get(id);
	}

	public getComponentRenderer(type: ContributionId): IComponentRenderer | undefined {
		return this.#componentRenderers.get(type);
	}

	public resolveFieldRenderer(spec: FieldRendererSpec): IFieldRenderer | undefined {
		return this.#fieldRenderers.get(spec.renderer)?.(spec);
	}

	public resolveFieldRenderers(specs?: Record<string, FieldRendererSpec>): FieldRendererMap | undefined {
		if (!specs) {
			return undefined;
		}
		const result: FieldRendererMap = {};
		for (const [field, spec] of Object.entries(specs)) {
			const renderer = this.resolveFieldRenderer(spec);
			if (renderer) {
				result[field] = renderer;
			}
			else {
				console.warn(`[viewEngine] No field renderer registered for "${spec.renderer}" (field "${field}").`);
			}
		}
		return result;
	}

	public describe(): ViewEngineManifest {
		return {
			kits: [...this.#kits.values()].map(kit => ({ id: kit.id, version: kit.version })),
			pageTemplates: [...this.#pageTemplates.keys()],
			componentRenderers: [...this.#componentRenderers.keys()],
			fieldRenderers: [...this.#fieldRenderers.keys()],
		};
	}

	#put<T>(map: Map<string, T>, kind: string, key: string, value: T, opts?: RegisterOptions): void {
		const existing = map.get(key);
		if (existing && !opts?.override) {
			throw new ViewEngineConflictError(kind, key, this.#owners.get(key));
		}
		this.#assertVendorPolicy(kind, key, existing !== undefined);
		if (existing) {
			console.warn(`[viewEngine] ${kind} "${key}" overridden by "${this.#ownerLabel()}".`);
		}
		map.set(key, value);
		this.#owners.set(key, this.#ownerLabel());
	}

	/**
	 * A third-party kit may *override* a `nikkierp.*` contribution (deliberate
	 * re-skinning) but may never *create* one -- otherwise it could squat an id
	 * a future built-in will want.
	 */
	#assertVendorPolicy(kind: string, key: string, isOverride: boolean): void {
		const kitId = this.#currentKitId;
		if (!kitId) {
			return;
		}
		const kitVendor = vendorOf(kitId);
		const keyVendor = vendorOf(key);
		if (kitVendor === keyVendor) {
			return;
		}
		if (keyVendor === RESERVED_VENDOR && !isOverride) {
			throw new ReservedVendorError(kitId, key);
		}
		console.warn(`[viewEngine] Kit "${kitId}" registered ${kind.toLowerCase()} "${key}" from another vendor.`);
	}

	#ownerLabel(): string {
		return this.#currentKitId ?? '<direct>';
	}
}
