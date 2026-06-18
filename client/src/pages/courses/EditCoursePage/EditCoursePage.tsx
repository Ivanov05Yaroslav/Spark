import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import styles from './EditCoursePage.module.css';

import { CenteredFormLayout } from '@/components/layout/CenteredFormLayout/CenteredFormLayout.tsx';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox/CustomCheckbox.tsx';
import { ThemeColorPicker } from '@/components/courses/ThemeColorPicker/ThemeColorPicker.tsx';
import { SelectField } from '@/components/ui/SelectField/SelectField.tsx';
import { FileUpload } from '@/components/ui/FileUpload/FileUpload.tsx';
import { MultiSelectField } from "@/components/ui/MultiSelectField/MultiSelectField.tsx";

const subjectOptions = [
    { value: 'math', label: 'Математика' },
    { value: 'english', label: 'Англійська мова' },
];
const gradeOptions = [
    { value: '5', label: '5 клас' },
    { value: '6', label: '6 клас' },
];
const coTeacherOptions = [
    { value: 'teacher1', label: 'Іван Іванов' },
    { value: 'teacher2', label: 'Марія Петрова' },
];
const groupOptions = [
    { value: '1', label: 'Група 1' },
    { value: '2', label: 'Група 2' },
];
const studentOptions = [
    { value: 'all', label: 'Всі студенти' },
    { value: '1', label: 'Студент 1' },
    { value: '2', label: 'Студент 2' },
    { value: '3', label: 'Студент 3' },
    { value: '4', label: 'Студент 4' },
    { value: '5', label: 'Студент 5' },
    { value: '6', label: 'Студент 6' },
];

export const EditCoursePage = () => {
    const navigate = useNavigate();

    const [isDivided, setIsDivided] = useState(false);
    const [themeColor, setThemeColor] = useState('teal');
    const [subject, setSubject] = useState('');
    const [grade, setGrade] = useState('');
    const [coTeachers, setCoTeachers] = useState<string[]>([]);
    const [groupNumber, setGroupNumber] = useState('');
    const [students, setStudents] = useState<string[]>([]);
    const [backgroundFiles, setBackgroundFiles] = useState<File[]>([]);

    const handleSave = () => {
        console.log("Збереження курсу з кольором:", themeColor);
        console.log("Розділено на групи:", isDivided);
    };

    return (
        <CenteredFormLayout
            title="РЕДАГУВАННЯ КУРСУ"
            onBack={() => navigate(-1)}
            showButton={true}
            buttonText="Зберегти"
            onButtonClick={handleSave}
            maxWidth="1050px"
        >
            <div className={styles.contentGrid}>
                <div className={styles.leftColumn}>
                    <SelectField
                        label="Предмет"
                        placeholder="Оберіть предмет"
                        options={subjectOptions}
                        value={subject}
                        onChange={setSubject}
                        disabled={true}
                    />

                    <SelectField
                        label="Клас"
                        placeholder="Оберіть клас"
                        options={gradeOptions}
                        value={grade}
                        onChange={setGrade}
                        disabled={true}
                    />

                    <MultiSelectField
                        label="Співвикладач"
                        placeholder="Оберіть співвикладачів"
                        options={coTeacherOptions}
                        value={coTeachers}
                        onChange={setCoTeachers}
                    />

                    <div className={styles.checkboxWrapper}>
                        <CustomCheckbox
                            label="Розділити на групи"
                            checked={isDivided}
                            onChange={(e) => setIsDivided(e.target.checked)}
                        />
                    </div>

                    {isDivided && (
                        <>
                            <SelectField
                                label="Номер групи"
                                placeholder="Оберіть номер групи"
                                options={groupOptions}
                                value={groupNumber}
                                onChange={setGroupNumber}
                            />

                            <MultiSelectField
                                label="Студенти"
                                placeholder="Оберіть студентів"
                                options={studentOptions}
                                value={students}
                                onChange={setStudents}
                            />
                        </>
                    )}
                </div>

                <div className={styles.rightColumn}>
                    <FileUpload
                        label="Фонове зображення"
                        height="140px"
                        maxFiles={1}
                        values={backgroundFiles}
                        onFilesChange={setBackgroundFiles}
                    />

                    <div className={styles.themeSection}>
                        <ThemeColorPicker
                            selectedColor={themeColor}
                            onChange={setThemeColor}
                        />
                    </div>
                </div>
            </div>
        </CenteredFormLayout>
    );
};