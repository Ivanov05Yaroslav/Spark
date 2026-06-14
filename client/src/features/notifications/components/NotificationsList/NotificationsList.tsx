import { NotificationItem } from '../NotificationItem/NotificationItem';
import { Divider } from '../../../../components/ui/Divider/Divider';
import styles from './NotificationsList.module.css';

const mockNotifications = [
    { id: 1, isUnread: true, userName: "Сара Джеймс", message: "перевірила Завдання 1", courseName: "Інформатика 11-Б", avatar: "https://i.pravatar.cc/150?img=47", date: "25 березня, 23:59" },
    { id: 2, isUnread: true, userName: "Сара Джеймс", message: "перевірила Завдання 1", courseName: "Інформатика 11-Б", avatar: "https://i.pravatar.cc/150?img=47", date: "25 березня, 23:59" },
    { id: 3, isUnread: true, userName: "Сара Джеймс", message: "перевірила Завдання 1", courseName: "Інформатика 11-Б", avatar: "https://i.pravatar.cc/150?img=47", date: "25 березня, 23:59" },
    { id: 4, isUnread: true, userName: "Сара Джеймс", message: "перевірила Завдання 1", courseName: "Інформатика 11-Б", avatar: "https://i.pravatar.cc/150?img=47", date: "25 березня, 23:59" },
    { id: 5, isUnread: false, userName: "Сара Джеймс", message: "залишила коментар", courseName: "Інформатика 11-Б", avatar: "https://i.pravatar.cc/150?img=47", date: "25 березня, 23:59" },
    { id: 6, isUnread: false, userName: "Сара Джеймс", message: "залишила коментар", courseName: "Інформатика 11-Б", avatar: "https://i.pravatar.cc/150?img=47", date: "25 березня, 23:59" },
    { id: 7, isUnread: false, userName: "Сара Джеймс", message: "залишила коментар", courseName: "Інформатика 11-Б", avatar: "https://i.pravatar.cc/150?img=47", date: "25 березня, 23:59" },
    { id: 8, isUnread: false, userName: "Сара Джеймс", message: "залишила коментар", courseName: "Інформатика 11-Б", avatar: "https://i.pravatar.cc/150?img=47", date: "25 березня, 23:59" },
    { id: 9, isUnread: false, userName: "Сара Джеймс", message: "залишила коментар", courseName: "Інформатика 11-Б", avatar: "https://i.pravatar.cc/150?img=47", date: "25 березня, 23:59" },
];

export const NotificationsList = () => {
    if (mockNotifications.length === 0) {
        return <div className={styles.empty}>Немає нових повідомлень</div>;
    }

    return (
        <div className={styles.listContainer}>
            {mockNotifications.map((notification, index) => (
                <div key={notification.id}>
                    <NotificationItem
                        isUnread={notification.isUnread}
                        userName={notification.userName}
                        message={notification.message}
                        courseName={notification.courseName}
                        avatarSrc={notification.avatar}
                        date={notification.date}
                    />
                    {index < mockNotifications.length - 1 && <Divider />}
                </div>
            ))}
        </div>
    );
};