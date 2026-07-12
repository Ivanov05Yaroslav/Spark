import { useState } from 'react';
import { ProfileBanner } from '@/features/profile/components/ProfileBanner/ProfileBanner.tsx';
import { InfoCard } from '@/components/ui/InfoCard/InfoCard.tsx';
import { ParentCodeCard } from '@/features/profile/components/ParentCodeCard/ParentCodeCard.tsx';
import { InfoItem } from '@/components/ui/InfoItem/InfoItem.tsx';
import { Tabs } from '@/components/ui/Tabs/Tabs.tsx';
import { useProfile } from '@/features/profile/hooks/useProfile';
import EmailIcon from '../../../assets/email.svg?react';
import ClassIcon from '../../../assets/class.svg?react';
import SchoolIcon from '../../../assets/school.svg?react';
import SubjectsIcon from '../../../assets/subjects.svg?react';
import styles from './ProfilePage.module.css';
import { EditProfileModal } from '@/features/profile/components/EditProfileModal/EditProfileModal.tsx';

export const ProfilePage = () => {
  const {
    profile,
    isLoading,
    activeTab,
    setActiveTab,
    tabItems,
    isStudent,
    isTeacher,
    isParent,
    rolesDisplay,
    refetch,
  } = useProfile();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading || !profile) return null;

  const isSuperAdmin = profile.roles?.includes('SUPER_ADMIN');

  const renderTabContent = () => {
    if (activeTab === 'my_info') {
      return (
        <div className={styles.infoGrid}>
          <InfoCard title="Особиста інформація">
            <InfoItem icon={EmailIcon} title="Email" subtitle={profile.email} variant="info" />
          </InfoCard>

          {!isSuperAdmin && (
            <InfoCard title="Інформація про клас і заклад">
              <InfoItem
                icon={SchoolIcon}
                title="Навчальний заклад"
                subtitle={profile.school?.name || 'Не вказано'}
                variant="info"
              />

              {(isStudent || profile.class) && (
                <>
                  <InfoItem
                    icon={ClassIcon}
                    title="Клас"
                    subtitle={profile.class?.name.toString() || '0'}
                    variant="info"
                  />
                  <InfoItem
                    icon={ClassIcon}
                    title="Однокласники"
                    subtitle={profile.classmatesCount?.toString() || '0'}
                    variant="info"
                  />
                  <InfoItem
                    icon={SubjectsIcon}
                    title="Предмети"
                    subtitle={profile.coursesCount?.toString() || '0'}
                    variant="info"
                  />
                </>
              )}

              {(isTeacher ||
                profile.homeroomClass ||
                (profile.subjects && profile.subjects.length > 0)) && (
                <>
                  <InfoItem
                    icon={SchoolIcon}
                    title="Класне керівництво"
                    subtitle={profile.homeroomClass?.name || 'Не вказано'}
                    variant="info"
                  />
                  <InfoItem
                    icon={SubjectsIcon}
                    title="Предмети"
                    subtitle={
                      profile.subjects && profile.subjects.length > 0
                        ? profile.subjects.map((s: any) => s.name).join(', ')
                        : 'Немає'
                    }
                    variant="info"
                  />
                </>
              )}
            </InfoCard>
          )}

          {profile.children && profile.children.length > 0 && (
            <InfoCard title="Діти">
              {profile.children.map((child: any) => (
                <InfoItem
                  key={child.id}
                  icon={SubjectsIcon}
                  title={child.class ? `${child.class.name}` : 'Не вказано'}
                  subtitle={`${child.lastName} ${child.firstName} ${child.middleName}`}
                  variant="info"
                />
              ))}
            </InfoCard>
          )}

          {profile.parentsCode && <ParentCodeCard code={profile.parentsCode} />}
        </div>
      );
    }

    const child = profile.children?.find((c: any) => c.id === activeTab);
    if (child) {
      return (
        <div className={styles.infoGrid}>
          <InfoCard title="Особиста інформація">
            <InfoItem icon={EmailIcon} title="Email" subtitle={child.email} variant="info" />
          </InfoCard>

          <InfoCard title="Інформація про клас і заклад">
            <InfoItem
              icon={SchoolIcon}
              title="Навчальний заклад"
              subtitle={profile.school?.name || 'Не вказано'}
              variant="info"
            />
            <InfoItem
              icon={ClassIcon}
              title="Клас"
              subtitle={child.class?.name.toString() || '0'}
              variant="info"
            />
            <InfoItem
              icon={ClassIcon}
              title="Однокласники"
              subtitle={child.classmatesCount?.toString() || '0'}
              variant="info"
            />
            <InfoItem
              icon={SubjectsIcon}
              title="Предмети"
              subtitle={child.coursesCount?.toString() || '0'}
              variant="info"
            />
          </InfoCard>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.page}>
      <ProfileBanner
        name={`${profile.lastName} ${profile.firstName} ${profile.middleName}`}
        group={rolesDisplay}
        avatarUrl={profile.avatarUrl || ''}
        onEditClick={() => setIsEditModalOpen(true)}
      />

      <div className={styles.content}>
        <Tabs items={tabItems} activeId={activeTab} onTabChange={setActiveTab} />
        <div className={styles.tabContainer}>{renderTabContent()}</div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onSuccess={refetch}
        onClose={() => setIsEditModalOpen(false)}
        userRoles={profile.roles}
        initialData={{
          firstName: profile.firstName,
          lastName: profile.lastName,
          middleName: profile.middleName,
          avatarUrl: profile.avatarUrl,
        }}
      />
    </div>
  );
};
