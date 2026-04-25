import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';

import { OrganizationCreatePageBody } from './OrganizationCreatePage';
import { OrganizationDetailPageBody } from './OrganizationDetailPage';


export type OrganizationFormVariant = 'create' | 'update';

export function OrganizationFormPageBody(props: { variant: OrganizationFormVariant }): React.ReactNode {
	if (props.variant === 'create') {
		return <OrganizationCreatePageBody />;
	}
	return <OrganizationDetailPageBody />;
}

export const OrganizationFormPage = withWindowTitle('Organization', OrganizationFormPageBody);
