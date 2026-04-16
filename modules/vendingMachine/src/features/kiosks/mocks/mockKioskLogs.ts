import { KioskLog } from '../types';


export const mockKioskLogs: KioskLog[] = [
	{
		id: '1',
		kioskRef: '1',
		createdAt: '2026-02-05T10:14:00',
		eventType: 'warning',
		payload: 'REDIS :: REDIS_PING_TIMEOUT_5000ms',
	},
	{
		id: '2',
		kioskRef: '1',
		createdAt: '2026-02-05T07:53:00',
		eventType: 'warning',
		payload: 'OUTPUT_DOOR :: Cửa bị mở trong tiến trình mua hàng',
	},
	{
		id: '3',
		kioskRef: '1',
		createdAt: '2026-02-04T17:25:00',
		eventType: 'warning',
		payload: 'OUTPUT_DOOR :: Cửa bị mở trong tiến trình mua hàng',
	},
	{
		id: '4',
		kioskRef: '1',
		createdAt: '2026-01-16T14:35:00',
		eventType: 'warning',
		payload: JSON.stringify({
			code: 'FAILED',
			message: 'NO SUCCESSFUL ITEM',
			data: {
				sessionState: {
					currentState: 'IN_PROGESS',
					currentJob: 'RETURN_HOME',
				},
			},
		}, null, 2),
	},
	{
		id: '5',
		kioskRef: '1',
		createdAt: '2026-01-15T12:41:00',
		eventType: 'warning',
		payload: 'RED_WARNING :: Số lượng sản phẩm tồn trên máng đạt tối đa',
	},
];
