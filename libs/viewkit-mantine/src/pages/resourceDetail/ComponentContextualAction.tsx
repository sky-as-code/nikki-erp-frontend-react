import { useTranslate } from '@nikkierp/ui/i18n';
import { defineComponent } from '@nikkierp/viewengine/metadata';
import { MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';

import { useResourceDetailTranslationNs } from './ResourceDetailProvider';

import type { ResourceDetailExtraAction } from './props';


/**
 * The `component` variant of a contextual action: the registered component renders in the button's
 * place, given the entry's translated `label`. Shared by the v1 and v2 action bars.
 */
export function ComponentContextualAction({ action }: { action: ResourceDetailExtraAction }): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	const label = t(action.label);
	const node = React.useMemo(
		() => defineComponent({ component: action.component ?? '', props: { label } }),
		[action.component, label],
	);
	return <MetaComponent node={node} />;
}
