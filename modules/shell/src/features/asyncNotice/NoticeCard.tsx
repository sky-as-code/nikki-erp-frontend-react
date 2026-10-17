import { UnstyledButton } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import { IconX } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import classes from './AsyncNotice.module.css';
import { AsyncNotice } from './asyncNoticeStore';
import { useSwipeDismiss } from './useSwipeDismiss';


export type NoticeCardProps = {
	notice: AsyncNotice,
	/** Position from the oldest visible card; drives the downward peek offset and paint order. */
	layer: number,
	/** Distance from the newest card; drives the shrink of the cards underneath. */
	depth: number,
	onDismiss: (id: string) => void,
};

export function NoticeCard({ notice, layer, depth, onDismiss }: NoticeCardProps): React.ReactNode {
	const translate = useTranslate('common');
	const isTop = depth === 0;
	const dismiss = React.useCallback(() => onDismiss(notice.id), [onDismiss, notice.id]);
	const swipe = useSwipeDismiss(isTop, dismiss);
	const style = {
		'--layer': layer,
		'--depth': depth,
		'--swipe-x': `${swipe.offsetX}px`,
	} as React.CSSProperties;

	return (
		<div
			role={notice.type === 'error' ? 'alert' : 'status'}
			className={clsx(classes.card, isTop && classes.cardTop)}
			style={style}
			data-type={notice.type}
			data-dragging={swipe.isDragging || undefined}
			data-leaving={swipe.isLeaving || undefined}
			{...swipe.handlers}
			{...testAttrs('shell', 'asyncNotice', notice.type, notice.id)}
		>
			{/* Trusted module HTML, see problem shell-001. */}
			<div className={classes.message} dangerouslySetInnerHTML={{ __html: notice.html }} />
			<UnstyledButton
				className={classes.closeButton}
				aria-label={translate('action.close')}
				title={translate('action.close')}
				tabIndex={isTop ? 0 : -1}
				onClick={dismiss}
				{...testAttrs('shell', 'asyncNotice', 'close', notice.id)}
			>
				<IconX size={16} />
			</UnstyledButton>
		</div>
	);
}
