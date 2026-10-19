import { EventBus } from '@nikkierp/common/eventBus';
import { useIsAuthenticated } from '@nikkierp/shell/authenticate';
import { ORG_HOME_PATH } from '@nikkierp/shell/constants';
import { routingService } from '@nikkierp/shell/routing';
import {
	saveActiveOrgId, USER_ORGS_CHANGED_EVENT, useActiveOrgId, useMyOrgs, userContextService,
} from '@nikkierp/shell/userContext';
import { dispatchServiceMethod, useServiceLayer } from '@nikkierp/ui/appState/store';
import { FlatSearchableSelect, FlatSearchableSelectProps, SearchableSelectItem } from '@nikkierp/ui/components';
import { useLocaleCollator, useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import React, { useEffect, useMemo } from 'react';

import { sharedStateService } from '../../features/sharedState';


/**
 * The organization list page of the IAM micro-app. The Shell cannot import the identity module, so
 * the path is spelled here: the module's slug, then its page route.
 */
const ORG_LIST_PATH = '/iam/iam_org';

export type OrgSwitchDropdownProps = Pick<FlatSearchableSelectProps, 'dropdownWidth'> & {
	hideIfEmpty: boolean,
};

export function OrgSwitchDropdown(props: OrgSwitchDropdownProps): React.ReactNode {
	const isAuthenticated = useIsAuthenticated();
	const lc = useLocalize();
	const t = useTranslate('common');
	const compareLocalized = useLocaleCollator();
	const activeOrgId = useActiveOrgId();
	const orgs = useMyOrgs();
	const { dispatchMethod: setCurrentOrgId } = useServiceLayer(sharedStateService.setCurrentOrgId);
	useRefetchOrgsOnChange(isAuthenticated);

	// display_name is LangJson, so it is localized rather than rendered directly, then sorted by
	// the text that localization produced.
	const items = useMemo(() => {
		if (!isAuthenticated) return [];
		return orgs
			.map<SearchableSelectItem>((org) => ({
				value: org.id,
				label: lc(org.display_name),
			}))
			.sort((a, b) => compareLocalized(a.label, b.label));
	}, [orgs, isAuthenticated, lc, compareLocalized]);

	/**
	 * Persists the choice, then reloads the whole document onto the org home.
	 *
	 * A soft switch would have to convince every mounted query, cache entry and micro-app that
	 * the org changed. Org scoping is injected deep in the service layer (`withOrgId`) rather
	 * than expressed as a query key, so there is no single cache key to invalidate — a reload is
	 * both the cheaper and the more reliable answer, and switching org is rare.
	 *
	 * Org home rather than the current page: the record being viewed may not exist in the new
	 * org, and the module list is the one page valid in every org.
	 */
	const handleOrgChange = (newOrgId: string) => {
		saveActiveOrgId(newOrgId);
		setCurrentOrgId(newOrgId);
		void routingService.navigateTo({ to: ORG_HOME_PATH, hardNavigate: true });
	};

	const handleManageOrgs = () => {
		void routingService.navigateTo({ to: ORG_LIST_PATH });
	};

	return isAuthenticated && (items.length || !props.hideIfEmpty) && (
		<FlatSearchableSelect
			{...props}
			actionOptionLabel={t('org.manageOrganizations')}
			onActionTrigger={handleManageOrgs}
			searchPlaceholder='Search organization'
			unselectedPlaceholder='Select organization'
			dropdownWidth={props.dropdownWidth}
			items={items}
			value={activeOrgId ?? undefined}
			onChange={handleOrgChange}
			testId='shell.orgSwitch'
		/>
	);
};

/**
 * Refetches the user context, which carries the org list, whenever a micro-app reports an org
 * change. Without it a new org would only appear after a reload.
 */
function useRefetchOrgsOnChange(isAuthenticated: boolean): void {
	useEffect(() => {
		if (!isAuthenticated) return undefined;
		return EventBus.instance?.subscribe(USER_ORGS_CHANGED_EVENT, () => {
			dispatchServiceMethod(userContextService.getUserContext).catch((error: unknown) => {
				console.error('Failed to refetch the organization list', error);
			});
		});
	}, [isAuthenticated]);
}
