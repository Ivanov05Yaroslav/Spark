import type { ComponentType, SVGProps } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { useStore } from '../../../stores/useStore';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import SparkLogo from '../../../assets/logo.svg?react';
import DashboardIcon from '../../../assets/dashboard.svg?react';
import JournalIcon from '../../../assets/journal.svg?react';
import NotificationsIcon from '../../../assets/notifications.svg?react';
import ChatsIcon from '../../../assets/chats.svg?react';
import StatisticsIcon from '../../../assets/statistics.svg?react';
import AdminIcon from '../../../assets/admin.svg?react';
import LogoutIcon from '../../../assets/logout.svg?react';
import { ROLE_LABELS } from '@/libs/constants/users.constants';

type NavItem = {
  id: number;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  path?: string;
};

type SidebarProps = {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  onOpenNotifications?: () => void;
};

const ROLE_TRANSLATIONS: Record<string, string> = {
  TEACHER: 'Учитель',
  ADMIN: 'Адміністратор',
  PARENT: 'Батько / Мати',
  STUDENT: 'Учень',
};

export const Sidebar = ({ isExpanded, setIsExpanded, onOpenNotifications }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);

  const navItems: NavItem[] = [
    { id: 1, label: 'Мої курси', icon: DashboardIcon, path: '/courses' },
    { id: 2, label: 'Журнал', icon: JournalIcon, path: '/journal' },
    { id: 3, label: 'Сповіщення', icon: NotificationsIcon },
    { id: 4, label: 'Чати', icon: ChatsIcon, path: '/chats' },
    { id: 5, label: 'Статистика', icon: StatisticsIcon, path: '/statistics' },
    { id: 6, label: 'Адмін панель', icon: AdminIcon, path: '/admin' },
  ];

  const handleItemClick = (label: string, path?: string) => {
    if (label === 'Сповіщення' && onOpenNotifications) {
      onOpenNotifications();
    } else if (path) {
      navigate(path);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fullName = user
    ? `${user.lastName} ${user.firstName} ${user.middleName}`.trim()
    : 'Завантаження...';

  const roleString = user?.roles?.[0] || '';
  const roleKey = roleString.replace('ROLE_', '');
  const displayRole = ROLE_LABELS[roleKey] || 'Користувач';

  const defaultAvatar = user
    ? `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=E1D4FE&color=702DFF`
    : `https://ui-avatars.com/api/?name=User&background=E1D4FE&color=702DFF`;

  const avatarSrc = user?.avatarUrl || defaultAvatar;

  return (
    <aside
      className={`${styles.sidebar} ${isExpanded ? styles.expanded : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={styles.logoSection}>
        <div className={styles.logoIconContainer}>
          <SparkLogo className={styles.sparkLogo} />
        </div>
        <span className={styles.brandName}>SPARK</span>
      </div>

      <nav className={styles.navSection}>
        {navItems.map((item) => {
          const isActive = item.path ? location.pathname === item.path : false;
          const IconComponent = item.icon;

          return (
            <div
              key={item.id}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => handleItemClick(item.label, item.path)}
              style={{ cursor: 'pointer' }}
            >
              <IconComponent className={styles.icon} />
              <span className={styles.navLabel}>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className={styles.bottomSection}>
        <div
          className={styles.profileItem}
          onClick={() => navigate('/profile')}
          style={{ cursor: 'pointer' }}
        >
          <Avatar
            src={
              avatarSrc ||
              `https://ui-avatars.com/api/?name=${fullName.replace(' ', '+')}&background=EBF4FF&color=4F46E5`
            }
            size={40}
            className={styles.avatar}
          />
          <div className={styles.profileInfo}>
            <span className={styles.profileName} title={fullName}>
              {fullName}
            </span>
            <span className={styles.profileRole}>{displayRole}</span>
          </div>
        </div>

        <div className={styles.logoutItem} onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <LogoutIcon className={styles.logoutIcon} />
          <span className={styles.logoutLabel}>Вийти</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
