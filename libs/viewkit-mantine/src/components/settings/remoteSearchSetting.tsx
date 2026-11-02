import { useDebouncedValue } from '@mantine/hooks';
import { Select } from '@nikkierp/ui/components';
import React from 'react';

import type { SettingOption, SettingOptionSearch } from './settingsDataContext';


const SEARCH_DEBOUNCE_MS = 250;

export type RemoteSearchSettingProps = {
	value: unknown,
	disabled: boolean,
	search: SettingOptionSearch,
	onChange: (value: unknown) => void,
};

/**
 * A searchable select whose choices the server filters -- a catalogue too long to ship whole, such
 * as the IANA timezones. Each keystroke (debounced) asks `search` again; the stored value is looked
 * up once by itself so the closed control shows its label rather than its code.
 */
export function RemoteSearchSetting({ value, disabled, search, onChange }: RemoteSearchSettingProps): React.ReactNode {
	const current = typeof value === 'string' && value !== '' ? value : null;
	const [keyword, setKeyword] = React.useState('');
	const [debounced] = useDebouncedValue(keyword, SEARCH_DEBOUNCE_MS);
	const [found, setFound] = React.useState<SettingOption[]>([]);
	const [currentOption, setCurrentOption] = React.useState<SettingOption | null>(null);

	React.useEffect(() => {
		let live = true;
		void search(debounced).then(options => live && setFound(options));
		return () => { live = false; };
	}, [search, debounced]);

	React.useEffect(() => {
		if (current == null || currentOption?.value === current) return undefined;
		let live = true;
		void search(current).then((options) => {
			if (!live) return;
			setCurrentOption(options.find(option => option.value === current) ?? { value: current, label: current });
		});
		return () => { live = false; };
	}, [search, current, currentOption]);

	const data = currentOption && !found.some(option => option.value === currentOption.value)
		? [currentOption, ...found]
		: found;

	return (
		<Select
			w={260}
			searchable
			clearable
			data={data}
			value={current}
			disabled={disabled}
			// The server already filtered by the keyword; filtering again here would hide a match on
			// the code when the label differs (`Asia/Ho_Chi_Minh` under its vi label).
			filter={({ options }) => options}
			onSearchChange={setKeyword}
			onChange={(next) => {
				const picked = data.find(option => option.value === next);
				if (picked) setCurrentOption(picked);
				onChange(next);
			}}
		/>
	);
}
