import React from 'react';
import { Search, Bell, LogOut, User } from 'lucide-react';

export default function Header({ searchVal, setSearchVal, notifications, markAllRead, theme, setTheme, user, onLogout }) {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="header">
      <div className="header-left">
        <div className="search-bar">
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar tareas, proyectos, etiquetas..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>
      </div>

      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Theme Selector */}
        <div className="theme-selector-container">
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginRight: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tema</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              className={`theme-color-dot dot-indigo ${theme === 'indigo' ? 'active' : ''}`} 
              onClick={() => setTheme('indigo')}
              title="Deep Indigo"
            />
            <button 
              className={`theme-color-dot dot-cyberpunk ${theme === 'cyberpunk' ? 'active' : ''}`} 
              onClick={() => setTheme('cyberpunk')}
              title="Cyberpunk Glow"
            />
            <button 
              className={`theme-color-dot dot-forest ${theme === 'forest' ? 'active' : ''}`} 
              onClick={() => setTheme('forest')}
              title="Forest Mist"
            />
            <button 
              className={`theme-color-dot dot-eclipse ${theme === 'eclipse' ? 'active' : ''}`} 
              onClick={() => setTheme('eclipse')}
              title="Solar Eclipse"
            />
          </div>
        </div>

        {/* Notifications menu */}
        <div className="notifications-menu" style={{ position: 'relative' }} onClick={() => {
          setShowNotifications(!showNotifications);
        }}>
          <button className="icon-btn">
            <Bell size={18} />
            {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '50px',
              right: '0',
              width: '320px',
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 100,
              padding: '16px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Notificaciones</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllRead();
                    }} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Marcar todo leído
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>
                    No hay notificaciones nuevas
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      background: notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                      borderLeft: notif.read ? 'none' : '3px solid var(--primary)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-secondary)'
                    }}>
                      <div style={{ color: 'white', fontWeight: 600, marginBottom: '2px' }}>{notif.title}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{notif.body}</div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{notif.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Logout */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--border-color)', paddingLeft: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>{user.email?.split('@')[0]}</span>
              <button 
                onClick={onLogout}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
              >
                <LogOut size={10} /> Cerrar sesión
              </button>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <User size={16} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
