import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/wallets', label: 'Minhas Carteiras', icon: '💼' },
    { path: '/sent', label: 'Enviado', icon: '📤' },
    { path: '/received', label: 'Recebido', icon: '📥' },
    { path: '/duplicates', label: 'Duplicados', icon: '⚠️' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '250px' : '60px',
        backgroundColor: '#1f2937',
        color: 'white',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1rem', 
          borderBottom: '1px solid #374151',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {sidebarOpen && (
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
                USDT Monitor
              </h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
                {user?.username}
              </p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Menu Items */}
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                color: location.pathname === item.path ? '#3b82f6' : '#d1d5db',
                backgroundColor: location.pathname === item.path ? '#1e40af20' : 'transparent',
                textDecoration: 'none',
                borderLeft: location.pathname === item.path ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '1.25rem', marginRight: sidebarOpen ? '0.75rem' : '0' }}>
                {item.icon}
              </span>
              {sidebarOpen && (
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid #374151' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              color: '#d1d5db',
              cursor: 'pointer',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <span style={{ fontSize: '1.25rem', marginRight: sidebarOpen ? '0.75rem' : '0' }}>
              🚪
            </span>
            {sidebarOpen && (
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                Sair
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;

