/**
 * Strong-typing contract for page props. Every page-props class implements this
 * and exposes a public readonly `params` that is passed as-is to the page
 * component. React re-renders the page only when this `params` reference changes.
 */
export interface IPageProps<TParams = unknown> {
	readonly params: TParams;
}
