import React, { useState } from 'react';
import { SimplePageHeader } from '@/components/ui/SimplePageHeader/SimplePageHeader';
import { Tabs } from '@/components/ui/Tabs/Tabs.tsx';
import { UserManagementTab } from '@/features/administration/components/UserManagementTab/UserManagementTab';
import { RoleManagementTab } from '@/features/administration/components/RoleManagementTab/RoleManagementTab';
import { TABS_ITEMS } from '@/libs/constants/administration.constants.ts';
import styles from './AdminUserManagementPage.module.css';
import {MessageModerationTab} from "@/features/administration/components/MessageModerationTab/MessageModerationTab.tsx";

export const AdminUserManagementPage = () => {
    const [activeTab, setActiveTab] = useState('user-management');

    return (
        <div className={styles.pageContainer}>
            <SimplePageHeader title="АДМІН ПАНЕЛЬ" />

            <div className={styles.tabsWrapper}>
                <Tabs items={TABS_ITEMS} activeId={activeTab} onTabChange={setActiveTab} />
            </div>

            {activeTab === 'user-management' && <UserManagementTab />}
            {activeTab === 'role-management' && <RoleManagementTab />}
            {activeTab === 'messages-moderation' && <MessageModerationTab />}
        </div>
    );
};