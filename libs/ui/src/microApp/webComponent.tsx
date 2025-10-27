import React from 'react';
import ReactDOM from 'react-dom/client';

import { MicroAppDomType } from './types';
import { RegisterReducerFn } from '../stateManagement/AppStateProvider';


export type MicroAppProps = {
	config?: Record<string, any>,
	basePath?: string,
	widgetPath?: string,
	stateMgmt: {
		registerReducer: RegisterReducerFn,
	},
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
	/**
	 * When this web component is mounted as Light DOM, the parent React app will render this component
	 * under this HTML tag.
	 */
	readonly Component: React.ComponentType<MicroAppProps>;

	/**
	 * For Light DOM, this is the web component element itself.
	 * For Shadow DOM, this is the &lt;div id="root"&gt; element.
	 */
	readonly mountElem: HTMLElement;

	/**
	 * Required properties that must be passed to web component instance before rendering its inner tree.
	 * For Light DOM, `props` must be set before the parent React app renders `Component`.
	 * For Shadow DOM, `props` must be set to trigger the component rendering, otherwise nothing will be rendered.
	 */
	props: MicroAppProps;
}

function createMicroAppClass(
	Component: React.ComponentType<MicroAppProps>,
	domType: MicroAppDomType = MicroAppDomType.SHARED,
) {
	return class MicroAppWebComponent extends HTMLElement implements IMicroAppWebComponent {
		private _props: MicroAppProps = undefined as any;
		private _mountElem?: HTMLElement = undefined;
		private _isRendered = false;

		public get Component(): React.ComponentType<MicroAppProps> {
			return Component;
		}

		public get mountElem(): HTMLElement {
			return this._mountElem!;
		}

		public set props(props: MicroAppProps) {
			this._props = props;
			if (domType === MicroAppDomType.ISOLATED) {
				this._render();
			}
			// else: Light DOM will be rendered by the parent React.createPortal()
		}

		public get props(): MicroAppProps {
			return {
				...this._props,
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
				this._mountElem = this;
			}
		}

		private _render() {
			if (!this._isRendered) {
				this._isRendered = true;
				ReactDOM.createRoot(this._mountElem!).render(<Component {...this._props} />);
			}
		}
	};
}