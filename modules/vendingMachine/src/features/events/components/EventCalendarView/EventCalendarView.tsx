import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Divider, Text } from '@mantine/core';
import { Box, Group } from '@mantine/core';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Event } from '../../types';





export interface EventCalendarViewProps {
	events: Event[];
	isLoading?: boolean;
	onViewDetail: (eventId: string) => void;
	onEdit?: (eventId: string) => void;
	onDelete?: (eventId: string) => void;
}

function renderEventContent(eventInfo: any) {
	const event = eventInfo.event || eventInfo;
	const startTime = event.start ? dayjs(event.start).format('HH:mm') : '';
	return (
		<Group p='xs'>
			<Text>{startTime && <b>{startTime}</b>}</Text>
			<Divider orientation='vertical' />
			<Text>{event.title}</Text>
		</Group>
	);
}

function renderAllDayContent(allDayContentInfo: any) {
	return (
		<>
			<i>{allDayContentInfo.title}</i>
		</>
	);
}

export const EventCalendarView: React.FC<EventCalendarViewProps> = ({
	events,
	isLoading: _isLoading,
	onViewDetail,
	onEdit: _onEdit,
	onDelete: _onDelete,
}) => {
	const { t: translate } = useTranslation();

	const eventsData = useMemo(() => events.map((event) => {
		return {
			id: event.id,
			start: new Date(event.startDate),
			end: new Date(event.endDate),
			title: event.name,
		};
	}), [events]);

	const handleEventClick = (clickInfo: any) => {
		if (onViewDetail && clickInfo.event.id) {
			onViewDetail(clickInfo.event.id);
		}
	};

	const buttonText = useMemo(() => ({
		today: translate('nikki.general.actions.today') || 'Today',
		month: translate('nikki.vendingMachine.events.calendar.view.month') || 'Month',
		week: translate('nikki.vendingMachine.events.calendar.view.week') || 'Week',
		day: translate('nikki.vendingMachine.events.calendar.view.day') || 'Day',
		list: translate('nikki.vendingMachine.events.calendar.view.list') || 'List',
	}), [translate]);

	return (
		<>
			<Box h={700}>
				<FullCalendar
					plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
					initialView='dayGridMonth'
					headerToolbar={{
						left: 'prev,next today',
						center: 'title',
						right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
					}}
					buttonText={buttonText}
					events={eventsData}
					eventContent={renderEventContent}
					allDayContent={renderAllDayContent}
					eventClick={handleEventClick}
					dragScroll
					height='100%'
					expandRows={true}
					weekends={true}
				/>
			</Box>
		</>
	);
};
