import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';

import { useI18n } from './index';


export type JsonLangTextProps = {
	langJson: dyn.ModelSchemaLangJson,
};

export function JsonLangText({ langJson }: JsonLangTextProps): React.ReactNode {
	const i18n = useI18n();
	const transKey = langJson[dyn.LangJsonRefKey];
	if (transKey) {
		return i18n.t(transKey);
	}
	return langJson[i18n.language] ?? '';
}
