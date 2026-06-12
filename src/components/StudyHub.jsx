import React, { useState, useEffect, useRef } from 'react';
import { Upload, BookOpen, FileText, Send, Sparkles, Brain, HelpCircle, GraduationCap, ChevronLeft, Type, Play, Pause, RotateCcw, Download, TrendingUp, Plus, Trash2, ZoomIn, ZoomOut, Calendar } from 'lucide-react';
import { jsPDF } from 'jspdf';
import useChatStorage from '../hooks/useChatStorage';

export default function StudyHub({
  pomodoroTime,
  isPomoRunning,
  setIsPomoRunning,
  pomoMode,
  setPomoMode,
  addToast,
  logActivity
}) {
  const [activeTab, setActiveTab] = useState('notes'); // notes | bot | timeline | math
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fontSize, setFontSize] = useState(15); // reader text size
  
  // Notes state
  const [notesText, setNotesText] = useState('');

  // AI Chat state
  const [chatInput, setChatInput] = useState('');
  const materialId = selectedFile ? selectedFile.name : null;
  const { chatMessages, setChatMessages, clearChat } = useChatStorage(materialId);
  const [isBotAnalyzing, setIsBotAnalyzing] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);

  // Timeline state
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [isTimelineLoading, setIsTimelineLoading] = useState(false);

  // Math Grapher state
  const [equations, setEquations] = useState(['x^2', 'sin(x)']); // Pre-established equations
  const [newEquationInput, setNewEquationInput] = useState('');
  const [graphCenter, setGraphCenter] = useState({ x: 0, y: 0 });
  const [graphZoom, setGraphZoom] = useState(40); // px per unit
  const [mouseCoord, setMouseCoord] = useState({ x: 0, y: 0 });
  const [mathInput, setMathInput] = useState('');
  const [mathSolution, setMathSolution] = useState('');
  const [isSolving, setIsSolving] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null); // null | 'general' | 'history' | 'math'

  const chatEndRef = useRef(null);
  const canvasRef = useRef(null);

  const exportToPDF = (summaryText, fileName) => {
    try {
      const doc = new jsPDF();
      let isBoldState = false;
      
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = 25;

      const addWatermark = () => {
        doc.saveGraphicsState();
        doc.setTextColor(240, 238, 244); // Very soft lilac/gray watermark
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(40);
        doc.text('EDUBOT AI TUTOR', pageWidth / 2, pageHeight / 2, {
          align: 'center',
          angle: 30
        });
        doc.restoreGraphicsState();
      };

      const drawHeaderFooter = (pageNum, totalPages) => {
        // Top Indigo Accent bar
        doc.setFillColor(79, 70, 229);
        doc.rect(0, 0, pageWidth, 4, 'F');

        // Header
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Resumen Académico - EduBot AI`, margin, 12);
        
        let cleanName = fileName.replace(/\.[^/.]+$/, "");
        if (cleanName.length > 30) cleanName = cleanName.substring(0, 27) + "...";
        doc.text(`Archivo: ${cleanName}`, pageWidth - margin, 12, { align: 'right' });
        
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, 15, pageWidth - margin, 15);

        // Footer
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generado automáticamente por SyncFlow StudyHub`, margin, pageHeight - 10);
        doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      };

      const drawFormattedText = (text, x, y, width, defaultStyle = 'normal', fontSize = 10, color = [51, 65, 85]) => {
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        
        const textLines = doc.splitTextToSize(text, width);
        let currentY = y;
        
        textLines.forEach(line => {
          if (currentY > pageHeight - 25) {
            doc.addPage();
            addWatermark();
            currentY = 25;
          }
          
          const parts = line.split('**');
          let currentX = x;
          
          parts.forEach((part, index) => {
            const style = isBoldState ? 'bold' : defaultStyle;
            doc.setFont('helvetica', style);
            doc.text(part, currentX, currentY);
            currentX += doc.getTextWidth(part);
            
            if (index < parts.length - 1) {
              isBoldState = !isBoldState;
            }
          });
          
          currentY += (fontSize * 0.35) + 2.2; // Optimized line spacing
        });
        
        return currentY;
      };

      // Initial page watermark setup
      addWatermark();

      // Title Block
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229); // Primary Indigo
      doc.text(`Resumen de Estudio`, margin, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate secondary text
      const dateStr = new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Documento de origen: ${fileName}  |  Generado: ${dateStr}`, margin, yPosition);
      yPosition += 6;

      // Divider Line
      doc.setDrawColor(79, 70, 229);
      doc.setLineWidth(1);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 12;

      const lines = summaryText.split('\n');
      
      lines.forEach(line => {
        let cleanLine = line.trim();
        if (!cleanLine) {
          yPosition += 4;
          return;
        }

        // Subtitles (###)
        if (cleanLine.startsWith('###')) {
          yPosition += 6;
          
          if (yPosition > pageHeight - 25) {
            doc.addPage();
            addWatermark();
            yPosition = 25;
          }

          const titleText = cleanLine.replace(/^###\s*/, '').replace(/[📜💻📚]/g, '').trim();
          
          // Beautiful left vertical indicator flag in Purple accent
          doc.setFillColor(147, 51, 234);
          doc.rect(margin, yPosition - 10, 3, 12, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          doc.setTextColor(147, 51, 234);
          doc.text(titleText, margin + 6, yPosition);
          
          yPosition += 8;
        } 
        // Bullet Lists
        else if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
          const bulletText = cleanLine.replace(/^[-*]\s*/, '');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(79, 70, 229); // Indigo bullet
          doc.text('•', margin + 3, yPosition);
          
          yPosition = drawFormattedText(bulletText, margin + 8, yPosition, contentWidth - 8, 'normal', 10, [51, 65, 85]);
          yPosition += 1.5;
        } 
        // Numbered Lists
        else if (/^\d+\.\s*/.test(cleanLine)) {
          const match = cleanLine.match(/^(\d+\.)\s*/);
          const numberPrefix = match ? match[1] : '';
          const numberText = cleanLine.replace(/^\d+\.\s*/, '');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(79, 70, 229); // Indigo number prefix
          doc.text(numberPrefix, margin + 2, yPosition);
          
          yPosition = drawFormattedText(numberText, margin + 8, yPosition, contentWidth - 8, 'normal', 10, [51, 65, 85]);
          yPosition += 1.5;
        }
        // Paragraph Text
        else {
          yPosition = drawFormattedText(cleanLine, margin, yPosition, contentWidth, 'normal', 10, [51, 65, 85]);
          yPosition += 3;
        }
      });

      // Post-apply page numbering on headers & footers
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawHeaderFooter(i, totalPages);
      }

      doc.save(`resumen-${fileName.replace(/\.[^/.]+$/, "")}.pdf`);
      addToast('PDF Exportado', 'El resumen académico se ha guardado en tu carpeta de descargas.');
      logActivity('EduBot', 'exportó resumen a PDF de', fileName, 'complete');
    } catch (err) {
      console.error("Error al exportar PDF:", err);
      addToast('Error al exportar PDF', 'Hubo un problema al generar el documento.', 'error');
    }
  };

  // --- Math and Algebra Grapher Helpers ---
  const evaluateEquation = (equationStr, x) => {
    let cleanStr = equationStr.toLowerCase().replace(/\s+/g, '');
    
    let expr = cleanStr
      .replace(/\^/g, '**')
      .replace(/pi/g, 'Math.PI')
      .replace(/e/g, 'Math.E')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/log\(/g, 'Math.log(')
      .replace(/exp\(/g, 'Math.exp(');

    expr = expr.replace(/(\d+)(x)/g, '$1*$2');
    expr = expr.replace(/(\d+)(Math\.)/g, '$1*$2');
    expr = expr.replace(/(\))(x)/g, '$1*$2');

    // Strict validation check to prevent arbitrary javascript code execution
    let checkStr = expr
      .replace(/Math\.(PI|E|sin|cos|tan|abs|sqrt|log|exp)/g, '')
      .replace(/[0-9x+\-*/().,\s]/g, '');

    if (checkStr.length > 0) {
      return NaN;
    }

    try {
      const fn = new Function('x', `
        try {
          const sin = Math.sin, cos = Math.cos, tan = Math.tan, abs = Math.abs, 
                sqrt = Math.sqrt, log = Math.log, exp = Math.exp, pi = Math.PI, e = Math.E;
          return ${expr};
        } catch (e) {
          return NaN;
        }
      `);
      return fn(x);
    } catch (err) {
      return NaN;
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const pixelX = ((e.clientX - rect.left) / rect.width) * canvasRef.current.width;
    const pixelY = ((e.clientY - rect.top) / rect.height) * canvasRef.current.height;
    
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const zoom = graphZoom;
    const centerX = width / 2 - graphCenter.x * zoom;
    const centerY = height / 2 + graphCenter.y * zoom;
    
    const xVal = (pixelX - centerX) / zoom;
    const yVal = (centerY - pixelY) / zoom;
    
    setMouseCoord({ x: xVal, y: yVal });
  };

  const handleZoom = (factor) => {
    setGraphZoom(prev => Math.min(Math.max(prev * factor, 5), 800));
  };

  const handlePan = (dx, dy) => {
    setGraphCenter(prev => ({
      x: prev.x + (dx * 15) / graphZoom,
      y: prev.y + (dy * 15) / graphZoom
    }));
  };

  const handleResetView = () => {
    setGraphCenter({ x: 0, y: 0 });
    setGraphZoom(40);
  };

  const handleAddEquation = (e) => {
    e.preventDefault();
    if (!newEquationInput.trim()) return;
    setEquations(prev => [...prev, newEquationInput.trim()]);
    addToast('Ecuación Graficada', `Se agregó la función f(x) = ${newEquationInput.trim()}`);
    setNewEquationInput('');
  };

  const handleRemoveEquation = (index) => {
    const target = equations[index];
    setEquations(prev => prev.filter((_, idx) => idx !== index));
    addToast('Ecuación Eliminada', `Se removió la función f(x) = ${target}`);
  };

  const handleAskMath = (promptText) => {
    setActiveTab('bot');
    sendMessageToBot(promptText);
  };

  const handleSolveMathProblem = async (problemText) => {
    const inputProblem = problemText || mathInput;
    if (!inputProblem.trim()) return;

    setIsSolving(true);
    setMathSolution('');

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("VITE_GEMINI_API_KEY no configurada. Usando solucionador matemático simulado.");
      runLocalMathSolverFallback(inputProblem.trim());
      return;
    }

    const systemPrompt = `
    Eres un experto tutor y solucionador matemático AI. Tu tarea es analizar el problema matemático ingresado y proveer una resolución detallada paso a paso.
    Estructura tu respuesta estrictamente de la siguiente manera:
    1. Escribe el problema planteado.
    2. Divide la explicación detallada en pasos claros y numerados (ej. "Paso 1: [Acción]"). En cada paso, explica brevemente y con claridad la regla algebraica o de cálculo aplicada.
    3. Concluye mostrando el resultado final de forma destacada en negrita y en su propia línea.
    Usa una notación matemática clara y limpia.
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `Resuelve el siguiente problema matemático paso a paso:\n${inputProblem.trim()}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.2 }
        })
      });

      if (!response.ok) throw new Error('Gemini API call failed');
      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo resolver el ejercicio.";
      
      setMathSolution(responseText);
      addToast('Ejercicio Resuelto', 'El Solucionador AI ha detallado el paso a paso.');
      logActivity('EduBot', 'resolvió ejercicio matemático', inputProblem.trim().substring(0, 20), 'complete');
    } catch (error) {
      console.warn("Error al resolver con la API. Usando simulación local.", error);
      runLocalMathSolverFallback(inputProblem.trim());
    }
    setIsSolving(false);
  };

  const runLocalMathSolverFallback = (problem) => {
    setTimeout(() => {
      let solution = `### 📐 Solución de Ejercicio: ${problem}\n\n`;
      const query = problem.toLowerCase();

      if (query.includes('2x') && query.includes('7') && query.includes('15')) {
        solution += `**Paso 1: Restar 7 a ambos lados**\nReducimos los términos constantes moviendo el 7 al miembro derecho:\n2x + 7 - 7 = 15 - 7\n2x = 8\n\n**Paso 2: Dividir por el coeficiente de x**\nDividimos ambos lados de la ecuación entre 2 para despejar la incógnita:\nx = 8 / 2\nx = 4\n\n**Resultado Final:**\nLa solución es **x = 4**.`;
      } else if (query.includes('deriv') && query.includes('3x')) {
        solution += `**Paso 1: Aplicar la regla de potencias**\nPara cada término de la función f(x) = 3x² - 5x + 2, aplicamos la regla d/dx[xⁿ] = n·xⁿ⁻¹:\n- Para 3x²: el exponente 2 multiplica a la constante 3 (2 · 3 = 6), y restamos 1 al exponente (x¹): d/dx[3x²] = 6x\n- Para -5x: la derivada de x es 1, por lo que nos queda: d/dx[-5x] = -5\n- Para 2: la derivada de cualquier constante es 0: d/dx[2] = 0\n\n**Paso 2: Consolidar los resultados**\nAgrupamos los términos obtenidos en la suma correspondiente:\nf'(x) = 6x - 5\n\n**Resultado Final:**\nLa derivada es **f'(x) = 6x - 5**.`;
      } else if (query.includes('factor') && query.includes('x^2') && query.includes('9')) {
        solution += `**Paso 1: Identificar la estructura algebraica**\nLa expresión algebraica x² - 9 es una diferencia de cuadrados perfectos: a² - b².\nPodemos reescribirla expresando el término 9 como una potencia cuadrada:\nx² - 3²\n\n**Paso 2: Aplicar producto notable**\nAplicamos la fórmula de factorización para diferencias de cuadrados: a² - b² = (a - b)(a + b).\nTomando a = x y b = 3:\n(x - 3)(x + 3)\n\n**Resultado Final:**\nLa factorización es **(x - 3)(x + 3)**.`;
      } else {
        solution += `**Paso 1: Analizar la estructura de la expresión**\nAnalizamos la entrada: "${problem}". Para resolverla algebraicamente, aislamos las incógnitas y agrupamos los coeficientes reales en el miembro opuesto.\n\n**Paso 2: Simplificación de términos**\nRealizamos las operaciones aritméticas básicas de suma, resta y multiplicación correspondientes en ambos lados de la expresión.\n\n**Resultado Final:**\nEl valor simplificado/resuelto correspondiente es **aproximadamente estructurado**. Para un análisis real continuo, conecta la API en tu archivo .env.`;
      }

      setMathSolution(solution);
      setIsSolving(false);
      addToast('Ejercicio Resuelto (Simulado)', 'Se generaron los pasos algebraicos explicados.');
      logActivity('EduBot', 'resolvió ejercicio matemático simulado', problem.substring(0, 20), 'complete');
    }, 1500);
  };

  // Canvas drawing effect
  useEffect(() => {
    if (activeTab !== 'math' || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 0.5;
    
    const zoom = graphZoom;
    const centerX = width / 2 - graphCenter.x * zoom;
    const centerY = height / 2 + graphCenter.y * zoom;
    
    let gridSpacing = 1;
    if (zoom < 10) gridSpacing = 10;
    else if (zoom < 20) gridSpacing = 5;
    else if (zoom > 150) gridSpacing = 0.2;
    else if (zoom > 300) gridSpacing = 0.1;
    
    const minX = Math.floor((0 - centerX) / zoom / gridSpacing) * gridSpacing;
    const maxX = Math.ceil((width - centerX) / zoom / gridSpacing) * gridSpacing;
    const minY = Math.floor((centerY - height) / zoom / gridSpacing) * gridSpacing;
    const maxY = Math.ceil((centerY - 0) / zoom / gridSpacing) * gridSpacing;
    
    // Vertical grid
    for (let xVal = minX; xVal <= maxX; xVal += gridSpacing) {
      const xPixel = centerX + xVal * zoom;
      ctx.beginPath();
      ctx.moveTo(xPixel, 0);
      ctx.lineTo(xPixel, height);
      ctx.stroke();
    }
    
    // Horizontal grid
    for (let yVal = minY; yVal <= maxY; yVal += gridSpacing) {
      const yPixel = centerY - yVal * zoom;
      ctx.beginPath();
      ctx.moveTo(0, yPixel);
      ctx.lineTo(width, yPixel);
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    
    // Axis ticks and numbers
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // X ticks
    for (let xVal = minX; xVal <= maxX; xVal += gridSpacing) {
      if (Math.abs(xVal) < 0.0001) continue;
      const xPixel = centerX + xVal * zoom;
      ctx.fillText(xVal.toFixed(1).replace(/\.0$/, ''), xPixel, centerY + 4);
    }
    
    // Y ticks
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let yVal = minY; yVal <= maxY; yVal += gridSpacing) {
      if (Math.abs(yVal) < 0.0001) continue;
      const yPixel = centerY - yVal * zoom;
      ctx.fillText(yVal.toFixed(1).replace(/\.0$/, ''), centerX - 4, yPixel);
    }
    
    ctx.fillText('0', centerX - 4, centerY + 4);
    
    // Plot curves
    const colors = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];
    
    equations.forEach((eq, index) => {
      ctx.strokeStyle = colors[index % colors.length];
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      let isFirstPoint = true;
      
      for (let xPixel = 0; xPixel < width; xPixel += 1.5) {
        const xVal = (xPixel - centerX) / zoom;
        const yVal = evaluateEquation(eq, xVal);
        
        if (!isNaN(yVal) && isFinite(yVal)) {
          const yPixel = centerY - yVal * zoom;
          if (yPixel >= -50 && yPixel <= height + 50) {
            if (isFirstPoint) {
              ctx.moveTo(xPixel, yPixel);
              isFirstPoint = false;
            } else {
              ctx.lineTo(xPixel, yPixel);
            }
          } else {
            isFirstPoint = true;
          }
        } else {
          isFirstPoint = true;
        }
      }
      ctx.stroke();
    });
  }, [activeTab, equations, graphCenter, graphZoom]);


  // --- Chronological Timeline Extraction Helpers ---
  const handleGenerateTimeline = async () => {
    if (!selectedFile) {
      alert('Sube un documento primero para poder generar una línea de tiempo.');
      return;
    }
    setIsTimelineLoading(true);
    setActiveTab('timeline');

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("VITE_GEMINI_API_KEY no configurada. Usando línea de tiempo simulada local.");
      runLocalTimelineFallback();
      return;
    }

    const fileTextContext = fileContent ? `Contenido del archivo:\n${fileContent}` : `Nombre del archivo: ${selectedFile.name}`;
    const systemPrompt = `
    Eres un experto historiador y estructurador de datos cronológicos.
    Analiza el siguiente documento y extrae los hitos históricos, cronológicos o eventos principales en orden cronológico estricto.
    Debes responder OBLIGATORIAMENTE en formato JSON puro, conteniendo únicamente un array de objetos con las propiedades "year", "title" y "description".
    Ejemplo de formato:
    [
      {"year": "753 a.C.", "title": "Fundación de Roma", "description": "Rómulo funda la ciudad en la colina del Palatino."},
      {"year": "509 a.C.", "title": "Establecimiento de la República", "description": "Expulsión del último rey Tarquinio el Soberbio."}
    ]
    No devuelvas ningún texto explicativo, solo el bloque JSON.
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `Genera una línea de tiempo cronológica en JSON basada en este material de estudio:\n${fileTextContext}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { 
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) throw new Error('Gemini API call failed');
      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      
      const parsedEvents = JSON.parse(responseText.trim());
      if (Array.isArray(parsedEvents)) {
        setTimelineEvents(parsedEvents);
        addToast('Línea de Tiempo Generada', `Se extrajeron ${parsedEvents.length} hitos cronológicos del documento.`);
        logActivity('EduBot', 'generó línea de tiempo de', selectedFile.name, 'complete');
      } else {
        throw new Error('Response is not an array');
      }
    } catch (error) {
      console.warn("Error al generar línea de tiempo en API, usando fallback.", error);
      runLocalTimelineFallback();
    }
    setIsTimelineLoading(false);
  };

  const runLocalTimelineFallback = () => {
    setIsTimelineLoading(true);
    setTimeout(() => {
      const fileName = selectedFile ? selectedFile.name.toLowerCase() : '';
      let mockEvents = [];

      if (fileName.includes('historia') || fileName.includes('roma')) {
        mockEvents = [
          { year: '753 a.C.', title: 'Fundación de Roma', description: 'Rómulo funda la ciudad según la tradición del Lacio.' },
          { year: '509 a.C.', title: 'Inicio de la República Romana', description: 'Derrocamiento de Tarquinio el Soberbio, estableciendo el gobierno de cónsules y el Senado.' },
          { year: '264 a.C. - 146 a.C.', title: 'Guerras Púnicas', description: 'Conflicto bélico de larga duración contra Cartago que consolida a Roma en el Mediterráneo.' },
          { year: '44 a.C.', title: 'Asesinato de Julio César', description: 'Magnicidio perpetrado por senadores en los Idus de Marzo, marcando el fin de la República.' },
          { year: '27 a.C.', title: 'Instauración del Imperio Romano', description: 'Octavio recibe el título de Augusto, convirtiéndose en el primer emperador de Roma.' },
          { year: '476 d.C.', title: 'Caída de Roma Occidental', description: 'Rómulo Augústulo es depuesto por el caudillo hérulo Odoacro, dando paso a la Edad Media.' }
        ];
      } else {
        mockEvents = [
          { year: 'Fase 1', title: 'Fundamentos Iniciales', description: 'Definición de hipótesis básicas y planteamiento del marco teórico del documento.' },
          { year: 'Fase 2', title: 'Análisis y Desarrollo', description: 'Estructuración de las principales ideas y recopilación de evidencias / metodologías.' },
          { year: 'Fase 3', title: 'Resultados y Pruebas', description: 'Interpretación de datos y experimentación práctica explicada en el texto.' },
          { year: 'Fase 4', title: 'Conclusión y Legado', description: 'Sintetización del tema con recomendaciones de estudio y futuras vías de investigación.' }
        ];
      }

      setTimelineEvents(mockEvents);
      setIsTimelineLoading(false);
      addToast('Línea de Tiempo Simulada', 'Línea de tiempo creada localmente basándose en el documento.');
      logActivity('EduBot', 'generó línea de tiempo simulada de', selectedFile ? selectedFile.name : 'Documento', 'complete');
    }, 1500);
  };

  // --- Refactored AI Chat Handler ---
  const sendMessageToBot = async (messageText) => {
    if (!messageText.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText.trim(),
      time: 'Hace un momento'
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsBotAnalyzing(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("VITE_GEMINI_API_KEY no encontrada en .env. Usando simulación local.");
      runLocalChatFallback(messageText.trim());
      return;
    }

    const fileContext = fileContent 
      ? `Documento cargado por el estudiante (${selectedFile?.name}):\n---\n${fileContent}\n---\n` 
      : (selectedFile ? `El estudiante está leyendo el archivo llamado "${selectedFile.name}".` : '');
    
    const systemPrompt = `
    Eres EduBot, un tutor virtual de inteligencia artificial integrado en la plataforma de estudio SyncFlow.
    Tu objetivo es ayudar al usuario a comprender y repasar su material de estudio de manera didáctica, clara y motivadora.
    ${fileContext}
    Instrucciones de respuesta:
    1. Responde a las dudas del estudiante de forma comprensible, amigable y estructurada usando formato Markdown.
    2. Si el tema lo requiere, brinda ejemplos sencillos de código o listas ordenadas.
    3. Sé conciso y enfócate en el valor educativo del concepto.
    `;

    try {
      const contents = [];
      const updatedHistory = [...chatMessages, userMsg];
      updatedHistory.filter(msg => msg.id !== 'welcome' && !msg.isQuiz && !msg.isTimelineSuggestion).forEach(msg => {
        contents.push({
          role: msg.sender === 'bot' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        });
      });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.7 }
        })
      });

      if (!response.ok) throw new Error('Gemini API call failed');
      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo obtener una respuesta.";

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: responseText,
        time: 'Hace un momento',
        isSummary: responseText.includes('Resumen') || responseText.includes('resumen') || responseText.includes('### 📜') || responseText.startsWith('###')
      };

      setChatMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.warn("Error en la llamada a Gemini. Usando simulación local.", error);
      runLocalChatFallback(messageText.trim());
    }
    setIsBotAnalyzing(false);
  };
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isBotAnalyzing]);

  // Load notes for the specific file name
  useEffect(() => {
    if (selectedFile) {
      const savedNotes = localStorage.getItem(`syncflow_notes_${selectedFile.name}`);
      setNotesText(savedNotes || '');
    } else {
      setNotesText('');
    }
  }, [selectedFile]);

  // Save notes dynamically
  const handleNotesChange = (e) => {
    const text = e.target.value;
    setNotesText(text);
    if (selectedFile) {
      localStorage.setItem(`syncflow_notes_${selectedFile.name}`, text);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setActiveQuiz(null);
    setQuizAnswered(false);
    setSelectedQuizOption(null);

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    
    if (isPdf) {
      // Create local object URL for PDF iframe rendering
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setFileContent('');
      addToast('Documento PDF Cargado', `Abriendo "${file.name}" para lectura de estudio.`);
      logActivity('Tú', 'abrió documento PDF', file.name, 'create');
    } else {
      // Read TXT/MD files
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target.result);
        setFileUrl('');
      };
      reader.readAsText(file);
      addToast('Documento de Texto Cargado', `Abriendo "${file.name}" para lectura de estudio.`);
      logActivity('Tú', 'abrió documento de texto', file.name, 'create');
    }

    // Proactive tutor suggestion for timeline based on name matching history topics
    const lowerName = file.name.toLowerCase();
    if (lowerName.includes('historia') || lowerName.includes('cronologia') || lowerName.includes('roma') || lowerName.includes('edad') || lowerName.includes('guerra') || lowerName.includes('siglo') || lowerName.includes('biografia') || lowerName.includes('libro') || lowerName.includes('informe')) {
      setTimeout(() => {
        const suggestMsg = {
          id: 'suggest-' + Date.now().toString(),
          sender: 'bot',
          text: `📚 He notado que el archivo "${file.name}" contiene información de orden cronológico e histórico.\n\n¿Te gustaría que extraiga una línea de tiempo interactiva de los hitos más importantes de este documento?`,
          time: 'Ahora',
          isTimelineSuggestion: true
        };
        setChatMessages(prev => [...prev, suggestMsg]);
      }, 2000);
    }
  };

  const handleBackToUpload = () => {
    setSelectedFile(null);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl('');
    }
    setFileContent('');
    setActiveQuiz(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // EduBot logic
  // Direct Gemini REST API helpers & fallbacks
  const runLocalChatFallback = (currentInput) => {
    const query = currentInput.toLowerCase();
    setTimeout(() => {
      let botResponse = 'Entendido. Como tutor de estudio, te recomiendo tomar notas sobre ese concepto en el bloc lateral. ¿Quieres que busque información sobre esto en el documento actual o prefieres un cuestionario?';
      let isSummaryResponse = false;

      if (query.includes('resum') || query.includes('sintetiz')) {
        botResponse = generateMockSummary();
        isSummaryResponse = true;
      } else if (query.includes('quiz') || query.includes('examen') || query.includes('evalu') || query.includes('pregunt')) {
        runLocalQuizFallback();
        setIsBotAnalyzing(false);
        return;
      } else if (query.includes('consejo') || query.includes('estudiar') || query.includes('pomodoro') || query.includes('tecnica')) {
        botResponse = 'Aquí tienes mis 3 técnicas favoritas para maximizar el estudio hoy:\n\n1. **Técnica Feynman**: Explica el tema que estás leyendo con palabras sencillas, como si se lo enseñaras a un niño de 10 años.\n2. **Práctica Recuperatoria**: Cierra el libro y escribe todo lo que recuerdes sin mirar las notas.\n3. **Bloques Pomodoro**: Estudia 25 minutos sin mirar el celular, y descansa 5. ¡Usa el temporizador que tienes arriba!';
      } else if (query.includes('hola') || query.includes('buen')) {
        botResponse = '¡Hola! Qué gusto saludarte. Estoy listo para ayudarte a desglosar el material de estudio. Puedes pedirme resúmenes o un quiz rápido.';
      }

      const botMsg = {
        id: Date.now().toString(),
        sender: 'bot',
        text: botResponse,
        time: 'Hace un momento',
        isSummary: isSummaryResponse
      };

      setChatMessages(prev => [...prev, botMsg]);
      setIsBotAnalyzing(false);
    }, 1500);
  };

  const runLocalSummaryFallback = () => {
    setTimeout(() => {
      const summaryText = generateMockSummary();
      const botMsg = {
        id: Date.now().toString(),
        sender: 'bot',
        text: summaryText,
        time: 'Hace un momento',
        isSummary: true
      };
      setChatMessages(prev => [...prev, botMsg]);
      setIsBotAnalyzing(false);
      addToast('Resumen Generado', 'EduBot ha resumido los conceptos del archivo.');
      logActivity('EduBot', 'generó un resumen de', selectedFile.name, 'complete');
    }, 1500);
  };

  const runLocalQuizFallback = () => {
    const fileName = selectedFile ? selectedFile.name.toLowerCase() : '';
    let quiz = {
      question: '¿Cuál es el propósito fundamental de la técnica de estudio activa "Active Recall" o Práctica de Recuperación?',
      options: [
        { id: 'a', text: 'Subrayar y releer repetidamente el texto para memorizar de forma pasiva.' },
        { id: 'b', text: 'Forzar al cerebro a recuperar activamente información de la memoria para fortalecer las conexiones sinápticas.', isCorrect: true },
        { id: 'c', text: 'Escribir resúmenes largos copiando textualmente el libro.' }
      ],
      explanation: 'La recuperación activa (Active Recall) obliga a tu mente a buscar la respuesta sin mirar el texto, lo cual es científicamente la forma más eficiente de memorizar a largo plazo.'
    };

    if (fileName.includes('historia')) {
      quiz = {
        question: '¿Qué fenómeno socioeconómico marcó la transición entre la Edad Media y la Edad Moderna en Europa?',
        options: [
          { id: 'a', text: 'El surgimiento de la burguesía mercantil y el auge del comercio urbano.', isCorrect: true },
          { id: 'b', text: 'La invasión del Imperio Romano por los pueblos germánicos.' },
          { id: 'c', text: 'El establecimiento del sistema de vasallaje absoluto.' }
        ],
        explanation: 'El auge del comercio urbano y la burguesía debilitaron el sistema feudal agrario, promoviendo el Renacimiento y la Edad Moderna.'
      };
    } else if (fileName.includes('program') || fileName.includes('codigo') || fileName.includes('web') || fileName.endsWith('.js') || fileName.endsWith('.css')) {
      quiz = {
        question: 'En el desarrollo frontend, ¿cuál es la ventaja clave de utilizar "State Management" (Gestión de Estado) centralizado?',
        options: [
          { id: 'a', text: 'Aumentar la velocidad de carga de las hojas de estilo CSS.' },
          { id: 'b', text: 'Facilitar la comunicación de datos entre componentes no adyacentes de forma predecible y evitar el "prop drilling".', isCorrect: true },
          { id: 'c', text: 'Permitir al navegador ejecutar código JS en un solo hilo.' }
        ],
        explanation: 'Al centralizar el estado, cualquier componente de la interfaz puede suscribirse y recibir actualizaciones en tiempo real sin pasar propiedades por múltiples capas jerárquicas.'
      };
    }

    setActiveQuiz(quiz);
    setQuizAnswered(false);
    setSelectedQuizOption(null);

    const botMsg = {
      id: Date.now().toString(),
      sender: 'bot',
      text: '¡Cuestionario de Repaso listo! Responde la siguiente pregunta sobre el tema de estudio:',
      time: 'Hace un momento',
      isQuiz: true
    };
    setChatMessages(prev => [...prev, botMsg]);
    logActivity('EduBot', 'generó un quiz interactivo de', selectedFile ? selectedFile.name : 'Conceptos', 'move');
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    const input = chatInput.trim();
    if (!input) return;
    setChatInput('');
    sendMessageToBot(input);
  };

  // Generate study summaries based on loaded file name
  const generateMockSummary = () => {
    const fileName = selectedFile ? selectedFile.name.toLowerCase() : '';
    let summaryText = '';

    if (fileName.includes('historia')) {
      summaryText = '### 📜 Resumen Académico: Historia Universal\n\n- **Tema Central**: Evolución geopolítica y transformaciones socioculturales.\n- **Conceptos Clave**:\n  1. *Causalidad*: Análisis multidimensional de detonantes bélicos.\n  2. *Periodización*: División estructurada de hitos cronológicos.\n- **Ideas Principales**:\n  - La economía agraria definió la organización de las primeras civilizaciones.\n  - Las revoluciones industriales marcaron la pauta para la globalización moderna.\n- **Glosario**: *Monarquía*: Régimen soberano absoluto. *Feudalismo*: Contrato de vasallaje medieval.';
    } else if (fileName.includes('program') || fileName.includes('codigo') || fileName.includes('web') || fileName.endsWith('.js') || fileName.endsWith('.css')) {
      summaryText = '### 💻 Resumen Técnico: Arquitectura de Software & Desarrollo\n\n- **Tema Central**: Optimización de algoritmos y modularidad de código.\n- **Conceptos Clave**:\n  1. *Reactividad*: Actualizaciones eficientes de estado en interfaces.\n  2. *Clean Code*: Separación de responsabilidades y reusabilidad.\n- **Ideas Principales**:\n  - Separar la lógica del diseño facilita el mantenimiento y escalabilidad.\n  - El control de memoria y asincronismo previene pérdidas de rendimiento.\n- **Glosario**: *Hook*: Función especial de React que enlaza estados. *State*: Memoria viva de la UI.';
    } else {
      summaryText = `### 📚 Resumen Ejecutivo: ${selectedFile ? selectedFile.name : 'Material de Estudio'}\n\n- **Tema Central**: Análisis introductorio y fundamentos del documento.\n- **Conceptos Clave**:\n  1. *Estructura Base*: Metodología y orden de las ideas expuestas.\n  2. *Aplicación Práctica*: Casos prácticos de estudio deducidos del texto.\n- **Ideas Principales**:\n  - El texto propone un marco de comprensión sistemático.\n  - Se identifican variables y dependencias esenciales.\n- **Glosario**: *Teoría*: Marco conceptual de entendimiento. *Práctica*: Experimentación real.`;
    }

    return summaryText;
  };

  const handleTriggerSummary = async () => {
    if (!selectedFile) {
      alert('Sube un documento de estudio primero para poder resumirlo.');
      return;
    }
    setIsBotAnalyzing(true);
    setActiveTab('bot');

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("VITE_GEMINI_API_KEY no configurada. Usando resumen simulado local.");
      runLocalSummaryFallback();
      return;
    }

    const fileTextContext = fileContent ? `Contenido del archivo:\n${fileContent}` : `Nombre del archivo: ${selectedFile.name}`;
    const systemPrompt = `
    Eres un experto en resúmenes académicos.
    Analiza el siguiente documento y genera un resumen completo y estructurado en formato Markdown.
    El resumen debe contener obligatoriamente estas secciones:
    ### 📜 Resumen Académico: [Nombre del Tema]
    - **Tema Central**: Breve explicación del objetivo o tema principal.
    - **Conceptos Clave**: Lista de 2-4 términos esenciales con breves definiciones.
    - **Ideas Principales**: Puntos clave o ideas fundamentales explicadas.
    - **Glosario**: Definiciones concisas en negrita.
    Adapta el tono y los conceptos si el archivo es técnico (ej. código fuente), histórico, de negocios o general.
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `Genera un resumen académico para este archivo:\n${fileTextContext}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.4 }
        })
      });

      if (!response.ok) throw new Error('Gemini API call failed');
      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo obtener el resumen.";

      const botMsg = {
        id: Date.now().toString(),
        sender: 'bot',
        text: responseText,
        time: 'Hace un momento',
        isSummary: true
      };
      setChatMessages(prev => [...prev, botMsg]);
      addToast('Resumen Generado', 'EduBot ha resumido los conceptos del archivo.');
      logActivity('EduBot', 'generó un resumen de', selectedFile.name, 'complete');
    } catch (error) {
      console.warn("Error al generar resumen en la API. Usando resumen simulado local.", error);
      runLocalSummaryFallback();
    }
    setIsBotAnalyzing(false);
  };

  // Generate interactive quiz questions
  const triggerQuiz = async () => {
    setActiveTab('bot');
    setIsBotAnalyzing(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("VITE_GEMINI_API_KEY no configurada. Usando quiz simulado local.");
      runLocalQuizFallback();
      return;
    }

    const fileTextContext = fileContent ? `Contenido del archivo:\n${fileContent}` : `Nombre del archivo: ${selectedFile ? selectedFile.name : 'Conceptos generales'}`;
    const systemPrompt = `
    Eres un examinador académico. Tu tarea es generar una pregunta de opción múltiple interactiva basada en el material de estudio proporcionado.
    Debes responder estrictamente con un objeto JSON válido que cumpla con el siguiente esquema:
    {
      "question": "Pregunta de opción múltiple estructurada y clara...",
      "options": [
        { "id": "a", "text": "Opción de respuesta A" },
        { "id": "b", "text": "Opción de respuesta B", "isCorrect": true },
        { "id": "c", "text": "Opción de respuesta C" }
      ],
      "explanation": "Explicación académica detallada de por qué esa respuesta es la correcta y por qué las otras no."
    }
    Reglas:
    1. Genera exactamente 3 opciones (con id 'a', 'b', y 'c').
    2. Solo una opción debe tener la clave "isCorrect": true.
    3. No agregues formatos de Markdown o bloques de código (ej: \`\`\`json) en la respuesta, solo la cadena JSON directa.
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `Genera un quiz de opción múltiple interactivo sobre este material de estudio:\n${fileTextContext}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { 
            temperature: 0.85,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) throw new Error('Gemini API call failed');
      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      const quizData = JSON.parse(responseText);
      setActiveQuiz(quizData);
      setQuizAnswered(false);
      setSelectedQuizOption(null);

      const botMsg = {
        id: Date.now().toString(),
        sender: 'bot',
        text: '¡Cuestionario de Repaso listo! Responde la siguiente pregunta sobre el tema de estudio:',
        time: 'Hace un momento',
        isQuiz: true
      };
      setChatMessages(prev => [...prev, botMsg]);
      logActivity('EduBot', 'generó un quiz interactivo de', selectedFile ? selectedFile.name : 'Conceptos', 'move');
    } catch (error) {
      console.warn("Error al generar quiz en la API. Usando quiz simulado local.", error);
      runLocalQuizFallback();
    }
    setIsBotAnalyzing(false);
  };

  const handleSelectQuizOption = (option) => {
    if (quizAnswered) return;
    setSelectedQuizOption(option);
    setQuizAnswered(true);
    
    if (option.isCorrect) {
      addToast('Respuesta Correcta', '¡Buen trabajo! Has respondido bien el quiz.');
    } else {
      addToast('Respuesta Incorrecta', 'Intenta repasar el tema nuevamente.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Study Header with Mini Pomodoro timer control */}
      <div className="board-header" style={{ marginBottom: '16px', flexShrink: 0 }}>
        <div className="board-info">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={24} style={{ color: 'var(--primary)' }} />
            <span>Centro de Estudio</span>
          </h1>
          <p>Lee documentos y PDFs libre de distracciones al lado de tu bloc de notas y tutor AI</p>
        </div>
        
        {/* Compact Pomodoro control inside reader */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '6px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: pomoMode === 'work' ? 'var(--primary)' : 'var(--secondary)'
            }}></span>
            <span>{pomoMode === 'work' ? 'Enfoque' : 'Recreo'}</span>
          </div>
          <span style={{ fontFamily: 'var(--font-secondary)', fontWeight: 700, fontSize: '15px', color: 'white' }}>
            {formatTime(pomodoroTime)}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={() => setIsPomoRunning(!isPomoRunning)} 
              className="icon-btn" 
              style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.02)' }}
            >
              {isPomoRunning ? <Pause size={12} /> : <Play size={12} style={{ marginLeft: '1px' }} />}
            </button>
            <button 
              onClick={() => {
                setIsPomoRunning(false);
                if (pomoMode === 'work') setPomodoroTime(1500);
                else setPomodoroTime(300);
              }} 
              className="icon-btn" 
              style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.02)' }}
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>
      </div>

      {selectedTutor === null ? (
        /* Tutor Selection Page */
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
              Centro de Aprendizaje Inteligente
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
              Elige a tu Tutor Especializado de Inteligencia Artificial para comenzar tu sesión de estudio interactiva.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
            gap: '20px', 
            maxWidth: '960px', 
            margin: '0 auto',
            width: '100%'
          }}>
            {/* General Tutor */}
            <div 
              className="timeline-card-content" 
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.01)', borderRadius: 'var(--radius-lg)' }}
              onClick={() => {
                setSelectedTutor('general');
                setActiveTab('notes');
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', marginBottom: '16px', justifyContent: 'center' }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Tutor General (EduBot)</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1, marginBottom: '20px' }}>
                Ayuda con resúmenes académicos detallados, explicaciones de conceptos, cuestionarios tipo quiz de opción múltiple y consultas generales sobre tus documentos.
              </p>
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: '12px' }}>Comenzar Tutoría</button>
            </div>

            {/* History Tutor */}
            <div 
              className="timeline-card-content" 
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.01)', borderRadius: 'var(--radius-lg)' }}
              onClick={() => {
                setSelectedTutor('history');
                setActiveTab('timeline');
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', marginBottom: '16px', justifyContent: 'center' }}>
                <Calendar size={24} style={{ color: '#f59e0b' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Tutor de Historia y Cronología</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1, marginBottom: '20px' }}>
                Especializado en el desglose cronológico de textos e historia. Analiza tus materiales de lectura para extraer líneas de tiempo de eventos interactivas.
              </p>
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: '12px' }}>Iniciar Cronología</button>
            </div>

            {/* Math / Algebra Tutor */}
            <div 
              className="timeline-card-content" 
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.01)', borderRadius: 'var(--radius-lg)' }}
              onClick={() => {
                setSelectedTutor('math');
                setActiveTab('math');
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', marginBottom: '16px', justifyContent: 'center' }}>
                <TrendingUp size={24} style={{ color: '#a855f7' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Laboratorio de Álgebra</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1, marginBottom: '20px' }}>
                Accede directamente al graficador de funciones 2D interactivo y al solucionador algebraico AI para resolver problemas paso a paso sin necesidad de subir archivos.
              </p>
              <button className="btn btn-primary" style={{ width: '100%', fontSize: '12px' }}>Abrir Laboratorio</button>
            </div>
          </div>
        </div>
      ) : (!selectedFile && selectedTutor !== 'math') ? (
        /* File Upload View */
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', overflowY: 'auto', padding: '24px' }}>
          <button 
            className="btn btn-secondary" 
            style={{ alignSelf: 'flex-start', marginBottom: '16px', fontSize: '12px', padding: '6px 12px' }} 
            onClick={() => {
              setSelectedTutor(null);
              setSelectedFile(null);
              setFileUrl('');
              setFileContent('');
            }}
          >
            <ChevronLeft size={14} />
            <span>Volver a Tutores</span>
          </button>
          
          <div className="file-dropzone" onClick={() => document.getElementById('file-upload-input').click()} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--primary-glow)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              alignSelf: 'center'
            }}>
              <Upload size={32} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
              Sube tu material para el {selectedTutor === 'history' ? 'Tutor de Historia' : 'Tutor General'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '24px', alignSelf: 'center' }}>
              Arrastra tu archivo o haz clic para subirlo. Soporta archivos PDF de texto y documentos de texto (.txt, .md).
            </p>
            <button className="btn btn-primary" style={{ alignSelf: 'center' }}>
              Seleccionar Archivo
            </button>
            <input
              type="file"
              id="file-upload-input"
              accept=".pdf,.txt,.md"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      ) : (
        /* Split Screen Study View (For Math Sandbox or when file is loaded) */
        <div className="study-hub-container">
          
          {/* Left panel: Legible Viewer or Canvas (if selectedTutor is math) */}
          <div className="document-viewer-panel">
            {selectedTutor === 'math' ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#090d16', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <div className="reader-toolbar" style={{ borderBottom: '1px solid var(--border-color)', justifyContent: 'space-between', padding: '10px 16px' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => {
                    setSelectedTutor(null);
                    setSelectedFile(null);
                    setFileUrl('');
                    setFileContent('');
                  }}>
                    <ChevronLeft size={14} />
                    <span>Volver a Tutores</span>
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'white' }}>
                    <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>Lienzo Álgebra 2D Interactivo</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    ({mouseCoord.x.toFixed(2)}, {mouseCoord.y.toFixed(2)})
                  </span>
                </div>
                
                <div style={{ flex: 1, position: 'relative' }}>
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={400}
                    style={{ display: 'block', cursor: 'crosshair', width: '100%', height: '100%' }}
                    onMouseMove={handleCanvasMouseMove}
                  />
                  
                  {/* Floating Controls */}
                  <div style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', gap: '6px', zIndex: 10 }}>
                    <button className="graph-control-btn" style={{ width: '32px', height: '32px', fontSize: '16px' }} onClick={() => handleZoom(1.2)}>+</button>
                    <button className="graph-control-btn" style={{ width: '32px', height: '32px', fontSize: '16px' }} onClick={() => handleZoom(0.8)}>-</button>
                    <button className="graph-control-btn" style={{ height: '32px', padding: '0 12px', fontSize: '11px' }} onClick={handleResetView}>Restablecer</button>
                  </div>
                  
                  <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', zIndex: 10 }}>
                    <button className="graph-control-btn" style={{ width: '32px', height: '32px' }} onClick={() => handlePan(0, 1)}>↑</button>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="graph-control-btn" style={{ width: '32px', height: '32px' }} onClick={() => handlePan(-1, 0)}>←</button>
                      <button className="graph-control-btn" style={{ width: '32px', height: '32px' }} onClick={() => handlePan(1, 0)}>→</button>
                    </div>
                    <button className="graph-control-btn" style={{ width: '32px', height: '32px' }} onClick={() => handlePan(0, -1)}>↓</button>
                  </div>
                </div>
              </div>
            ) : selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf') ? (
              /* PDF View rendering in iframe */
              <iframe
                src={fileUrl}
                title="Lector de PDF SyncFlow"
                width="100%"
                height="100%"
                style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}
              />
            ) : (
              /* Legible Text View */
              <div className="text-viewer" style={{ fontSize: `${fontSize}px` }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{fileContent}</pre>
              </div>
            )}
          </div>

          {/* Right panel: tabbed study side bar */}
          <div className="notes-editor-panel">
            <div className="study-tabs">
              <button 
                className={`study-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                <FileText size={14} />
                <span>Bloc de Notas</span>
              </button>
              <button 
                className={`study-tab-btn ${activeTab === 'bot' ? 'active' : ''}`}
                onClick={() => setActiveTab('bot')}
              >
                <Sparkles size={14} />
                <span>Asistente AI</span>
              </button>
              <button 
                className={`study-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
                onClick={() => setActiveTab('timeline')}
              >
                <Calendar size={14} />
                <span>Línea de Tiempo</span>
              </button>
              <button 
                className={`study-tab-btn ${activeTab === 'math' ? 'active' : ''}`}
                onClick={() => setActiveTab('math')}
              >
                <TrendingUp size={14} />
                <span>Álgebra</span>
              </button>
            </div>

            {activeTab === 'notes' && (
              /* Editor notes */
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <textarea
                  className="notepad-textarea"
                  placeholder="Escribe tus resúmenes, ideas clave y notas de estudio aquí. Se guardan automáticamente vinculados a este documento..."
                  value={notesText}
                  onChange={handleNotesChange}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'right' }}>
                  Nota guardada localmente ({notesText.length} caract.)
                </span>
              </div>
            )}

            {activeTab === 'bot' && (
              /* AI Companion chat */
              <div className="ai-chat-container">
                <div className="ai-actions-bar">
                  <button className="ai-action-chip" onClick={handleTriggerSummary}>
                    <Sparkles size={12} />
                    <span>Resumir PDF</span>
                  </button>
                  <button className="ai-action-chip" onClick={triggerQuiz}>
                    <Brain size={12} />
                    <span>Hacer Quiz</span>
                  </button>
                  <button className="ai-action-chip" onClick={() => {
                    setChatInput('Bríndame consejos para estudiar mejor este documento');
                  }}>
                    <GraduationCap size={12} />
                    <span>Técnicas</span>
                  </button>
                  <button 
                    type="button"
                    className="ai-action-chip" 
                    onClick={clearChat}
                    style={{ 
                      marginLeft: 'auto',
                      color: '#94a3b8',
                      border: '1px dashed rgba(255,255,255,0.08)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#f87171';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                    title="Borrar historial del chat de este documento"
                  >
                    <Trash2 size={12} />
                    <span>Limpiar Chat</span>
                  </button>
                </div>

                <div className="ai-chat-messages">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`ai-message ${msg.sender === 'bot' ? 'edu' : 'user'}`}>
                      <div className={`ai-avatar ${msg.sender === 'bot' ? 'bot' : 'user'}`}>
                        {msg.sender === 'bot' ? 'ED' : 'TÚ'}
                      </div>
                      <div className="ai-bubble">
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                        
                        {msg.sender === 'bot' && (msg.isSummary || msg.text.includes('Resumen') || msg.text.includes('resumen') || msg.text.includes('### 📜') || msg.text.startsWith('###')) && (
                          <button 
                            className="btn btn-secondary" 
                            style={{ 
                              marginTop: '12px', 
                              padding: '6px 12px', 
                              fontSize: '11px', 
                              gap: '6px', 
                              background: 'rgba(255, 255, 255, 0.03)', 
                              borderColor: 'rgba(255, 255, 255, 0.08)',
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'pointer'
                            }}
                            onClick={() => exportToPDF(msg.text, selectedFile ? selectedFile.name : 'resumen.txt')}
                          >
                            <Download size={12} style={{ color: 'var(--primary)' }} />
                            <span style={{ color: 'white' }}>Exportar Resumen PDF</span>
                          </button>
                        )}

                        {msg.sender === 'bot' && msg.isTimelineSuggestion && (
                          <button 
                            className="btn btn-secondary" 
                            style={{ 
                              marginTop: '12px', 
                              padding: '6px 12px', 
                              fontSize: '11px', 
                              gap: '6px', 
                              background: 'var(--primary)', 
                              borderColor: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'pointer'
                            }}
                            onClick={handleGenerateTimeline}
                          >
                            <Calendar size={12} style={{ color: 'white' }} />
                            <span style={{ color: 'white' }}>Generar Línea de Tiempo</span>
                          </button>
                        )}
                        
                        {/* Interactive Quiz options within chat bubble */}
                        {msg.isQuiz && activeQuiz && (
                          <div className="quiz-card">
                            <div className="quiz-question">{activeQuiz.question}</div>
                            <div className="quiz-options-list">
                              {activeQuiz.options.map((opt, idx) => {
                                const isSelected = selectedQuizOption?.id === opt.id;
                                let btnClass = '';
                                if (quizAnswered) {
                                  if (opt.isCorrect) btnClass = 'correct';
                                  else if (isSelected) btnClass = 'wrong';
                                }
                                return (
                                  <button
                                    key={idx}
                                    className={`quiz-option-btn ${btnClass}`}
                                    onClick={() => handleSelectQuizOption(opt)}
                                    disabled={quizAnswered}
                                  >
                                    {opt.text}
                                  </button>
                                );
                              })}
                            </div>
                            {quizAnswered && (
                              <div className={`quiz-feedback ${selectedQuizOption?.isCorrect ? 'feedback-success' : 'feedback-error'}`}>
                                <HelpCircle size={14} />
                                <span>
                                  {selectedQuizOption?.isCorrect ? '¡Correcto! ' : 'Incorrecto. '}
                                  {activeQuiz.explanation}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isBotAnalyzing && (
                    <div className="ai-message edu">
                      <div className="ai-avatar bot">ED</div>
                      <div className="typing-indicator" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                        <span>EduBot está redactando</span>
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
                    placeholder="Escribe tu consulta académica..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isBotAnalyzing}
                  />
                  <button type="submit" className="chat-send-btn" disabled={isBotAnalyzing}>
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'timeline' && (
              /* Chronological Timeline view */
              <div className="timeline-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: 'white', display: 'block' }}>Línea de Tiempo</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Cronología extraída del documento
                    </span>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleGenerateTimeline} 
                    disabled={isTimelineLoading || !selectedFile}
                    style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Calendar size={12} />
                    <span>{isTimelineLoading ? 'Generando...' : 'Generar Línea'}</span>
                  </button>
                </div>

                {!selectedFile ? (
                  <div className="timeline-empty-state">
                    <Calendar size={32} style={{ color: 'var(--text-muted)', marginBottom: '10px', opacity: 0.5 }} />
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Sube un documento en el visor izquierdo para generar su línea de tiempo.
                    </p>
                  </div>
                ) : isTimelineLoading ? (
                  <div className="timeline-empty-state">
                    <div className="typing-indicator" style={{ display: 'flex', gap: '4px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Extrayendo cronología...</span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                ) : timelineEvents.length === 0 ? (
                  <div className="timeline-empty-state">
                    <Calendar size={32} style={{ color: 'var(--text-muted)', marginBottom: '10px', opacity: 0.5 }} />
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Haz clic en "Generar Línea" para reconstruir los hitos cronológicos.
                    </p>
                  </div>
                ) : (
                  <div className="timeline-events-list">
                    {timelineEvents.map((evt, index) => (
                      <div key={index} className="timeline-event-card">
                        <div className="timeline-badge">{evt.year}</div>
                        <div className="timeline-card-content">
                          <h4 className="timeline-card-title">{evt.title}</h4>
                          <p className="timeline-card-desc">{evt.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'math' && (
              /* Algebra Sandbox view */
              <div className="math-sandbox-container">
                <div className="math-tutor-banner" style={{ background: 'rgba(168, 85, 247, 0.03)', border: '1px solid rgba(168, 85, 247, 0.12)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Sparkles size={14} style={{ color: 'var(--accent-purple)' }} />
                    <strong style={{ fontSize: '13px', color: 'white' }}>Solucionador de Ejercicios AI</strong>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: '1.4' }}>
                    Escribe tu ecuación, derivada o problema algebraico y el Tutor AI te lo resolverá detalladamente paso a paso:
                  </p>
                  
                  {/* Solve input & button */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      className="modal-input"
                      style={{ height: '32px', fontSize: '11px', flex: 1, background: 'rgba(0, 0, 0, 0.2)' }}
                      placeholder="Ej. Resolver: 2x + 7 = 15 o Factorizar: x^2 - 9"
                      value={mathInput}
                      onChange={(e) => setMathInput(e.target.value)}
                      disabled={isSolving}
                    />
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0 12px', height: '32px', fontSize: '11px', cursor: 'pointer', borderColor: 'var(--accent-purple)', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => handleSolveMathProblem(mathInput)}
                      disabled={isSolving || !mathInput.trim()}
                    >
                      {isSolving ? 'Resolviendo...' : 'Resolver'}
                    </button>
                  </div>

                  {/* Shortcuts */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    <button 
                      className="ai-action-chip" 
                      style={{ fontSize: '9px', padding: '3px 8px' }} 
                      onClick={() => { setMathInput('Resolver: 2x + 7 = 15'); handleSolveMathProblem('Resolver: 2x + 7 = 15'); }}
                      disabled={isSolving}
                    >
                      Ecuación básica
                    </button>
                    <button 
                      className="ai-action-chip" 
                      style={{ fontSize: '9px', padding: '3px 8px' }} 
                      onClick={() => { setMathInput('Derivar: f(x) = 3x^2 - 5x + 2'); handleSolveMathProblem('Derivar: f(x) = 3x^2 - 5x + 2'); }}
                      disabled={isSolving}
                    >
                      Derivada polinomial
                    </button>
                    <button 
                      className="ai-action-chip" 
                      style={{ fontSize: '9px', padding: '3px 8px' }} 
                      onClick={() => { setMathInput('Factorizar: x^2 - 9'); handleSolveMathProblem('Factorizar: x^2 - 9'); }}
                      disabled={isSolving}
                    >
                      Diferencia de cuadrados
                    </button>
                  </div>

                  {/* Solution display box */}
                  {(mathSolution || isSolving) && (
                    <div style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '12px', marginTop: '10px', position: 'relative' }}>
                      {isSolving ? (
                        <div className="typing-indicator" style={{ display: 'flex', gap: '4px', padding: 0 }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Resolviendo ejercicio paso a paso...</span>
                          <span className="dot"></span>
                          <span className="dot"></span>
                          <span className="dot"></span>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--accent-purple)', fontWeight: 'bold', textTransform: 'uppercase' }}>Paso a Paso Solución</span>
                            <button 
                              style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '10px' }}
                              onClick={() => { setMathSolution(''); setMathInput(''); }}
                            >
                              Limpiar
                            </button>
                          </div>
                          <div style={{ fontSize: '11px', color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: '1.5', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                            {mathSolution}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="math-grapher-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TrendingUp size={14} style={{ color: 'var(--primary)' }} />
                      <strong style={{ fontSize: '13px', color: 'white' }}>Graficador Álgebra 2D</strong>
                    </div>
                    {selectedTutor !== 'math' && (
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        Coord: ({mouseCoord.x.toFixed(2)}, {mouseCoord.y.toFixed(2)})
                      </span>
                    )}
                  </div>

                  {selectedTutor !== 'math' ? (
                    <div style={{ position: 'relative', background: '#07090e', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', height: '220px', overflow: 'hidden' }}>
                      <canvas
                        ref={canvasRef}
                        width={320}
                        height={220}
                        style={{ display: 'block', cursor: 'crosshair', width: '100%', height: '100%' }}
                        onMouseMove={handleCanvasMouseMove}
                      />
                      
                      {/* Zoom Overlay Controls */}
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', display: 'flex', gap: '4px', zIndex: 10 }}>
                        <button className="graph-control-btn" onClick={() => handleZoom(1.2)}>+</button>
                        <button className="graph-control-btn" onClick={() => handleZoom(0.8)}>-</button>
                        <button className="graph-control-btn" style={{ width: '42px', fontSize: '10px' }} onClick={handleResetView}>Reset</button>
                      </div>
                      
                      {/* Pan Overlay Controls */}
                      <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', zIndex: 10 }}>
                        <button className="graph-control-btn" onClick={() => handlePan(0, 1)}>↑</button>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="graph-control-btn" onClick={() => handlePan(-1, 0)}>←</button>
                          <button className="graph-control-btn" onClick={() => handlePan(1, 0)}>→</button>
                        </div>
                        <button className="graph-control-btn" onClick={() => handlePan(0, -1)}>↓</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', color: 'white', margin: 0, lineHeight: '1.4' }}>
                        🎨 El lienzo gráfico interactivo está abierto en pantalla completa a la izquierda. Puedes gestionar tus funciones abajo:
                      </p>
                    </div>
                  )}

                  <div style={{ marginTop: '12px' }}>
                    <form onSubmit={handleAddEquation} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>y =</span>
                        <input
                          type="text"
                          className="modal-input"
                          style={{ paddingLeft: '28px', height: '32px', fontSize: '11px', background: 'rgba(255,255,255,0.02)' }}
                          placeholder="Ej. x^2 - 3*x, sin(x)"
                          value={newEquationInput}
                          onChange={(e) => setNewEquationInput(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Plus size={12} />
                        <span>Graficar</span>
                      </button>
                    </form>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '70px', overflowY: 'auto', padding: '2px' }}>
                      {equations.map((eq, index) => {
                        const colors = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];
                        const color = colors[index % colors.length];
                        return (
                          <div 
                            key={index} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              background: 'rgba(255, 255, 255, 0.02)', 
                              border: `1px solid ${color}44`,
                              borderRadius: '4px',
                              padding: '2px 8px',
                              fontSize: '10px'
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }} />
                            <span style={{ color: 'white', fontFamily: 'monospace' }}>y = {eq}</span>
                            <button 
                              type="button" 
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', padding: 0, marginLeft: '4px' }}
                              onClick={() => handleRemoveEquation(index)}
                            >
                              <Trash2 size={10} style={{ color: '#ef4444' }} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
