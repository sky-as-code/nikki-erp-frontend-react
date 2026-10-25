// jsdom has no layout: every element reports offsetParent null and a zero rect. These stubs make
// elements "shown" unless they carry `data-test-hidden` or `data-test-zero-size`.
export function stubLayout(): () => void {
	const offsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
	const rectFn = HTMLElement.prototype.getBoundingClientRect;
	Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
		configurable: true,
		get(this: HTMLElement) {
			return this.closest('[data-test-hidden]') ? null : document.body;
		},
	});
	HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
		const size = this.hasAttribute('data-test-zero-size') ? 0 : 20;
		return new DOMRect(5, 5, size, size);
	};
	return () => {
		if (offsetParent) {
			Object.defineProperty(HTMLElement.prototype, 'offsetParent', offsetParent);
		}
		HTMLElement.prototype.getBoundingClientRect = rectFn;
	};
}

type KeyInit = { key: string, code: string, alt?: boolean, shift?: boolean, ctrl?: boolean, meta?: boolean };

/** Dispatches from `document.body`, so the registry's capture listener on window sees it. Returns `defaultPrevented`. */
export function press(type: 'keydown' | 'keyup', init: KeyInit): boolean {
	const event = new KeyboardEvent(type, {
		key: init.key,
		code: init.code,
		altKey: init.alt ?? true,
		shiftKey: !!init.shift,
		ctrlKey: !!init.ctrl,
		metaKey: !!init.meta,
		bubbles: true,
		cancelable: true,
	});
	document.body.dispatchEvent(event);
	return event.defaultPrevented;
}

export function pressAlt(type: 'keydown' | 'keyup'): boolean {
	return press(type, { key: 'Alt', code: 'AltLeft', alt: type === 'keydown' });
}

export function addButton(label: string): HTMLButtonElement {
	const button = document.createElement('button');
	button.textContent = label;
	document.body.appendChild(button);
	return button;
}
