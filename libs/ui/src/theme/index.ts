export * from './colorScheme';
export * from './SyncedMantineProvider';


/**
 * The surface behind a page's content, as a CSS variable rather than a resolved colour.
 *
 * A colour resolved in JS follows the scheme of the provider it was computed in, and a micro-app's
 * provider used to lag the Shell's; a variable follows the `<html>` attribute, which is always
 * current. Defined for both schemes in the Shell's `nikki.css`.
 */
export function usePaperBgColor(): string {
	return 'var(--nikki-color-page-surface)';
}
