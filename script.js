(function() {
  // ========== CONFIGURAÇÕES GLOBAIS ==========
  const CONFIG = {
    typeDelay: 0.001,
    images: {
      logo: 'https://img.icons8.com/fluency/96/000000/combo-chart.png',
      heart: 'https://img.icons8.com/color/96/000000/hearts.png',
      robot: 'https://img.icons8.com/color/96/000000/robot.png',
      sun: 'https://img.icons8.com/color/96/000000/sun.png',
      moon: 'https://img.icons8.com/color/96/000000/crescent-moon.png',
      game: 'https://img.icons8.com/color/96/000000/controller.png',
      check: 'https://img.icons8.com/color/96/000000/checkmark.png',
      error: 'https://img.icons8.com/color/96/000000/error.png',
      star: 'https://img.icons8.com/color/96/000000/star.png',
      rocket: 'https://img.icons8.com/color/96/000000/rocket.png',
      palette: 'https://img.icons8.com/color/96/000000/palette.png',
      unlock: 'https://img.icons8.com/color/96/000000/unlock.png',
      info: 'https://img.icons8.com/color/96/000000/info.png'
    },
    darkMode: {
      bg: '#0f0f23',
      surface: '#1a1a2e',
      card: '#16213e',
      text: '#e6e6ff',
      textLight: '#a0a0cc',
      textImportant: '#ffffff',
      primary: '#6366f1',
      success: '#10b981',
      warning: '#f59e0b',
      border: '#2d2d5a',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    lightMode: {
      bg: '#ffffff',
      surface: '#f8fafc',
      card: '#ffffff',
      text: '#334155',
      textLight: '#64748b',
      textImportant: '#0f172a',
      primary: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      border: '#e2e8f0',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    }
  };

  // ========== VERIFICAÇÃO DE DUPLICIDADE ==========
  if (document.getElementById('typeflow-popup')) return;

  // ========== DETECÇÃO DE DISPOSITIVO ==========
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const popupSize = isMobile ? 0.6 : 0.85;

  // ========== GESTÃO DE ESTADO ==========
  class StateManager {
    constructor() {
      this.state = {
        currentMode: 'dark',
        capturedInfo: {},
        applyingStyles: false,
        observerActive: false,
        wordGoal: 200,
        popupVisible: true,
        typing: false,
        typingQueue: [],
        minimized: false,
        splashShown: false,
        tutorialShown: false,
        isDragging: false
      };
      this.subscribers = [];
    }

    update(newState) {
      this.state = { ...this.state, ...newState };
      this.notifySubscribers();
    }

    get() {
      return { ...this.state };
    }

    subscribe(callback) {
      this.subscribers.push(callback);
    }

    notifySubscribers() {
      this.subscribers.forEach(callback => callback(this.state));
    }
  }

  const stateManager = new StateManager();

  // ========== UTILITÁRIOS ==========
  const Utils = {
    debounce(func, wait) {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    },

    throttle(func, limit) {
      let inThrottle;
      return (...args) => {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    getScaled(size) {
      return Math.round(size * popupSize);
    },

    async safeExecute(operation, errorMessage) {
      try {
        return await operation();
      } catch (error) {
        console.error(`${errorMessage}:`, error);
        NotificationSystem.show(`❌ ${errorMessage}`, 4000);
        return null;
      }
    }
  };

  // ========== SISTEMA DE SPLASH SCREEN ==========
  class SplashScreen {
    constructor() {
      this.splash = null;
    }

    show() {
      const splash = document.createElement('div');
      splash.id = 'typeflow-splash';
      
      const colors = CONFIG.darkMode;
      splash.innerHTML = `
        <div class="splash-content">
          <img src="${CONFIG.images.logo}" width="60" height="60" class="splash-logo">
          <h1 class="splash-title">Type Flow</h1>
          <p class="splash-subtitle">Ferramenta de Redação Avançada</p>
          <div class="splash-progress">
            <div class="splash-progress-bar"></div>
          </div>
          <p class="splash-loading">Carregando recursos...</p>
        </div>
      `;

      splash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: ${colors.bg};
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000001;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        transition: opacity 0.5s ease;
      `;

      const style = document.createElement('style');
      style.textContent = `
        .splash-content {
          text-align: center;
          padding: 40px;
          animation: fadeIn 0.5s ease;
        }
        
        .splash-logo {
          animation: pulse 2s infinite;
          margin-bottom: 20px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        
        .splash-title {
          color: ${colors.textImportant};
          font-size: 32px;
          margin: 0 0 10px 0;
          background: ${colors.gradient};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }
        
        .splash-subtitle {
          color: ${colors.textLight};
          margin: 0 0 30px 0;
          font-size: 14px;
          letter-spacing: 0.5px;
        }
        
        .splash-progress {
          width: 200px;
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          margin: 0 auto;
          overflow: hidden;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
        }
        
        .splash-progress-bar {
          height: 100%;
          background: ${colors.primary};
          width: 0%;
          transition: width 0.3s ease;
          border-radius: 2px;
          box-shadow: 0 0 10px ${colors.primary};
        }
        
        .splash-loading {
          color: ${colors.textLight};
          font-size: 12px;
          margin-top: 20px;
          opacity: 0.8;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      
      document.head.appendChild(style);
      document.body.appendChild(splash);
      this.splash = splash;
      this.animateProgress();
    }

    animateProgress() {
      const progressBar = this.splash.querySelector('.splash-progress-bar');
      let width = 0;
      
      const interval = setInterval(() => {
        width += Math.random() * 15 + 5;
        if (width >= 100) {
          width = 100;
          clearInterval(interval);
        }
        progressBar.style.width = width + '%';
      }, 150);
    }

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
  }

  // ========== SISTEMA DE NOTIFICAÇÕES ==========
  class NotificationSystem {
    static show(message, duration = 3000, position = 'top') {
      const notification = document.createElement('div');
      notification.className = 'typeflow-notification';
      
      notification.innerHTML = `
        <img src="${this.getIcon(message)}" width="20" height="20">
        <span>${message}</span>
      `;
      
      const colors = stateManager.get().currentMode === 'dark' ? CONFIG.darkMode : CONFIG.lightMode;
      
      notification.style.cssText = `
        position: fixed;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: ${colors.surface};
        color: ${colors.text};
        padding: 12px 20px;
        border-radius: 12px;
        border: 1px solid ${colors.border};
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 1000002;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 90vw;
        white-space: nowrap;
      `;
      
      if (position === 'top') {
        notification.style.top = '20px';
      } else {
        notification.style.bottom = '20px';
      }
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(0)';
      }, 10);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
      }, duration);
    }

    static getIcon(message) {
      if (message.includes('✅') || message.includes('sucesso')) return CONFIG.images.check;
      if (message.includes('❌') || message.includes('erro')) return CONFIG.images.error;
      if (message.includes('⭐') || message.includes('bem-vindo')) return CONFIG.images.star;
      if (message.includes('🚀')) return CONFIG.images.rocket;
      if (message.includes('🎨')) return CONFIG.images.palette;
      if (message.includes('🔓')) return CONFIG.images.unlock;
      if (message.includes('📚') || message.includes('tutorial')) return CONFIG.images.info;
      return CONFIG.images.check;
    }
  }

  // ========== SISTEMA DE TUTORIAL ==========
  class TutorialSystem {
    constructor() {
      this.steps = [
        {
          title: "Bem-vindo ao Type Flow!",
          description: "Ferramenta de redação avançada com diversas funcionalidades para facilitar sua escrita.",
          icon: CONFIG.images.logo
        },
        {
          title: "Botões Principais",
          description: "❤️ - Widgets de doação ativos<br>🤖 - Criar prompt para IA<br>☀️/🌙 - Alternar tema<br>ℹ️ - Ver tutorial novamente",
          icon: CONFIG.images.rocket
        },
        {
          title: "Como usar o Prompt para IA",
          description: "1. Acesse uma redação<br>2. Clique no botão 🤖<br>3. O prompt será copiado automaticamente<br>4. Cole em sua IA favorita",
          icon: CONFIG.images.robot
        },
        {
          title: "Modo Escuro/Claro",
          description: "Clique no botão ☀️/🌙 para alternar entre os temas. Sua preferência será salva.",
          icon: CONFIG.images.palette
        },
        {
          title: "Desbloqueio de Colagem",
          description: "A colagem (Ctrl+V) está automaticamente desbloqueada em todos os campos de texto.",
          icon: CONFIG.images.unlock
        }
      ];
    }

    show() {
      const tutorial = document.createElement('div');
      tutorial.id = 'typeflow-tutorial';
      
      const colors = CONFIG.darkMode;
      tutorial.innerHTML = `
        <div class="tutorial-content">
          <div class="tutorial-header">
            <h2><img src="${CONFIG.images.logo}" width="24" height="24"> Tutorial Type Flow</h2>
            <button id="close-tutorial" class="close-btn">×</button>
          </div>
          <div class="tutorial-steps">
            ${this.steps.map((step, i) => `
              <div class="tutorial-step" style="animation-delay: ${i * 0.1}s">
                <div class="step-header">
                  <img src="${step.icon}" width="32" height="32">
                  <h3>${step.title}</h3>
                </div>
                <p>${step.description}</p>
              </div>
            `).join('')}
          </div>
          <div class="tutorial-footer">
            <button id="start-experience" class="primary-btn">Começar a usar!</button>
          </div>
        </div>
      `;

      tutorial.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(15, 15, 35, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        backdrop-filter: blur(10px);
        padding: 20px;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;

      const style = document.createElement('style');
      style.textContent = `
        .tutorial-content {
          background: ${colors.surface};
          border-radius: 16px;
          padding: 30px;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          border: 1px solid ${colors.border};
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          transform: translateY(-20px);
          opacity: 0;
          animation: slideUp 0.4s ease forwards;
        }
        
        @keyframes slideUp {
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .tutorial-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid ${colors.border};
        }
        
        .tutorial-header h2 {
          margin: 0;
          color: ${colors.textImportant};
          font-size: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }
        
        .close-btn {
          background: none;
          border: none;
          color: ${colors.text};
          font-size: 28px;
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .close-btn:hover {
          background: rgba(255,255,255,0.1);
          transform: scale(1.1);
        }
        
        .tutorial-steps {
          margin: 20px 0;
        }
        
        .tutorial-step {
          background: ${colors.card};
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          border: 1px solid ${colors.border};
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }
        
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .step-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .step-header h3 {
          margin: 0;
          color: ${colors.textImportant};
          font-size: 16px;
          font-weight: 600;
        }
        
        .tutorial-step p {
          margin: 0;
          color: ${colors.textLight};
          line-height: 1.6;
          font-size: 14px;
        }
        
        .tutorial-footer {
          margin-top: 24px;
          text-align: center;
          padding-top: 16px;
          border-top: 1px solid ${colors.border};
        }
        
        .primary-btn {
          background: ${colors.gradient};
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          letter-spacing: 0.5px;
        }
        
        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
      `;
      
      document.head.appendChild(style);
      document.body.appendChild(tutorial);

      setTimeout(() => {
        tutorial.style.opacity = '1';
      }, 10);

      document.getElementById('close-tutorial').onclick = () => this.close();
      document.getElementById('start-experience').onclick = () => this.close();
      
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.close();
      });

      stateManager.update({ tutorialShown: true });
    }

    close() {
      const tutorial = document.getElementById('typeflow-tutorial');
      if (tutorial) {
        tutorial.style.opacity = '0';
        setTimeout(() => tutorial.remove(), 300);
      }
    }
  }

  // ========== WIDGETS LIVEPIX ==========
  class LivePixWidgets {
    constructor() {
      this.widgets = {
        donation: {
          id: 'e469d696-eab2-4c3f-9154-058e42a56b08',
          container: 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:9998;width:min(400px,95vw);overflow:hidden;background:transparent;pointer-events:none',
          iframe: 'width:800px;height:400px;border:none;transform:scale(0.5);transform-origin:top left;background:transparent;color-scheme:normal !important;pointer-events:none'
        },
        qr: {
          id: '0468d92a-238e-4720-abdf-75167b5c59d6',
          container: 'position:fixed;bottom:60px;right:0px;z-index:9998;height:225px;overflow:hidden;background:transparent;pointer-events:none',
          iframe: 'width:400px;height:600px;border:none;transform:scale(0.45);transform-origin:top right;background:transparent;color-scheme:normal !important;pointer-events:none'
        },
        donors: {
          id: '36e12ce5-53b0-4d75-81bb-310e9d9023e0',
          container: 'position:fixed;top:50px;left:20px;z-index:9998;width:200px;overflow:hidden;background:transparent;pointer-events:none',
          iframe: 'width:300px;height:150px;border:none;transform:scale(0.5);transform-origin:top left;background:transparent;color-scheme:normal !important;pointer-events:none'
        }
      };
    }

    init() {
      this.createWidgets();
      this.setupObservers();
    }

    createWidgets() {
      // Widget de doação (sempre visível)
      const donationContainer = this.createWidget(this.widgets.donation);
      donationContainer.id = 'livepix-donation';
      document.body.appendChild(donationContainer);

      // Widgets adicionais apenas para desktop
      if (!isMobile) {
        const qrContainer = this.createWidget(this.widgets.qr);
        qrContainer.id = 'livepix-qr';
        document.body.appendChild(qrContainer);

        const donorsContainer = this.createWidget(this.widgets.donors);
        donorsContainer.id = 'livepix-donors';
        document.body.appendChild(donorsContainer);
      }
    }

    createWidget(config) {
      const container = document.createElement('div');
      container.style.cssText = config.container;
      
      const iframe = document.createElement('iframe');
      iframe.src = `https://widget.livepix.gg/embed/${config.id}`;
      iframe.style.cssText = config.iframe;
      iframe.allowTransparency = true;
      iframe.allow = 'autoplay; encrypted-media';
      
      container.appendChild(iframe);
      return container;
    }

    setupObservers() {
      const observer = new MutationObserver(() => {
        const qrWidget = document.getElementById('livepix-qr');
        if (qrWidget) {
          const isProfilePage = window.location.pathname.includes('/profile');
          qrWidget.style.bottom = isProfilePage ? '0px' : '60px';
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
      });
    }
  }

  // ========== SISTEMA DE ARRASTAR ==========
  class DragSystem {
    constructor(element) {
      this.element = element;
      this.isDragging = false;
      this.offset = { x: 0, y: 0 };
      this.bindEvents();
    }

    bindEvents() {
      const header = this.element.querySelector('.popup-header');
      if (!header) return;

      header.addEventListener('mousedown', this.startDrag.bind(this));
      document.addEventListener('mousemove', Utils.throttle(this.drag.bind(this), 16));
      document.addEventListener('mouseup', this.stopDrag.bind(this));
      
      header.addEventListener('touchstart', this.startDrag.bind(this));
      document.addEventListener('touchmove', Utils.throttle(this.drag.bind(this), 16));
      document.addEventListener('touchend', this.stopDrag.bind(this));
    }

    startDrag(e) {
      e.preventDefault();
      this.isDragging = true;
      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;
      const rect = this.element.getBoundingClientRect();
      
      this.offset.x = clientX - rect.left;
      this.offset.y = clientY - rect.top;
      
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      this.element.style.transition = 'none';
      this.element.style.boxShadow = '0 15px 35px rgba(0,0,0,0.4)';
      stateManager.update({ isDragging: true });
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
      document.body.style.cursor = '';
      this.element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      this.element.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
      stateManager.update({ isDragging: false });
    }
  }

  // ========== GESTÃO DE TEMA ==========
  class ThemeManager {
    static toggle() {
      const state = stateManager.get();
      if (state.currentMode === 'dark') {
        this.disableDarkMode();
      } else {
        this.enableDarkMode();
      }
    }

    static enableDarkMode() {
      const state = stateManager.get();
      if (state.applyingStyles) return;
      
      stateManager.update({ currentMode: 'dark', applyingStyles: true, observerActive: false });
      localStorage.setItem('toolpad-mode', 'dark');
      document.documentElement.setAttribute('data-toolpad-color-scheme', 'dark');
      this.applyDarkModeStyles();
      
      const themeBtn = document.querySelector('.theme-btn');
      if (themeBtn) {
        themeBtn.innerHTML = `<img src="${CONFIG.images.sun}" width="16" height="16">`;
        themeBtn.title = 'Alternar para Modo Claro';
      }
      
      setTimeout(() => {
        stateManager.update({ observerActive: true, applyingStyles: false });
      }, 1000);
      
      NotificationSystem.show('🌙 Modo escuro ativado', 2000);
    }

    static disableDarkMode() {
      const state = stateManager.get();
      if (state.applyingStyles) return;
      
      stateManager.update({ currentMode: 'light', applyingStyles: true, observerActive: false });
      localStorage.removeItem('toolpad-mode');
      document.documentElement.removeAttribute('data-toolpad-color-scheme');
      
      const darkStyles = document.querySelectorAll('[data-dark-mode="universal"]');
      darkStyles.forEach(style => style.remove());
      
      const themeBtn = document.querySelector('.theme-btn');
      if (themeBtn) {
        themeBtn.innerHTML = `<img src="${CONFIG.images.moon}" width="16" height="16">`;
        themeBtn.title = 'Alternar para Modo Escuro';
      }
      
      setTimeout(() => {
        stateManager.update({ observerActive: true, applyingStyles: false });
      }, 1000);
      
      NotificationSystem.show('☀️ Modo claro ativado', 2000);
    }

    static applyDarkModeStyles() {
      const existingStyles = document.querySelectorAll('[data-dark-mode="universal"]');
      existingStyles.forEach(style => style.remove());
      
      const darkStyle = document.createElement('style');
      darkStyle.setAttribute('data-dark-mode', 'universal');
      darkStyle.textContent = `
        body {
            background-color: ${CONFIG.darkMode.bg} !important;
            color: ${CONFIG.darkMode.text} !important;
        }
        [class*="MuiBox-root"], [class*="MuiPaper-root"], [class*="MuiCard-root"],
        [class*="container"], [class*="Container"], .main-content-container {
            background-color: ${CONFIG.darkMode.surface} !important;
            color: ${CONFIG.darkMode.text} !important;
        }
        [class*="MuiTypography"], p, span, div, h1, h2, h3, h4, h5, h6 {
            color: ${CONFIG.darkMode.text} !important;
        }
        [class*="MuiInput"], [class*="MuiTextField"], input, textarea, select {
            background-color: ${CONFIG.darkMode.card} !important;
            color: ${CONFIG.darkMode.text} !important;
            border-color: ${CONFIG.darkMode.border} !important;
        }
      `;
      document.head.appendChild(darkStyle);
    }
  }

  // ========== CAPTURA DE INFORMAÇÕES ==========
  class InfoCapture {
    static capture() {
      const containers = document.querySelectorAll('div.css-skkg69');
      const info = {};
      
      containers.forEach(container => {
        const labelElement = container.querySelector('p.MuiTypography-body1');
        const valueElement = container.querySelector('p.MuiTypography-body2');
        
        if (labelElement && valueElement) {
          const label = labelElement.textContent.replace(':', '').trim().toLowerCase();
          const value = valueElement.textContent.trim();
          info[label] = value;
          
          if (label.includes('palavras') || label.includes('número')) {
            const match = value.match(/(\d+)/);
            if (match) {
              stateManager.update({ wordGoal: parseInt(match[1]) });
            }
          }
        }
      });
      
      stateManager.update({ capturedInfo: info });
      return info;
    }

    static generateAIPrompt() {
      const state = stateManager.get();
      const genre = state.capturedInfo.gênero || 'desconhecido';
      const theme = state.capturedInfo.tema || 'desconhecido';
      const words = state.capturedInfo['número de palavras'] || state.wordGoal;
      
      return `Faça um texto do gênero ${genre} sobre ${theme} de ${words} palavras, com um título.`;
    }

    static async copyPromptToClipboard() {
      const prompt = this.generateAIPrompt();
      
      try {
        await navigator.clipboard.writeText(prompt);
        NotificationSystem.show('✅ Prompt copiado para a área de transferência!', 3000);
      } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = prompt;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          NotificationSystem.show('✅ Prompt copiado para a área de transferência!', 3000);
        } catch (fallbackError) {
          NotificationSystem.show('❌ Erro ao copiar. Aqui está o prompt:<br><br>' + prompt, 6000);
        }
        document.body.removeChild(textarea);
      }
    }
  }

  // ========== DESBLOQUEIO DE COLAGEM ==========
  class PasteUnlocker {
    static init() {
      this.unlock();
      this.setupObserver();
    }

    static unlock() {
      const fields = document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]');
      
      fields.forEach(field => {
        field.removeAttribute('onpaste');
        field.removeAttribute('oncopy');
        field.removeAttribute('oncut');
        
        field.onpaste = null;
        field.oncopy = null;
        field.oncut = null;
        
        field.addEventListener('paste', e => e.stopPropagation(), true);
        field.addEventListener('copy', e => e.stopPropagation(), true);
        field.addEventListener('cut', e => e.stopPropagation(), true);
      });
      
      NotificationSystem.show('🔓 Colagem desbloqueada em todos os campos', 2000);
      
      setTimeout(() => {
        this.nuclearUnlock();
      }, 2000);
    }

    static nuclearUnlock() {
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        if (textarea.onpaste || textarea.getAttribute('onpaste')) {
          const newTextarea = textarea.cloneNode(true);
          newTextarea.onpaste = null;
          newTextarea.oncopy = null;
          newTextarea.oncut = null;
          newTextarea.removeAttribute('onpaste');
          newTextarea.removeAttribute('oncopy');
          newTextarea.removeAttribute('oncut');
          textarea.parentNode.replaceChild(newTextarea, textarea);
        }
      });
    }

    static setupObserver() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              if (node.tagName === 'TEXTAREA' || node.tagName === 'INPUT') {
                this.unlock();
              } else if (node.querySelectorAll) {
                const fields = node.querySelectorAll('textarea, input[type="text"]');
                if (fields.length > 0) {
                  this.unlock();
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
  }

  // ========== SISTEMA DE FPS ==========
  class FPSMonitor {
    constructor() {
      this.fps = 0;
      this.frameCount = 0;
      this.lastTime = performance.now();
      this.fpsElement = null;
    }

    init() {
      this.createDisplay();
      this.startTracking();
    }

    createDisplay() {
      this.fpsElement = document.createElement('div');
      this.fpsElement.id = 'typeflow-fps';
      
      const colors = CONFIG.darkMode;
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
        z-index: 999997;
        backdrop-filter: blur(10px);
        border: 1px solid #00ff00;
        transition: all 0.3s ease;
        opacity: 0.9;
      `;
      
      this.fpsElement.innerHTML = `
        <div style="line-height: 1.4;">
          <div>FPS: <span id="fps-value">0</span></div>
          <div>MS: <span id="ms-value">0</span>ms</div>
          <div style="font-size: 10px; opacity: 0.8;">@_zx.lipe_</div>
        </div>
      `;
      
      document.body.appendChild(this.fpsElement);
    }

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
    }

    updateDisplay() {
      if (this.fpsElement) {
        const ms = Math.round(1000 / Math.max(this.fps, 1));
        document.getElementById('fps-value').textContent = this.fps;
        document.getElementById('ms-value').textContent = ms;
        
        // Mudar cor baseado no FPS
        const fpsValue = document.getElementById('fps-value');
        if (this.fps < 30) {
          fpsValue.style.color = '#ff4444';
        } else if (this.fps < 50) {
          fpsValue.style.color = '#ffaa00';
        } else {
          fpsValue.style.color = '#00ff00';
        }
      }
    }
  }

  // ========== SISTEMA DE POPUP ==========
  class PopupSystem {
    constructor() {
      this.popup = null;
      this.dragSystem = null;
    }

    init() {
      this.create();
      this.setupEvents();
      this.setupResponsive();
    }

    create() {
      const popup = document.createElement('div');
      popup.id = 'typeflow-popup';
      
      const state = stateManager.get();
      const colors = state.currentMode === 'dark' ? CONFIG.darkMode : CONFIG.lightMode;
      const scaled = Utils.getScaled;
      
      popup.innerHTML = `
        <div class="popup-header">
          <div class="popup-title">
            <img src="${CONFIG.images.logo}" width="${scaled(20)}" height="${scaled(20)}">
            <span>Type Flow</span>
          </div>
          <div class="popup-controls">
            <button class="popup-btn heart-btn" title="Apoiar o projeto">
              <img src="${CONFIG.images.heart}" width="${scaled(16)}" height="${scaled(16)}">
            </button>
            <button class="popup-btn ai-btn" title="Criar Prompt para IA">
              <img src="${CONFIG.images.robot}" width="${scaled(16)}" height="${scaled(16)}">
            </button>
            <button class="popup-btn theme-btn" title="Alternar tema">
              <img src="${state.currentMode === 'dark' ? CONFIG.images.sun : CONFIG.images.moon}" width="${scaled(16)}" height="${scaled(16)}">
            </button>
            <button class="popup-btn tutorial-btn" title="Abrir tutorial">
              <img src="${CONFIG.images.info}" width="${scaled(16)}" height="${scaled(16)}">
            </button>
          </div>
        </div>
        <div class="popup-body">
          <div class="status-info">
            <div class="status-item">
              <span class="status-icon">🟢</span>
              <span class="status-text">Status: Ativo</span>
            </div>
            <div class="status-item">
              <span class="status-icon">📱</span>
              <span class="status-text">${isMobile ? 'Mobile' : 'Desktop'}</span>
            </div>
            <div class="status-item">
              <span class="status-icon">🎯</span>
              <span class="status-text">Meta: ${state.wordGoal} palavras</span>
            </div>
          </div>
          <div class="info-capture">
            <button id="capture-info" class="secondary-btn">Capturar Informações</button>
          </div>
        </div>
      `;
      
      popup.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: ${scaled(350)}px;
        background: ${colors.surface};
        border: 1px solid ${colors.border};
        border-radius: ${scaled(16)}px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 999999;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        backdrop-filter: blur(10px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
        transform: translateY(-10px);
      `;
      
      document.body.appendChild(popup);
      this.popup = popup;
      
      // Animar entrada
      setTimeout(() => {
        popup.style.opacity = '1';
        popup.style.transform = 'translateY(0)';
      }, 300);
      
      this.applyStyles();
      this.dragSystem = new DragSystem(popup);
    }

    applyStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: ${Utils.getScaled(16)}px;
          background: rgba(0,0,0,0.1);
          border-bottom: 1px solid var(--typeflow-border, #2d2d5a);
          cursor: move;
          user-select: none;
        }
        
        .popup-title {
          display: flex;
          align-items: center;
          gap: ${Utils.getScaled(8)}px;
          font-weight: 600;
          color: var(--typeflow-text, #e6e6ff);
          font-size: ${Utils.getScaled(14)}px;
        }
        
        .popup-controls {
          display: flex;
          gap: ${Utils.getScaled(8)}px;
        }
        
        .popup-btn {
          width: ${Utils.getScaled(36)}px;
          height: ${Utils.getScaled(36)}px;
          border-radius: ${Utils.getScaled(10)}px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          background: rgba(255,255,255,0.1);
        }
        
        .popup-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .heart-btn {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        }
        
        .ai-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .tutorial-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }
        
        .popup-body {
          padding: ${Utils.getScaled(16)}px;
          color: var(--typeflow-text, #e6e6ff);
          font-size: ${Utils.getScaled(13)}px;
        }
        
        .status-info {
          margin-bottom: ${Utils.getScaled(12)}px;
        }
        
        .status-item {
          display: flex;
          align-items: center;
          gap: ${Utils.getScaled(8)}px;
          padding: ${Utils.getScaled(8)}px;
          background: rgba(0,0,0,0.05);
          border-radius: ${Utils.getScaled(8)}px;
          margin-bottom: ${Utils.getScaled(6)}px;
          transition: background 0.2s;
        }
        
        .status-item:hover {
          background: rgba(255,255,255,0.05);
        }
        
        .status-icon {
          font-size: ${Utils.getScaled(14)}px;
        }
        
        .status-text {
          font-size: ${Utils.getScaled(12)}px;
        }
        
        .secondary-btn {
          background: rgba(255,255,255,0.1);
          color: var(--typeflow-text, #e6e6ff);
          border: 1px solid var(--typeflow-border, #2d2d5a);
          padding: ${Utils.getScaled(10)}px ${Utils.getScaled(16)}px;
          border-radius: ${Utils.getScaled(8)}px;
          cursor: pointer;
          width: 100%;
          font-size: ${Utils.getScaled(13)}px;
          transition: all 0.2s ease;
          font-weight: 500;
          letter-spacing: 0.3px;
        }
        
        .secondary-btn:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }
        
        @media (max-width: 768px) {
          #typeflow-popup {
            width: calc(100vw - 40px) !important;
            right: 20px !important;
            left: 20px !important;
            top: 20px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    setupEvents() {
      // Tema
      const themeBtn = this.popup.querySelector('.theme-btn');
      if (themeBtn) {
        themeBtn.onclick = () => ThemeManager.toggle();
      }
      
      // Tutorial
      const tutorialBtn = this.popup.querySelector('.tutorial-btn');
      if (tutorialBtn) {
        tutorialBtn.onclick = () => {
          const tutorial = new TutorialSystem();
          tutorial.show();
        };
      }
      
      // Doação
      const heartBtn = this.popup.querySelector('.heart-btn');
      if (heartBtn) {
        heartBtn.onclick = () => {
          NotificationSystem.show('❤️ Widgets de doação sempre ativos! Obrigado pelo apoio.', 3000);
        };
      }
      
      // IA
      const aiBtn = this.popup.querySelector('.ai-btn');
      if (aiBtn) {
        aiBtn.onclick = () => {
          Utils.safeExecute(() => {
            const info = InfoCapture.capture();
            if (info.tema || info.gênero) {
              InfoCapture.copyPromptToClipboard();
            } else {
              NotificationSystem.show('ℹ️ Nenhuma informação encontrada. Verifique se está na página de redação.', 3000);
            }
          }, 'Erro ao criar prompt');
        };
      }
      
      // Captura de informações
      const captureBtn = this.popup.querySelector('#capture-info');
      if (captureBtn) {
        captureBtn.onclick = () => {
          const info = InfoCapture.capture();
          if (Object.keys(info).length > 0) {
            NotificationSystem.show('✅ Informações capturadas com sucesso!', 2000);
          } else {
            NotificationSystem.show('ℹ️ Nenhuma informação encontrada para capturar.', 3000);
          }
        };
      }
    }

    setupResponsive() {
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      
      const handleMobileChange = (e) => {
        if (e.matches) {
          this.popup.style.width = 'calc(100vw - 40px)';
          this.popup.style.left = '20px';
          this.popup.style.right = '20px';
          this.popup.style.top = '20px';
        } else {
          this.popup.style.width = `${Utils.getScaled(350)}px`;
          this.popup.style.right = '20px';
          this.popup.style.left = 'auto';
          this.popup.style.top = '20px';
        }
      };
      
      mediaQuery.addListener(handleMobileChange);
      handleMobileChange(mediaQuery);
    }
  }

  // ========== SISTEMA DE LIMPEZA ==========
  class CleanupSystem {
    static init() {
      this.setupCleanup();
    }

    static setupCleanup() {
      const cleanup = () => {
        if (window.typeflowObserver) {
          window.typeflowObserver.disconnect();
        }
        const elements = [
          'typeflow-fps',
          'livepix-donation',
          'livepix-qr',
          'livepix-donors',
          'typeflow-popup',
          'typeflow-tutorial',
          'typeflow-splash'
        ];
        
        elements.forEach(id => {
          const element = document.getElementById(id);
          if (element) element.remove();
        });
      };
      
      window.addEventListener('beforeunload', cleanup);
      return cleanup;
    }
  }

  // ========== INICIALIZAÇÃO ==========
  async function init() {
    // Mostrar splash screen
    const splash = new SplashScreen();
    splash.show();
    
    // Inicializar componentes principais
    await Utils.delay(1000);
    
    const popup = new PopupSystem();
    popup.init();
    
    PasteUnlocker.init();
    
    const livepix = new LivePixWidgets();
    livepix.init();
    
    ThemeManager.enableDarkMode();
    
    const fpsMonitor = new FPSMonitor();
    fpsMonitor.init();
    
    CleanupSystem.init();
    
    // Configurar observer para tema
    window.typeflowObserver = new MutationObserver(() => {
      const state = stateManager.get();
      if (!state.observerActive) return;
      
      if (state.currentMode === 'dark') {
        const currentAttr = document.documentElement.getAttribute('data-toolpad-color-scheme');
        if (currentAttr !== 'dark') {
          document.documentElement.setAttribute('data-toolpad-color-scheme', 'dark');
        }
      }
    });

    stateManager.update({ observerActive: true });
    window.typeflowObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-toolpad-color-scheme']
    });

    // Mostrar notificações de boas-vindas
    await Utils.delay(500);
    NotificationSystem.show('🚀 Type Flow carregado com sucesso!', 3000);
    
    await Utils.delay(1000);
    NotificationSystem.show('🔓 Colagem desbloqueada automaticamente', 3000);

    await Utils.delay(1000);
    NotificationSystem.show('📚 Clique no botão ℹ️ para ver o tutorial', 3000);

    // Esconder splash screen
    await Utils.delay(1000);
    splash.hide();
    
    // Mostrar tutorial automaticamente após 1.5 segundos
    setTimeout(() => {
      const tutorial = new TutorialSystem();
      tutorial.show();
    }, 1500);

    stateManager.update({ splashShown: true });
    console.log(`✅ Type Flow inicializado (${isMobile ? 'Mobile' : 'Desktop'})`);
  }

  // Iniciar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();