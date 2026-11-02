import { MantineProvider } from '@mantine/core';
import { createInstance } from 'i18next';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it } from 'vitest';

import { RibbonContext } from './ribbonContext';
import { RibbonMeasureItem } from './RibbonItem';


function renderLabel(label: string, rowspan = true): string {
	const i18n = createInstance();
	void i18n.init({ lng: 'en', resources: { en: { inventory: { menu_newTransfer: label } } }, initAsync: false });
	const t = i18n.getFixedT(null, 'inventory');
	return renderToStaticMarkup(
		<MantineProvider env='test'>
			<I18nextProvider i18n={i18n}>
				<RibbonContext.Provider value={{ currentPath: '/', pathPrefix: '', t, onNavigate: () => undefined }}>
					<RibbonMeasureItem item={{ labelKey: 'menu_newTransfer', link: '/new', rowspan }} />
				</RibbonContext.Provider>
			</I18nextProvider>
		</MantineProvider>,
	);
}

describe('ribbon item label', () => {
	it('renders a <br/> in the translation as a line break', () => {
		expect(renderLabel('New<br/>stock transfer')).toMatch(/>New<br\/>stock transfer</);
	});

	it('renders a plain translation as text', () => {
		expect(renderLabel('Stock transfers', false)).toMatch(/>Stock transfers</);
	});

	it('never renders a tag outside the basic set', () => {
		const markup = renderLabel('<img src=x onerror=alert(1)>Bad');
		expect(markup).not.toContain('<img');
	});
});
