import React from 'react';
import styles from './DatePickerField.module.css';
import CalendarIcon from '@/assets/calendar.svg?react';

interface DatePickerFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const formatUkDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const dayMonth = new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
  }).format(date);

  const year = date.getFullYear();

  const time = new Intl.DateTimeFormat('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  return `${dayMonth}, ${year} о ${time}`;
};

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Оберіть дату та час',
}) => {
  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}

      <div className={styles.inputWrapper}>
        <input
          type="datetime-local"
          className={styles.nativeInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        <div className={`${styles.displayValue} ${!value ? styles.placeholder : ''}`}>
          {value ? formatUkDate(value) : placeholder}
        </div>

        <CalendarIcon className={styles.icon} />
      </div>
    </div>
  );
};
