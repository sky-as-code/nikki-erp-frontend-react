import { IconSettings } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ControlPanel } from '@/components';
import { DetailLayout } from '@/components/DetailLayout';
import { PageContainer } from '@/components/PageContainer';
import { useSettingDetail } from '@/features/settings';
import {
	SettingBasicInfo,
	SettingNotFound,
	useSettingDetailPageConfig,
} from '@/features/settings/components/SettingDetail';


export const SettingDetailPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { t: translate } = useTranslation();
	const { setting, isLoading } = useSettingDetail(id);
	const { breadcrumbs, actions, formProps } = useSettingDetailPageConfig({ setting });

	return (
		<PageContainer
			documentTitle={setting?.name ?? translate('nikki.vendingMachine.settings.detail.title')}
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel actions={actions} />]}
			isLoading={isLoading}
			isNotFound={!setting && !isLoading}
			notFoundContent={<SettingNotFound />}
		>
			<DetailLayout
				header={{
					title: setting?.name || '',
					subtitle: setting?.code || '',
					avatar: <IconSettings size={46} />,
				}}
				sections={[<SettingBasicInfo setting={setting} formProps={formProps} />]}
			/>
		</PageContainer>
	);
};
