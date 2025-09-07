export function LoadingSpinner({ size = 'md', color = 'primary' }) {
  const sizeClasses = {
    sm: { width: '20px', height: '20px', borderWidth: '2px' },
    md: { width: '40px', height: '40px', borderWidth: '4px' },
    lg: { width: '60px', height: '60px', borderWidth: '6px' }
  };

  const colorClasses = {
    primary: 'var(--primary-color)',
    secondary: 'var(--secondary-color)',
    white: '#ffffff'
  };

  return (
    <div 
      className="loading-spinner"
      style={{
        ...sizeClasses[size],
        borderTopColor: colorClasses[color]
      }}
    />
  );
}

export function LoadingOverlay({ children, loading }) {
  if (!loading) return children;

  return (
    <div style={{ position: 'relative' }}>
      {children}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--border-radius)'
      }}>
        <LoadingSpinner />
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card">
      <div className="card-body">
        <div className="skeleton" style={{ height: '24px', marginBottom: '1rem', borderRadius: '4px' }} />
        <div className="skeleton" style={{ height: '16px', marginBottom: '0.5rem', borderRadius: '4px', width: '80%' }} />
        <div className="skeleton" style={{ height: '16px', marginBottom: '1rem', borderRadius: '4px', width: '60%' }} />
        <div className="skeleton" style={{ height: '40px', borderRadius: '8px' }} />
      </div>
    </div>
  );
}

export default LoadingSpinner;
