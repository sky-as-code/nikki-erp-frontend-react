/**
 * A menu entry as *data*.
 *
 * `labelKey` is an i18n key, not a label: a module registers its menu from `init()`,
 * which runs before any React tree exists and possibly before i18next has loaded the
 * namespace. Translation happens at render time in the Shell, exactly the way page
 * metadata already carries `label: 'action.suspend'`.
 */
export type MenuItem = {
	labelKey: string,
	link?: string,
	/** Reserved for the permission registry; unused today. */
	resource?: string,
	/** Reserved for the permission registry; unused today. */
	actions?: string[],
	items?: MenuItem[],
};

/** One micro-app's whole menu, keyed by the slug the host registered it under. */
export type MenuContribution = {
	/** Micro-app slug; also the `/{orgSlug}/{slug}` URL segment. Registry key. */
	slug: string,
	/** i18n namespace every `labelKey` in `items` is resolved against. */
	translationNs: string,
	items: MenuItem[],
};

export type MenuRegisterOptions = {
	/** Explicit opt-in to replace an existing contribution for the same slug. */
	override?: boolean,
};

export type MenuRegistryManifest = {
	modules: Array<{ slug: string, translationNs: string, itemCount: number }>,
};

/** Write face, handed to micro-apps through `HostServices`. */
export interface IMenuWriter {
	register(contribution: MenuContribution, opts?: MenuRegisterOptions): void;
	unregister(slug: string): void;
}

/** Read face, used by the Shell's menu bar. */
export interface IMenuReader {
	getMenu(slug?: string | null): MenuContribution | undefined;
	subscribe(listener: () => void): () => void;
	describe(): MenuRegistryManifest;
}

export interface IMenuRegistry extends IMenuWriter, IMenuReader {}

/** Thrown when a slug is registered twice without `override: true`. */
export class MenuConflictError extends Error {
	public readonly slug: string;

	constructor(slug: string) {
		super(`A menu is already registered for "${slug}". Pass { override: true } to replace it.`);
		this.name = 'MenuConflictError';
		this.slug = slug;
	}
}
