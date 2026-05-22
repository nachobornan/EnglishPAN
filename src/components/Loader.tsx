export function Loader() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div
                style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid rgba(255, 183, 3, 0.2)',
                    borderTopColor: 'var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}
            />
            <style>{`
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
      `}</style>
        </div>
    );
}
