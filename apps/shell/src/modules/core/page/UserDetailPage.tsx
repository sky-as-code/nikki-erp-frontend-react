import React from 'react'

import { UserDetail } from '../components/users/UserDetail'

import { DetailPageLayout } from '@/common/components/layout/DetailPageLayout'


export const UserDetailPage: React.FC = () => {
    return <DetailPageLayout component={UserDetail} pageSlug='users' />
}
