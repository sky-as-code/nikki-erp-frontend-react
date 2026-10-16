/**
 * The React-free half of the action locks: what a page test needs to check that every action it
 * declares can be gated, without loading the component tree.
 */
export {
	actionRequirement, commandActionCode, resolveActionCode, StandardActionCode,
} from './permissions/actionEntitlements';
export { findUngatedActions } from './permissions/ungatedActions';
export type { UngatedAction } from './permissions/ungatedActions';
export { pageReadRequirements } from './permissions/pageRead';
