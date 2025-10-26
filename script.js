(function() {
  // ========== CONFIGURAÇÕES GLOBAIS ==========
  const CONFIG = {
    typingDelay: 35,
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
      typingQueue: []
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

    // Helper para acessar o estado atual
    getState() {
      return this.state;
    }
  };

  // ========== SISTEMA DE UTILITÁRIOS ==========
  const Utils = {
    // Debounce para eventos frequentes
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

    // Error handling wrapper
    async safeExecute(operation, errorMessage) {
      try {
        return await operation();
      } catch (error) {
        console.error(`${errorMessage}:`, error);
        NotificationSystem.mostrarNotificacao(`❌ ${errorMessage}`, 'error');
        return null;
      }
    },

    // Throttle para eventos de drag
    throttle(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
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
      
      NotificationSystem.mostrarNotificacao('🌙 Modo escuro ativado', 'success', 2000);
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
      
      NotificationSystem.mostrarNotificacao('☀️ Modo claro ativado', 'success', 2000);
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
          
          // Extrair número de palavras se disponível
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
        NotificationSystem.mostrarNotificacao('✅ Prompt copiado para a área de transferência!', 'success');
      } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = prompt;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          NotificationSystem.mostrarNotificacao('✅ Prompt copiado para a área de transferência!', 'success');
        } catch (fallbackErr) {
          NotificationSystem.mostrarNotificacao('❌ Erro ao copiar. Aqui está o prompt:<br><br>' + prompt, 'error', 6000);
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
      
      // Touch events para mobile
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

      const popup = document.createElement('div');
      popup.id = 'typeflow-popup';
      popup.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 380px;
        background: ${colors.surface};
        color: ${colors.text};
        padding: 16px;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        z-index: 999999;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid ${colors.border};
        backdrop-filter: blur(10px);
      `;

      this.createHeader(popup, colors, state.currentMode);
      this.createBody(popup, colors);
      
      document.body.appendChild(popup);
      this.popup = popup;

      // Inicializar sistema de drag
      new DragManager(popup);
    },

    createHeader(popup, colors, currentMode) {
      const header = document.createElement('div');
      header.className = 'tf-header';
      header.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid ${colors.border};
      `;
      
      const titleEl = document.createElement('div');
      titleEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="font-size: 20px;">🌀</div>
          <div>
            <div style="font-weight: 700; font-size: 16px; color: ${colors.textImportant};">Type Flow</div>
            <div style="font-size: 11px; color: ${colors.textLight}; margin-top: 2px;">Ferramenta de Redação</div>
          </div>
        </div>
      `;
      
      const controlsContainer = document.createElement('div');
      controlsContainer.style.cssText = `display: flex; gap: 6px;`;
      
      window.darkModeBtn = document.createElement('button');
      window.darkModeBtn.innerHTML = currentMode === 'dark' ? '☀️' : '🌙';
      window.darkModeBtn.title = currentMode === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro';
      window.darkModeBtn.style.cssText = `
        background: rgba(255,255,255,0.1);
        border: none;
        color: ${colors.text};
        font-size: 16px;
        cursor: pointer;
        width: 36px;
        height: 36px;
        border-radius: 10px;
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
        font-size: 18px;
        cursor: pointer;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
      `;
      
      // Efeitos hover
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

      // Store references
      this.btnToggle = btnToggle;
    },

    createBody(popup, colors) {
      const body = document.createElement('div');
      body.className = 'tf-body';
      body.style.cssText = `margin-top: 8px;`;

      this.createTopButtons(body, colors);
      this.createFormFields(body, colors);
      this.createBottomRow(body, colors);
      this.createProgressBar(body, colors);
      
      popup.appendChild(body);
      this.body = body;
    },

    createTopButtons(body, colors) {
      const topButtons = document.createElement('div');
      topButtons.style.cssText = 'display: flex; gap: 8px; margin-bottom: 16px;';
      
      const infoBtn = document.createElement('button');
      infoBtn.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px;">
          <span>📋</span>
          <span>Capturar Info</span>
        </div>
      `;
      infoBtn.style.cssText = `
        flex: 1;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid ${colors.border};
        background: ${colors.card};
        color: ${colors.text};
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
      `;

      const copyPromptBtn = document.createElement('button');
      copyPromptBtn.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px;">
          <span>🤖</span>
          <span>Prompt IA</span>
        </div>
      `;
      copyPromptBtn.title = 'Gerar prompt para inteligência artificial';
      copyPromptBtn.style.cssText = `
        flex: 1;
        padding: 12px;
        border-radius: 12px;
        border: none;
        background: ${colors.gradient};
        color: white;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.2s ease;
      `;

      // Efeitos hover para botões
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

      // Store references
      this.infoBtn = infoBtn;
      this.copyPromptBtn = copyPromptBtn;
    },

    createFormFields(body, colors) {
      const titleLabel = document.createElement('label');
      titleLabel.innerText = 'Título da Redação';
      titleLabel.style.cssText = `
        display: block;
        font-size: 12px;
        margin-bottom: 6px;
        color: ${colors.textLight};
        font-weight: 500;
      `;
      
      const titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.placeholder = 'Digite o título da sua redação...';
      titleInput.style.cssText = `
        width: 100%;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid ${colors.border};
        background: ${colors.card};
        color: ${colors.text};
        outline: none;
        margin-bottom: 16px;
        font-size: 13px;
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
        font-size: 12px;
        margin: 6px 0;
        color: ${colors.textLight};
        font-weight: 500;
      `;
      
      window.popupTextarea = document.createElement('textarea');
      window.popupTextarea.rows = 6;
      window.popupTextarea.placeholder = 'Digite o texto da sua redação aqui...';
      window.popupTextarea.style.cssText = `
        width: 100%;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid ${colors.border};
        background: ${colors.card};
        color: ${colors.text};
        outline: none;
        resize: vertical;
        font-size: 13px;
        font-family: 'Inter', system-ui, sans-serif;
        transition: all 0.2s ease;
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

      // Store references
      this.titleInput = titleInput;
    },

    createBottomRow(body, colors) {
      const bottomRow = document.createElement('div');
      bottomRow.style.cssText = 'display: flex; gap: 12px; align-items: center; margin-top: 16px;';

      window.wordCounter = document.createElement('div');
      WordCounter.updateWordCounter();

      const sendBtn = document.createElement('button');
      sendBtn.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px;">
          <span>🚀</span>
          <span>Enviar Texto</span>
        </div>
      `;
      sendBtn.style.cssText = `
        background: ${colors.success};
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 12px;
        cursor: pointer;
        font-weight: 600;
        font-size: 13px;
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

      // Store reference
      this.sendBtn = sendBtn;
    },

    createProgressBar(body, colors) {
      const progressWrap = document.createElement('div');
      progressWrap.style.cssText = `
        width: 100%;
        height: 6px;
        background: ${colors.border};
        border-radius: 10px;
        margin-top: 16px;
        overflow: hidden;
      `;
      
      window.progressBar = document.createElement('div');
      window.progressBar.style.cssText = `
        width: 0%;
        height: 100%;
        background: ${colors.gradient};
        transition: width 0.3s ease;
        border-radius: 10px;
      `;
      progressWrap.appendChild(window.progressBar);
      body.appendChild(progressWrap);
    },

    setupEventListeners() {
      // Toggle popup visibility
      this.btnToggle.addEventListener('click', () => {
        const state = StateManager.getState();
        StateManager.setState({ popupVisible: !state.popupVisible });
        
        if (!state.popupVisible) {
          this.body.style.display = 'none';
          this.popup.style.width = '200px';
          this.btnToggle.innerText = '+';
          this.btnToggle.title = 'Restaurar';
        } else {
          this.body.style.display = '';
          this.popup.style.width = '380px';
          this.btnToggle.innerText = '–';
          this.btnToggle.title = 'Minimizar';
        }
      });

      // Dark mode toggle
      window.darkModeBtn.addEventListener('click', () => {
        ThemeManager.toggleModoEscuro();
      });

      // Info capture
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
            NotificationSystem.mostrarNotificacao(
              `📋 Informações capturadas!<br>
              <strong>Tema:</strong> ${info.tema || 'Não encontrado'}<br>
              <strong>Gênero:</strong> ${info.gênero || 'Não encontrado'}<br>
              <strong>Palavras:</strong> ${StateManager.getState().wordGoal}`,
              'success'
            );
          } else {
            NotificationSystem.mostrarNotificacao('❌ Nenhuma informação encontrada. Verifique se está na página correta.', 'error');
          }
        }, 'Erro ao capturar informações');
      });

      // Copy prompt
      this.copyPromptBtn.addEventListener('click', () => {
        const state = StateManager.getState();
        if (!state.capturedInfo.gênero && !state.capturedInfo.tema) {
          NotificationSystem.mostrarNotificacao('ℹ️ Nenhuma informação capturada. Clique em "Capturar Info" primeiro.', 'info', 3000);
        } else {
          InfoCapture.copiarPromptParaAreaTransferencia();
        }
      });

      // Send text
      this.sendBtn.addEventListener('click', async () => {
        await Utils.safeExecute(async () => {
          const title = this.titleInput.value || '';
          const text = window.popupTextarea.value || '';

          if (!text.trim() && !title.trim()) {
            NotificationSystem.mostrarNotificacao('❌ Digite título ou texto antes de enviar.', 'error');
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
            NotificationSystem.mostrarNotificacao('❌ Campo da redação não encontrado. Abra a página onde você escreve a redação.', 'error');
            return;
          }

          const titleField = document.querySelector('input[type="text"], input[id*="title" i], input[placeholder*="tít" i]');

          window.progressBar.style.width = '0%';
          
          if (titleField && title.trim()) {
            await TypingEngine.typeToElement(titleField, title);
          }
          
          await TypingEngine.typeToElement(target, text);
          
          NotificationSystem.mostrarNotificacao('✅ Digitação concluída com sucesso!', 'success');
        }, 'Erro ao enviar texto');
      });

      // Word counter with debounce
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
          this.popup.style.width = '380px';
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
      
      // Keyboard navigation
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
        // Remover event listeners se necessário
      };
      
      window.addEventListener('beforeunload', cleanup);
      return cleanup;
    }
  };

  // ========== INICIALIZAÇÃO ==========
  function init() {
    PopupManager.init();
    ThemeManager.ativarModoEscuroUniversal();
    CleanupManager.init();
    
    // Observer para mudanças de tema
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

    console.log('🚀 Type Flow carregado com sucesso! (Versão Modular)');
  }

  // Inicializar a aplicação
  init();
})();