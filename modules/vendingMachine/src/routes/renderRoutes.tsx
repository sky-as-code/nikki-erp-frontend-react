import { PermissionScope, useHasPermission } from '@nikkierp/shell/userContext';
import { Unauthorized } from '@nikkierp/ui/components';
import { AppRoute, WidgetRoute } from '@nikkierp/ui/microApp';
import React from 'react';

import type { AppRouteConfig } from './appRoutes';
import type { WidgetRouteConfig } from './widgetRoutes';


export function renderAppRoutes(routes: AppRouteConfig[], contextScope?: PermissionScope): React.ReactNode {
	return routes.map((route) => {
		const { key, path, element, index, children, resource, action } = route;

		// * check permission
		const hasPermission = resource && action ? useHasPermission(resource, action, contextScope) : true;
		if (!hasPermission) return <AppRoute key={key} path={path ?? ''} element={<Unauthorized />} />;

		return ( index ?
			<AppRoute key={key} index element={element} /> :
			<AppRoute key={key} path={path ?? ''} element={element ?? <></>}>
				{children && renderAppRoutes(children)}
			</AppRoute>
		);
	});
}


export function renderWidgetRoutes(routes: WidgetRouteConfig[], _contextScope?: PermissionScope): React.ReactNode {
	return routes.map((route) => {
		const { key, element } = route;
		return (
			<WidgetRoute key={key} name={key} Component={element ?? (() => <></>)} />
		);
	});
}