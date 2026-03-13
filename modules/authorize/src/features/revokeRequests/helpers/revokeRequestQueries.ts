/**
 * Helper functions to build graph queries for revoke request filtering
 */
import { ReceiverType } from '@/features/grantRequests/types';


export function buildRolesByReceiverQuery(
	receiverId: string,
	receiverType: ReceiverType,
): Record<string, unknown> {
	return {
		and: [
			{ if: ['role_users.receiver_type', '=', receiverType] },
			{ if: ['role_users.receiver_ref', '=', receiverId] },
		],
		order: [['id', 'asc']],
	};
}

export function buildRoleSuitesByReceiverQuery(
	receiverId: string,
	receiverType: ReceiverType,
): Record<string, unknown> {
	return {
		and: [
			{ if: ['rolesuite_users.receiver_type', '=', receiverType] },
			{ if: ['rolesuite_users.receiver_ref', '=', receiverId] },
		],
		order: [['id', 'asc']],
	};
}

/**
 * Query users that have a specific role
 * Uses role_users relationship from identity module
 * Filters by receiver_type = 'user'
 */
export function buildUsersByRoleQuery(roleId: string): Record<string, unknown> {
	return {
		and: [
			{ if: ['role_users.role_id', '=', roleId] },
			{ if: ['role_users.receiver_type', '=', 'user'] },
		],
		order: [['id', 'asc']],
	};
}

/**
 * Query groups that have a specific role
 * Uses role_users relationship from identity module
 * Filters by receiver_type = 'group'
 */
export function buildGroupsByRoleQuery(roleId: string): Record<string, unknown> {
	return {
		and: [
			{ if: ['role_users.role_id', '=', roleId] },
			{ if: ['role_users.receiver_type', '=', 'group'] },
		],
		order: [['id', 'asc']],
	};
}

/**
 * Query users that have a specific role suite
 * Uses role_suite_users relationship from identity module
 * Filters by receiver_type = 'user'
 */
export function buildUsersByRoleSuiteQuery(suiteId: string): Record<string, unknown> {
	return {
		and: [
			{ if: ['role_suite_users.role_suite_id', '=', suiteId] },
			{ if: ['role_suite_users.receiver_type', '=', 'user'] },
		],
		order: [['id', 'asc']],
	};
}

/**
 * Query groups that have a specific role suite
 * Uses role_suite_users relationship from identity module
 * Filters by receiver_type = 'group'
 */
export function buildGroupsByRoleSuiteQuery(suiteId: string): Record<string, unknown> {
	return {
		and: [
			{ if: ['role_suite_users.role_suite_id', '=', suiteId] },
			{ if: ['role_suite_users.receiver_type', '=', 'group'] },
		],
		order: [['id', 'asc']],
	};
}

