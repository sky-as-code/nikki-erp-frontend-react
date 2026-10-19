import { Alert } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import { useResourceUpdateContext } from '@nikkierp/viewkit-mantine';
import React, { useEffect } from 'react';
import { z } from 'zod';

import { IAM_MODULE } from '../../constants';
import { reportOrgStatus } from '../../features/organization/orgService';
import { ORG_LIFECYCLE_STATUS } from '../ids';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


const TEST_ID_PREFIX = 'identity.orgLifecycleStatus';

/**
 * How often an org still being set up or removed is re-read. The backend gives no push for it, and
 * a module usually answers within seconds.
 */
const POLL_INTERVAL_MS = 3000;

export const orgLifecycleStatusRenderer: IComponentRenderer<Record<string, never>> = {
	type: ORG_LIFECYCLE_STATUS,
	propsSchema: z.object({}).strict(),
	render() {
		return (
			<ComponentAnchor id={ORG_LIFECYCLE_STATUS}>
				<OrgLifecycleStatus />
			</ComponentAnchor>
		);
	},
};

/**
 * The org's lifecycle as the backend reports it: a hint while modules are setting it up or
 * cleaning it up, the translated reason when one of them failed. Renders nothing for a ready org.
 */
function OrgLifecycleStatus(): React.ReactNode {
	const t = useTranslate([IAM_MODULE, 'common']);
	const { resource, refresh } = useResourceUpdateContext();
	const status = resource?.status as string | undefined;
	const messageKey = resource?.status_message as string | undefined;
	const messageVars = (resource?.status_message_vars ?? {}) as Record<string, unknown>;
	const isPending = (status === 'provisioning' || status === 'deleted') && !messageKey;

	const orgId = resource?.id as string | undefined;
	useEffect(() => reportOrgStatus(orgId, status), [orgId, status]);

	useEffect(() => {
		if (!isPending) return undefined;
		const timer = window.setInterval(refresh, POLL_INTERVAL_MS);
		return () => window.clearInterval(timer);
	}, [isPending, refresh]);

	if (messageKey) {
		return (
			<Alert variant='light' color='red' mb='sm' {...testAttrs(TEST_ID_PREFIX, 'failure')}>
				{t(messageKey, { ...messageVars, defaultValue: messageKey })}
			</Alert>
		);
	}
	if (isPending) {
		const hintKey = status === 'provisioning' ? 'org_status.provisioning_hint' : 'org_status.deleting_hint';
		return (
			<Alert variant='light' color='yellow' mb='sm' {...testAttrs(TEST_ID_PREFIX, 'pending')}>
				{t(hintKey)}
			</Alert>
		);
	}
	return null;
}
