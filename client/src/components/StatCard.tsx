import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
}

export default function StatCard({ title, value, icon: Icon, color, description, trend }: StatCardProps) {
  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{title}</p>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{value}</h3>
        </div>
        <div style={{ 
          padding: '10px', 
          background: `${color}20`, 
          borderRadius: '12px', 
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={20} />
        </div>
      </div>
      
      {(description || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          {trend && (
            <span style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: trend.isUp ? 'var(--success)' : 'var(--error)',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}>
              {trend.isUp ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
          )}
          {description && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
