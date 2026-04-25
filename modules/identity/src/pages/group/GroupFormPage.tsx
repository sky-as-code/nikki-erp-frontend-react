import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';

import { GroupCreatePageBody } from './GroupCreatePage';
import { GroupDetailPageBody } from './GroupDetailPage';


export type GroupFormVariant = 'create' | 'update';

export function GroupFormPageBody(props: { variant: GroupFormVariant }): React.ReactNode {
	if (props.variant === 'create') {
		return <GroupCreatePageBody />;
	}
	return <GroupDetailPageBody />;
}

export const GroupFormPage = withWindowTitle('Group', GroupFormPageBody);
