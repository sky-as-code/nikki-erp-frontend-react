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
	// domType: MicroAppDomType;

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

/**
 * Defines web component, register reducer with state management, etc.
 */
export type MicroAppBundle = (opts: MicroAppBundleOptions) => MicroAppBundleInitResult;

export type MicroAppBundleOptions = {
	/**
	 * The web component tag name.
	 * The Shell will determine this tag name to avoid conflicts with other micro apps.
	 */
	htmlTag: string;
};

export type MicroAppBundleInitResult = {
	/**
	 * How the micro app is mounted under the web component root.
	 * - `shared`: Light DOM.
	 * - `isolated`: Shadow DOM.
	 */
	domType: MicroAppDomType;
};

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
	readonly Component: React.ComponentType<MicroAppProps>;
	readonly mountElem: HTMLElement;
	props: MicroAppProps;
}

function createMicroAppClass(
	Component: React.ComponentType<MicroAppProps>,
	domType: MicroAppDomType = MicroAppDomType.SHARED,
) {
	return class MicroAppWebComponent extends HTMLElement implements IMicroAppWebComponent {
		private _stateMgmt: { registerReducer: RegisterReducerFn; } = undefined as any;
		private _config?: Record<string, any> = undefined;
		private _mountElem?: HTMLElement = undefined;
		private _isRendered = false;

		public get Component(): React.ComponentType<MicroAppProps> {
			return Component;
		}

		public get mountElem(): HTMLElement {
			return this._mountElem!;
		}

		public set props(props: MicroAppProps) {
			this._stateMgmt = props.stateMgmt;
			this._config = props.config;
			if (domType === MicroAppDomType.ISOLATED) {
				this._render();
			}
			// else: Light DOM will be rendered by the parent React.createPortal()
		}

		public get props(): MicroAppProps {
			return {
				stateMgmt: this._stateMgmt,
				config: this._config,
			};
		}

		public connectedCallback() {
			if (this.shadowRoot) return; // avoid re-mount

			if (domType === MicroAppDomType.ISOLATED) {
				const mount = this._mountElem = document.createElement('div');
				mount.id = 'root';
				const root = this.attachShadow({ mode: 'open' });
				root.appendChild(mount);
			}
			else { // Light DOM
				// this.appendChild(mount);
				this._mountElem = this;
			}
		}

		private _render() {
			if (!this._isRendered) {
				this._isRendered = true;
				ReactDOM.createRoot(this._mountElem!).render(<Component {...this.props} />);
			}
		}
	};
}