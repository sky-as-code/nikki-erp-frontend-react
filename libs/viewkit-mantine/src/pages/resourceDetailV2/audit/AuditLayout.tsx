import { useMediaQuery } from '@mantine/hooks';
import { Modal } from '@nikkierp/ui/components';
import { useMeasuredWidth } from '@nikkierp/ui/components/ExcelDataTable';
import { componentAttrs } from '@nikkierp/viewengine/core';
import { MetaComponent } from '@nikkierp/viewengine/render';
import clsx from 'clsx';
import React from 'react';
import { z } from 'zod';

import classes from './AuditLayout.module.css';
import { AuditPanel } from './AuditPanel';
import { RESOURCE_DETAIL_AUDIT_LAYOUT } from '../../../ids';
import { useResourceUpdateContext } from '../resourceUpdateContext';

import type { ComponentRenderRuntime, IComponentRenderer } from '@nikkierp/viewengine/core';


/** Matches the `width` transition in `AuditLayout.module.css`. */
export const AUDIT_PANEL_TRANSITION_MS = 200;

/** Below this body width (56rem) the panel opens as a full-screen dialog rather than beside the sections. */
export const NARROW_WIDTH_PX = 896;
const NARROW_MEDIA_QUERY = '(max-width: 56em)';

export const auditLayoutPropsSchema = z.object({}).strict();

export type AuditLayoutProps = z.infer<typeof auditLayoutPropsSchema>;

/**
 * The detail page's body: its sections in a left parent, full width while the Audit panel is closed,
 * and the panel in a right parent that opens beside them. In a narrow body (a split view's pane, a
 * phone) the panel opens as a full-screen dialog instead, closed by its own X.
 */
export const auditLayoutRenderer: IComponentRenderer<AuditLayoutProps> = {
	type: RESOURCE_DETAIL_AUDIT_LAYOUT,
	propsSchema: auditLayoutPropsSchema,
	render(_props, runtime) {
		return <AuditLayout runtime={runtime} />;
	},
};

function AuditLayout({ runtime }: { runtime: ComponentRenderRuntime }): React.ReactNode {
	const { auditOpen = false, setAuditOpen, setAfterSectionsSlot } = useResourceUpdateContext();
	const { ref, narrow } = useNarrowLayout();
	const panel = usePanelTransition(auditOpen && !narrow, AUDIT_PANEL_TRANSITION_MS);
	const onClose = React.useCallback(() => setAuditOpen?.(false), [setAuditOpen]);
	return (
		<div ref={ref} {...componentAttrs(RESOURCE_DETAIL_AUDIT_LAYOUT)}>
			<div className={classes.layout}>
				<div className={classes.left}>
					<MetaComponent node={runtime.children} />
					<div ref={setAfterSectionsSlot} />
				</div>
				{panel.mounted ? (
					<div className={clsx(classes.right, { [classes.rightShown]: panel.shown })}>
						<div className={classes.rightInner}><AuditPanel onClose={onClose} /></div>
					</div>
				) : null}
			</div>
			{narrow ? (
				<Modal opened={auditOpen} onClose={onClose} fullScreen withCloseButton={false} padding='md'>
					<AuditPanel onClose={onClose} bare />
				</Modal>
			) : null}
		</div>
	);
}

/**
 * Whether the body is too narrow for the panel beside the sections (a phone, a split view's pane):
 * the panel then opens as a full-screen dialog. Measured, falling back to the viewport until the
 * first reading and where `ResizeObserver` does not exist.
 */
function useNarrowLayout(): { ref: React.RefCallback<HTMLElement>, narrow: boolean } {
	const [width, setWidth] = React.useState<number | null>(null);
	const measuredRef = useMeasuredWidth(setWidth);
	const ref = React.useCallback((element: HTMLElement | null) => {
		if (typeof ResizeObserver !== 'undefined') {
			measuredRef(element);
		}
	}, [measuredRef]);
	const narrowViewport = useMediaQuery(NARROW_MEDIA_QUERY, false, { getInitialValueInEffect: false }) ?? false;
	const narrow = width === null || width === 0 ? narrowViewport : width < NARROW_WIDTH_PX;
	return { ref, narrow };
}

/**
 * Keeps the panel mounted through its closing transition, and mounts it collapsed for two frames
 * before showing it, so opening animates from zero width instead of appearing at full width.
 */
export function usePanelTransition(open: boolean, durationMs: number): { mounted: boolean, shown: boolean } {
	const [mounted, setMounted] = React.useState(open);
	const [shown, setShown] = React.useState(open);
	React.useEffect(() => {
		if (!open) {
			setShown(false);
			const timer = setTimeout(() => setMounted(false), durationMs);
			return () => clearTimeout(timer);
		}
		setMounted(true);
		let inner = 0;
		const outer = requestAnimationFrame(() => {
			inner = requestAnimationFrame(() => setShown(true));
		});
		return () => {
			cancelAnimationFrame(outer);
			cancelAnimationFrame(inner);
		};
	}, [open, durationMs]);
	return { mounted, shown };
}
