import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ModuleRoutes from './routes';


class NikkiMicroApp extends HTMLElement {
	connectedCallback() {
		if (this.shadowRoot) return; // avoid re-mount
		// const root = this.attachShadow({ mode: 'open' });
		// const root = this;
		const mount = document.createElement('div');
		this.appendChild(mount);

		ReactDOM.createRoot(mount).render(
			<>
				<h1>Identity</h1>
				<BrowserRouter basename='/identity'>
					<ModuleRoutes />
				</BrowserRouter>,
			</>,
		);
	}
}

if (!customElements.get('nikkiapp-identity')) {
	customElements.define('nikkiapp-identity', NikkiMicroApp);
}
