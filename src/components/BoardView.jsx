import React, { useState } from 'react';
import { Plus, MessageSquare, CheckSquare, Calendar, ChevronLeft, ChevronRight, LayoutDashboard, Grid } from 'lucide-react';

export default function BoardView({ tasks, onMoveTask, onOpenTaskDetails, onAddTask, searchQuery }) {
  const [viewMode, setViewMode] = useState('calendar'); // Default to calendar view as it is study-focused
  const [currentDate, setCurrentDate] = useState(new Date());

  const columns = [
    { id: 'todo', title: 'Por Estudiar', cssClass: 'column-todo' },
    { id: 'inprogress', title: 'En Estudio', cssClass: 'column-inprogress' },
    { id: 'review', title: 'Por Repasar', cssClass: 'column-review' },
    { id: 'done', title: 'Completado', cssClass: 'column-done' }
  ];

  // Drag and drop handlers (for Board mode)
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onMoveTask(taskId, targetColumnId);
    }
  };

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task => {
    const query = searchQuery.toLowerCase();
    const matchesTitle = task.title.toLowerCase().includes(query);
    const matchesDesc = (task.desc || '').toLowerCase().includes(query);
    const matchesTags = (task.tags || []).some(tag => tag.toLowerCase().includes(query));
    return matchesTitle || matchesDesc || matchesTags;
  });

  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 'high': return 'Prioridad Alta';
      case 'medium': return 'Prioridad Media';
      case 'low': return 'Prioridad Baja';
      default: return 'Sin Prioridad';
    }
  };

  const getTagStyleClass = (tag) => {
    switch (tag.toLowerCase()) {
      case 'estudio': return 'tag-design'; // Use existing design styles for study
      case 'diseño': return 'tag-design';
      case 'frontend': return 'tag-frontend';
      case 'backend': return 'tag-backend';
      case 'bug': return 'tag-bugs';
      default: return '';
    }
  };

  // --- Calendar Helpers ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const formatDateString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Generate calendar cells for a 6-week grid (42 days)
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();
  
  // Monday start: 0 = Mon, 1 = Tue, ..., 6 = Sun
  const firstDayOfWeekIndex = (firstDay.getDay() + 6) % 7;

  const cells = [];

  // Previous month padding days
  for (let i = firstDayOfWeekIndex - 1; i >= 0; i--) {
    const day = prevMonthTotalDays - i;
    cells.push({
      date: new Date(year, month - 1, day),
      isCurrentMonth: false,
      dayNum: day
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    cells.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
      dayNum: i
    });
  }

  // Next month padding days to fill 42 cells
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
      dayNum: i
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Component Styles Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        .view-mode-toggle {
          display: flex;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 3px;
          gap: 2px;
        }
        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          border-radius: calc(var(--radius-md) - 2px);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .toggle-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.02);
        }
        .toggle-btn.active {
          color: white;
          background: var(--primary);
        }
        .calendar-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          overflow: hidden;
          min-height: 500px;
        }
        .calendar-nav-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255,255,255,0.01);
          border-bottom: 1px solid var(--border-color);
        }
        .calendar-month-title {
          font-size: 16px;
          font-weight: 700;
          color: white;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-template-rows: auto repeat(6, 1fr);
          flex: 1;
          background: rgba(255,255,255,0.002);
        }
        .calendar-day-header {
          text-align: center;
          padding: 8px 0;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-color);
          background: rgba(0,0,0,0.15);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .calendar-cell {
          border-right: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          padding: 6px;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: background 0.15s ease;
          min-height: 80px;
        }
        .calendar-cell:nth-child(7n) {
          border-right: none;
        }
        .calendar-cell.other-month {
          background: rgba(0, 0, 0, 0.12);
        }
        .calendar-cell.other-month .day-num {
          color: var(--text-muted);
          opacity: 0.35;
        }
        .calendar-cell:hover {
          background: rgba(255, 255, 255, 0.01);
        }
        .calendar-cell-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .day-num {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        .day-num.today {
          background: var(--primary);
          color: white;
        }
        .calendar-tasks-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .calendar-tasks-list::-webkit-scrollbar {
          width: 3px;
        }
        .calendar-tasks-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 2px;
        }
        .calendar-add-btn {
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .calendar-cell:hover .calendar-add-btn {
          opacity: 1;
        }
      ` }} />

      <div className="board-header" style={{ marginBottom: '16px' }}>
        <div className="board-info">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={24} style={{ color: 'var(--primary)' }} />
            <span>Planificador de Estudio</span>
          </h1>
          <p>Organiza tus entregas, exámenes y sesiones de repaso de manera visual</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* View Toggle */}
          <div className="view-mode-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`} 
              onClick={() => setViewMode('calendar')}
            >
              <Grid size={14} />
              <span>Calendario</span>
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'board' ? 'active' : ''}`} 
              onClick={() => setViewMode('board')}
            >
              <LayoutDashboard size={14} />
              <span>Tablero</span>
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => onAddTask()}>
            <Plus size={16} />
            <span>Nueva Tarea</span>
          </button>
        </div>
      </div>

      {viewMode === 'board' ? (
        /* Re-themed Kanban Study Board */
        <div className="board-columns">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter(t => t.column === col.id);
            return (
              <div
                key={col.id}
                className={`board-column ${col.cssClass}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="column-header">
                  <div className="column-title">
                    <div className="column-color-bar"></div>
                    <span>{col.title}</span>
                    <span className="task-count">{colTasks.length}</span>
                  </div>
                </div>

                <div className="task-list">
                  {colTasks.map((task) => {
                    const completedSubtasks = (task.subtasks || []).filter(s => s.completed).length;
                    const totalSubtasks = (task.subtasks || []).length;

                    return (
                      <div
                        key={task.id}
                        className="task-card"
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onOpenTaskDetails(task)}
                      >
                        <div className={`task-card-glow priority-${task.priority}`}></div>
                        
                        <div className="task-card-header">
                          <div className="task-tags">
                            {(task.tags || []).map((tag, idx) => (
                              <span key={idx} className={`task-tag ${getTagStyleClass(tag)}`}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="task-title">{task.title}</div>
                        <div className="task-desc">{task.desc}</div>

                        <div className="task-footer">
                          <div className="task-meta">
                            {totalSubtasks > 0 && (
                              <div className="meta-item" title="Subtareas completadas">
                                <CheckSquare size={13} />
                                <span>{completedSubtasks}/{totalSubtasks}</span>
                              </div>
                            )}
                            {(task.comments || []).length > 0 && (
                              <div className="meta-item active-comments" title="Comentarios">
                                <MessageSquare size={13} />
                                <span>{task.comments.length}</span>
                              </div>
                            )}
                            {task.dueDate && (
                              <div className="meta-item" title="Fecha límite">
                                <Calendar size={13} />
                                <span>{task.dueDate}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <div style={{
                      padding: '24px 12px',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '13px',
                      border: '1px dashed rgba(255,255,255,0.05)',
                      borderRadius: 'var(--radius-md)',
                      marginTop: '8px'
                    }}>
                      Arrastra aquí
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Study Monthly Calendar View */
        <div className="calendar-container">
          <div className="calendar-nav-bar">
            <button className="icon-btn" onClick={handlePrevMonth}>
              <ChevronLeft size={16} />
            </button>
            <span className="calendar-month-title">
              {monthNames[month]} {year}
            </span>
            <button className="icon-btn" onClick={handleNextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="calendar-grid">
            {/* Days of week headings */}
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((dName, idx) => (
              <div key={idx} className="calendar-day-header">
                {dName}
              </div>
            ))}

            {/* Calendar Cells */}
            {cells.map((cell, idx) => {
              const cellDateStr = formatDateString(cell.date);
              const dayTasks = filteredTasks.filter(t => t.dueDate === cellDateStr);
              const isToday = formatDateString(new Date()) === cellDateStr;

              return (
                <div 
                  key={idx} 
                  className={`calendar-cell ${cell.isCurrentMonth ? '' : 'other-month'}`}
                >
                  <div className="calendar-cell-header">
                    <span className={`day-num ${isToday ? 'today' : ''}`}>
                      {cell.dayNum}
                    </span>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onAddTask({ dueDate: cellDateStr }); 
                      }}
                      className="calendar-add-btn icon-btn"
                      style={{ 
                        width: '20px', 
                        height: '20px', 
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}
                      title="Agregar entrega o examen para este día"
                    >
                      <Plus size={10} style={{ color: 'white' }} />
                    </button>
                  </div>

                  <div className="calendar-tasks-list">
                    {dayTasks.map((task) => {
                      let borderColor = 'rgba(255,255,255,0.08)';
                      if (task.priority === 'high') borderColor = '#ef4444';
                      else if (task.priority === 'medium') borderColor = '#f59e0b';
                      else if (task.priority === 'low') borderColor = '#10b981';

                      return (
                        <div 
                          key={task.id}
                          onClick={() => onOpenTaskDetails(task)}
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            borderLeft: `2.5px solid ${borderColor}`,
                            borderRadius: '3px',
                            padding: '3px 5px',
                            fontSize: '9.5px',
                            color: '#cbd5e1',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            borderTop: '1px solid rgba(255,255,255,0.02)',
                            borderRight: '1px solid rgba(255,255,255,0.02)',
                            borderBottom: '1px solid rgba(255,255,255,0.02)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                          title={`${task.title} (${getPriorityLabel(task.priority)})`}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {task.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
