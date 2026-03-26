import { WidgetComponentProps } from '@nikkierp/ui/microApp';


export type WidgetRouteConfig = {
	key: string;
	element?: React.ComponentType<WidgetComponentProps>;
};

export const widgetRoutes: WidgetRouteConfig[] = [];