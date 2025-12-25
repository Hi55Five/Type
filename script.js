(function() {
  // ========== CONFIGURAÇÕES ==========
  const CONFIG = {
    colors: {
      dark: {
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
      light: {
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
    }
  };

  // ========== VERIFICAÇÃO DE DUPLICIDADE ==========
  if (document.getElementById('typeflow-popup')) return;

  // ========== DETECÇÃO DE DISPOSITIVO ==========
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // ========== ESTADO ==========
  const state = {
    currentMode: 'dark',
    capturedInfo: {},
    wordGoal: 200,
    isDragging: false
  };

  // ========== UTILITÁRIOS ==========
  const Utils = {
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
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
    }
  };

  // ========== SPLASH SCREEN ==========
  class SplashScreen {
    constructor() {
      this.element = null;
    }

    show() {
      const splash = document.createElement('div');
      splash.id = 'typeflow-splash';
      
      const colors = CONFIG.colors.dark;
      splash.innerHTML = `
        <div style="
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
        ">
          <div style="text-align: center; padding: 40px;">
            <div style="
              width: 60px;
              height: 60px;
              background: ${colors.gradient};
              border-radius: 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              font-size: 28px;
              animation: pulse 2s infinite;
            ">🌀</div>
            <h1 style="
              color: ${colors.textImportant};
              font-size: 32px;
              margin: 0 0 10px 0;
              background: ${colors.gradient};
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              font-weight: 700;
            ">Type Flow</h1>
            <p style="color: ${colors.textLight}; margin: 0 0 30px 0; font-size: 14px;">
              Ferramenta de Redação Avançada
            </p>
            <div style="
              width: 200px;
              height: 4px;
              background: rgba(255,255,255,0.1);
              border-radius: 2px;
              margin: 0 auto;
              overflow: hidden;
            ">
              <div id="splash-progress" style="
                height: 100%;
                background: ${colors.primary};
                width: 0%;
                transition: width 0.3s ease;
                border-radius: 2px;
              "></div>
            </div>
            <p style="color: ${colors.textLight}; font-size: 12px; margin-top: 20px;">
              Carregando recursos...
            </p>
          </div>
        </div>
      `;
      
      // Adicionar animação pulse
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(splash);
      this.element = splash;
      this.animateProgress();
    }

    animateProgress() {
      const progress = document.getElementById('splash-progress');
      let width = 0;
      
      const interval = setInterval(() => {
        width += Math.random() * 15 + 5;
        if (width >= 100) {
          width = 100;
          clearInterval(interval);
        }
        progress.style.width = width + '%';
      }, 150);
    }

    hide() {
      if (this.element) {
        this.element.style.opacity = '0';
        setTimeout(() => {
          if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
          }
        }, 500);
      }
    }
  }

  // ========== NOTIFICAÇÕES ==========
  class NotificationSystem {
    static show(message, duration = 3000) {
      const colors = state.currentMode === 'dark' ? CONFIG.colors.dark : CONFIG.colors.light;
      const notification = document.createElement('div');
      
      const icon = this.getIcon(message);
      
      notification.innerHTML = `
        <span style="font-size: 18px;">${icon}</span>
        <span>${message}</span>
      `;
      
      notification.style.cssText = `
        position: fixed;
        top: 20px;
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
      
      document.body.appendChild(notification);
      
      // Animação de entrada
      setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(0)';
      }, 10);
      
      // Remover após duração
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, duration);
    }

    static getIcon(message) {
      if (message.includes('✅')) return '✅';
      if (message.includes('❌')) return '❌';
      if (message.includes('🚀')) return '🚀';
      if (message.includes('🔓')) return '🔓';
      if (message.includes('📚')) return '📚';
      if (message.includes('❤️')) return '❤️';
      if (message.includes('🌙')) return '🌙';
      if (message.includes('☀️')) return '☀️';
      return 'ℹ️';
    }
  }

  // ========== TUTORIAL ==========
  class TutorialSystem {
    constructor() {
      this.steps = [
        {
          title: "Bem-vindo ao Type Flow!",
          description: "Ferramenta de redação avançada com diversas funcionalidades para facilitar sua escrita.",
          icon: "🌀"
        },
        {
          title: "Botões Principais",
          description: "❤️ - Widgets de doação ativos<br>🤖 - Criar prompt para IA<br>☀️/🌙 - Alternar tema<br>ℹ️ - Ver tutorial novamente",
          icon: "🚀"
        },
        {
          title: "Como usar o Prompt para IA",
          description: "1. Acesse uma redação<br>2. Clique no botão 🤖<br>3. O prompt será copiado automaticamente<br>4. Cole em sua IA favorita",
          icon: "🤖"
        },
        {
          title: "Modo Escuro/Claro",
          description: "Clique no botão ☀️/🌙 para alternar entre os temas. Sua preferência será salva.",
          icon: "🎨"
        }
      ];
    }

    show() {
      const tutorial = document.createElement('div');
      tutorial.id = 'typeflow-tutorial';
      
      const colors = CONFIG.colors.dark;
      tutorial.innerHTML = `
        <div style="
          background: ${colors.surface};
          border-radius: 16px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          border: 1px solid ${colors.border};
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          transform: translateY(-20px);
          opacity: 0;
          animation: slideUp 0.4s ease forwards;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2 style="margin: 0; color: ${colors.textImportant}; font-size: 20px; display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 24px;">🌀</span> Tutorial Type Flow
            </h2>
            <button id="close-tutorial" style="
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
            ">×</button>
          </div>
          
          <div style="margin: 20px 0;">
            ${this.steps.map((step, i) => `
              <div style="
                background: ${colors.card};
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 16px;
                border: 1px solid ${colors.border};
                animation: fadeInUp 0.5s ease forwards;
                opacity: 0;
                animation-delay: ${i * 0.1}s;
              ">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                  <div style="
                    width: 40px;
                    height: 40px;
                    background: ${colors.gradient};
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                  ">${step.icon}</div>
                  <h3 style="margin: 0; color: ${colors.textImportant}; font-size: 16px;">${step.title}</h3>
                </div>
                <p style="margin: 0; color: ${colors.textLight}; line-height: 1.6; font-size: 14px;">${step.description}</p>
              </div>
            `).join('')}
          </div>
          
          <div style="margin-top: 24px; text-align: center;">
            <button id="start-experience" style="
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
            ">Começar a usar!</button>
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
      
      // Adicionar animações
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideUp {
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
      // Widget de doação
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
      state.isDragging = true;
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
      state.isDragging = false;
    }
  }

  // ========== GESTÃO DE TEMA ==========
  class ThemeManager {
    static toggle() {
      if (state.currentMode === 'dark') {
        this.disableDarkMode();
      } else {
        this.enableDarkMode();
      }
    }

    static enableDarkMode() {
      state.currentMode = 'dark';
      localStorage.setItem('toolpad-mode', 'dark');
      document.documentElement.setAttribute('data-toolpad-color-scheme', 'dark');
      this.applyDarkModeStyles();
      
      const themeBtn = document.querySelector('.theme-btn');
      if (themeBtn) {
        themeBtn.innerHTML = '☀️';
        themeBtn.title = 'Alternar para Modo Claro';
      }
      
      NotificationSystem.show('🌙 Modo escuro ativado', 2000);
    }

    static disableDarkMode() {
      state.currentMode = 'light';
      localStorage.removeItem('toolpad-mode');
      document.documentElement.removeAttribute('data-toolpad-color-scheme');
      
      const darkStyles = document.querySelectorAll('[data-dark-mode="universal"]');
      darkStyles.forEach(style => style.remove());
      
      const themeBtn = document.querySelector('.theme-btn');
      if (themeBtn) {
        themeBtn.innerHTML = '🌙';
        themeBtn.title = 'Alternar para Modo Escuro';
      }
      
      NotificationSystem.show('☀️ Modo claro ativado', 2000);
    }

    static applyDarkModeStyles() {
      const existingStyles = document.querySelectorAll('[data-dark-mode="universal"]');
      existingStyles.forEach(style => style.remove());
      
      const darkStyle = document.createElement('style');
      darkStyle.setAttribute('data-dark-mode', 'universal');
      darkStyle.textContent = `
        body {
            background-color: ${CONFIG.colors.dark.bg} !important;
            color: ${CONFIG.colors.dark.text} !important;
        }
        [class*="MuiBox-root"], [class*="MuiPaper-root"], [class*="MuiCard-root"],
        [class*="container"], [class*="Container"], .main-content-container {
            background-color: ${CONFIG.colors.dark.surface} !important;
            color: ${CONFIG.colors.dark.text} !important;
        }
        [class*="MuiTypography"], p, span, div, h1, h2, h3, h4, h5, h6 {
            color: ${CONFIG.colors.dark.text} !important;
        }
        [class*="MuiInput"], [class*="MuiTextField"], input, textarea, select {
            background-color: ${CONFIG.colors.dark.card} !important;
            color: ${CONFIG.colors.dark.text} !important;
            border-color: ${CONFIG.colors.dark.border} !important;
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
              state.wordGoal = parseInt(match[1]);
            }
          }
        }
      });
      
      state.capturedInfo = info;
      return info;
    }

    static generateAIPrompt() {
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

  // ========== MONITOR DE FPS ==========
  class FPSMonitor {
    constructor() {
      this.fps = 0;
      this.frameCount = 0;
      this.lastTime = performance.now();
      this.element = null;
    }

    init() {
      this.createDisplay();
      this.startTracking();
    }

    createDisplay() {
      this.element = document.createElement('div');
      this.element.id = 'typeflow-fps';
      
      this.element.style.cssText = `
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
        opacity: 0.9;
      `;
      
      this.element.innerHTML = `
        <div style="line-height: 1.4;">
          <div>FPS: <span id="fps-value">0</span></div>
          <div>MS: <span id="ms-value">0</span>ms</div>
          <div style="font-size: 10px; opacity: 0.8;">@_zx.lipe_</div>
        </div>
      `;
      
      document.body.appendChild(this.element);
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
      if (this.element) {
        const ms = Math.round(1000 / Math.max(this.fps, 1));
        document.getElementById('fps-value').textContent = this.fps;
        document.getElementById('ms-value').textContent = ms;
      }
    }
  }

  // ========== POPUP PRINCIPAL ==========
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
      
      const colors = state.currentMode === 'dark' ? CONFIG.colors.dark : CONFIG.colors.light;
      
      popup.innerHTML = `
        <div class="popup-header" style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: rgba(0,0,0,0.1);
          border-bottom: 1px solid ${colors.border};
          cursor: move;
        ">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: ${colors.text};">
            <span style="font-size: 20px;">🌀</span>
            <span>Type Flow</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="popup-btn heart-btn" title="Apoiar o projeto" style="
              width: 36px;
              height: 36px;
              border-radius: 10px;
              border: none;
              background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
              color: white;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
            ">❤️</button>
            <button class="popup-btn ai-btn" title="Criar Prompt para IA" style="
              width: 36px;
              height: 36px;
              border-radius: 10px;
              border: none;
              background: ${colors.gradient};
              color: white;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
            ">🤖</button>
            <button class="popup-btn theme-btn" title="Alternar tema" style="
              width: 36px;
              height: 36px;
              border-radius: 10px;
              border: none;
              background: rgba(255,255,255,0.1);
              color: ${colors.text};
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
            ">${state.currentMode === 'dark' ? '☀️' : '🌙'}</button>
            <button class="popup-btn tutorial-btn" title="Abrir tutorial" style="
              width: 36px;
              height: 36px;
              border-radius: 10px;
              border: none;
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
            ">ℹ️</button>
          </div>
        </div>
        <div class="popup-body" style="
          padding: 16px;
          color: ${colors.text};
          font-size: 14px;
        ">
          <div style="margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: rgba(0,0,0,0.05); border-radius: 8px; margin-bottom: 8px;">
              <span>🟢</span>
              <span>Status: Ativo</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: rgba(0,0,0,0.05); border-radius: 8px; margin-bottom: 8px;">
              <span>📱</span>
              <span>${isMobile ? 'Mobile' : 'Desktop'}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: rgba(0,0,0,0.05); border-radius: 8px;">
              <span>🎯</span>
              <span>Meta: ${state.wordGoal} palavras</span>
            </div>
          </div>
          <button id="capture-info" style="
            background: rgba(255,255,255,0.1);
            color: ${colors.text};
            border: 1px solid ${colors.border};
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            width: 100%;
            font-size: 13px;
            transition: all 0.2s ease;
          ">Capturar Informações</button>
        </div>
      `;
      
      popup.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: ${isMobile ? 'calc(100vw - 40px)' : '300px'};
        background: ${colors.surface};
        border: 1px solid ${colors.border};
        border-radius: 16px;
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
      
      this.dragSystem = new DragSystem(popup);
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
          new TutorialSystem().show();
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
          const info = InfoCapture.capture();
          if (info.tema || info.gênero) {
            InfoCapture.copyPromptToClipboard();
          } else {
            NotificationSystem.show('ℹ️ Nenhuma informação encontrada. Verifique se está na página de redação.', 3000);
          }
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
      window.addEventListener('resize', () => {
        if (this.popup) {
          if (window.innerWidth <= 768) {
            this.popup.style.width = 'calc(100vw - 40px)';
            this.popup.style.right = '20px';
            this.popup.style.left = '20px';
          } else {
            this.popup.style.width = '300px';
            this.popup.style.right = '20px';
            this.popup.style.left = 'auto';
          }
        }
      });
    }
  }

  // ========== LIMPEZA ==========
  function setupCleanup() {
    window.addEventListener('beforeunload', () => {
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
    });
  }

  // ========== INICIALIZAÇÃO ==========
  async function init() {
    // Mostrar splash screen
    const splash = new SplashScreen();
    splash.show();
    
    // Inicializar componentes
    await Utils.delay(1000);
    
    const popup = new PopupSystem();
    popup.init();
    
    PasteUnlocker.init();
    
    const livepix = new LivePixWidgets();
    livepix.init();
    
    ThemeManager.enableDarkMode();
    
    const fpsMonitor = new FPSMonitor();
    fpsMonitor.init();
    
    setupCleanup();
    
    // Notificações iniciais
    await Utils.delay(500);
    NotificationSystem.show('🚀 Type Flow carregado com sucesso!', 3000);
    
    await Utils.delay(1000);
    NotificationSystem.show('🔓 Colagem desbloqueada automaticamente', 3000);
    
    await Utils.delay(1000);
    NotificationSystem.show('📚 Clique no botão ℹ️ para ver o tutorial', 3000);
    
    // Esconder splash e mostrar tutorial
    await Utils.delay(1000);
    splash.hide();
    
    setTimeout(() => {
      new TutorialSystem().show();
    }, 1500);
    
    console.log(`✅ Type Flow inicializado (${isMobile ? 'Mobile' : 'Desktop'})`);
  }

  // Iniciar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();