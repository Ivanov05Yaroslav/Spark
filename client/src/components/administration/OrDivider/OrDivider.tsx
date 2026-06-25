import React from 'react';

export const OrDivider = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        margin: '24px 0',
        color: '#7E7E7E',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        fontWeight: 500,
      }}
    >
      <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
      <span style={{ padding: '0 16px', textTransform: 'lowercase' }}>або</span>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
    </div>
  );
};
