import {useState} from "react";
import styles from "../../../App.module.css";
import Sidebar from "../Sidebar/Sidebar.tsx";
import {Outlet} from "react-router-dom";
import { NotificationsDrawer } from "../../../features/notifications";

const MainLayout = () => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    return (
        <div className={styles.appContainer}>
            <Sidebar
                isExpanded={isSidebarExpanded}
                setIsExpanded={setIsSidebarExpanded}
                onOpenNotifications={() => setIsNotificationsOpen(true)}
            />

            <main className={`${styles.mainContent} ${isSidebarExpanded ? styles.shifted : ''}`}>
                <Outlet />
            </main>

            <NotificationsDrawer
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
            />
        </div>
    );
};

export default MainLayout;