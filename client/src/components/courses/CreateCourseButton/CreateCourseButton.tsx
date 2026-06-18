import CreateCourseIcon from '../../../assets/createCourse.svg?react';
import styles from './CreateCourseButton.module.css';

interface CreateCourseButtonProps {
    onClick?: () => void;
}

export const CreateCourseButton = ({ onClick }: CreateCourseButtonProps) => {
    return (
        <button
            type="button"
            className={styles.button}
            onClick={onClick}
        >
            <span className={styles.text}>Створити курс</span>
            <CreateCourseIcon className={styles.icon} />
        </button>
    );
};