import {
	ActionIcon, Anchor, Avatar, Badge, Box, Button, Group, Menu,
	Paper, SimpleGrid, Stack, Text, TextInput, Title,
} from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconDots } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	DataTable, RenderTableNameFn, SearchData,
} from './DataTable';
import classes from './ResourceDetail.module.css';
import { usePaperBgColor } from '../../theme';


type SchemaFieldSpec = { type: 'SchemaField', value: string };
type LinkSpec = { type: 'Link', value: string, linkHref: string };
type TitleSpec = SchemaFieldSpec | LinkSpec;

type StatusOption = { value: string, label: string };
type ActionDef = { label: string, reduxAction: () => unknown };

type SchemaFieldGroup = { type: 'SchemaFieldGroup', fields: string[] };
type ListContent = { type: 'List', schemaName: string, listSearchData?: SearchData };

type SubSection = {
	template?: string,
	title?: string,
	content?: SchemaFieldGroup | ListContent,
};

type TopSectionTemplateProps = {
	allStatuses?: StatusOption[],
	currentStatus?: SchemaFieldSpec,
	actions?: { create?: ActionDef, delete?: ActionDef, save?: ActionDef },
};

type TopSection = {
	template?: string,
	templateProps?: TopSectionTemplateProps,
	sections?: SubSection[],
};

type RelatedResource = {
	schemaName?: string,
	label?: string,
	count?: number,
};

export type ResourceDetailParams = {
	schemaName: string,
	reduxAction: (pathParams: Record<string, string>) => unknown,
	titleLvl1: TitleSpec,
	titleLvl2: TitleSpec,
	titleLvl3: TitleSpec,
	relatedResources: RelatedResource[],
	sections: TopSection[],
};

export type ResourceDetailProps = {
	props: ResourceDetailParams,
};


export function ResourceDetail({ props }: ResourceDetailProps): React.ReactNode {
	const bgColor = usePaperBgColor();
	return (
		<Stack gap='md' className='p-4'>
			<ResourceHeader
				titleLvl1={props.titleLvl1}
				titleLvl2={props.titleLvl2}
				titleLvl3={props.titleLvl3}
				relatedResources={props.relatedResources}
				bgColor={bgColor}
			/>
			{props.sections.map((section, idx) => (
				<TopSectionView key={idx} section={section} bgColor={bgColor} />
			))}
		</Stack>
	);
}


type ResourceHeaderProps = {
	titleLvl1: TitleSpec,
	titleLvl2: TitleSpec,
	titleLvl3: TitleSpec,
	relatedResources: RelatedResource[],
	bgColor: string,
};

function ResourceHeader(props: ResourceHeaderProps): React.ReactNode {
	return (
		<Group align='stretch' gap='md' wrap='nowrap'>
			<ResourceThumbnail />
			<Paper p='md' bg={props.bgColor} className='flex-1' withBorder>
				<ResourceTitleBlock
					titleLvl1={props.titleLvl1}
					titleLvl2={props.titleLvl2}
					titleLvl3={props.titleLvl3}
				/>
			</Paper>
			{props.relatedResources.map((resource, idx) => (
				<RelatedResourceCard key={idx} resource={resource} bgColor={props.bgColor} />
			))}
		</Group>
	);
}

function ResourceThumbnail(): React.ReactNode {
	return <Avatar size={120} radius='md' className={classes.thumbnail} />;
}


type ResourceTitleBlockProps = {
	titleLvl1: TitleSpec,
	titleLvl2: TitleSpec,
	titleLvl3: TitleSpec,
};

function ResourceTitleBlock(props: ResourceTitleBlockProps): React.ReactNode {
	return (
		<Stack gap={4}>
			<TitleSpecValue spec={props.titleLvl1} as='h3' />
			<TitleSpecValue spec={props.titleLvl2} as='subtitle' />
			<TitleSpecValue spec={props.titleLvl3} as='caption' />
		</Stack>
	);
}


type TitleSpecValueProps = {
	spec: TitleSpec,
	as: 'h3' | 'subtitle' | 'caption',
};

function TitleSpecValue({ spec, as }: TitleSpecValueProps): React.ReactNode {
	const { t } = useTranslation();
	if (spec.type === 'Link') {
		return <Anchor href={spec.linkHref} size={as === 'h3' ? 'xl' : 'sm'}>{t(spec.value)}</Anchor>;
	}
	if (as === 'h3') {
		return <Title order={3}>{`{${spec.value}}`}</Title>;
	}
	return <Text c={as === 'caption' ? 'dimmed' : undefined}>{`{${spec.value}}`}</Text>;
}


type RelatedResourceCardProps = {
	resource: RelatedResource,
	bgColor: string,
};

function RelatedResourceCard(props: RelatedResourceCardProps): React.ReactNode {
	const { t } = useTranslation();
	const label = props.resource.label ? t(props.resource.label) : '';
	return (
		<Paper p='md' bg={props.bgColor} withBorder className='min-w-[160px]'>
			<Stack gap={4} align='flex-start'>
				<Text fw={600}>{label}</Text>
				<Text size='xl'>{props.resource.count ?? 0}</Text>
			</Stack>
		</Paper>
	);
}


type TopSectionViewProps = {
	section: TopSection,
	bgColor: string,
};

function TopSectionView({ section, bgColor }: TopSectionViewProps): React.ReactNode {
	const subSections = section.sections ?? [];
	if (!section.template && subSections.length === 0) {
		return null;
	}
	return (
		<Paper p='md' bg={bgColor} withBorder>
			<Stack gap='md'>
				<SectionActionBar templateProps={section.templateProps ?? {}} />
				{subSections.map((sub, idx) => (
					<SubSectionView key={idx} subSection={sub} bgColor={bgColor} />
				))}
			</Stack>
		</Paper>
	);
}


type SectionActionBarProps = { templateProps: TopSectionTemplateProps };

function SectionActionBar({ templateProps }: SectionActionBarProps): React.ReactNode {
	const actions = templateProps.actions;
	if (!actions && !templateProps.allStatuses) {
		return null;
	}
	return (
		<Group justify='space-between' wrap='wrap'>
			<Group gap='xs'>
				{actions?.create ? <CreateActionMenu action={actions.create} /> : null}
				{actions?.save ? <ActionLabelButton action={actions.save} /> : null}
				{actions?.delete ? <ActionLabelButton action={actions.delete} variant='outline' /> : null}
			</Group>
			<StatusFlow statuses={templateProps.allStatuses ?? []} current={templateProps.currentStatus} />
		</Group>
	);
}


type ActionLabelButtonProps = { action: ActionDef, variant?: 'filled' | 'outline' };

function ActionLabelButton({ action, variant = 'outline' }: ActionLabelButtonProps): React.ReactNode {
	const { t } = useTranslation();
	return <Button variant={variant} size='compact-md'>{t(action.label)}</Button>;
}


function CreateActionMenu({ action }: { action: ActionDef }): React.ReactNode {
	const { t } = useTranslation();
	return (
		<Menu shadow='md' position='bottom-start'>
			<Menu.Target>
				<Button variant='filled' size='compact-md' rightSection={<IconChevronDown size={14} />}>
					{t(action.label)}
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item>{t(action.label)}</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
}


type StatusFlowProps = {
	statuses: StatusOption[],
	current?: SchemaFieldSpec,
};

function StatusFlow({ statuses, current }: StatusFlowProps): React.ReactNode {
	const { t } = useTranslation();
	if (statuses.length === 0) {
		return null;
	}
	return (
		<Group gap={4} wrap='wrap'>
			{statuses.map((status, idx) => (
				<React.Fragment key={status.value}>
					{idx > 0 ? <IconChevronRight size={14} /> : null}
					<Badge variant={current ? 'light' : 'outline'}>{t(status.label)}</Badge>
				</React.Fragment>
			))}
		</Group>
	);
}


type SubSectionViewProps = {
	subSection: SubSection,
	bgColor: string,
};

function SubSectionView({ subSection, bgColor }: SubSectionViewProps): React.ReactNode {
	if (subSection.content?.type === 'List') {
		return <CollapsibleListSection subSection={subSection} list={subSection.content} bgColor={bgColor} />;
	}
	return <SimpleSubSectionView subSection={subSection} />;
}


function SimpleSubSectionView({ subSection }: { subSection: SubSection }): React.ReactNode {
	const { t } = useTranslation();
	const fields = subSection.content?.type === 'SchemaFieldGroup' ? subSection.content.fields : [];
	return (
		<Stack gap='sm'>
			{subSection.title ? <Title order={4}>{t(subSection.title)}</Title> : null}
			{fields.length > 0 ? <FieldGroupGrid fields={fields} /> : null}
		</Stack>
	);
}


function FieldGroupGrid({ fields }: { fields: string[] }): React.ReactNode {
	return (
		<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
			{fields.map(field => (
				<Stack key={field} gap={4}>
					<Text size='sm' fw={500}>{field}</Text>
					<TextInput placeholder={`{${field}}`} disabled />
				</Stack>
			))}
		</SimpleGrid>
	);
}


type CollapsibleListSectionProps = {
	subSection: SubSection,
	list: ListContent,
	bgColor: string,
};

function CollapsibleListSection(props: CollapsibleListSectionProps): React.ReactNode {
	const { t } = useTranslation();
	const [collapsed, setCollapsed] = React.useState(false);
	const title = props.subSection.title ? t(props.subSection.title) : props.list.schemaName;
	if (collapsed) {
		return <CollapsedListHeader title={title} onExpand={() => setCollapsed(false)} />;
	}
	return (
		<Box>
			<DataTable
				tableName={title}
				searchData={props.list.listSearchData ?? createEmptySearchData()}
				renderTableName={renderExpandedTableName(() => setCollapsed(true))}
				allowColumnResizing
			/>
		</Box>
	);
}


function CollapsedListHeader({ title, onExpand }: { title: string, onExpand: () => void }): React.ReactNode {
	return (
		<Group gap='xs' className={classes.collapsibleHeader} onClick={onExpand}>
			<ActionIcon variant='subtle' size='sm' aria-label='Expand section'>
				<IconChevronRight size={16} />
			</ActionIcon>
			<Title order={4}>{title}</Title>
		</Group>
	);
}


function renderExpandedTableName(onCollapse: () => void): RenderTableNameFn {
	return ({ name, total }) => (
		<Group gap='xs' className={classes.collapsibleHeader} onClick={onCollapse}>
			<ActionIcon variant='subtle' size='sm' aria-label='Collapse section'>
				<IconChevronDown size={16} />
			</ActionIcon>
			<Title order={3}>{name} ({total})</Title>
			<ActionIcon variant='subtle' size='sm' aria-label='More'>
				<IconDots size={16} />
			</ActionIcon>
		</Group>
	);
}


function createEmptySearchData(): SearchData {
	return {
		page: 0,
		size: 10,
		total: 0,
		items: [],
		desired_fields: [],
		masked_fields: [],
		schema_etag: '',
	} as SearchData;
}
