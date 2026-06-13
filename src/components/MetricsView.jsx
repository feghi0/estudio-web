import React from 'react';
import { BarChart3, CheckCircle2, Clock, Flame, Award, ShieldAlert, CheckSquare, Dumbbell } from 'lucide-react';

export default function MetricsView({ tasks, dailyTasks, pomodoroHistory, habits }) {
  // Calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.column === 'done').length;
  
  const totalDaily = dailyTasks.length;
  const completedDaily = dailyTasks.filter(t => t.completed).length;

  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => h.completed).length;

  // Productivity Score Calculation (out of 100)
  // 40% Kanban, 30% Daily, 30% Habits
  const kanbanWeight = totalTasks > 0 ? (completedTasks / totalTasks) * 40 : 0;
  const dailyWeight = totalDaily > 0 ? (completedDaily / totalDaily) * 30 : 0;
  const habitsWeight = totalHabits > 0 ? (completedHabits / totalHabits) * 30 : 0;
  const productivityScore = Math.round(kanbanWeight + dailyWeight + habitsWeight);

  const getScoreLabel = (score) => {
    if (score >= 90) return { text: 'Nivel Élite', color: 'var(--secondary)' };
    if (score >= 70) return { text: 'Enfoque Alto', color: 'var(--primary)' };
    if (score >= 50) return { text: 'Productivo', color: 'var(--accent-cyan)' };
    return { text: 'Iniciando', color: 'var(--text-muted)' };
  };

  const scoreDetails = getScoreLabel(productivityScore);

  // Priority counts
  const highPriority = tasks.filter(t => t.priority === 'high');
  const mediumPriority = tasks.filter(t => t.priority === 'medium');
  const lowPriority = tasks.filter(t => t.priority === 'low');

  const getPriorityPercentage = (count) => {
    if (totalTasks === 0) return 0;
    return Math.round((count / totalTasks) * 100);
  };

  // Habit completion rate
  const habitPercentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  // Maximum streak calculation
  const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0;

  return (
    <div className="metrics-container">
      <div className="metrics-header">
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'white' }}>Panel de Métricas y Rendimiento</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Analiza tu progreso diario, hábitos completados y estadísticas del temporizador de enfoque.
        </p>
      </div>

      {/* Grid summarizing core metrics */}
      <div className="metrics-summary-grid">
        <div className="glass-panel metric-stat-card">
          <div className="metric-stat-icon stat-icon-blue">
            <CheckCircle2 size={24} />
          </div>
          <div className="metric-stat-info">
            <span className="metric-stat-number">{completedTasks}/{totalTasks}</span>
            <span className="metric-stat-label">Tareas Kanban</span>
          </div>
        </div>

        <div className="glass-panel metric-stat-card">
          <div className="metric-stat-icon stat-icon-green">
            <CheckSquare size={24} />
          </div>
          <div className="metric-stat-info">
            <span className="metric-stat-number">{completedDaily}/{totalDaily}</span>
            <span className="metric-stat-label">Pendientes Diarios</span>
          </div>
        </div>

        <div className="glass-panel metric-stat-card">
          <div className="metric-stat-icon stat-icon-amber">
            <Flame size={24} />
          </div>
          <div className="metric-stat-info">
            <span className="metric-stat-number">{maxStreak} días</span>
            <span className="metric-stat-label">Racha de Hábitos Máx.</span>
          </div>
        </div>

        <div className="glass-panel metric-stat-card">
          <div className="metric-stat-icon stat-icon-purple">
            <Clock size={24} />
          </div>
          <div className="metric-stat-info">
            <span className="metric-stat-number">{pomodoroHistory.length}</span>
            <span className="metric-stat-label">Pomodoros Hechos</span>
          </div>
        </div>
      </div>

      <div className="metrics-charts-row">
        {/* Left Side: Score & Priorities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Productivity score wheel card */}
          <div className="glass-panel chart-panel-card" style={{ display: 'flex', alignItems: 'center', gap: '40px', padding: '32px' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
              <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="rgba(255, 255, 255, 0.03)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="var(--primary)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="314.15" // 2 * pi * 50
                  strokeDashoffset={314.15 - (productivityScore / 100) * 314.15}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 0.8s ease-out',
                    filter: 'drop-shadow(0 0 6px rgba(var(--primary-raw), 0.4))'
                  }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'white', lineHeight: 1 }}>{productivityScore}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>Score</div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} style={{ color: scoreDetails.color }} />
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>Puntaje de Enfoque Diario</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
                Tu puntaje actual es de <strong style={{ color: 'white' }}>{productivityScore} puntos</strong>, lo que te coloca en la categoría <strong style={{ color: scoreDetails.color }}>{scoreDetails.text}</strong>. Este cálculo integra tareas Kanban resueltas, hábitos marcados y checklists diarias completadas.
              </p>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="glass-panel chart-panel-card">
            <h2 className="chart-panel-title">
              <ShieldAlert size={18} style={{ color: 'var(--accent-rose)' }} />
              <span>Carga de Trabajo por Prioridad</span>
            </h2>
            <div className="priority-distribution-list">
              <div className="priority-distribution-item">
                <div className="dist-bar-header">
                  <span>Prioridad Alta</span>
                  <span>{highPriority.length} tareas ({getPriorityPercentage(highPriority.length)}%)</span>
                </div>
                <div className="dist-bar-track">
                  <div className="dist-bar-fill fill-high" style={{ width: `${getPriorityPercentage(highPriority.length)}%` }}></div>
                </div>
              </div>

              <div className="priority-distribution-item">
                <div className="dist-bar-header">
                  <span>Prioridad Media</span>
                  <span>{mediumPriority.length} tareas ({getPriorityPercentage(mediumPriority.length)}%)</span>
                </div>
                <div className="dist-bar-track">
                  <div className="dist-bar-fill fill-medium" style={{ width: `${getPriorityPercentage(mediumPriority.length)}%` }}></div>
                </div>
              </div>

              <div className="priority-distribution-item">
                <div className="dist-bar-header">
                  <span>Prioridad Baja</span>
                  <span>{lowPriority.length} tareas ({getPriorityPercentage(lowPriority.length)}%)</span>
                </div>
                <div className="dist-bar-track">
                  <div className="dist-bar-fill fill-low" style={{ width: `${getPriorityPercentage(lowPriority.length)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Habits Overview & Pomodoro logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Habits progress panel */}
          <div className="glass-panel chart-panel-card">
            <h2 className="chart-panel-title">
              <Dumbbell size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>Rendimiento de Hábitos</span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'white' }}>{habitPercentage}%</div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Completado de hoy</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>{completedHabits}/{totalHabits}</div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Hábitos del día</span>
              </div>
            </div>
            <div className="dist-bar-track" style={{ height: '6px' }}>
              <div className="dist-bar-fill" style={{ width: `${habitPercentage}%`, background: 'linear-gradient(to right, var(--primary), var(--accent-cyan))' }}></div>
            </div>
          </div>

          {/* Completed Pomodoros list */}
          <div className="glass-panel chart-panel-card" style={{ flex: 1 }}>
            <h2 className="chart-panel-title">
              <Clock size={18} style={{ color: 'var(--accent-purple)' }} />
              <span>Historial de Pomodoros</span>
            </h2>
            <div className="pomodoro-history-list">
              {pomodoroHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No has completado sesiones de enfoque hoy.
                </div>
              ) : (
                [...pomodoroHistory].reverse().map((pomo) => (
                  <div key={pomo.id} className="pomo-history-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: pomo.mode === 'work' ? 'var(--primary)' : 'var(--secondary)'
                      }}></div>
                      <span style={{ fontWeight: 600, color: 'white' }}>
                        {pomo.mode === 'work' ? 'Sesión de Enfoque' : 'Descanso Completado'}
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{pomo.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
