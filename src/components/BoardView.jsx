import React from 'react';
import { Plus, MessageSquare, CheckSquare, Calendar, ChevronRight } from 'lucide-react';

export default function BoardView({ tasks, onMoveTask, onOpenTaskDetails, onAddTask, searchQuery }) {
  const columns = [
    { id: 'todo', title: 'Por Hacer', cssClass: 'column-todo' },
    { id: 'inprogress', title: 'En Progreso', cssClass: 'column-inprogress' },
    { id: 'review', title: 'En Revisión', cssClass: 'column-review' },
    { id: 'done', title: 'Completado', cssClass: 'column-done' }
  ];

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
    const matchesDesc = task.desc.toLowerCase().includes(query);
    const matchesTags = task.tags.some(tag => tag.toLowerCase().includes(query));
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
      case 'diseño': return 'tag-design';
      case 'frontend': return 'tag-frontend';
      case 'backend': return 'tag-backend';
      case 'bug': return 'tag-bugs';
      default: return '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="board-header">
        <div className="board-info">
          <h1>Tablero de Proyecto - SyncFlow V1</h1>
          <p>Coordina tareas y visualiza la actividad del equipo en tiempo real</p>
        </div>
        <div className="board-actions">
          <button className="btn btn-primary" onClick={() => onAddTask()}>
            <Plus size={16} />
            Nueva Tarea
          </button>
        </div>
      </div>

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
                  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
                  const totalSubtasks = task.subtasks.length;

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
                          {task.tags.map((tag, idx) => (
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
                          {task.comments.length > 0 && (
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

                        <div className="task-assignees">
                          {task.assignees.map((as, idx) => (
                            <div
                              key={as.id || idx}
                              className="assignee-avatar"
                              title={as.name}
                              style={{
                                background: as.gradient || 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyOrigin: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '8px',
                                border: '1.5px solid var(--bg-card)'
                              }}
                            >
                              {as.initials}
                            </div>
                          ))}
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
    </div>
  );
}
