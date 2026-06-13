import React from 'react';
import { LayoutDashboard, CheckSquare, BarChart3, Clock, Sparkles, Download, Upload, BookOpen, Calendar } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, pomodoroTime, isPomoRunning, pomoMode, onExportData, onImportData }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPomoLabel = () => {
    if (pomoMode === 'work') return 'Enfoque';
    if (pomoMode === 'shortBreak') return 'Recreo';
    return 'Descanso';
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">
          <div className="logo-icon" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/edubot-logo.png" alt="EduBot Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span className="logo-text">EduBot</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'board' ? 'active' : ''}`}
            onClick={() => setActiveTab('board')}
          >
            <Calendar size={18} />
            <span>Planificador de Estudio</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'focus' ? 'active' : ''}`}
            onClick={() => setActiveTab('focus')}
          >
            <CheckSquare size={18} />
            <span>Mi Enfoque Diario</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            <BarChart3 size={18} />
            <span>Métricas e Historial</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'study' ? 'active' : ''}`}
            onClick={() => setActiveTab('study')}
          >
            <BookOpen size={18} />
            <span>Centro de Estudio</span>
          </button>
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="mini-pomodoro-widget">
          <div className="mini-pomo-progress">
            <svg width="40" height="40" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="3"
                fill="transparent"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke={isPomoRunning ? "var(--primary)" : "var(--text-muted)"}
                strokeWidth="3"
                fill="transparent"
                strokeDasharray={100}
                strokeDashoffset={100 - (pomodoroTime / (pomoMode === 'work' ? 1500 : pomoMode === 'shortBreak' ? 300 : 900)) * 100}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={14} className={isPomoRunning ? 'pulse-dot' : ''} style={{ animation: isPomoRunning ? 'pulse 2s infinite' : 'none', color: isPomoRunning ? 'var(--primary)' : 'var(--text-muted)' }} />
            </div>
          </div>
          <div>
            <div className="mini-pomo-time">{formatTime(pomodoroTime)}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {getPomoLabel()} {isPomoRunning ? '(Activo)' : '(Pausado)'}
            </div>
          </div>
        </div>

        {/* Data backups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '4px', letterSpacing: '0.5px' }}>Datos Locales</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={onExportData} 
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '8px', fontSize: '11px', gap: '4px', justifyContent: 'center' }}
              title="Descargar datos en un archivo JSON"
            >
              <Download size={12} />
              <span>Exportar</span>
            </button>
            <label 
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '8px', fontSize: '11px', gap: '4px', justifyContent: 'center', cursor: 'pointer' }}
              title="Subir un archivo JSON de respaldo"
            >
              <Upload size={12} />
              <span>Importar</span>
              <input 
                type="file" 
                accept=".json" 
                onChange={onImportData} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
}
