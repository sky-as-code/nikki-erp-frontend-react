import { componentAttrs } from '@nikkierp/viewengine/core';
import React from 'react';
import { z } from 'zod';

import { RESOURCE_DETAIL_HEADER } from '../ids';
import { PageHeader } from './pageHeader/PageHeader';
import { PageHeaderProvider } from './pageHeader/pageHeaderContext';
import { linkSpecSchema, schemaFieldSpecSchema } from '../pages/resourceDetail/props';
import { useResourceDetailContext } from '../pages/resourceDetail/ResourceDetailProvider';
import { useResourceUpdateContext } from '../pages/resourceDetail/resourceUpdateContext';
import { CreateActionButton } from '../pages/resourceDetail/resourceUpdateParts';
import { SplitPaneCloseButton } from '../pages/resourceDetail/SplitPaneCloseButton';

import type { PageHeaderContextValue } from './pageHeader/pageHeaderContext';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const resourceDetailHeaderPropsSchema = z.object({
	titleLvl1: schemaFieldSpecSchema.optional(),
	titleLvl2: schemaFieldSpecSchema.optional(),
	titleLvl3: linkSpecSchema.optional(),
}).strict();

export type ResourceDetailHeaderProps = z.infer<typeof resourceDetailHeaderPropsSchema>;

/**
 * The resource-detail flavour of {@link PageHeader}.
 *
 * All this adds is the adapter: it feeds the generic header the fetched record and model schema,
 * and supplies the two buttons that only make sense on a resource page. Create and Close stay
 * here rather than moving into the generic header because both read resource-detail contexts
 * that a plain page has no reason to provide.
 */
export const resourceDetailHeaderRenderer: IComponentRenderer<ResourceDetailHeaderProps> = {
	type: RESOURCE_DETAIL_HEADER,
	propsSchema: resourceDetailHeaderPropsSchema,
	render(props) {
		return <ResourceDetailHeader {...props} />;
	},
};

function ResourceDetailHeader(props: ResourceDetailHeaderProps): React.ReactNode {
	const { schemaPack, translationNs } = useResourceDetailContext();
	const context = useResourceUpdateContext();
	const modelSchema = schemaPack?.modelSchema;
	const headerContext = React.useMemo(
		(): PageHeaderContextValue => ({ translationNs, record: context.resource, modelSchema }),
		[translationNs, context.resource, modelSchema],
	);
	// Title overrides fall back to the values held in the resource-update context.
	const titleLvl3 = props.titleLvl3 ?? context.titleLvl3;

	return (
		<PageHeaderProvider value={headerContext}>
			<PageHeader
				{...componentAttrs(RESOURCE_DETAIL_HEADER)}
				titleLvl1={props.titleLvl1 ?? context.titleLvl1}
				titleLvl2={props.titleLvl2 ?? context.titleLvl2}
				titleLvl3={titleLvl3 && modelSchema ? { linkHref: titleLvl3.linkHref } : undefined}
				actions={context.commands.create
					? <CreateActionButton disabled={context.isReading || context.isWriting} />
					: null}
				trailing={<SplitPaneCloseButton />}
			/>
		</PageHeaderProvider>
	);
}
