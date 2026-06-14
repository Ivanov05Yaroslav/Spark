import React from 'react';
import { CreateCourseButton } from '../CreateCourseButton/CreateCourseButton';
import StarsIcon from '../../../../assets/stars.svg?react';
import styles from './CoursesBanner.module.css';

export const CoursesBanner: React.FC = () => {
    return (
        <div className={styles.banner}>
            <div className={styles.content}>
                <h1 className={styles.title}>
                    Керуйте всім навчальним процесом в одному місці зі<br />Spark
                </h1>
                <CreateCourseButton />
            </div>

            <StarsIcon className={styles.starsDecoration} />
        </div>
    );
};