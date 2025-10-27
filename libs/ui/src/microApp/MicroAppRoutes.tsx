import React from 'react';
import { MemoryRouter, BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';


export type MicroAppRoutesProps = React.PropsWithChildren & {
	/**
	 * If specified, the BrowserRouter will be used to provide URL-based routing
	 */
	basePath?: string;

	/**
	 * The routing path to directly navigate to when this MicroApp is used as a widget.
	 */
	widgetPath?: string;
};

export const MicroAppRoutes: React.FC<MicroAppRoutesProps> = (props) => {
	const Router = props.widgetPath ? MemoryRouter : BrowserRouter;

	if ((!props.widgetPath && !props.basePath) || (props.widgetPath && props.basePath)) {
		throw new Error('Either widgetPath or basePath must be specified, but not both');
	}

	let indexElem: React.ReactNode;
	if (props.widgetPath) {
		indexElem = (
			<Route index element={<Navigate replace to={props.widgetPath} />} />
		);
	}

	return (
		<Router basename={props.basePath}>
			<Routes>
				{indexElem}
				{props.children}
			</Routes>
		</Router>
	);
};