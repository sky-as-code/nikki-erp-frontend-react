import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';

import { HierarchyCreatePageBody } from './HierarchyCreatePage';
import { HierarchyDetailPageBody } from './HierarchyDetailPage';


export type OrgUnitFormVariant = 'create' | 'update';

export function OrgUnitFormPageBody(props: { variant: OrgUnitFormVariant }): React.ReactNode {
	if (props.variant === 'create') {
		return <HierarchyCreatePageBody />;
	}
	return <HierarchyDetailPageBody />;
}

export const OrgUnitFormPage = withWindowTitle('Org Unit', OrgUnitFormPageBody);
