import { useState, useEffect, useCallback } from 'react';

const WELCOME_MESSAGE = {
  id: 'welcome',
  sender: 'bot',
  text: '¡Hola! Soy EduBot, tu asistente de estudio personal. Sube un documento de estudio y podré resumírtelo, crearte cuestionarios interactivos de opción múltiple para repasar o explicarte conceptos difíciles. ¿Con qué empezamos hoy?',
  time: 'Ahora'
};

export default function useChatStorage(materialId) {
  // Inicializar el estado de los mensajes buscando en LocalStorage bajo la llave syncflow_chat_${materialId}
  const [state, setState] = useState(() => {
    if (!materialId) return { id: null, messages: [WELCOME_MESSAGE] };
    const key = `syncflow_chat_${materialId}`;
    const saved = localStorage.getItem(key);
    return {
      id: materialId,
      messages: saved ? JSON.parse(saved) : [WELCOME_MESSAGE]
    };
  });

  // useEffect para limpiar la pantalla y cargar el historial correcto si cambia de material de estudio
  useEffect(() => {
    if (materialId) {
      const key = `syncflow_chat_${materialId}`;
      const saved = localStorage.getItem(key);
      setState({
        id: materialId,
        messages: saved ? JSON.parse(saved) : [WELCOME_MESSAGE]
      });
    } else {
      setState({
        id: null,
        messages: [WELCOME_MESSAGE]
      });
    }
  }, [materialId]);

  // useEffect para sincronizar y guardar automáticamente los mensajes en LocalStorage cada vez que el historial cambie
  useEffect(() => {
    if (!materialId) return;

    // Evitamos sobreescribir el historial con los mensajes del material anterior
    // si el estado de los mensajes aún no se ha actualizado con el cargado en el useEffect anterior
    if (state.id !== materialId) return;

    const key = `syncflow_chat_${materialId}`;
    localStorage.setItem(key, JSON.stringify(state.messages));
  }, [state.messages, state.id, materialId]);

  // Proveer una función clearChat para borrar el LocalStorage de ese material específico y vaciar el estado de la pantalla
  const clearChat = useCallback(() => {
    if (materialId) {
      const key = `syncflow_chat_${materialId}`;
      localStorage.removeItem(key);
    }
    setState({
      id: materialId,
      messages: [WELCOME_MESSAGE]
    });
  }, [materialId]);

  // Wrapper para setChatMessages para que sea compatible con setChatMessages(prev => ...)
  const setChatMessages = useCallback((newMessagesOrUpdater) => {
    setState(prev => {
      const newMessages = typeof newMessagesOrUpdater === 'function'
        ? newMessagesOrUpdater(prev.messages)
        : newMessagesOrUpdater;
      return {
        ...prev,
        messages: newMessages
      };
    });
  }, []);

  return {
    chatMessages: state.messages,
    setChatMessages,
    clearChat
  };
}
