import React from 'react';
import ReactDOM from 'react-dom/client';

import { ImportFn } from './miscs';
import { RegisterReducerFn } from '../stateManagement/AppStateProvider';


export type MicroAppShellProps = {
	microApps: MicroAppMetadata[],
};

export type MicroAppShellBundle = {
	AppShell: React.FC<MicroAppShellProps>;
};


export type MicroAppMetadata = {
	/**
	 * How the micro app should be mounted under the web component root.
	 * - `shared`: Light DOM.
	 * - `isolated`: Shadow DOM.
	 */
	domType: MicroAppDomType;

	/**
	 * The slug used as unique identifier for the micro app, as well as
	 * the root path for the micro app in the URL.
	 * Must be in camelCase.
	 */
	slug: string;

	/**
	 * The web component tag name.
	 */
	htmlTag: string;

	/**
	 * If a string, it is URL where to fetch the micro app bundle from.
	 * If a function, it is a function that invokes import().
	 */
	bundleUrl: string | ImportFn;

	/**
	 * If specified, Shell will fetch the config from this URL and pass it to the micro-app.
	 */
	configUrl?: string,
};

export type MicroAppBundle = () => void;
export type MicroAppConfig = Record<string, any>;
export enum MicroAppDomType {
	SHARED = 'shared',
	ISOLATED = 'isolated',
}

export type MicroAppProps = {
	stateMgmt: {
		registerReducer: RegisterReducerFn,
	},
	config?: Record<string, any>,
};


export type DefineWebComponentOpts = {
	domType?: MicroAppDomType;
	htmlTag: string;
};

export function defineWebComponent(Component: React.ComponentType<MicroAppProps>, opts: DefineWebComponentOpts): void {
	if (!customElements.get(opts.htmlTag)) {
		const MicroAppClass = createMicroAppClass(Component, opts.domType);
		customElements.define(opts.htmlTag, MicroAppClass);
	}
}

export interface IMicroAppWebComponent {
	props: MicroAppProps;
}

function createMicroAppClass(
	Component: React.ComponentType<MicroAppProps>,
	domType: MicroAppDomType = MicroAppDomType.SHARED,
) {
	return class MicroAppWebComponent extends HTMLElement implements IMicroAppWebComponent {
		private _stateMgmt: { registerReducer: RegisterReducerFn; } = undefined as any;
		private _config?: Record<string, any> = undefined;
		private _mountElem?: HTMLDivElement = undefined;

		public set props(props: MicroAppProps) {
			this._stateMgmt = props.stateMgmt;
			this._config = props.config;
			this._render();
		}

		public get props(): MicroAppProps {
			return {
				stateMgmt: this._stateMgmt,
				config: this._config,
			};
		}

		public connectedCallback() {
			if (this.shadowRoot) return; // avoid re-mount
			const mount = this._mountElem = document.createElement('div');
			mount.id = 'root';

			if (domType === MicroAppDomType.ISOLATED) {
				const root = this.attachShadow({ mode: 'open' });
				root.appendChild(mount);
			}
			else { // Light DOM
				this.appendChild(mount);
			}
		}

		private _render() {
			ReactDOM.createRoot(this._mountElem!).render(<Component {...this.props} />);
		}
	};
}