import { Badge, Group } from '@mantine/core';
import { useTranslate } from '@nikkierp/ui/i18n';
import { componentAttrs } from '@nikkierp/viewengine/core';
import { IconChevronRight } from '@tabler/icons-react';
import React from 'react';

import { resourceStatusStripPropsSchema } from './resourceStatusStripProps';
import layoutClasses from '../../../components/formBlockLayout.module.css';
import { RESOURCE_DETAIL_STATUS_STRIP } from '../../../ids';
import { useResourceDetailTestAttrs, useResourceDetailTranslationNs } from '../../resourceDetail/ResourceDetailProvider';
import { useResourceUpdateContext } from '../resourceUpdateContext';

import type { ResourceStatusStripProps } from './resourceStatusStripProps';
import type { StatusOption } from '../../resourceDetail/props';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


/**
 * The status flow as the first, full-width row of a `formBlocks` section. The template inserts it
 * there when the page sets `statusPlacement: 'firstSection'`; the header's toolbar then shows none.
 */
export const resourceStatusStripRenderer: IComponentRenderer<ResourceStatusStripProps> = {
	type: RESOURCE_DETAIL_STATUS_STRIP,
	propsSchema: resourceStatusStripPropsSchema,
	render() {
		return <ResourceStatusStrip />;
	},
};

function ResourceStatusStrip(): React.ReactNode {
	const tid = useResourceDetailTestAttrs();
	return (
		<div
			className={layoutClasses.formBlockFullRow}
			{...componentAttrs(RESOURCE_DETAIL_STATUS_STRIP)}
			{...tid('statusStrip')}
		>
			<RecordStatusFlow />
		</div>
	);
}

/** The flow of the page's `allStatuses`, the record's `currentStatus` highlighted. */
export function RecordStatusFlow(): React.ReactNode {
	const { allStatuses, currentStatus, resource } = useResourceUpdateContext();
	const field = currentStatus?.schemaField;
	const status = field ? resource?.[field] : null;
	return <StatusFlow statuses={allStatuses ?? []} current={typeof status === 'string' ? status : null} />;
}

function StatusFlow({ statuses, current }: { statuses: StatusOption[], current?: string | null }): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	if (statuses.length === 0) {
		return null;
	}
	return (
		<Group gap={4} wrap='wrap'>
			{statuses.map((status, idx) => (
				<React.Fragment key={status.value}>
					{idx > 0 ? <IconChevronRight size={14} /> : null}
					<Badge
						variant='filled'
						color={status.value === current ? status.color : 'gray'}
						data-current={status.value === current ? 'true' : undefined}
					>
						{t(status.label)}
					</Badge>
				</React.Fragment>
			))}
		</Group>
	);
}
