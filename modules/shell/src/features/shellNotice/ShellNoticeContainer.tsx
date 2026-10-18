import { testAttrs } from '@nikkierp/common/utils';
import clsx from 'clsx';
import React from 'react';

import { NoticeStack } from './NoticeStack';
import classes from './ShellNotice.module.css';
import { ShellNoticeStore, shellNoticeStore } from './shellNoticeStore';


export type ShellNoticeContainerProps = {
	store?: ShellNoticeStore,
};

/** Center-top surface for async-action notices; the error stack sits above the info stack. */
export function ShellNoticeContainer({ store = shellNoticeStore }: ShellNoticeContainerProps): React.ReactNode {
	const { info, error } = React.useSyncExternalStore(store.subscribe, store.getSnapshot);
	if (!info.length && !error.length) return null;

	return (
		<div
			className={clsx(
				'pointer-events-none fixed top-4 left-1/2 flex -translate-x-1/2 flex-col gap-3',
				'w-[min(32rem,calc(100vw-2rem))]',
				classes.container,
			)}
			{...testAttrs('shell', 'shellNotice', 'container')}
		>
			<NoticeStack type='error' notices={error} onDismiss={store.dismiss} />
			<NoticeStack
				type='info'
				notices={info}
				onDismiss={store.dismiss}
				onPause={store.pauseInfo}
				onResume={store.resumeInfo}
			/>
		</div>
	);
}
