import { Avatar, Badge, Paper } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamic_model';
import React from 'react';

import {
	DataTable, FieldRenderHintMap, IFieldRenderHint, SearchData,
} from './DataTable';
import { ThunkPackHookReturn } from '../../appState';
import { LoadingState } from '../../components/Loading';
import { MicroAppDispatchFn } from '../../microApp';
import { usePaperBgColor } from '../../theme';


export type ResourceActionHook = {
	label?: string,
	icon?: React.ReactNode,
	isSeparator?: boolean,
	useThunkHook?: () => ThunkPackHookReturn<any, any>,
};

export type { IFieldRenderHint, FieldRenderHintMap };


export class AvatarRenderHint implements IFieldRenderHint {
	get type(): string {
		return 'avatar';
	}

	render(value: string): React.ReactNode {
		return <Avatar src={value || undefined} size='lg' radius='md' />;
	}
}

export type BadgeRenderHintProps = {
	colorMap: Record<string, string>,
};

export class BadgeRenderHint implements IFieldRenderHint {
	private readonly colorMap: Record<string, string>;

	constructor(props: BadgeRenderHintProps) {
		this.colorMap = props.colorMap;
	}

	get type(): string {
		return 'badge';
	}

	render(value: string): React.ReactNode {
		return <Badge variant='filled' color={this.colorMap[value]}>{value}</Badge>;
	}
}


type ResourceListTemplatePropsParams = {
	schemaName: string,
	resourceName: string,
	resourceNamePlural: string,
	dispatch: MicroAppDispatchFn,
	searchAction: ResourceActionHook,
	actions?: ResourceActionHook[],
	linkField?: string,
	linkRoutePath?: string,
	fieldAsLink?: string,
	fieldAsId?: string,
	fieldRenderHint?: FieldRenderHintMap,
};

export class ResourceListTemplateProps {
	public readonly params: ResourceListTemplatePropsParams;

	constructor(params: ResourceListTemplatePropsParams) {
		this.params = params;
	}
}

export type ResourceListProps = {
	props: ResourceListTemplateProps,
};


export function ResourceList({ props }: ResourceListProps): React.ReactNode {
	if (! (props instanceof ResourceListTemplateProps)) {
		throw new Error('props must be an instance of ' + ResourceListTemplateProps.name);
	}
	const params = props.params;
	const pack = useSchemaPack(params.schemaName);
	const searchResrc = useInitialSearch(params.searchAction, params.dispatch);
	const bgColor = usePaperBgColor();

	if (!pack || !searchResrc?.isDone) {
		return <LoadingState />;
	}

	const searchData = searchResrc.data as SearchData;
	const linkField = params.linkField ?? params.fieldAsLink;
	const linkRoutePath = params.linkRoutePath;
	return (
		<Paper className='p-4' bg={bgColor}>
			<DataTable
				tableName={searchData.total > 0 ? params.resourceNamePlural : params.resourceName}
				searchData={searchData}
				fieldRenderHint={params.fieldRenderHint}
				linkField={linkField}
				linkRoutePath={linkRoutePath}
				allowColumnResizing
				actions={params.actions}
			/>
		</Paper>
	);
}

function useSchemaPack(schemaName: string) {
	const [pack, setPack] = React.useState<dyn.SchemaPack | null>(null);
	const [etag, setEtag] = React.useState<string | undefined>(undefined);

	React.useEffect(() => {
		dyn.schemaRegistry.get(schemaName).then(next => {
			setPack(next);
			setEtag(next?.modelSchema?.etag);
		});
	}, [schemaName, etag === pack?.modelSchema?.etag]);

	return pack;
}

function useInitialSearch(searchAction: ResourceActionHook, dispatch: MicroAppDispatchFn) {
	const searchResrc = searchAction.useThunkHook?.();
	React.useEffect(() => {
		if (!searchResrc) {
			return;
		}
		dispatch(searchResrc.thunkAction({
			page: 0, size: 50, search_name: 'default',
		} as dyn.RestSearchRequest) as any);
	}, []);
	return searchResrc;
}
