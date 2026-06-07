import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  circle?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  width,
  height,
  borderRadius,
  circle,
  className = '',
  style,
}: SkeletonProps): React.JSX.Element {
  const combinedStyle: React.CSSProperties = {
    width: width,
    height: height,
    borderRadius: circle ? '50%' : borderRadius || 'var(--radius-sm)',
    ...style,
  };

  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={combinedStyle}
    />
  );
}
