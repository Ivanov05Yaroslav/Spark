import { forwardRef, type InputHTMLAttributes } from 'react';
import styles from './SearchInput.module.css';
import searchIcon from '../../../assets/search.svg';

export type SearchInputProps = InputHTMLAttributes<HTMLInputElement>;

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
    ({ className = '', ...props }, ref) => {
        return (
            <div className={styles.wrapper}>
                <img
                    src={searchIcon}
                    alt="Search"
                    className={styles.icon}
                />

                <input
                    ref={ref}
                    type="text"
                    className={`${styles.input} ${className}`}
                    {...props}
                />
            </div>
        );
    }
);

SearchInput.displayName = 'SearchInput';