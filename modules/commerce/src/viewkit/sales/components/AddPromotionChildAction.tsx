import { testAttrs } from '@nikkierp/common/utils';
import { LinkButton } from '@nikkierp/ui/components';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import {
	useActionLock, useOptionalResourceUpdateContext, useResourceBaseHref, useResourceFormView,
} from '@nikkierp/viewkit-mantine';
import React from 'react';
import { z } from 'zod';

import { childCreateHref } from './promotionHelpers';
import { TEST_ID_MODULE, useSalesText } from './salesText';
import {
	SALES_PROMOTION_REWARD_SCHEMA_NAME, SALES_PROMOTION_RULE_SCHEMA_NAME, SALES_PROMOTION_SCHEMA_NAME,
} from '../../../constants/sales';
import { ADD_REWARD_ACTION, ADD_RULE_ACTION } from '../ids';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


type ChildKind = { routePath: string, labelKey: string, testId: string };

type ActionProps = { label?: string };

function rendererFor(type: string, kind: ChildKind): IComponentRenderer<ActionProps> {
	return {
		type,
		propsSchema: z.object({ label: z.string().optional() }).strict(),
		render(props) {
			return (
				<ComponentAnchor id={type}>
					<AddPromotionChildAction kind={kind} label={props.label} />
				</ComponentAnchor>
			);
		},
	};
}

export const addRuleActionRenderer = rendererFor(ADD_RULE_ACTION, {
	routePath: SALES_PROMOTION_RULE_SCHEMA_NAME, labelKey: 'promotion.add_rule', testId: 'addRule',
});
export const addRewardActionRenderer = rendererFor(ADD_REWARD_ACTION, {
	routePath: SALES_PROMOTION_REWARD_SCHEMA_NAME, labelKey: 'promotion.add_reward', testId: 'addReward',
});

/** The child's create page with `promotion_id` pre-filled (`?field_data=`); the backend gate is `update` on it. */
function AddPromotionChildAction({ kind, label }: { kind: ChildKind, label?: string }): React.ReactNode {
	const update = useOptionalResourceUpdateContext();
	const updateMode = useResourceFormView()?.updateMode ?? false;
	const base = useResourceBaseHref(kind.routePath);
	const lock = useActionLock(SALES_PROMOTION_SCHEMA_NAME, 'update');
	const text = useSalesText();
	const promotionId = update?.resource?.id;
	if (typeof promotionId !== 'string' || !base || updateMode) {
		return null;
	}
	return (
		<LinkButton
			to={childCreateHref(base, promotionId)}
			mode='append'
			variant='outline'
			locked={lock.locked}
			lockedMissing={lock.missing}
			{...testAttrs(TEST_ID_MODULE, 'promotionChild', kind.testId)}
		>
			{label ?? text.t(kind.labelKey)}
		</LinkButton>
	);
}
