import type { ContributionId } from './ids';


/**
 * DOM attributes that make a rendered page self-describing: every element the view engine
 * produces names the contribution that produced it, and every button that publishes to the
 * command bus names the command it will publish.
 *
 * These are for tooling — end-to-end tests, screenshot diffing, debugging a page whose metadata
 * lives in a different package than its renderer. They are deliberately plain objects with no
 * React dependency, so `libs/ui` can use them too (it may import `./core`, but not the engine
 * barrel, which exposes `defaultViewEngine`).
 *
 * Attaching them is each renderer's own job rather than the render pipeline's: several renderers
 * root in a context provider that emits no DOM at all, so there is no element for a wrapper at
 * `renderComponent.tsx` to attach to without inserting one into every node's layout.
 */
export type ComponentAttributes = { 'data-component': ContributionId };
export type PageAttributes = { 'data-page': ContributionId };
export type CommandAttributes = { 'data-command'?: string };

/** Spread onto a component renderer's root DOM element. */
export function componentAttrs(id: ContributionId): ComponentAttributes {
	return { 'data-component': id };
}

/** Spread onto a page template's root DOM element. */
export function pageAttrs(id: ContributionId): PageAttributes {
	return { 'data-page': id };
}

/**
 * Spread onto a button that publishes to the command bus. Emits nothing when there is no command,
 * so a button that only navigates never carries an empty attribute.
 */
export function commandAttrs(command: string | undefined): CommandAttributes {
	return command ? { 'data-command': command } : {};
}
