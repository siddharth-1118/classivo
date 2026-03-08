import React from 'react';
import { LucideIcon, Search } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ title, description, icon: Icon = Search, action }: EmptyStateProps) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '60px 20px',
      textAlign: 'center',
      background: 'rgba(255,255,255,0.02)',
      borderRadius: '16px',
      border: '1px dashed var(--border-subtle)',
      width: '100%'
    }}>
      <div style={{ 
        width: '64px', 
        height: '64px', 
        borderRadius: '50%', 
        background: 'var(--bg-card)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '20px',
        color: 'var(--text-muted)'
      }}>
        <Icon size={32} />
      </div>
      
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '320px', lineHeight: '1.6' }}>{description}</p>
      
      {action && (
        <button 
          onClick={action.onClick}
          className="btn btn-primary"
          style={{ marginTop: '24px' }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
