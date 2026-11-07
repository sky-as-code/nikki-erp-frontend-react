import { defineComponent } from '@nikkierp/viewengine/metadata';

import { ACTION_DIALOGS, BOM_STRUCTURE } from './ids';

import type { ActionDialogsProps } from './components/actionTypes';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/** The record's actions, each a button and, when it needs input, a dialog. React-free for page metadata. */
export function actionDialogsNode(props: ActionDialogsProps): ComponentNode {
	return defineComponent({ component: ACTION_DIALOGS, props });
}

/** A BoM's components and operations with their Configure editors; reads the record from the detail page. */
export function bomStructureNode(): ComponentNode {
	return defineComponent({ component: BOM_STRUCTURE });
}

export * from './ids';
