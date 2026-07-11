import React from 'react';
import { SecondaryButton } from '@/components/ui/SecondaryButton/SecondaryButton.tsx';
import StarsLanding from '@/assets/starsLanding.svg?react';
import User from '@/assets/user.svg?react';
import Parent from '@/assets/parent.svg?react';
import School from '@/assets/school.svg?react';
import styles from './LandingPage.module.css';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegisterParent = () => {
    navigate('/parent/register/init');
  };

  const handleRegisterSchool = () => {
    navigate('/school/register/init');
  };

  return (
    <div className={styles.landingContainer}>
      <main className={styles.contentSection}>
        <h1 className={styles.title}>ЛАСКАВО ПРОСИМО ДО SPARK</h1>
        <p className={styles.subtitle}>
          Платформа для сучасної освіти та ефективної взаємодії між школами, учнями та батьками.
        </p>

        <div className={styles.buttonGroup}>
          <SecondaryButton onClick={handleLogin} icon={<User />}>
            Login
          </SecondaryButton>

          <SecondaryButton onClick={handleRegisterParent} icon={<Parent />}>
            Register as Parent
          </SecondaryButton>

          <SecondaryButton onClick={handleRegisterSchool} icon={<School />}>
            Register School
          </SecondaryButton>
        </div>
      </main>

      <div className={styles.starsWrapper}>
        <StarsLanding className={styles.starsSvg} preserveAspectRatio="xMaxYMin slice" />
      </div>
    </div>
  );
};
