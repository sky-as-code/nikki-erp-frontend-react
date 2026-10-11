/**
 * The update context is deliberately **not** duplicated for v2.
 *
 * The shared view-engine components -- `resourceForm`, `resourceFormColumn`,
 * `resourceDetailHeader` -- are registered once in the kit and render inside both templates. A
 * second `createContext` object would be invisible to them, so v2's provider would sit above
 * consumers reading v1's context and every one of them would throw.
 *
 * v2 still owns its own `ResourceUpdate` and parts; only the context identity is shared.
 */
export {
	ResourceUpdateContext, useResourceUpdateContext,
} from '../resourceDetail/resourceUpdateContext';

export type { ResourceUpdateContextValue } from '../resourceDetail/resourceUpdateContext';
