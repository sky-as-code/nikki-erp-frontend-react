import React from 'react';

import { AssignedKioskList, AssignedKioskListProps } from '@/components/AssignKiosks';


/** Wrapper cho màn chi tiết sự kiện — dùng copy i18n của events. */
export type EventKioskListProps = AssignedKioskListProps;

export const EventKioskList: React.FC<EventKioskListProps> = ({ translationKeys, ...rest }) => (
	<AssignedKioskList
		{...rest}
		translationKeys={{
			addKiosks: 'nikki.vendingMachine.events.selectKiosks.addKiosks',
			empty: 'nikki.vendingMachine.events.messages.no_kiosks',
			...translationKeys,
		}}
	/>
);
