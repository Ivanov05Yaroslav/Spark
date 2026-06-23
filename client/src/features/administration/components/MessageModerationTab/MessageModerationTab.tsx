import React, { useState, useMemo } from 'react';
import { SearchInput } from '@/components/ui/SearchInput/SearchInput';
import { ModerationReportCard } from '@/components/administration/ModerationReportCard/ModerationReportCard';
import styles from './MessageModerationTab.module.css';

const MOCK_REPORTS = [
    {
        id: 'report-1',
        messageText: 'Ты вообще ничего не понимаешь в этом предмете, прекрати писать бред!',
        messageTime: '14:32',
        reportReason: 'Образа інших учасників / Булінг',
        reporter: {
            id: 'u-1',
            firstName: 'Иван',
            lastName: 'Франко',
            middleName: 'Яковлевич',
            role: 'STUDENT',
            roleLabel: 'Учень',
            avatarUrl: ''
        },
        reportedUser: {
            id: 'u-2',
            firstName: 'Александр',
            lastName: 'Коваленко',
            middleName: 'Петрович',
            role: 'STUDENT',
            roleLabel: 'Учень',
            avatarUrl: ''
        }
    },
    {
        id: 'report-2',
        messageText: 'Давай встретимся после уроков за школой и разберемся, если ты такой смелый.',
        messageTime: '15:05',
        reportReason: 'Образа інших учасників / Булінг',
        reporter: {
            id: 'u-3',
            firstName: 'Мария',
            lastName: 'Шевченко',
            middleName: 'Ивановна',
            role: 'TEACHER',
            roleLabel: 'Вчитель',
            avatarUrl: ''
        },
        reportedUser: {
            id: 'u-4',
            firstName: 'Дмитрий',
            lastName: 'Мельник',
            middleName: 'Сергеевич',
            role: 'STUDENT',
            roleLabel: 'Учень',
            avatarUrl: ''
        }
    }
];

export const MessageModerationTab = () => {
    const [reports, setReports] = useState(MOCK_REPORTS);
    const [searchQuery, setSearchQuery] = useState('');

    const handleApprove = (id: string) => {
        setReports(prev => prev.filter(report => report.id !== id));
        console.log(`Report ${id} approved (kept message, cleared report)`);
    };

    const handleReject = (id: string) => {
        setReports(prev => prev.filter(report => report.id !== id));
        console.log(`Report ${id} rejected`);
    };

    const handleBlockUser = (id: string) => {
        const report = reports.find(r => r.id === id);
        if (report) {
            console.log(`User ${report.reportedUser.firstName} ${report.reportedUser.lastName} has been blocked`);
        }
        setReports(prev => prev.filter(report => report.id !== id));
    };

    const handleDeleteMessage = (id: string) => {
        setReports(prev => prev.filter(report => report.id !== id));
        console.log(`Message in report ${id} deleted`);
    };

    const filteredReports = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return reports;

        return reports.filter(report => {
            const messageMatches = report.messageText.toLowerCase().includes(query);
            const reporterName = `${report.reporter.firstName} ${report.reporter.lastName}`.toLowerCase();
            const reportedName = `${report.reportedUser.firstName} ${report.reportedUser.lastName}`.toLowerCase();

            return messageMatches || reporterName.includes(query) || reportedName.includes(query);
        });
    }, [reports, searchQuery]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <SearchInput
                    placeholder="Пошук скарг за текстом або користувачем..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className={styles.list}>
                {filteredReports.length > 0 ? (
                    filteredReports.map(report => (
                        <ModerationReportCard
                            key={report.id}
                            id={report.id}
                            reporter={report.reporter}
                            reportedUser={report.reportedUser}
                            messageText={report.messageText}
                            messageTime={report.messageTime}
                            reportReason={report.reportReason}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onBlockUser={handleBlockUser}
                            onDeleteMessage={handleDeleteMessage}
                        />
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        Скарг на повідомлення не знайдено
                    </div>
                )}
            </div>
        </div>
    );
};