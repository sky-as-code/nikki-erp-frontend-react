import type { EntitlementRequirementInput } from '../components/PermissionGuard';


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
	/**
	 * Permissions this entry needs, all of which must hold. An entry the caller cannot reach is
	 * rendered locked — greyed with a lock, still clickable — rather than hidden, so the menu does
	 * not silently change shape between users.
	 *
	 * Each is either `{action, resource, scope}` or the literal a refusal would name, e.g.
	 * `read:sales_order:org`. An org-scoped requirement may omit the org; the Shell fills in the
	 * active one.
	 */
	requiredEntitlements?: EntitlementRequirementInput[],
	items?: MenuItem[],
	/**
	 * Ribbon only: the entry takes a column of its own at the left of its block (see
	 * {@link RibbonLinkItem.rowspan}). A traditional menu ignores it.
	 */
	rowspan?: boolean,
};

type MenuContributionBase = {
	/** Micro-app slug; also the `/{orgSlug}/{slug}` URL segment. Registry key. */
	slug: string,
	/** i18n namespace every label and title key in the contribution is resolved against. */
	translationNs: string,
};

/**
 * The traditional menu bar: top-level entries with nested groups. The default when `type` is omitted.
 * It keeps the plain name because every module menu but a ribbon's is one; registry and Shell take
 * {@link AnyMenuContribution}.
 */
export type MenuContribution = MenuContributionBase & {
	type?: 'traditional',
	items: MenuItem[],
};

/** A ribbon entry that navigates. */
export type RibbonLinkItem = {
	labelKey: string,
	link: string,
	/** Same contract as {@link MenuItem.requiredEntitlements}: locked, never hidden. */
	requiredEntitlements?: EntitlementRequirementInput[],
	/**
	 * Takes a column of its own at the left of its block, spanning all its rows, with the label centred.
	 * Several such items keep their declaration order; the rest of the block fills columns after them.
	 */
	rowspan?: boolean,
};

/** A ribbon entry that opens a list of links. */
export type RibbonDropdownItem = {
	labelKey: string,
	items: RibbonLinkItem[],
	/**
	 * Takes a column of its own at the left of its block, spanning all its rows, with the label centred.
	 * Several such items keep their declaration order; the rest of the block fills columns after them.
	 */
	rowspan?: boolean,
};

export type RibbonItem = RibbonLinkItem | RibbonDropdownItem;

/** A titled group of items inside a tab. */
export type RibbonBlock = {
	titleKey: string,
	items: RibbonItem[],
};

export type RibbonTab = {
	labelKey: string,
	blocks: RibbonBlock[],
};

export type RibbonBlockTitlePosition = 'top' | 'bottom';

/** An Office-style ribbon: tabs, each a row of titled blocks of items. */
export type RibbonMenuContribution = MenuContributionBase & {
	type: 'ribbon',
	tabs: RibbonTab[],
	/** Where a block's title sits relative to its items. Defaults to `'bottom'`. */
	blockTitlePosition?: RibbonBlockTitlePosition,
};

/** One micro-app's whole menu, of either type, keyed by the slug the host registered it under. */
export type AnyMenuContribution = MenuContribution | RibbonMenuContribution;

export type MenuRegisterOptions = {
	/** Explicit opt-in to replace an existing contribution for the same slug. */
	override?: boolean,
};

export type MenuRegistryManifest = {
	modules: Array<{ slug: string, translationNs: string, itemCount: number }>,
};

/** Write face, handed to micro-apps through `HostServices`. */
export interface IMenuWriter {
	register(contribution: AnyMenuContribution, opts?: MenuRegisterOptions): void;
	unregister(slug: string): void;
}

/** Read face, used by the Shell's menu bar. */
export interface IMenuReader {
	getMenu(slug?: string | null): AnyMenuContribution | undefined;
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
