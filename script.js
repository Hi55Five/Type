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

  // ========== SISTEMA DE DESBLOQUEIO DE COLAGEM ==========
  const PasteUnlocker = {
    init() {
      this.unlockPaste();
      this.setupPasteObserver();
    },

    unlockPaste() {
      console.log('🔓 Iniciando desbloqueio de colagem...');
      
      // Remove bloqueios de todos os campos de texto
      const campos = document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]');
      
      campos.forEach(campo => {
        // Remove atributos de bloqueio
        campo.removeAttribute('onpaste');
        campo.removeAttribute('oncopy');
        campo.removeAttribute('oncut');
        
        // Remove event listeners
        campo.onpaste = null;
        campo.oncopy = null;
        campo.oncut = null;
        
        // Permite tudo
        campo.addEventListener('paste', e => e.stopPropagation(), true);
        campo.addEventListener('copy', e => e.stopPropagation(), true);
        campo.addEventListener('cut', e => e.stopPropagation(), true);
      });
      
      console.log(`🔓 Bloqueios removidos de ${campos.length} campos`);
      
      // Método nuclear para garantir desbloqueio
      setTimeout(() => {
        this.nuclearUnlock();
      }, 2000);
    },

    nuclearUnlock() {
      // Substitui completamente os textareas problemáticos
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        if (textarea.onpaste || textarea.getAttribute('onpaste')) {
          const novoTextarea = textarea.cloneNode(true);
          novoTextarea.onpaste = null;
          novoTextarea.oncopy = null;
          novoTextarea.oncut = null;
          novoTextarea.removeAttribute('onpaste');
          novoTextarea.removeAttribute('oncopy');
          novoTextarea.removeAttribute('oncut');
          textarea.parentNode.replaceChild(novoTextarea, textarea);
          console.log('✅ Textarea substituído - colagem liberada!');
        }
      });
    },

    setupPasteObserver() {
      // Observa novos elementos adicionados à página
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              if (node.tagName === 'TEXTAREA' || node.tagName === 'INPUT') {
                this.unlockPaste();
              } else if (node.querySelectorAll) {
                const campos = node.querySelectorAll('textarea, input[type="text"]');
                if (campos.length > 0) {
                  this.unlockPaste();
                }
              }
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
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

  // ========== SISTEMA DE POPUP SIMPLIFICADO ==========
  const PopupManager = {
    init() {
      this.createPopup();
      this.setupEventListeners();
      this.setupResponsiveBehavior();
    },

    createPopup() {
      const state = StateManager.getState();
      const colors = state.currentMode === 'dark' ? CONFIG.darkModeColors : CONFIG.lightModeColors;

      const currentWidth = Utils.getSize(300); // Largura para 3 elementos
      const currentPadding = Utils.getSize(16);
      const currentBorderRadius = Utils.getSize(16);

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
        max-height: 80px;
        overflow: hidden;
      `;

      this.createHeader(popup, colors, state.currentMode);
      
      document.body.appendChild(popup);
      this.popup = popup;

      new DragManager(popup);
    },

    createHeader(popup, colors, currentMode) {
      const header = document.createElement('div');
      header.className = 'tf-header';
      header.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${Utils.getSize(8)}px;
        cursor: move;
      `;
      
      // Nome Type Flow
      const titleEl = document.createElement('div');
      titleEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: ${Utils.getSize(8)}px;">
          <div style="font-size: ${Utils.getSize(20)}px;">🌀</div>
          <div style="font-weight: 700; font-size: ${Utils.getSize(16)}px; color: ${colors.textImportant};">Type Flow</div>
        </div>
      `;
      
      const controlsContainer = document.createElement('div');
      controlsContainer.style.cssText = `display: flex; gap: ${Utils.getSize(8)}px; align-items: center;`;
      
      // Botão Prompt IA
      const promptBtn = document.createElement('button');
      promptBtn.innerHTML = '🤖';
      promptBtn.title = 'Criar Prompt para IA';
      promptBtn.style.cssText = `
        background: ${colors.gradient};
        border: none;
        color: white;
        font-size: ${Utils.getSize(16)}px;
        cursor: pointer;
        width: ${Utils.getSize(36)}px;
        height: ${Utils.getSize(36)}px;
        border-radius: ${Utils.getSize(10)}px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      `;
      
      // Botão Modo Claro/Escuro
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
      
      controlsContainer.appendChild(promptBtn);
      controlsContainer.appendChild(window.darkModeBtn);
      header.appendChild(titleEl);
      header.appendChild(controlsContainer);
      popup.appendChild(header);

      // Efeitos hover
      [promptBtn, window.darkModeBtn].forEach(btn => {
        btn.addEventListener('mouseenter', function() {
          this.style.transform = 'scale(1.1)';
          this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        });
        btn.addEventListener('mouseleave', function() {
          this.style.transform = 'scale(1)';
          this.style.boxShadow = 'none';
        });
      });

      this.promptBtn = promptBtn;
    },

    setupEventListeners() {
      // Botão Modo Claro/Escuro
      window.darkModeBtn.addEventListener('click', () => {
        ThemeManager.toggleModoEscuro();
      });

      // Botão Prompt IA
      this.promptBtn.addEventListener('click', () => {
        Utils.safeExecute(() => {
          // Primeiro captura as informações
          const info = InfoCapture.capturarInformacoes();
          
          if (info.tema || info.gênero) {
            InfoCapture.copiarPromptParaAreaTransferencia();
          } else {
            ToastSystem.show('ℹ️ Nenhuma informação encontrada. Verifique se está na página de redação.', 3000);
          }
        }, 'Erro ao criar prompt');
      });
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
          this.popup.style.width = '300px';
          this.popup.style.right = '20px';
          this.popup.style.left = 'auto';
        }
      };
      
      mediaQuery.addListener(handleMobileChange);
      handleMobileChange(mediaQuery);
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
    PasteUnlocker.init(); // Inicializar desbloqueio de colagem
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
    ToastSystem.show(`🔓 Colagem desbloqueada automaticamente`, 3000);

    // Esconder splash screen
    await Utils.delay(1000);
    SplashScreen.hide();
    
    StateManager.setState({ splashShown: true });

    console.log(`🚀 Type Flow carregado com sucesso! (${isMobile ? 'Mobile' : 'PC'})`);
  }

  init();
})();