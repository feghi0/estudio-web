import { supabase } from './supabaseClient';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.substring(0, 10);
};

export const api = {
  // --- TASKS ---
  async fetchTasks(userId) {
    const { data, error } = await supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(t => ({
      ...t,
      desc: t.description,
      dueDate: formatDate(t.due_date),
      column: t.column
    }));
  },
  async insertTask(task, userId) {
    const dbTask = {
      user_id: userId,
      title: task.title,
      description: task.desc || '',
      column: task.column || 'todo',
      priority: task.priority || 'medium',
      tags: task.tags || [],
      due_date: task.dueDate || null,
      subtasks: task.subtasks || [],
      comments: task.comments || []
    };
    const { data, error } = await supabase.from('tasks').insert([dbTask]).select();
    if (error) throw error;
    const t = data[0];
    return { ...t, desc: t.description, dueDate: formatDate(t.due_date), column: t.column };
  },
  async updateTask(id, task) {
    const dbTask = {
      title: task.title,
      description: task.desc,
      column: task.column,
      priority: task.priority,
      tags: task.tags,
      due_date: task.dueDate,
      subtasks: task.subtasks,
      comments: task.comments
    };
    const { data, error } = await supabase.from('tasks').update(dbTask).eq('id', id).select();
    if (error) throw error;
    const t = data[0];
    return { ...t, desc: t.description, dueDate: formatDate(t.due_date), column: t.column };
  },
  async deleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },

  // --- DAILY TASKS ---
  async fetchDailyTasks(userId) {
    const { data, error } = await supabase.from('daily_tasks').select('*').eq('user_id', userId).order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },
  async insertDailyTask(task, userId) {
    const dbTask = { user_id: userId, text: task.text, completed: task.completed, category: task.category };
    const { data, error } = await supabase.from('daily_tasks').insert([dbTask]).select();
    if (error) throw error;
    return data[0];
  },
  async updateDailyTask(id, updates) {
    const { data, error } = await supabase.from('daily_tasks').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  async deleteDailyTask(id) {
    const { error } = await supabase.from('daily_tasks').delete().eq('id', id);
    if (error) throw error;
  },

  // --- HABITS ---
  async fetchHabits(userId) {
    const { data, error } = await supabase.from('habits').select('*').eq('user_id', userId).order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },
  async insertHabit(habit, userId) {
    const dbHabit = { user_id: userId, text: habit.text, completed: habit.completed, streak: habit.streak };
    const { data, error } = await supabase.from('habits').insert([dbHabit]).select();
    if (error) throw error;
    return data[0];
  },
  async updateHabit(id, updates) {
    const { data, error } = await supabase.from('habits').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  async deleteHabit(id) {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) throw error;
  },

  // --- POMODORO ---
  async fetchPomodoroHistory(userId) {
    const { data, error } = await supabase.from('pomodoro_history').select('*').eq('user_id', userId).order('completed_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async insertPomodoroSession(sessionData, userId) {
    const dbSession = { user_id: userId, mode: sessionData.mode, duration: sessionData.time };
    const { data, error } = await supabase.from('pomodoro_history').insert([dbSession]).select();
    if (error) throw error;
    return data[0];
  },

  // --- PROFILES (Config) ---
  async fetchProfile(userId) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found, which is fine if trigger failed but it shouldn't
    return data;
  },
  async updateProfile(userId, updates) {
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select();
    if (error) throw error;
    return data[0];
  }
};
