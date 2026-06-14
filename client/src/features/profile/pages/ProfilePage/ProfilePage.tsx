import React, { useState, useEffect } from 'react';
import { ProfileBanner } from '@/features/profile/components/ProfileBanner/ProfileBanner';
import { InfoCard } from '@/components/ui/InfoCard/InfoCard';
import { ParentCodeCard } from '@/features/profile/components/ParentCodeCard/ParentCodeCard';
import { GradesTable } from '@/features/profile/components/GradesTable/GradesTable';
import { InfoItem } from '@/components/ui/InfoItem/InfoItem';
import { Tabs, TabItem } from '@/components/ui/Tabs/Tabs';
import { userService } from '@/features/profile/profile.service';
import { UserProfileResponseDTO } from '@/features/profile/profile.types';
import { toast } from '@/components/utils/Toast';

import EmailIcon from '../../../../assets/email.svg?react';
import SchoolIcon from '../../../../assets/school.svg?react';
import SubjectsIcon from '../../../../assets/subjects.svg?react';
import styles from './ProfilePage.module.css';

export const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('my_info');
    const [profile, setProfile] = useState<UserProfileResponseDTO | null>(null);

    const tabItems: TabItem[] = [
        { id: 'my_info', label: 'My Info' },
        { id: 'child_info', label: 'Johns M.S.' }
    ];

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const data = await userService.getProfile();
                setProfile(data);
            } catch (err: any) {
                toast.error(err.message || 'Не вдалося завантажити дані профілю');
            }
        };

        fetchProfileData();
    }, []);

    if (!profile) {
        return <div className={styles.errorContainer}>Дані профілю відсутні</div>;
    }

    const fullName = `${profile.lastName} ${profile.firstName} ${profile.middleName}`.trim();

    const userRole = profile.roles.join(', ');

    return (
        <div className={styles.pageContainer}>
            <ProfileBanner
                name={fullName}
                group={userRole}
                avatarUrl={profile.avatarUrl || "https://i.pravatar.cc/150?img=47"}
            />

            <Tabs
                items={tabItems}
                activeId={activeTab}
                onTabChange={setActiveTab}
            />

            <div className={styles.contentGrid}>
                <div className={styles.leftColumn}>
                    <InfoCard title="Personal Info">
                        <InfoItem
                            icon={EmailIcon}
                            title="Email"
                            subtitle={profile.email}
                            variant="info"
                        />
                    </InfoCard>

                    <InfoCard title="Class & School Info">
                        <InfoItem
                            icon={SchoolIcon}
                            title="Educational institution"
                            subtitle={profile.school?.name || 'Не вказано'}
                            variant="info"
                        />
                        <InfoItem
                            icon={SubjectsIcon}
                            title="Total subjects"
                            subtitle={profile.subjects ? profile.subjects.length.toString() : '0'}
                            variant="info"
                        />
                    </InfoCard>

                    <ParentCodeCard code="000 000" />
                </div>

                <div className={styles.rightColumn}>
                    {activeTab === 'child_info' ? (
                        <GradesTable />
                    ) : (
                        <div style={{ padding: '24px', background: '#FFF', borderRadius: '12px' }}>
                            <h3 style={{ marginBottom: '16px', color: '#702DFF' }}>Ваші предмети:</h3>
                            {profile.subjects && profile.subjects.length > 0 ? (
                                <ul>
                                    {profile.subjects.map((subject, index) => (
                                        <li key={index} style={{ marginBottom: '8px', fontSize: '16px' }}>
                                            {subject}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Список предметів порожній</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};