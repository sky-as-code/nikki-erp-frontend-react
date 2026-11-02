import { getCurrentOrgId } from '@nikkierp/common/service';

import type { SettingLevel } from './types';


/**
 * The organization an org-level settings call acts for: the one the caller named, else the Shell's
 * current org. Null for the other levels, and when no org is resolved -- the backend then falls
 * back to the org it infers from the token, as it did before `org_id` was accepted.
 *
 * Without it a user in several orgs read and wrote the org their org unit sits in, whichever org
 * the UI was showing.
 */
export async function resolveSettingsOrgId(
	req: { level: SettingLevel, orgId?: string | null },
	currentOrgId: () => Promise<string | null> = getCurrentOrgId,
): Promise<string | null> {
	if (req.level !== 'org') return null;
	if (req.orgId) return req.orgId;
	return currentOrgId();
}
