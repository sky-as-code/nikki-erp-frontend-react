import { MantineProvider } from '@mantine/core';
import ReactDOM from 'react-dom/client';

import { FileSelector, type FileSelectorMode } from './FileSelector';


export const DRIVE_FILE_SELECTOR_TAG = 'drive-file-selector';

export type DriveFilesSelectedDetail = {
	fileIds: string[];
};

/**
 * Đăng ký custom element để module khác dùng FileSelector qua web component.
 * Gọi trong drive bundle init().
 *
 * Usage từ module khác (sau khi đã load drive bundle):
 *   <drive-file-selector parent-id="" multiple="true"></drive-file-selector>
 *   element.addEventListener('drive-files-selected', (e) => { e.detail.fileIds })
 */
export function registerDriveFileSelectorWebComponent(htmlTag: string = DRIVE_FILE_SELECTOR_TAG): void {
	if (typeof customElements === 'undefined' || customElements.get(htmlTag)) {
		return;
	}

	type Props = {
		parentId: string;
		multiple: boolean;
		mode: FileSelectorMode;
	};

	class DriveFileSelectorElement extends HTMLElement {
		static get observedAttributes(): string[] {
			return ['parent-id', 'multiple', 'mode'];
		}

		#root: ReactDOM.Root | null = null;
		#mount: HTMLDivElement | null = null;
		#props: Props = {
			parentId: '',
			multiple: false,
			mode: 'file',
		};

		connectedCallback(): void {
			if (this.#root) return;

			this.#mount = document.createElement('div');
			this.#mount.style.display = 'block';
			this.appendChild(this.#mount);

			this.#root = ReactDOM.createRoot(this.#mount);
			this.#applyProps();
		}

		disconnectedCallback(): void {
			if (this.#root && this.#mount) {
				this.#root.unmount();
				this.#root = null;
				this.#mount = null;
			}
		}

		attributeChangedCallback(name: string, _oldVal: string | null, newVal: string | null): void {
			if (name === 'parent-id') {
				this.#props.parentId = newVal ?? '';
			}
			if (name === 'multiple') {
				this.#props.multiple = newVal === 'true' || newVal === '';
			}
			if (name === 'mode') {
				this.#props.mode = (newVal === 'folder' ? 'folder' : 'file');
			}
			this.#applyProps();
		}

		#applyProps(): void {
			if (!this.#root) return;

			const parentId = this.getAttribute('parent-id') ?? this.#props.parentId ?? '';
			const multiple = this.getAttribute('multiple') === 'true' || this.#props.multiple;
			const modeAttr = this.getAttribute('mode');
			const mode = (modeAttr === 'folder' ? 'folder' : this.#props.mode);

			this.#root.render(
				<MantineProvider>
					<FileSelector
						parentId={parentId}
						multiple={multiple}
						mode={mode}
						onSelect={(fileIds) => {
							const ids = Array.isArray(fileIds) ? fileIds : [fileIds];
							this.dispatchEvent(
								new CustomEvent<DriveFilesSelectedDetail>('drive-files-selected', {
									detail: { fileIds: ids },
									bubbles: true,
									composed: true,
								}),
							);
						}}
					/>
				</MantineProvider>,
			);
		}
	}

	customElements.define(htmlTag, DriveFileSelectorElement);
}
