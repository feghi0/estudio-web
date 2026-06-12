import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Plus, Check, Trash2, Tag, Calendar, User, AlignLeft, AlertCircle } from 'lucide-react';

export default function TaskDetailModal({
  task,
  onClose,
  onSave,
  onDelete,
  collaborators
}) {
  const isNew = !task.id;
  const [title, setTitle] = useState(task.title || '');
  const [desc, setDesc] = useState(task.desc || '');
  const [column, setColumn] = useState(task.column || 'todo');
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [tags, setTags] = useState(task.tags || []);
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [assignees, setAssignees] = useState(task.assignees || []);
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [comments, setComments] = useState(task.comments || []);

  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [typingUser, setTypingUser] = useState(null); // Simulated user typing

  const chatEndRef = useRef(null);

  // Available tags to toggle
  const availableTags = ['Diseño', 'Frontend', 'Backend', 'Bug'];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments, typingUser]);

  const handleToggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleToggleAssignee = (collab) => {
    if (assignees.some(a => a.id === collab.id)) {
      setAssignees(assignees.filter(a => a.id !== collab.id));
    } else {
      setAssignees([...assignees, collab]);
    }
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    const newSub = {
      id: Date.now().toString(),
      title: newSubtaskText.trim(),
      completed: false
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskText('');
  };

  const handleToggleSubtask = (subId) => {
    setSubtasks(subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s));
  };

  const handleDeleteSubtask = (subId) => {
    setSubtasks(subtasks.filter(s => s.id !== subId));
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userComment = {
      id: Date.now().toString(),
      userName: 'Tú',
      text: chatInput.trim(),
      time: 'Hace un momento',
      isSelf: true
    };

    const updatedComments = [...comments, userComment];
    setComments(updatedComments);
    setChatInput('');
  };


  const handleSaveClick = () => {
    if (!title.trim()) {
      alert('Por favor ingresa un título para la tarea');
      return;
    }
    onSave({
      id: task.id || Date.now().toString(),
      title: title.trim(),
      desc: desc.trim(),
      column,
      priority,
      tags,
      dueDate,
      assignees,
      subtasks,
      comments
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>
            {isNew ? 'Crear Nueva Tarea' : 'Detalles de la Tarea'}
          </h2>
          <div className="modal-header-actions">
            {!isNew && (
              <button
                onClick={() => {
                  if (window.confirm('¿Seguro que deseas eliminar esta tarea?')) {
                    onDelete(task.id);
                  }
                }}
                className="btn btn-secondary"
                style={{ color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.2)' }}
              >
                Eliminar
              </button>
            )}
            <button className="icon-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Left Panel: Inputs */}
          <div>
            <div className="modal-form-group">
              <label className="modal-label">Título de la Tarea</label>
              <input
                type="text"
                className="modal-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nombre descriptivo de la tarea..."
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-label">Descripción</label>
              <textarea
                className="modal-textarea"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe el objetivo de esta tarea o criterios de aceptación..."
              />
            </div>

            {/* Checklist items */}
            <div className="modal-form-group">
              <label className="modal-label">Subtareas / Checklist</label>
              <div className="subtasks-list">
                {subtasks.map(sub => (
                  <div key={sub.id} className={`subtask-item ${sub.completed ? 'completed' : ''}`}>
                    <div className="subtask-checkbox" onClick={() => handleToggleSubtask(sub.id)}>
                      {sub.completed && <Check size={11} />}
                    </div>
                    <span style={{ flex: 1 }}>{sub.title}</span>
                    <button
                      onClick={() => handleDeleteSubtask(sub.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddSubtask} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Agregar subtarea..."
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '13px' }}
                />
                <button type="submit" className="btn btn-secondary" style={{ padding: '0 12px' }}>
                  Añadir
                </button>
              </form>
            </div>

            {/* Simulated Live Chat section */}
            {!isNew && (
              <div className="modal-form-group" style={{ marginTop: '28px' }}>
                <label className="modal-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Discusión en Tiempo Real</span>
                  <span className="pulse-dot"></span>
                </label>
                <div className="chat-container">
                  <div className="chat-messages">
                    {comments.map((comment) => (
                      <div key={comment.id} className={`chat-bubble ${comment.isSelf ? 'self' : ''}`}>
                        {!comment.isSelf && (
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: comment.gradient || 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '9px',
                            color: 'white',
                            fontWeight: '700',
                            flexShrink: 0
                          }}>
                            {comment.userName.charAt(0)}
                          </div>
                        )}
                        <div className="chat-text-wrapper">
                          <div className="chat-user-name">{comment.userName}</div>
                          <div className="chat-message-text">{comment.text}</div>
                          <span className="chat-time">{comment.time}</span>
                        </div>
                      </div>
                    ))}
                    {typingUser && (
                      <div className="chat-bubble">
                        <div className="typing-indicator">
                          <span>{typingUser} está escribiendo</span>
                          <span className="dot"></span>
                          <span className="dot"></span>
                          <span className="dot"></span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleSendChat} className="chat-input-area">
                    <input
                      type="text"
                      placeholder="Escribe un mensaje para el equipo..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button type="submit" className="chat-send-btn">
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Settings / Meta */}
          <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
            <div className="modal-form-group">
              <label className="modal-label">Columna / Estado</label>
              <select
                className="modal-input"
                value={column}
                onChange={(e) => setColumn(e.target.value)}
                style={{ appearance: 'none', background: 'rgba(255,255,255,0.03)' }}
              >
                <option value="todo" style={{ background: 'var(--bg-card)' }}>Por Hacer</option>
                <option value="inprogress" style={{ background: 'var(--bg-card)' }}>En Progreso</option>
                <option value="review" style={{ background: 'var(--bg-card)' }}>En Revisión</option>
                <option value="done" style={{ background: 'var(--bg-card)' }}>Completado</option>
              </select>
            </div>

            <div className="modal-form-group">
              <label className="modal-label">Prioridad</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['low', 'medium', 'high'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`btn btn-secondary`}
                    style={{
                      flex: 1,
                      padding: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderColor: priority === p ? (p === 'high' ? 'var(--accent-rose)' : p === 'medium' ? 'var(--accent-amber)' : 'var(--accent-cyan)') : 'var(--border-color)',
                      background: priority === p ? (p === 'high' ? 'rgba(244, 63, 94, 0.15)' : p === 'medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(6, 182, 212, 0.15)') : 'transparent',
                      color: priority === p ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                    {p === 'high' ? 'Alta' : p === 'medium' ? 'Media' : 'Baja'}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-form-group">
              <label className="modal-label">Fecha Límite</label>
              <input
                type="date"
                className="modal-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Tags Toggle */}
            <div className="modal-form-group">
              <label className="modal-label">Etiquetas</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {availableTags.map(tag => {
                  const active = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`task-tag ${active ? 'tag-frontend' : ''}`}
                      style={{
                        cursor: 'pointer',
                        border: '1px solid transparent',
                        background: active ? '' : 'rgba(255,255,255,0.03)',
                        color: active ? 'white' : 'var(--text-secondary)',
                        borderColor: active ? 'var(--accent-cyan)' : 'var(--border-color)',
                        padding: '6px 10px',
                        borderRadius: '6px'
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>



            <button
              onClick={handleSaveClick}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '24px', justifyContent: 'center' }}
            >
              Guardar Tarea
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
