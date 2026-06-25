import React from 'react';
import styles from './GradesTable.module.css';

interface GradeItem {
  id: string;
  subject: string;
  unitGrades1: string;
  semester1: string;
  unitGrades2: string;
  semester2: string;
  annualGrade: string;
}

interface GradesTableProps {
  data?: GradeItem[];
}

const mockGrades: GradeItem[] = Array.from({ length: 10 }, (_, index) => ({
  id: String(index + 1),
  subject: 'Informatics',
  unitGrades1: '11, 11, 11',
  semester1: '11',
  unitGrades2: '11, 11, 11',
  semester2: '11',
  annualGrade: '11',
}));

export const GradesTable: React.FC<GradesTableProps> = ({ data = mockGrades }) => {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Grades</h3>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>Предмет</th>
              <th className={styles.thRight}>Тематичні оцінки</th>
              <th className={styles.thRight}>Семестр 1</th>
              <th className={styles.thRight}>Тематичні оцінки</th>
              <th className={styles.thRight}>Семестр 2</th>
              <th className={styles.thRight}>Річна оцінка</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className={styles.row}>
                <td className={styles.tdSubject}>{row.subject}</td>
                <td className={styles.tdGrade}>{row.unitGrades1}</td>
                <td className={styles.tdGrade}>{row.semester1}</td>
                <td className={styles.tdGrade}>{row.unitGrades2}</td>
                <td className={styles.tdGrade}>{row.semester2}</td>
                <td className={styles.tdAnnual}>{row.annualGrade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
