import React from 'react';
import ReactDOM from 'react-dom/client';

import { MicroAppDomType, MicroAppProps } from './types';


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
		#props: MicroAppProps = undefined as any;
		#mountElem?: HTMLElement = undefined;
		#reactRoot?: ReactDOM.Root = undefined;

		public get Component(): React.ComponentType<MicroAppProps> {
			return Component;
		}

		public get mountElem(): HTMLElement {
			return this.#mountElem!;
		}

		public set props(props: MicroAppProps) {
			this.#props = props;
			if (domType === MicroAppDomType.ISOLATED) {
				this._render();
			}
			// else: Light DOM will be rendered by the parent React.createPortal()
		}

		public get props(): MicroAppProps {
			return {
				...this.#props,
			};
		}

		public connectedCallback() {
			if (this.shadowRoot) return; // avoid re-mount

			if (domType === MicroAppDomType.ISOLATED) {
				const mount = this.#mountElem = document.createElement('div');
				mount.id = 'root';
				const root = this.attachShadow({ mode: 'open' });
				root.appendChild(mount);
			}
			else { // Light DOM
				this.#mountElem = this;
			}
		}
		//
		public disconnectedCallback() {
			this.#reactRoot?.unmount();
		}

		private _render() {
			if (!this.#reactRoot) {
				this.#reactRoot = ReactDOM.createRoot(this.#mountElem!);
			}
			this.#reactRoot.render(<Component {...this.#props} />);
		}
	};
}