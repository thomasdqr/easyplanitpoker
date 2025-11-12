import { ReactNode } from 'react';
import './Button.css';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  className?: string;
}

export default function Button({ 
  children, 
  onClick, 
  type = 'button',
  size = 'md',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  icon,
  className = ''
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`custom-button ${size} ${variant} ${fullWidth ? 'full-width' : ''} ${className}`}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {children}
    </button>
  );
} 