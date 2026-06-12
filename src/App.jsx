import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BoardView from './components/BoardView';
import DailyFocusView from './components/DailyFocusView';
import TaskDetailModal from './components/TaskDetailModal';
import ToastNotifications from './components/ToastNotifications';
import MetricsView from './components/MetricsView';
import StudyHub from './components/StudyHub';

// Pre-filled Kanban tasks (default if localstorage is empty)
const INITIAL_TASKS = [
  {
    id: 't1',
    title: 'Diseñar Dashboard Principal UI/UX',
    desc: 'Crear el mockup interactivo para la aplicación con efectos de glassmorphism y tema oscuro premium.',
    column: 'inprogress',
    priority: 'high',
    tags: ['Diseño', 'Frontend'],
    dueDate: '2026-06-15',
    assignees: [],
    subtasks: [
      { id: 's1', title: 'Definir paleta de colores y variables CSS', completed: true },
      { id: 's2', title: 'Diseñar componentes del panel lateral (Sidebar)', completed: true },
      { id: 's3', title: 'Crear modal de detalles con notas personales', completed: false }
    ],
    comments: [
      { id: 'c1', userName: 'Tú', text: 'Definí las variables en index.css. Quedó genial.', time: 'Hace 2 horas', isSelf: true }
    ]
  },
  {
    id: 't2',
    title: 'Configurar Estructura React',
    desc: 'Inicializar Vite, configurar estructura de carpetas, cargar fuentes de Google y set de iconos Lucide.',
    column: 'done',
    priority: 'medium',
    tags: ['Frontend'],
    dueDate: '2026-06-12',
    assignees: [],
    subtasks: [
      { id: 's4', title: 'Configurar variables de entorno', completed: true },
      { id: 's5', title: 'Instalar lucide-react y optimizar bundle', completed: true }
    ],
    comments: []
  },
  {
    id: 't3',
    title: 'Implementar Lógica de Negocio en Base de Datos',
    desc: 'Diseñar tablas, relaciones y consultas clave de rendimiento para la persistencia local.',
    column: 'todo',
    priority: 'high',
    tags: ['Backend'],
    dueDate: '2026-06-20',
    assignees: [],
    subtasks: [
      { id: 's6', title: 'Diseñar esquema de base de datos', completed: false },
      { id: 's7', title: 'Crear modelos y validaciones', completed: false }
    ],
    comments: []
  },
  {
    id: 't4',
    title: 'Corrección de Bug: Animación de Arrastre',
    desc: 'El sombreado fantasma falla al arrastrar tarjetas en navegadores Safari. Optimizar handlers de drag.',
    column: 'review',
    priority: 'low',
    tags: ['Bug', 'Frontend'],
    dueDate: '2026-06-14',
    assignees: [],
    subtasks: [],
    comments: []
  }
];

// Pre-filled daily focus checklist
const INITIAL_DAILY_TASKS = [
  { id: 'd1', text: 'Revisar correos y pendientes del día', completed: true, category: 'Rutina' },
  { id: 'd2', text: 'Planificar sprint semanal', completed: true, category: 'Planificación' },
  { id: 'd3', text: 'Diseñar la vista de Enfoque Diario', completed: false, category: 'Diseño' },
  { id: 'd4', text: 'Optimizar imports y build en Vite', completed: false, category: 'Desarrollo' }
];

// Pre-filled habits list
const INITIAL_HABITS = [
  { id: 'h1', text: 'Beber 2 litros de agua', completed: false, streak: 3 },
  { id: 'h2', text: 'Meditar por 10 minutos', completed: false, streak: 1 },
  { id: 'h3', text: 'Hacer estiramientos / yoga', completed: false, streak: 0 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('board');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Persistent States loaded from Local Storage
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('syncflow_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  const [dailyTasks, setDailyTasks] = useState(() => {
    const saved = localStorage.getItem('syncflow_dailyTasks');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_TASKS;
  });
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('syncflow_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });
  const [pomodoroHistory, setPomodoroHistory] = useState(() => {
    const saved = localStorage.getItem('syncflow_pomodoroHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('syncflow_theme') || 'indigo';
  });

  // Pomodoro State
  const [pomodoroTime, setPomodoroTime] = useState(1500); // 25 mins
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [pomoMode, setPomoMode] = useState('work'); // work, shortBreak, longBreak

  // Synthesizer Ambient Audio State
  const [audioMode, setAudioMode] = useState('none'); // none, rain, binaural, fire
  const [audioVolume, setAudioVolume] = useState(0.5);

  // Audio Context References for Synthesizer
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const crackleSourceRef = useRef(null);
  const gainNodeRef = useRef(null);
  const osc1Ref = useRef(null);
  const osc2Ref = useRef(null);

  // Refs to sync variables within asynchronous loops without re-triggering the main effect
  const audioVolumeRef = useRef(audioVolume);
  const audioModeRef = useRef(audioMode);
  const rainTimeoutRef = useRef(null);
  const fireTimeoutRef = useRef(null);

  // Keep refs in sync
  useEffect(() => {
    audioVolumeRef.current = audioVolume;
  }, [audioVolume]);

  useEffect(() => {
    audioModeRef.current = audioMode;
  }, [audioMode]);

  // UI Toast and Notification states
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'Proyecto SyncFlow Creado', body: 'Has iniciado tu espacio de trabajo personal.', time: 'Hace 3 horas', read: true }
  ]);
  const [activityLogs, setActivityLogs] = useState([
    { id: 'l1', userName: 'Tú', actionText: 'creaste el espacio de trabajo', targetName: 'SyncFlow', type: 'create', time: 'Hace 3 horas' },
    { id: 'l2', userName: 'Tú', actionText: 'agregaste nota en', targetName: 'Diseñar Dashboard Principal UI/UX', type: 'comment', time: 'Hace 2 horas' }
  ]);

  // Selected task for modal details
  const [selectedTask, setSelectedTask] = useState(null);

  // 1. Local Storage Syncer Effects
  useEffect(() => {
    localStorage.setItem('syncflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('syncflow_dailyTasks', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  useEffect(() => {
    localStorage.setItem('syncflow_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('syncflow_pomodoroHistory', JSON.stringify(pomodoroHistory));
  }, [pomodoroHistory]);

  useEffect(() => {
    localStorage.setItem('syncflow_theme', theme);
  }, [theme]);

  // 2. Pomodoro Timer Countdown Effect
  useEffect(() => {
    let interval = null;
    if (isPomoRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPomoRunning, pomodoroTime]);

  // Helper to get maximum time of active pomodoro mode
  const getModeMaxTime = () => {
    if (pomoMode === 'work') return 1500;
    if (pomoMode === 'shortBreak') return 300;
    return 900;
  };

  // 3. Pomodoro Completion and Alarm Trigger Effect
  useEffect(() => {
    if (pomodoroTime === 0) {
      setIsPomoRunning(false);
      
      // Synthesis chime
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const soundCtx = new AudioContextClass();
        const osc = soundCtx.createOscillator();
        const gainNode = soundCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(soundCtx.destination);
        osc.frequency.setValueAtTime(659.25, soundCtx.currentTime); // E5
        gainNode.gain.setValueAtTime(0, soundCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, soundCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, soundCtx.currentTime + 0.5);
        osc.start();
        osc.stop(soundCtx.currentTime + 0.5);
      } catch (e) {
        console.log("Failed to play alarm chime", e);
      }

      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const completedSession = {
        id: Date.now().toString(),
        mode: pomoMode,
        time: getModeMaxTime(),
        timestamp: timeString
      };
      setPomodoroHistory(prev => [...prev, completedSession]);

      if (pomoMode === 'work') {
        addToast('¡Buen trabajo!', 'Completaste una sesión de enfoque.', 'system');
        addNotification('Enfoque Completado', 'Completaste una sesión Pomodoro.');
        logActivity('Tú', 'completó un ciclo Pomodoro en', 'Enfoque', 'complete');
        setPomoMode('shortBreak');
        setPomodoroTime(300); // 5 mins
        alert('¡Excelente trabajo! Hora de un descanso.');
      } else {
        addToast('Descanso Terminado', 'Hora de volver a concentrarse.', 'system');
        setPomoMode('work');
        setPomodoroTime(1500); // 25 mins
        alert('El descanso terminó. ¡A enfocarse!');
      }
    }
  }, [pomodoroTime]);

  // 4. Web Audio API Synthesizer loops
  useEffect(() => {
    const stopAudio = () => {
      // Clear timers
      if (rainTimeoutRef.current) {
        clearTimeout(rainTimeoutRef.current);
        rainTimeoutRef.current = null;
      }
      if (fireTimeoutRef.current) {
        clearTimeout(fireTimeoutRef.current);
        fireTimeoutRef.current = null;
      }

      try {
        if (sourceRef.current) {
          sourceRef.current.stop();
          sourceRef.current.disconnect();
          sourceRef.current = null;
        }
        if (crackleSourceRef.current) {
          crackleSourceRef.current.stop();
          crackleSourceRef.current.disconnect();
          crackleSourceRef.current = null;
        }
        if (osc1Ref.current) {
          osc1Ref.current.stop();
          osc1Ref.current.disconnect();
          osc1Ref.current = null;
        }
        if (osc2Ref.current) {
          osc2Ref.current.stop();
          osc2Ref.current.disconnect();
          osc2Ref.current = null;
        }
        if (gainNodeRef.current) {
          gainNodeRef.current.disconnect();
          gainNodeRef.current = null;
        }
      } catch (e) {
        console.log("Error resetting synthesizers", e);
      }
    };

    if (audioMode === 'none') {
      stopAudio();
      return;
    }

    const initAudioCtx = () => {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    };

    // Synthesizer trigger helpers for random intervals
    const triggerRainDrop = () => {
      if (!audioCtxRef.current || audioModeRef.current !== 'rain') return;
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') return;

      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(gainNodeRef.current || ctx.destination);
        
        osc.type = 'sine';
        // Random high frequency pops for organic drops
        osc.frequency.setValueAtTime(1000 + Math.random() * 800, ctx.currentTime);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.04 * audioVolumeRef.current, ctx.currentTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.045);
      } catch (err) {}
    };

    const triggerFireCrackle = () => {
      if (!audioCtxRef.current || audioModeRef.current !== 'fire') return;
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') return;

      try {
        // Wood pop (triangle snap)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(gainNodeRef.current || ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120 + Math.random() * 180, ctx.currentTime);

        const popVolume = (0.03 + Math.random() * 0.06) * audioVolumeRef.current;
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(popVolume, ctx.currentTime + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);

        // High frequency noise burst
        const bufferSize = 0.03 * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2600, ctx.currentTime);

        const noiseGain = ctx.createGain();
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(gainNodeRef.current || ctx.destination);

        noiseGain.gain.setValueAtTime(0, ctx.currentTime);
        noiseGain.gain.linearRampToValueAtTime(popVolume * 0.45, ctx.currentTime + 0.002);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.008);

        osc.start();
        noise.start();
        osc.stop(ctx.currentTime + 0.02);
        noise.stop(ctx.currentTime + 0.02);
      } catch (err) {}
    };

    // Recursive timeout players
    const runRainLoop = () => {
      if (audioModeRef.current !== 'rain') return;
      triggerRainDrop();
      const delay = 40 + Math.random() * 240;
      rainTimeoutRef.current = setTimeout(runRainLoop, delay);
    };

    const runFireLoop = () => {
      if (audioModeRef.current !== 'fire') return;
      triggerFireCrackle();
      const delay = 80 + Math.random() * 380;
      fireTimeoutRef.current = setTimeout(runFireLoop, delay);
    };

    try {
      const ctx = initAudioCtx();
      stopAudio();

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(audioVolume, ctx.currentTime);
      mainGain.connect(ctx.destination);
      gainNodeRef.current = mainGain;

      if (audioMode === 'rain') {
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        // Lower frequency rumble for storm wind noise
        filter.frequency.setValueAtTime(280, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // very slow wind gust
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.08, ctx.currentTime);

        // Correct connection: connect LFO oscillator to modulate the lfoGain gain value
        lfo.connect(lfoGain.gain);
        noise.connect(filter);
        filter.connect(mainGain);

        noise.start();
        lfo.start();

        sourceRef.current = noise;
        osc1Ref.current = lfo;

        // Run drop loop
        runRainLoop();
      } 
      else if (audioMode === 'binaural') {
        // 200Hz Left, 210Hz Right -> 10Hz Alpha differential wave
        const oscL = ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(200, ctx.currentTime);

        const oscR = ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(210, ctx.currentTime);

        const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.2, ctx.currentTime); // keep binaural beats gentle
        subGain.connect(mainGain);

        if (pannerL && pannerR) {
          pannerL.pan.setValueAtTime(-1, ctx.currentTime);
          pannerR.pan.setValueAtTime(1, ctx.currentTime);
          oscL.connect(pannerL);
          pannerL.connect(subGain);
          oscR.connect(pannerR);
          pannerR.connect(subGain);
        } else {
          oscL.connect(subGain);
          oscR.connect(subGain);
        }

        oscL.start();
        oscR.start();

        osc1Ref.current = oscL;
        osc2Ref.current = oscR;
      } 
      else if (audioMode === 'fire') {
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        // Low frequency fire rumble base
        const rumble = ctx.createBufferSource();
        rumble.buffer = noiseBuffer;
        rumble.loop = true;
        const rumbleFilter = ctx.createBiquadFilter();
        rumbleFilter.type = 'lowpass';
        rumbleFilter.frequency.setValueAtTime(80, ctx.currentTime);
        rumble.connect(rumbleFilter);
        rumbleFilter.connect(mainGain);

        rumble.start();
        sourceRef.current = rumble;

        // Run crackle loop
        runFireLoop();
      }
    } catch (err) {
      console.log("Failed to initialize background synthesizers", err);
    }

    return () => stopAudio();
  }, [audioMode, audioVolume]);

  const addToast = (title, message, type = 'system') => {
    const newToast = { id: Date.now().toString(), title, message, type };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      removeToast(newToast.id);
    }, 6000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addNotification = (title, body) => {
    const newNotif = {
      id: Date.now().toString(),
      title,
      body,
      time: 'Hace un momento',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const logActivity = (userName, actionText, targetName, type) => {
    const newLog = {
      id: Date.now().toString(),
      userName,
      actionText,
      targetName,
      type,
      time: 'Hace un momento'
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Kanban Handlers
  const handleMoveTask = (taskId, targetColumnId) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, column: targetColumnId } : t));

    const columnNames = {
      todo: 'Por Hacer',
      inprogress: 'En Progreso',
      review: 'En Revisión',
      done: 'Completado'
    };

    addToast('Tarea Actualizada', `Moviste "${targetTask.title}" a ${columnNames[targetColumnId]}.`);
    logActivity('Tú', `moviste a ${columnNames[targetColumnId]}`, targetTask.title, targetColumnId === 'done' ? 'complete' : 'move');
  };

  const handleSaveTask = (taskData) => {
    if (tasks.some(t => t.id === taskData.id)) {
      setTasks(prev => prev.map(t => t.id === taskData.id ? taskData : t));
      addToast('Tarea Guardada', `Se actualizaron los detalles de "${taskData.title}".`);
      logActivity('Tú', 'actualizaste', taskData.title, 'move');
    } else {
      setTasks(prev => [...prev, taskData]);
      addToast('Tarea Creada', `Creaste la tarea "${taskData.title}".`);
      logActivity('Tú', 'creaste la tarea', taskData.title, 'create');
    }
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    setTasks(prev => prev.filter(t => t.id !== taskId));
    setSelectedTask(null);
    addToast('Tarea Eliminada', `Eliminaste la tarea "${targetTask.title}".`);
  };

  const handleAddTaskClick = () => {
    setSelectedTask({
      title: '',
      desc: '',
      column: 'todo',
      priority: 'medium',
      tags: ['Frontend'],
      dueDate: '',
      assignees: [],
      subtasks: [],
      comments: []
    });
  };

  // Daily Tasks Handlers
  const handleToggleDailyTask = (id) => {
    setDailyTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) {
          addToast('Foco Diario', `Completaste: "${t.text}"`);
        }
        return { ...t, completed: nextState };
      }
      return t;
    }));
  };

  const handleAddDailyTask = (text) => {
    const newTask = {
      id: Date.now().toString(),
      text,
      completed: false,
      category: 'General'
    };
    setDailyTasks(prev => [...prev, newTask]);
    addToast('Foco Diario', `Agregaste tarea diaria: "${text}"`);
  };

  const handleDeleteDailyTask = (id) => {
    setDailyTasks(prev => prev.filter(t => t.id !== id));
  };

  // Habit Tracker Handlers
  const handleToggleHabit = (id) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const nextCompleted = !h.completed;
        let nextStreak = h.streak || 0;
        if (nextCompleted) {
          nextStreak += 1;
          addToast('Hábito Completado', `¡Felicidades! Rachas de "${h.text}" subió a ${nextStreak} días.`);
        } else {
          nextStreak = Math.max(0, nextStreak - 1);
        }
        return { ...h, completed: nextCompleted, streak: nextStreak };
      }
      return h;
    }));
  };

  const handleAddHabit = (text) => {
    const newHabit = {
      id: Date.now().toString(),
      text,
      completed: false,
      streak: 0
    };
    setHabits(prev => [...prev, newHabit]);
    addToast('Hábito Registrado', `Agregaste el hábito: "${text}"`);
  };

  const handleDeleteHabit = (id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  // JSON Export / Import Handlers
  const handleExportData = () => {
    try {
      const data = {
        tasks,
        dailyTasks,
        habits,
        pomodoroHistory,
        theme
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "syncflow-backup.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast("Copia de Seguridad", "Tus datos se exportaron con éxito.");
    } catch (e) {
      alert("Error al exportar los datos.");
    }
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        if (parsedData.tasks) setTasks(parsedData.tasks);
        if (parsedData.dailyTasks) setDailyTasks(parsedData.dailyTasks);
        if (parsedData.habits) setHabits(parsedData.habits);
        if (parsedData.pomodoroHistory) setPomodoroHistory(parsedData.pomodoroHistory);
        if (parsedData.theme) setTheme(parsedData.theme);
        
        addToast("Copia Importada", "Se restauraron todas tus configuraciones con éxito.", "system");
        logActivity('Tú', 'restauraste una copia de seguridad de', 'Datos Locales', 'create');
      } catch (err) {
        alert("Error al importar: El archivo JSON de copia no es válido.");
      }
    };
    fileReader.readAsText(file);
  };

  return (
    <div className={`app-container theme-${theme}`}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pomodoroTime={pomodoroTime}
        isPomoRunning={isPomoRunning}
        pomoMode={pomoMode}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      <main className="main-content">
        <Header
          searchVal={searchQuery}
          setSearchVal={setSearchQuery}
          notifications={notifications}
          markAllRead={markAllNotificationsRead}
          theme={theme}
          setTheme={setTheme}
        />

        <div className="content-body">
          {activeTab === 'board' && (
            <BoardView
              tasks={tasks}
              onMoveTask={handleMoveTask}
              onOpenTaskDetails={setSelectedTask}
              onAddTask={handleAddTaskClick}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'focus' && (
            <DailyFocusView
              pomodoroTime={pomodoroTime}
              setPomodoroTime={setPomodoroTime}
              isPomoRunning={isPomoRunning}
              setIsPomoRunning={setIsPomoRunning}
              pomoMode={pomoMode}
              setPomoMode={setPomoMode}
              activityLogs={activityLogs}
              dailyTasks={dailyTasks}
              onToggleDailyTask={handleToggleDailyTask}
              onAddDailyTask={handleAddDailyTask}
              onDeleteDailyTask={handleDeleteDailyTask}
              habits={habits}
              onToggleHabit={handleToggleHabit}
              onAddHabit={handleAddHabit}
              onDeleteHabit={handleDeleteHabit}
              audioMode={audioMode}
              setAudioMode={setAudioMode}
              audioVolume={audioVolume}
              setAudioVolume={setAudioVolume}
            />
          )}

          {activeTab === 'metrics' && (
            <MetricsView
              tasks={tasks}
              dailyTasks={dailyTasks}
              pomodoroHistory={pomodoroHistory}
              habits={habits}
            />
          )}

          {activeTab === 'study' && (
            <StudyHub
              pomodoroTime={pomodoroTime}
              isPomoRunning={isPomoRunning}
              setIsPomoRunning={setIsPomoRunning}
              pomoMode={pomoMode}
              setPomodoroTime={setPomodoroTime}
              setPomoMode={setPomoMode}
              addToast={addToast}
              logActivity={logActivity}
            />
          )}
        </div>
      </main>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          collaborators={[]}
        />
      )}

      {/* Live Toast System */}
      <ToastNotifications
        toasts={toasts}
        removeToast={removeToast}
      />
    </div>
  );
}
