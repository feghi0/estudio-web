import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Check, Clock, Trash2, Heart, Award, Zap, Flame, Volume2, VolumeX, Sparkles } from 'lucide-react';

export default function DailyFocusView({
  pomodoroTime,
  setPomodoroTime,
  isPomoRunning,
  setIsPomoRunning,
  pomoMode,
  setPomoMode,
  activityLogs,
  dailyTasks,
  onToggleDailyTask,
  onAddDailyTask,
  onDeleteDailyTask,
  habits,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
  audioMode,
  setAudioMode,
  audioVolume,
  setAudioVolume
}) {
  const [newDailyTaskText, setNewDailyTaskText] = useState('');
  const [newHabitText, setNewHabitText] = useState('');

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playAlarmSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc1.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
      osc2.frequency.setValueAtTime(329.63, ctx.currentTime + 0.15); // E4
      osc2.frequency.setValueAtTime(392.00, ctx.currentTime + 0.3); // G4

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.65);
      osc2.stop(ctx.currentTime + 0.65);
    } catch (e) {
      console.log('Audio Context failed', e);
    }
  };



  const handleModeChange = (mode) => {
    setIsPomoRunning(false);
    setPomoMode(mode);
    if (mode === 'work') setPomodoroTime(1500);
    else if (mode === 'shortBreak') setPomodoroTime(300);
    else if (mode === 'longBreak') setPomodoroTime(900);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newDailyTaskText.trim()) return;
    onAddDailyTask(newDailyTaskText.trim());
    setNewDailyTaskText('');
  };

  const handleAddHabitSubmit = (e) => {
    e.preventDefault();
    if (!newHabitText.trim()) return;
    onAddHabit(newHabitText.trim());
    setNewHabitText('');
  };

  const getModeMaxTime = () => {
    if (pomoMode === 'work') return 1500;
    if (pomoMode === 'shortBreak') return 300;
    return 900;
  };
  const percentage = (pomodoroTime / getModeMaxTime()) * 100;
  const strokeDashoffset = 565 - (percentage / 100) * 565;

  const completedDailyCount = dailyTasks.filter(t => t.completed).length;
  const totalDailyCount = dailyTasks.length;
  const dailyPercentage = totalDailyCount > 0 ? Math.round((completedDailyCount / totalDailyCount) * 100) : 0;

  return (
    <div className="focus-container">
      {/* Left side: Checklist, Habits and Activity */}
      <div className="focus-left">
        {/* Daily Checklist */}
        <div className="glass-panel focus-card">
          <div className="focus-header-row">
            <div>
              <div className="focus-title">Planificador Diario</div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Tu espacio de concentración personal para hoy
              </p>
            </div>
            {totalDailyCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Progreso: {completedDailyCount}/{totalDailyCount} ({dailyPercentage}%)
                </span>
                <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${dailyPercentage}%`, height: '100%', background: 'var(--secondary)', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleAddSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
            <input
              type="text"
              className="modal-input"
              placeholder="¿Qué tienes planeado hacer hoy? (Ej: Diseñar Dashboard, Standup...)"
              value={newDailyTaskText}
              onChange={(e) => setNewDailyTaskText(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 18px' }}>
              <Plus size={18} />
            </button>
          </form>

          <div className="daily-tasks-list">
            {dailyTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                No tienes tareas personales agregadas para hoy. ¡Agrega una arriba!
              </div>
            ) : (
              dailyTasks.map(task => (
                <div key={task.id} className={`daily-task-item ${task.completed ? 'completed' : ''}`}>
                  <div className="daily-task-content">
                    <div className="custom-checkbox" onClick={() => onToggleDailyTask(task.id)}>
                      {task.completed && <Check size={14} />}
                    </div>
                    <span className="daily-task-text">{task.text}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="daily-task-tag">{task.category || 'General'}</span>
                    <button
                      onClick={() => onDeleteDailyTask(task.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-rose)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Habit Tracker */}
        <div className="glass-panel focus-card" style={{ marginTop: '20px' }}>
          <div className="focus-header-row">
            <div>
              <div className="focus-title">Seguimiento de Hábitos</div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Registra tus hábitos diarios y mantén tus rachas activas
              </p>
            </div>
            {habits.length > 0 && (
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Completado: {habits.filter(h => h.completed).length}/{habits.length}
              </span>
            )}
          </div>

          <form onSubmit={handleAddHabitSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
            <input
              type="text"
              className="modal-input"
              placeholder="Agregar nuevo hábito diario (Ej: Meditar, Beber Agua...)"
              value={newHabitText}
              onChange={(e) => setNewHabitText(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 18px' }}>
              <Plus size={18} />
            </button>
          </form>

          <div className="habit-list">
            {habits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                No tienes hábitos agregados. ¡Crea el primero!
              </div>
            ) : (
              habits.map(habit => (
                <div key={habit.id} className={`habit-item ${habit.completed ? 'completed' : ''}`} onClick={() => onToggleHabit(habit.id)}>
                  <div className="habit-left">
                    <div className="custom-checkbox" style={{ borderRadius: '50%' }}>
                      {habit.completed && <Check size={12} />}
                    </div>
                    <span style={{
                      fontWeight: 500,
                      fontSize: '14px',
                      color: habit.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: habit.completed ? 'line-through' : 'none'
                    }}>
                      {habit.text}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
                    <div className={`habit-streak-badge ${habit.streak > 0 ? 'active-streak' : ''}`}>
                      <Flame size={12} />
                      <span>{habit.streak || 0}d</span>
                    </div>
                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-rose)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Log Panel */}
        <div className="glass-panel activity-card" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Zap size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h2 className="focus-title" style={{ fontSize: '16px' }}>Historial de Actividad</h2>
          </div>
          <div className="activity-list">
            {activityLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                Esperando eventos de actividad...
              </div>
            ) : (
              activityLogs.map((log) => (
                <div key={log.id} className="activity-item">
                  <div className={`activity-icon-container act-${log.type}`}>
                    {log.type === 'create' && <Plus size={12} />}
                    {log.type === 'move' && <Clock size={12} />}
                    {log.type === 'comment' && <Heart size={12} />}
                    {log.type === 'complete' && <Award size={12} />}
                  </div>
                  <div className="activity-details">
                    <span className="activity-user">{log.userName} </span>
                    <span className="activity-action">{log.actionText} </span>
                    <span className="activity-target">"{log.targetName}"</span>
                    <span className="activity-time">{log.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right side: Pomodoro Widget */}
      <div>
        <div className="glass-panel pomodoro-card">
          <div className="pomo-modes">
            <button
              className={`pomo-mode-btn ${pomoMode === 'work' ? 'active' : ''}`}
              onClick={() => handleModeChange('work')}
            >
              Enfoque (25m)
            </button>
            <button
              className={`pomo-mode-btn ${pomoMode === 'shortBreak' ? 'active' : ''}`}
              onClick={() => handleModeChange('shortBreak')}
            >
              Recreo (5m)
            </button>
            <button
              className={`pomo-mode-btn ${pomoMode === 'longBreak' ? 'active' : ''}`}
              onClick={() => handleModeChange('longBreak')}
            >
              Descanso (15m)
            </button>
          </div>

          <div className="pomo-display">
            <svg className="pomo-circle-svg" width="220" height="220">
              <circle
                cx="110"
                cy="110"
                r="90"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="110"
                cy="110"
                r="90"
                stroke={pomoMode === 'work' ? "var(--primary)" : pomoMode === 'shortBreak' ? "var(--secondary)" : "var(--accent-purple)"}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="565"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.5s linear',
                  filter: `drop-shadow(0 0 8px ${pomoMode === 'work' ? 'rgba(99,102,241,0.5)' : pomoMode === 'shortBreak' ? 'rgba(16,185,129,0.5)' : 'rgba(168,85,247,0.5)'})`
                }}
              />
            </svg>
            <div className="pomo-time-text">{formatTime(pomodoroTime)}</div>
            <div className="pomo-status-label">
              {pomoMode === 'work' ? '¡A Concentrarse!' : 'Relájate un poco'}
            </div>
          </div>

          <div className="pomo-controls" style={{ marginBottom: '24px' }}>
            <button className="pomo-btn-reset" onClick={() => handleModeChange(pomoMode)} title="Reiniciar">
              <RotateCcw size={18} />
            </button>
            <button className="pomo-btn-main" onClick={() => setIsPomoRunning(!isPomoRunning)}>
              {isPomoRunning ? <Pause size={24} fill="var(--bg-dark)" /> : <Play size={24} fill="var(--bg-dark)" style={{ marginLeft: '4px' }} />}
            </button>
          </div>

          {/* Web Audio Synthesizer sound generator panel */}
          <div className="audio-synth-panel">
            <div className="audio-synth-title">
              <Volume2 size={15} />
              <span>Audio de Fondo Sintetizado</span>
            </div>
            <div className="audio-synth-options">
              <button 
                onClick={() => setAudioMode('none')}
                className={`audio-synth-btn ${audioMode === 'none' ? 'active' : ''}`}
              >
                <VolumeX size={12} />
                <span>Silencio</span>
              </button>
              <button 
                onClick={() => setAudioMode('rain')}
                className={`audio-synth-btn ${audioMode === 'rain' ? 'active' : ''}`}
              >
                <Sparkles size={12} />
                <span>Lluvia</span>
              </button>
              <button 
                onClick={() => setAudioMode('binaural')}
                className={`audio-synth-btn ${audioMode === 'binaural' ? 'active' : ''}`}
              >
                <Clock size={12} />
                <span>Ondas Alpha</span>
              </button>
              <button 
                onClick={() => setAudioMode('fire')}
                className={`audio-synth-btn ${audioMode === 'fire' ? 'active' : ''}`}
              >
                <Flame size={12} />
                <span>Fuego</span>
              </button>
            </div>
            {audioMode !== 'none' && (
              <div className="volume-control">
                <Volume2 size={12} style={{ color: 'var(--text-secondary)' }} />
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05"
                  className="volume-slider"
                  value={audioVolume}
                  onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-secondary)', minWidth: '24px', textAlign: 'right' }}>
                  {Math.round(audioVolume * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
