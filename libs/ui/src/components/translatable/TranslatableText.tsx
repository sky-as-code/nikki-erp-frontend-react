import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';

import { resolveLangJson } from './langJson';
import { useI18n } from '../../i18n';


export type TranslatableTextProps = {
	langJson: dyn.ModelSchemaLangJson | null | undefined,
};

/** A LangJSON value as text in the active language, with the fallback of {@link resolveLangJson}. */
export function TranslatableText({ langJson }: TranslatableTextProps): React.ReactNode {
	const i18n = useI18n();
	return resolveLangJson(langJson, i18n.language, key => i18n.t(key));
}
