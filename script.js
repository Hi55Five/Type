(function() {
  // ========== CONFIGURAÇÕES GLOBAIS ==========
  const CONFIG = {
    typingDelay: 0.001,
    darkModeColors: {
      background: '#0f0f23',
      surface: '#1a1a2e',
      card: '#16213e',
      text: '#e6e6ff',
      textLight: '#a0a0cc',
      textImportant: '#ffffff',
      primary: '#6366f1',
      success: '#10b981',
      accent: '#f59e0b',
      border: '#2d2d5a',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    lightModeColors: {
      background: '#ffffff',
      surface: '#f8fafc',
      card: '#ffffff',
      text: '#334155',
      textLight: '#64748b',
      textImportant: '#0f172a',
      primary: '#3b82f6',
      success: '#10b981',
      accent: '#f59e0b',
      border: '#e2e8f0',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    }
  };

  // ========== VERIFICAÇÃO DE DUPLICIDADE ==========
  if (document.getElementById('typeflow-popup')) return;

  // ========== DETECÇÃO DE DISPOSITIVO ==========
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const popupSize = isMobile ? 0.6 : 0.85; // 60% mobile, 85% PC

  // ========== SISTEMA DE SPLASH SCREEN ==========
  const SplashScreen = {
    show() {
      const splash = document.createElement('div');
      splash.id = 'typeflow-splash';
      splash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: ${CONFIG.darkModeColors.background};
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000001;
        font-family: 'Inter', system-ui, sans-serif;
        color: ${CONFIG.darkModeColors.text};
        transition: opacity 0.5s ease;
      `;

      splash.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 20px;">🌀</div>
          <h1 style="font-size: 28px; margin-bottom: 10px; color: ${CONFIG.darkModeColors.textImportant};">
            Type Flow
          </h1>
          <p style="color: ${CONFIG.darkModeColors.textLight}; margin-bottom: 30px;">
            Ferramenta de Redação Avançada
          </p>
          <div style="
            width: 60px;
            height: 4px;
            background: ${CONFIG.darkModeColors.gradient};
            border-radius: 2px;
            margin: 0 auto;
            position: relative;
            overflow: hidden;
          ">
            <div id="splash-progress" style="
              position: absolute;
              top: 0;
              left: 0;
              height: 100%;
              background: ${CONFIG.darkModeColors.primary};
              width: 0%;
              transition: width 0.3s ease;
            "></div>
          </div>
          <p style="color: ${CONFIG.darkModeColors.textLight}; font-size: 12px; margin-top: 20px;">
            Carregando recursos...
          </p>
        </div>
      `;

      document.body.appendChild(splash);
      this.splash = splash;
      this.animateProgress();
    },

    animateProgress() {
      const progress = document.getElementById('splash-progress');
      let width = 0;
      
      const interval = setInterval(() => {
        width += Math.random() * 15;
        if (width >= 100) {
          width = 100;
          clearInterval(interval);
        }
        progress.style.width = width + '%';
      }, 200);
    },

    hide() {
      if (this.splash) {
        this.splash.style.opacity = '0';
        setTimeout(() => {
          if (this.splash && this.splash.parentNode) {
            this.splash.parentNode.removeChild(this.splash);
          }
        }, 500);
      }
    }
  };

  // ========== SISTEMA DE TOAST ==========
  const ToastSystem = {
    show(message, duration = 3000, position = 'top') {
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        ${position === 'top' ? 'top: 20px' : 'bottom: 20px'};
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: ${CONFIG.darkModeColors.surface};
        color: ${CONFIG.darkModeColors.text};
        padding: 12px 20px;
        border-radius: 12px;
        border: 1px solid ${CONFIG.darkModeColors.border};
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 1000002;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 14px;
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        gap: 8px;
      `;

      toast.innerHTML = `
        <span>${this.getIcon(message)}</span>
        <span>${message}</span>
      `;

      document.body.appendChild(toast);

      // Animar entrada
      setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
      }, 100);

      // Remover após duração
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, duration);
    },

    getIcon(message) {
      if (message.includes('✅') || message.includes('sucesso')) return '✅';
      if (message.includes('❌') || message.includes('erro')) return '❌';
      if (message.includes('⭐') || message.includes('bem-vindo')) return '⭐';
      if (message.includes('🚀')) return '🚀';
      if (message.includes('🌿')) return '🌿';
      return 'ℹ️';
    }
  };

  // ========== SISTEMA DE FPS ==========
  const FPSTracker = {
    fps: 0,
    frameCount: 0,
    lastTime: performance.now(),
    fpsElement: null,

    init() {
      this.createFPSDisplay();
      this.startTracking();
    },

    createFPSDisplay() {
      this.fpsElement = document.createElement('div');
      this.fpsElement.id = 'typeflow-fps';
      this.fpsElement.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: #00ff00;
        padding: 8px 12px;
        border-radius: 6px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        z-index: 999998;
        backdrop-filter: blur(10px);
        border: 1px solid #00ff00;
        transition: all 0.3s ease;
        opacity: 0.9;
      `;
      document.body.appendChild(this.fpsElement);
      this.updateDisplay();
    },

    startTracking() {
      const updateFPS = () => {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
          this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
          this.frameCount = 0;
          this.lastTime = currentTime;
          this.updateDisplay();
        }
        
        requestAnimationFrame(updateFPS);
      };
      
      requestAnimationFrame(updateFPS);
    },

    updateDisplay() {
      if (this.fpsElement) {
        const ms = Math.round(1000 / Math.max(this.fps, 1));
        this.fpsElement.innerHTML = `
          <div style="line-height: 1.4;">
            <div>FPS: ${this.fps}</div>
            <div>MS: ${ms}ms</div>
            <div style="font-size: 10px; opacity: 0.8;">@_zx.lipe_</div>
          </div>
        `;
      }
    },

    toggleVisibility(show) {
      if (this.fpsElement) {
        this.fpsElement.style.display = show ? 'block' : 'none';
      }
    }
  };

  // ========== GESTÃO DE ESTADO ==========
  const StateManager = {
    state: {
      currentMode: 'dark',
      capturedInfo: {},
      isApplyingStyles: false,
      observerActive: false,
      wordGoal: 200,
      popupVisible: true,
      isTyping: false,
      typingQueue: [],
      isMinimized: false,
      splashShown: false
    },
    
    setState(newState) {
      this.state = { ...this.state, ...newState };
      this.notifyObservers();
    },
    
    observers: [],
    subscribe(callback) {
      this.observers.push(callback);
    },
    
    notifyObservers() {
      this.observers.forEach(callback => callback(this.state));
    },

    getState() {
      return this.state;
    }
  };

  // ========== SISTEMA DE UTILITÁRIOS ==========
  const Utils = {
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    async safeExecute(operation, errorMessage) {
      try {
        return await operation();
      } catch (error) {
        console.error(`${errorMessage}:`, error);
        ToastSystem.show(`❌ ${errorMessage}`, 4000);
        return null;
      }
    },

    throttle(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    // Função para calcular tamanhos baseado no dispositivo
    getSize(baseSize) {
      return baseSize * popupSize;
    },

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  };

  // ========== SISTEMA DE NOTIFICAÇÕES ==========
  const NotificationSystem = {
    mostrarNotificacao(mensagem, tipo = 'info', tempo = 4000) {
      let notificacaoContainer = document.getElementById('typeflow-notifications');
      if (!notificacaoContainer) {
        notificacaoContainer = document.createElement('div');
        notificacaoContainer.id = 'typeflow-notifications';
        notificacaoContainer.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000000;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 350px;
        `;
        document.body.appendChild(notificacaoContainer);
      }

      const notificacao = document.createElement('div');
      const bgColor = tipo === 'success' ? '#10b981' : tipo === 'error' ? '#ef4444' : '#3b82f6';
      
      notificacao.style.cssText = `
        background: ${bgColor};
        color: white;
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        transform: translateX(400px);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
      `;

      const progressBar = document.createElement('div');
      progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: rgba(255,255,255,0.8);
        width: 100%;
        transform: scaleX(1);
        transform-origin: left;
        transition: transform ${tempo}ms linear;
      `;
      notificacao.appendChild(progressBar);

      notificacao.innerHTML += `
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <div style="font-size: 18px;">
            ${tipo === 'success' ? '✅' : tipo === 'error' ? '❌' : 'ℹ️'}
          </div>
          <div style="flex: 1;">${mensagem}</div>
        </div>
      `;
      
      notificacaoContainer.appendChild(notificacao);

      setTimeout(() => {
        notificacao.style.transform = 'translateX(0)';
        notificacao.style.opacity = '1';
        progressBar.style.transform = 'scaleX(0)';
      }, 100);

      notificacao.addEventListener('click', () => {
        this.fecharNotificacao(notificacao);
      });

      const timeout = setTimeout(() => {
        this.fecharNotificacao(notificacao);
      }, tempo);

      notificacao.addEventListener('mouseenter', () => {
        progressBar.style.transition = 'none';
        clearTimeout(timeout);
      });

      notificacao.addEventListener('mouseleave', () => {
        const remainingTime = tempo * 0.7;
        progressBar.style.transition = `transform ${remainingTime}ms linear`;
        progressBar.style.transform = 'scaleX(0)';
        
        setTimeout(() => {
          this.fecharNotificacao(notificacao);
        }, remainingTime);
      });
    },

    fecharNotificacao(notificacao) {
      notificacao.style.transform = 'translateX(400px)';
      notificacao.style.opacity = '0';
      
      setTimeout(() => {
        if (notificacao.parentNode) {
          notificacao.parentNode.removeChild(notificacao);
        }
      }, 400);
    }
  };

  // ========== GERENCIAMENTO DE MODO ESCURO/CLARO ==========
  const ThemeManager = {
    toggleModoEscuro() {
      const state = StateManager.getState();
      if (state.currentMode === 'dark') {
        this.desativarModoEscuro();
      } else {
        this.ativarModoEscuroUniversal();
      }
    },

    ativarModoEscuroUniversal() {
      const state = StateManager.getState();
      if (state.isApplyingStyles) return;
      StateManager.setState({ isApplyingStyles: true, observerActive: false });
      
      StateManager.setState({ currentMode: 'dark' });
      localStorage.setItem('toolpad-mode', 'dark');
      document.documentElement.setAttribute('data-toolpad-color-scheme', 'dark');
      this.aplicarEstilosModoEscuro();
      
      if (window.darkModeBtn) {
        window.darkModeBtn.innerHTML = '☀️';
        window.darkModeBtn.title = 'Alternar para Modo Claro';
      }
      
      setTimeout(() => {
        StateManager.setState({ observerActive: true, isApplyingStyles: false });
      }, 1000);
      
      ToastSystem.show('🌙 Modo escuro ativado', 2000);
    },

    desativarModoEscuro() {
      const state = StateManager.getState();
      if (state.isApplyingStyles) return;
      StateManager.setState({ isApplyingStyles: true, observerActive: false });
      
      StateManager.setState({ currentMode: 'light' });
      localStorage.removeItem('toolpad-mode');
      document.documentElement.removeAttribute('data-toolpad-color-scheme');
      
      const estilosEscuro = document.querySelectorAll('[data-modo-escuro="universal"]');
      estilosEscuro.forEach(style => style.remove());
      
      if (window.darkModeBtn) {
        window.darkModeBtn.innerHTML = '🌙';
        window.darkModeBtn.title = 'Alternar para Modo Escuro';
      }
      
      setTimeout(() => {
        StateManager.setState({ observerActive: true, isApplyingStyles: false });
      }, 1000);
      
      ToastSystem.show('☀️ Modo claro ativado', 2000);
    },

    aplicarEstilosModoEscuro() {
      const estilosAnteriores = document.querySelectorAll('[data-modo-escuro="universal"]');
      estilosAnteriores.forEach(style => style.remove());
      
      const estiloEscuroUniversal = `
        body {
            background-color: ${CONFIG.darkModeColors.background} !important;
            color: ${CONFIG.darkModeColors.text} !important;
        }
        [class*="MuiBox-root"], [class*="MuiPaper-root"], [class*="MuiCard-root"],
        [class*="container"], [class*="Container"], .main-content-container {
            background-color: ${CONFIG.darkModeColors.surface} !important;
            color: ${CONFIG.darkModeColors.text} !important;
        }
        [class*="MuiTypography"], p, span, div, h1, h2, h3, h4, h5, h6 {
            color: ${CONFIG.darkModeColors.text} !important;
        }
        [class*="MuiInput"], [class*="MuiTextField"], input, textarea, select {
            background-color: ${CONFIG.darkModeColors.card} !important;
            color: ${CONFIG.darkModeColors.text} !important;
            border-color: ${CONFIG.darkModeColors.border} !important;
        }
      `;
      
      const styleSheet = document.createElement('style');
      styleSheet.setAttribute('data-modo-escuro', 'universal');
      styleSheet.textContent = estiloEscuroUniversal;
      document.head.appendChild(styleSheet);
    }
  };

  // ========== CAPTURA DE INFORMAÇÕES ==========
  const InfoCapture = {
    capturarInformacoes() {
      const containers = document.querySelectorAll('div.css-skkg69');
      const informacoes = {};
      
      containers.forEach(container => {
        const labelElement = container.querySelector('p.MuiTypography-body1');
        const valorElement = container.querySelector('p.MuiTypography-body2');
        
        if (labelElement && valorElement) {
          const label = labelElement.textContent.replace(':', '').trim().toLowerCase();
          const valor = valorElement.textContent.trim();
          informacoes[label] = valor;
          
          if (label.includes('palavras') || label.includes('número')) {
            const match = valor.match(/(\d+)/);
            if (match) {
              StateManager.setState({ wordGoal: parseInt(match[1]) });
            }
          }
        }
      });
      
      StateManager.setState({ capturedInfo: informacoes });
      return informacoes;
    },

    gerarPromptIA() {
      const state = StateManager.getState();
      const genero = state.capturedInfo.gênero || 'desconhecido';
      const tema = state.capturedInfo.tema || 'desconhecido';
      const palavras = state.capturedInfo['número de palavras'] || state.wordGoal;
      
      return `Faça um texto do gênero ${genero} sobre ${tema} de ${palavras} palavras, com um título.`;
    },

    async copiarPromptParaAreaTransferencia() {
      const prompt = this.gerarPromptIA();
      
      try {
        await navigator.clipboard.writeText(prompt);
        ToastSystem.show('✅ Prompt copiado para a área de transferência!', 3000);
      } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = prompt;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          ToastSystem.show('✅ Prompt copiado para a área de transferência!', 3000);
        } catch (fallbackErr) {
          ToastSystem.show('❌ Erro ao copiar. Aqui está o prompt:<br><br>' + prompt, 6000);
        }
        document.body.removeChild(textArea);
      }
    }
  };

  // ========== SISTEMA DE DIGITAÇÃO ==========
  const TypingEngine = {
    async typeToElement(element, text) {
      const state = StateManager.getState();
      
      if (state.isTyping) {
        state.typingQueue.push({ element, text });
        StateManager.setState({ typingQueue: state.typingQueue });
        return;
      }
      
      StateManager.setState({ isTyping: true });
      await this.executeTyping(element, text);
      StateManager.setState({ isTyping: false });
      
      this.processQueue();
    },

    async processQueue() {
      const state = StateManager.getState();
      if (state.typingQueue.length > 0) {
        const next = state.typingQueue.shift();
        StateManager.setState({ typingQueue: state.typingQueue });
        await this.typeToElement(next.element, next.text);
      }
    },

    async executeTyping(element, text) {
      if (element.isContentEditable) {
        await this.typeTextContentEditable(element, text);
      } else {
        await this.typeTextControlled(element, text);
      }
    },

    emitEventsForChar(el, char) {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
      try {
        const ie = new InputEvent('input', { bubbles: true, data: char, inputType: 'insertText' });
        el.dispatchEvent(ie);
      } catch {
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
      el.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }));
    },

    async typeTextControlled(el, text, delay = CONFIG.typingDelay) {
      el.focus();
      let descriptor = null;
      
      if (el instanceof HTMLTextAreaElement) descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
      else if (el instanceof HTMLInputElement) descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      else {
        const proto = Object.getPrototypeOf(el);
        if (proto) descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
      }

      let setValue = null;
      if (descriptor && typeof descriptor.set === 'function') {
        try { setValue = Function.prototype.call.bind(descriptor.set); } catch {}
      }

      if (setValue) setValue(el, '');
      else try { el.value = ''; } catch { el.textContent = ''; }
      
      try { el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' })); } catch {}

      const total = text.length || 1;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const currentValue = (el.value ?? el.textContent ?? '') + char;
        
        if (setValue) setValue(el, currentValue);
        else try { el.value = currentValue; } catch { el.textContent = currentValue; }

        this.emitEventsForChar(el, char);

        const pct = Math.round(((i + 1) / total) * 100);
        if (window.progressBar) {
          window.progressBar.style.width = pct + '%';
        }

        await new Promise(r => setTimeout(r, delay));
      }
      
      try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch {}
      if (window.progressBar) {
        window.progressBar.style.width = '100%';
      }
    },

    async typeTextContentEditable(el, text, delay = CONFIG.typingDelay) {
      el.focus();
      el.innerText = '';
      const total = text.length || 1;
      
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        el.innerText += char;
        
        try { 
          el.dispatchEvent(new InputEvent('input', { bubbles: true, data: char, inputType: 'insertText' })); 
        } catch { 
          el.dispatchEvent(new Event('input', { bubbles: true })); 
        }
        
        const pct = Math.round(((i + 1) / total) * 100);
        if (window.progressBar) {
          window.progressBar.style.width = pct + '%';
        }
        
        await new Promise(r => setTimeout(r, delay));
      }
      
      try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch {}
      if (window.progressBar) {
        window.progressBar.style.width = '100%';
      }
    }
  };

  // ========== SISTEMA DE ARRASTAR ==========
  class DragManager {
    constructor(element) {
      this.element = element;
      this.isDragging = false;
      this.offset = { x: 0, y: 0 };
      this.bindEvents();
    }
    
    bindEvents() {
      const header = this.element.querySelector('.tf-header');
      if (!header) return;

      header.addEventListener('mousedown', this.startDrag.bind(this));
      document.addEventListener('mousemove', Utils.throttle(this.drag.bind(this), 16));
      document.addEventListener('mouseup', this.stopDrag.bind(this));
      
      header.addEventListener('touchstart', this.startDrag.bind(this));
      document.addEventListener('touchmove', Utils.throttle(this.drag.bind(this), 16));
      document.addEventListener('touchend', this.stopDrag.bind(this));
    }
    
    startDrag(e) {
      this.isDragging = true;
      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;
      const rect = this.element.getBoundingClientRect();
      
      this.offset.x = clientX - rect.left;
      this.offset.y = clientY - rect.top;
      
      document.body.style.userSelect = 'none';
      this.element.style.transition = 'none';
    }
    
    drag(e) {
      if (!this.isDragging) return;
      
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      if (!clientX || !clientY) return;
      
      let left = clientX - this.offset.x;
      let top = clientY - this.offset.y;
      
      left = Math.max(8, Math.min(window.innerWidth - this.element.offsetWidth - 8, left));
      top = Math.max(8, Math.min(window.innerHeight - this.element.offsetHeight - 8, top));
      
      this.element.style.left = left + 'px';
      this.element.style.top = top + 'px';
      this.element.style.right = 'auto';
      this.element.style.bottom = 'auto';
    }
    
    stopDrag() {
      this.isDragging = false;
      document.body.style.userSelect = '';
      this.element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }
  }

  // ========== CONTADOR DE PALAVRAS ==========
  const WordCounter = {
    updateWordCounter() {
      if (window.wordCounter && window.popupTextarea) {
        const state = StateManager.getState();
        const count = window.popupTextarea.value.trim().split(/\s+/).filter(Boolean).length;
        const colors = state.currentMode === 'dark' ? CONFIG.darkModeColors : CONFIG.lightModeColors;
        
        window.wordCounter.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px; font-size: 13px;">
            <div style="background: ${colors.primary}; 
                        width: 8px; height: 8px; border-radius: 50%;"></div>
            <span style="color: ${colors.textLight};">
              ${count} / ${state.wordGoal} palavras
            </span>
          </div>
        `;
      }
    },

    debouncedUpdate: Utils.debounce(function() {
      WordCounter.updateWordCounter();
    }, 300)
  };

  // ========== SISTEMA DE POPUP ==========
  const PopupManager = {
    init() {
      this.createPopup();
      this.setupEventListeners();
      this.setupResponsiveBehavior();
      this.enhanceAccessibility();
    },

    createPopup() {
      const state = StateManager.getState();
      const colors = state.currentMode === 'dark' ? CONFIG.darkModeColors : CONFIG.lightModeColors;

      // Tamanhos base fixos para evitar problemas no minimizar
      const baseWidth = 380;
      const basePadding = 16;
      const baseBorderRadius = 16;

      const currentWidth = Utils.getSize(baseWidth);
      const currentPadding = Utils.getSize(basePadding);
      const currentBorderRadius = Utils.getSize(baseBorderRadius);

      const popup = document.createElement('div');
      popup.id = 'typeflow-popup';
      popup.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: ${currentWidth}px;
        background: ${colors.surface};
        color: ${colors.text};
        padding: ${currentPadding}px;
        border-radius: ${currentBorderRadius}px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        z-index: 999999;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid ${colors.border};
        backdrop-filter: blur(10px);
        max-height: 80vh;
        overflow-y: auto;
      `;

      this.createHeader(popup, colors, state.currentMode, currentPadding);
      this.createBody(popup, colors);
      
      document.body.appendChild(popup);
      this.popup = popup;

      // Guardar dimensões originais
      this.originalWidth = currentWidth;
      this.originalPadding = currentPadding;

      new DragManager(popup);
    },

    createHeader(popup, colors, currentMode, currentPadding) {
      const header = document.createElement('div');
      header.className = 'tf-header';
      header.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${Utils.getSize(12)}px;
        margin-bottom: ${Utils.getSize(16)}px;
        padding-bottom: ${Utils.getSize(12)}px;
        border-bottom: 1px solid ${colors.border};
      `;
      
      const titleEl = document.createElement('div');
      titleEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: ${Utils.getSize(10)}px;">
          <div style="font-size: ${Utils.getSize(20)}px;">🌀</div>
          <div>
            <div style="font-weight: 700; font-size: ${Utils.getSize(16)}px; color: ${colors.textImportant};">Type Flow</div>
            <div style="font-size: ${Utils.getSize(11)}px; color: ${colors.textLight}; margin-top: ${Utils.getSize(2)}px;">Ferramenta de Redação</div>
          </div>
        </div>
      `;
      
      const controlsContainer = document.createElement('div');
      controlsContainer.style.cssText = `display: flex; gap: ${Utils.getSize(6)}px;`;
      
      window.darkModeBtn = document.createElement('button');
      window.darkModeBtn.innerHTML = currentMode === 'dark' ? '☀️' : '🌙';
      window.darkModeBtn.title = currentMode === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro';
      window.darkModeBtn.style.cssText = `
        background: rgba(255,255,255,0.1);
        border: none;
        color: ${colors.text};
        font-size: ${Utils.getSize(16)}px;
        cursor: pointer;
        width: ${Utils.getSize(36)}px;
        height: ${Utils.getSize(36)}px;
        border-radius: ${Utils.getSize(10)}px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
      `;
      
      const btnToggle = document.createElement('button');
      btnToggle.innerText = '–';
      btnToggle.title = 'Minimizar';
      btnToggle.style.cssText = `
        background: rgba(255,255,255,0.1);
        border: none;
        color: ${colors.text};
        font-size: ${Utils.getSize(18)}px;
        cursor: pointer;
        width: ${Utils.getSize(36)}px;
        height: ${Utils.getSize(36)}px;
        border-radius: ${Utils.getSize(10)}px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
      `;
      
      [window.darkModeBtn, btnToggle].forEach(btn => {
        btn.addEventListener('mouseenter', function() {
          this.style.background = 'rgba(255,255,255,0.2)';
          this.style.transform = 'scale(1.1)';
        });
        btn.addEventListener('mouseleave', function() {
          this.style.background = 'rgba(255,255,255,0.1)';
          this.style.transform = 'scale(1)';
        });
      });
      
      controlsContainer.appendChild(window.darkModeBtn);
      controlsContainer.appendChild(btnToggle);
      header.appendChild(titleEl);
      header.appendChild(controlsContainer);
      popup.appendChild(header);

      this.btnToggle = btnToggle;
    },

    createBody(popup, colors) {
      const body = document.createElement('div');
      body.className = 'tf-body';
      body.style.cssText = `margin-top: ${Utils.getSize(8)}px;`;

      this.createTopButtons(body, colors);
      this.createFormFields(body, colors);
      this.createBottomRow(body, colors);
      this.createProgressBar(body, colors);
      
      popup.appendChild(body);
      this.body = body;
    },

    createTopButtons(body, colors) {
      const topButtons = document.createElement('div');
      topButtons.style.cssText = `display: flex; gap: ${Utils.getSize(8)}px; margin-bottom: ${Utils.getSize(16)}px;`;
      
      const infoBtn = document.createElement('button');
      infoBtn.innerHTML = `
        <div style="display: flex; align-items: center; gap: ${Utils.getSize(6)}px;">
          <span>📋</span>
          <span style="font-size: ${Utils.getSize(12)}px;">Capturar Info</span>
        </div>
      `;
      infoBtn.style.cssText = `
        flex: 1;
        padding: ${Utils.getSize(12)}px;
        border-radius: ${Utils.getSize(12)}px;
        border: 1px solid ${colors.border};
        background: ${colors.card};
        color: ${colors.text};
        cursor: pointer;
        font-size: ${Utils.getSize(12)}px;
        font-weight: 500;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
      `;

      const copyPromptBtn = document.createElement('button');
      copyPromptBtn.innerHTML = `
        <div style="display: flex; align-items: center; gap: ${Utils.getSize(6)}px;">
          <span>🤖</span>
          <span style="font-size: ${Utils.getSize(12)}px;">Prompt IA</span>
        </div>
      `;
      copyPromptBtn.title = 'Gerar prompt para inteligência artificial';
      copyPromptBtn.style.cssText = `
        flex: 1;
        padding: ${Utils.getSize(12)}px;
        border-radius: ${Utils.getSize(12)}px;
        border: none;
        background: ${colors.gradient};
        color: white;
        cursor: pointer;
        font-size: ${Utils.getSize(12)}px;
        font-weight: 600;
        transition: all 0.2s ease;
      `;

      [infoBtn, copyPromptBtn].forEach(btn => {
        btn.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-2px)';
          this.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
        });
        btn.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = 'none';
        });
      });

      topButtons.appendChild(infoBtn);
      topButtons.appendChild(copyPromptBtn);
      body.appendChild(topButtons);

      this.infoBtn = infoBtn;
      this.copyPromptBtn = copyPromptBtn;
    },

    createFormFields(body, colors) {
      const titleLabel = document.createElement('label');
      titleLabel.innerText = 'Título da Redação';
      titleLabel.style.cssText = `
        display: block;
        font-size: ${Utils.getSize(12)}px;
        margin-bottom: ${Utils.getSize(6)}px;
        color: ${colors.textLight};
        font-weight: 500;
      `;
      
      const titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.placeholder = 'Digite o título da sua redação...';
      titleInput.style.cssText = `
        width: 100%;
        padding: ${Utils.getSize(12)}px;
        border-radius: ${Utils.getSize(12)}px;
        border: 1px solid ${colors.border};
        background: ${colors.card};
        color: ${colors.text};
        outline: none;
        margin-bottom: ${Utils.getSize(16)}px;
        font-size: ${Utils.getSize(13)}px;
        transition: all 0.2s ease;
      `;
      titleInput.addEventListener('focus', function() {
        this.style.borderColor = colors.primary;
        this.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
      });
      titleInput.addEventListener('blur', function() {
        this.style.borderColor = colors.border;
        this.style.boxShadow = 'none';
      });

      const textLabel = document.createElement('label');
      textLabel.innerText = 'Texto da Redação';
      textLabel.style.cssText = `
        display: block;
        font-size: ${Utils.getSize(12)}px;
        margin: ${Utils.getSize(6)}px 0;
        color: ${colors.textLight};
        font-weight: 500;
      `;
      
      window.popupTextarea = document.createElement('textarea');
      window.popupTextarea.rows = isMobile ? 4 : 6;
      window.popupTextarea.placeholder = 'Digite o texto da sua redação aqui...';
      window.popupTextarea.style.cssText = `
        width: 100%;
        padding: ${Utils.getSize(12)}px;
        border-radius: ${Utils.getSize(12)}px;
        border: 1px solid ${colors.border};
        background: ${colors.card};
        color: ${colors.text};
        outline: none;
        resize: vertical;
        font-size: ${Utils.getSize(13)}px;
        font-family: 'Inter', system-ui, sans-serif;
        transition: all 0.2s ease;
        min-height: ${isMobile ? '72px' : '120px'};
      `;
      window.popupTextarea.addEventListener('focus', function() {
        this.style.borderColor = colors.primary;
        this.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
      });
      window.popupTextarea.addEventListener('blur', function() {
        this.style.borderColor = colors.border;
        this.style.boxShadow = 'none';
      });

      body.appendChild(titleLabel);
      body.appendChild(titleInput);
      body.appendChild(textLabel);
      body.appendChild(window.popupTextarea);

      this.titleInput = titleInput;
    },

    createBottomRow(body, colors) {
      const bottomRow = document.createElement('div');
      bottomRow.style.cssText = `display: flex; gap: ${Utils.getSize(12)}px; align-items: center; margin-top: ${Utils.getSize(16)}px;`;

      window.wordCounter = document.createElement('div');
      WordCounter.updateWordCounter();

      const sendBtn = document.createElement('button');
      sendBtn.innerHTML = `
        <div style="display: flex; align-items: center; gap: ${Utils.getSize(6)}px;">
          <span>🚀</span>
          <span style="font-size: ${Utils.getSize(13)}px;">Enviar Texto</span>
        </div>
      `;
      sendBtn.style.cssText = `
        background: ${colors.success};
        color: white;
        border: none;
        padding: ${Utils.getSize(12)}px ${Utils.getSize(20)}px;
        border-radius: ${Utils.getSize(12)}px;
        cursor: pointer;
        font-weight: 600;
        font-size: ${Utils.getSize(13)}px;
        transition: all 0.2s ease;
        flex-shrink: 0;
      `;
      sendBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)';
      });
      sendBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
      });

      bottomRow.appendChild(sendBtn);
      bottomRow.appendChild(window.wordCounter);
      body.appendChild(bottomRow);

      this.sendBtn = sendBtn;
    },

    createProgressBar(body, colors) {
      const progressWrap = document.createElement('div');
      progressWrap.style.cssText = `
        width: 100%;
        height: ${Utils.getSize(6)}px;
        background: ${colors.border};
        border-radius: ${Utils.getSize(10)}px;
        margin-top: ${Utils.getSize(16)}px;
        overflow: hidden;
      `;
      
      window.progressBar = document.createElement('div');
      window.progressBar.style.cssText = `
        width: 0%;
        height: 100%;
        background: ${colors.gradient};
        transition: width 0.3s ease;
        border-radius: ${Utils.getSize(10)}px;
      `;
      progressWrap.appendChild(window.progressBar);
      body.appendChild(progressWrap);
    },

    setupEventListeners() {
      this.btnToggle.addEventListener('click', () => {
        const state = StateManager.getState();
        const newMinimizedState = !state.isMinimized;
        StateManager.setState({ isMinimized: newMinimizedState });
        
        if (newMinimizedState) {
          // MINIMIZAR - Mostrar apenas o ícone
          this.body.style.display = 'none';
          this.popup.style.width = '180px'; // Tamanho fixo para o ícone
          this.popup.style.padding = '12px'; // Padding reduzido
          this.popup.style.height = '80px'; // Altura fixa
          this.btnToggle.innerText = '+';
          this.btnToggle.title = 'Restaurar';
          
          // Centralizar apenas o ícone
          const header = this.popup.querySelector('.tf-header');
          if (header) {
            const titleEl = header.querySelector('div:first-child');
            const controlsEl = header.querySelector('div:last-child');
            
            // Esconder texto, mostrar apenas ícone
            if (titleEl) {
              const textElements = titleEl.querySelectorAll('div > div');
              if (textElements.length > 1) {
                textElements[1].style.display = 'none'; // Esconde o texto
              }
            }
            
            // Esconder dark mode button, manter apenas toggle
            if (controlsEl) {
              const darkBtn = controlsEl.querySelector('button:first-child');
              if (darkBtn) {
                darkBtn.style.display = 'none';
              }
            }
            
            header.style.justifyContent = 'center';
            header.style.gap = '0';
            header.style.marginBottom = '0';
            header.style.paddingBottom = '0';
            header.style.borderBottom = 'none';
          }
          
        } else {
          // RESTAURAR - Mostrar conteúdo completo
          this.body.style.display = '';
          this.popup.style.width = `${this.originalWidth}px`;
          this.popup.style.padding = `${this.originalPadding}px`;
          this.popup.style.height = 'auto';
          this.btnToggle.innerText = '–';
          this.btnToggle.title = 'Minimizar';
          
          // Restaurar layout normal
          const header = this.popup.querySelector('.tf-header');
          if (header) {
            const titleEl = header.querySelector('div:first-child');
            const controlsEl = header.querySelector('div:last-child');
            
            // Mostrar texto novamente
            if (titleEl) {
              const textElements = titleEl.querySelectorAll('div > div');
              if (textElements.length > 1) {
                textElements[1].style.display = ''; // Mostra o texto
              }
            }
            
            // Mostrar dark mode button
            if (controlsEl) {
              const darkBtn = controlsEl.querySelector('button:first-child');
              if (darkBtn) {
                darkBtn.style.display = '';
              }
            }
            
            header.style.justifyContent = 'space-between';
            header.style.gap = `${Utils.getSize(12)}px`;
            header.style.marginBottom = `${Utils.getSize(16)}px`;
            header.style.paddingBottom = `${Utils.getSize(12)}px`;
            header.style.borderBottom = `1px solid ${StateManager.getState().currentMode === 'dark' ? CONFIG.darkModeColors.border : CONFIG.lightModeColors.border}`;
          }
          
          // Mostra marca d'água quando restaurado
          FPSTracker.toggleVisibility(true);
        }
      });

      window.darkModeBtn.addEventListener('click', () => {
        ThemeManager.toggleModoEscuro();
      });

      this.infoBtn.addEventListener('click', () => {
        Utils.safeExecute(() => {
          const info = InfoCapture.capturarInformacoes();
          
          if (info.tema && !this.titleInput.value) {
            this.titleInput.value = info.tema;
          }
          
          WordCounter.updateWordCounter();
          
          console.log('=== INFORMAÇÕES CAPTURADAS ===');
          console.log('Gênero:', info.gênero || 'Não encontrado');
          console.log('Tema:', info.tema || 'Não encontrado');
          console.log('Número de palavras:', info['número de palavras'] || 'Não encontrado');
          console.log('Word Goal definido para:', StateManager.getState().wordGoal);
          console.log('==============================');
          
          if (info.tema || info.gênero) {
            ToastSystem.show(
              `📋 Informações capturadas! Tema: ${info.tema || 'Não encontrado'}`,
              4000
            );
          } else {
            ToastSystem.show('❌ Nenhuma informação encontrada. Verifique se está na página correta.', 4000);
          }
        }, 'Erro ao capturar informações');
      });

      this.copyPromptBtn.addEventListener('click', () => {
        const state = StateManager.getState();
        if (!state.capturedInfo.gênero && !state.capturedInfo.tema) {
          ToastSystem.show('ℹ️ Nenhuma informação capturada. Clique em "Capturar Info" primeiro.', 3000);
        } else {
          InfoCapture.copiarPromptParaAreaTransferencia();
        }
      });

      this.sendBtn.addEventListener('click', async () => {
        await Utils.safeExecute(async () => {
          const title = this.titleInput.value || '';
          const text = window.popupTextarea.value || '';

          if (!text.trim() && !title.trim()) {
            ToastSystem.show('❌ Digite título ou texto antes de enviar.', 4000);
            return;
          }

          function findVisibleTextarea() {
            const all = Array.from(document.querySelectorAll('textarea'));
            const visible = all.find(t => t.getAttribute('aria-hidden') !== 'true' && t.offsetParent !== null);
            if (visible) return visible;
            return document.querySelector('textarea[placeholder*="Comece"], textarea') || null;
          }

          function findContentEditable() {
            return document.querySelector('[contenteditable="true"]');
          }

          let target = findVisibleTextarea() || findContentEditable();
          if (!target) {
            ToastSystem.show('❌ Campo da redação não encontrado. Abra a página onde você escreve a redação.', 5000);
            return;
          }

          const titleField = document.querySelector('input[type="text"], input[id*="title" i], input[placeholder*="tít" i]');

          window.progressBar.style.width = '0%';
          
          if (titleField && title.trim()) {
            await TypingEngine.typeToElement(titleField, title);
          }
          
          await TypingEngine.typeToElement(target, text);
          
          ToastSystem.show('✅ Digitação concluída com sucesso!', 3000);
        }, 'Erro ao enviar texto');
      });

      window.popupTextarea.addEventListener('input', WordCounter.debouncedUpdate);
    },

    setupResponsiveBehavior() {
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      
      const handleMobileChange = (e) => {
        if (e.matches) {
          this.popup.style.width = 'calc(100vw - 40px)';
          this.popup.style.left = '20px';
          this.popup.style.right = '20px';
          this.popup.style.bottom = '20px';
        } else {
          this.popup.style.width = `${this.originalWidth}px`;
          this.popup.style.right = '20px';
          this.popup.style.left = 'auto';
        }
      };
      
      mediaQuery.addListener(handleMobileChange);
      handleMobileChange(mediaQuery);
    },

    enhanceAccessibility() {
      this.popup.setAttribute('role', 'dialog');
      this.popup.setAttribute('aria-label', 'Type Flow - Ferramenta de Redação');
      this.popup.setAttribute('aria-modal', 'true');
      
      this.popup.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.btnToggle.click();
        }
      });
    }
  };

  // ========== CLEANUP SYSTEM ==========
  const CleanupManager = {
    init() {
      this.setupCleanup();
    },

    setupCleanup() {
      const cleanup = () => {
        if (window.typeflowObserver) {
          window.typeflowObserver.disconnect();
        }
        const fpsElement = document.getElementById('typeflow-fps');
        if (fpsElement) {
          fpsElement.remove();
        }
      };
      
      window.addEventListener('beforeunload', cleanup);
      return cleanup;
    }
  };

  // ========== INICIALIZAÇÃO ==========
  async function init() {
    // Mostrar splash screen primeiro
    SplashScreen.show();
    
    // Inicializar componentes principais
    await Utils.delay(1000);
    
    PopupManager.init();
    ThemeManager.ativarModoEscuroUniversal();
    FPSTracker.init();
    CleanupManager.init();
    
    // Configurar observer
    window.typeflowObserver = new MutationObserver(function(mutations) {
      const state = StateManager.getState();
      if (!state.observerActive) return;
      
      if (state.currentMode === 'dark') {
        const currentAttr = document.documentElement.getAttribute('data-toolpad-color-scheme');
        if (currentAttr !== 'dark') {
          document.documentElement.setAttribute('data-toolpad-color-scheme', 'dark');
        }
      }
    });

    StateManager.setState({ observerActive: true });
    window.typeflowObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-toolpad-color-scheme']
    });

    // Mostrar notificações de boas-vindas
    await Utils.delay(500);
    ToastSystem.show('🌿 Type Flow carregado com sucesso!', 3000);
    
    await Utils.delay(1000);
    ToastSystem.show(`⭐ Bem-vindo ao Type Flow!`, 3000);
    
    await Utils.delay(500);
    ToastSystem.show(`🚀 Ferramenta de Redação Avançada`, 3000);

    // Esconder splash screen
    await Utils.delay(1000);
    SplashScreen.hide();
    
    StateManager.setState({ splashShown: true });

    console.log(`🚀 Type Flow carregado com sucesso! (${isMobile ? 'Mobile 60%' : 'PC 85%'})`);
  }

  init();
})();
