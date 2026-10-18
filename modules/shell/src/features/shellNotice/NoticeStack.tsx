import { Badge } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import React from 'react';

import { NoticeCard } from './NoticeCard';
import classes from './ShellNotice.module.css';
import { ShellNotice, ShellNoticeType } from './shellNoticeStore';


export const VISIBLE_LAYERS = 3;

export type NoticeStackProps = {
	type: ShellNoticeType,
	notices: readonly ShellNotice[],
	onDismiss: (id: string) => void,
	onPause?: () => void,
	onResume?: () => void,
};

export function NoticeStack({ type, notices, onDismiss, onPause, onResume }: NoticeStackProps): React.ReactNode {
	if (!notices.length) return null;

	const visible = notices.slice(-VISIBLE_LAYERS);
	const hiddenCount = notices.length - visible.length;
	const style = { '--layers': visible.length } as React.CSSProperties;

	return (
		<section
			className={classes.stack}
			style={style}
			// Pointer events cover mouse hover and touch: a touch fires enter on press and leave on lift.
			onPointerEnter={onPause}
			onPointerLeave={onResume}
			{...testAttrs('shell', 'shellNotice', 'stack', type)}
		>
			{visible.map((notice, layer) => (
				<NoticeCard
					key={notice.id}
					notice={notice}
					layer={layer}
					depth={visible.length - 1 - layer}
					onDismiss={onDismiss}
				/>
			))}
			{hiddenCount > 0 && (
				<Badge
					className={classes.hiddenCount}
					size='sm'
					circle={hiddenCount < 10}
					color={type === 'error' ? 'red' : 'blue'}
					{...testAttrs('shell', 'shellNotice', 'hiddenCount', type)}
				>
					+{hiddenCount}
				</Badge>
			)}
		</section>
	);
}
