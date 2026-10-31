import { componentAttrs } from '@nikkierp/viewengine/core';
import React from 'react';

import { resourceStatusStripPropsSchema } from './resourceStatusStripProps';
import { StatusStepper } from './statusStepper';
import { formPanelSectionClass } from '../../../components/formPanel/sectionClass';
import { RESOURCE_DETAIL_STATUS_STRIP } from '../../../ids';
import { useResourceDetailTestAttrs } from '../../resourceDetail/ResourceDetailProvider';
import { useResourceUpdateContext } from '../resourceUpdateContext';

import type { ResourceStatusStripProps } from './resourceStatusStripProps';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


/**
 * The status flow as the first, full-width row of a `formBlocks` section (`statusPlacement:
 * 'firstSection'`), or inline as the first section header's right segment (`'firstSectionHeader'`).
 * The template inserts it; the header's toolbar then shows none.
 */
export const resourceStatusStripRenderer: IComponentRenderer<ResourceStatusStripProps> = {
	type: RESOURCE_DETAIL_STATUS_STRIP,
	propsSchema: resourceStatusStripPropsSchema,
	render(props) {
		return <ResourceStatusStrip inline={props.inline} />;
	},
};

function ResourceStatusStrip({ inline }: { inline: boolean }): React.ReactNode {
	const tid = useResourceDetailTestAttrs();
	return (
		<div
			className={inline ? undefined : formPanelSectionClass({ isFluid: false })}
			{...componentAttrs(RESOURCE_DETAIL_STATUS_STRIP)}
			{...tid('statusStrip')}
		>
			<RecordStatusFlow />
		</div>
	);
}

/** The stepper of the page's `allStatuses`, the record's `currentStatus` the current step. */
export function RecordStatusFlow(): React.ReactNode {
	const { allStatuses, currentStatus, resource } = useResourceUpdateContext();
	const field = currentStatus?.schemaField;
	const status = field ? resource?.[field] : null;
	return <StatusStepper statuses={allStatuses ?? []} current={typeof status === 'string' ? status : null} />;
}
