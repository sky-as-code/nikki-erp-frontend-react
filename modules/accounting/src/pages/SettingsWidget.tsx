import { Stack } from '@mantine/core';
import { resourceCommand } from '@nikkierp/common/dynamicModel';
import { useCommandBus } from '@nikkierp/ui/microApp';
import { MetaComponent } from '@nikkierp/viewengine/render';
import { SettingsDataProvider, SettingsSaveBar } from '@nikkierp/viewkit-mantine';
import React from 'react';
import { useTranslation } from 'react-i18next';

import * as c from '../constants';
import { buildAccountingSettingsNodes } from './settings';

import type { RestSearchResponse } from '@nikkierp/common/dynamicModel';
import type { SettingOptionSearch } from '@nikkierp/viewkit-mantine';
import type { SettingLevel } from '@nikkierp/viewkit-mantine/props';


/** Both levels carry the system currency; see `buildAccountingSettingsNodes`. */
const LEVELS: SettingLevel[] = ['tenant', 'org'];

/** Essential's currency search, named as a literal: modules never import each other. */
const CURRENCY_SEARCH_COMMAND = resourceCommand('essential_currency', 'search');
const CURRENCY_PAGE_SIZE = 50;

type CurrencyRow = { id: string, code: string, name?: Record<string, string> | string, symbol?: string };

/** Accounting's `pages.settings` widget: the pane the Settings module mounts for this module. */
export function SettingsWidget(): React.ReactNode {
	const nodes = React.useMemo(() => buildAccountingSettingsNodes(), []);
	const [reloadKey, setReloadKey] = React.useState(0);
	const searchOptions = useCurrencySearch();

	return (
		<SettingsDataProvider
			key={reloadKey}
			moduleKey={c.ACCOUNTING_MODULE}
			levels={LEVELS}
			searchOptions={searchOptions}
		>
			<Stack gap='xl'>
				<MetaComponent node={nodes} />
				<SettingsSaveBar
					moduleKey={c.ACCOUNTING_MODULE}
					onSaved={() => setReloadKey(key => key + 1)}
				/>
			</Stack>
		</SettingsDataProvider>
	);
}

/**
 * Active currencies matching the keyword by code or name. The stored value is the currency id, so
 * the stored one is found again by id when the pane opens.
 */
function useCurrencySearch(): Record<string, SettingOptionSearch> {
	const commandBus = useCommandBus();
	const { i18n } = useTranslation();
	const language = i18n.language;

	return React.useMemo(() => {
		const search: SettingOptionSearch = async (keyword) => {
			const term = keyword.trim();
			const response = await commandBus.publish<RestSearchResponse<CurrencyRow>>({
				name: CURRENCY_SEARCH_COMMAND,
				payload: {
					fields: ['id', 'code', 'name', 'symbol'],
					size: CURRENCY_PAGE_SIZE,
					language,
					graph: term === '' ? { if: ['is_active', '=', true] } : {
						or: [
							{ if: ['id', '=', term] },
							{ if: ['code', '*', term.toUpperCase()] },
							{ if: ['name', '*', term] },
						],
					},
				},
			});
			return (response.result?.data?.items ?? []).map(row => ({
				value: row.id,
				label: currencyLabel(row, language),
			}));
		};
		return { tenant_system_currency: search, system_currency: search };
	}, [commandBus, language]);
}

function currencyLabel(row: CurrencyRow, language: string): string {
	const name = typeof row.name === 'string' ? row.name : row.name?.[language] ?? Object.values(row.name ?? {})[0];
	const symbol = row.symbol ? ` (${row.symbol})` : '';
	return name ? `${row.code} — ${name}${symbol}` : row.code;
}
