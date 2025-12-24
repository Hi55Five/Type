(function() {
  // ========== CONFIGURAÇÕES GLOBAIS ==========
  const CONFIGURACOES = {
    atrasoDigitacao: 0.001,
    coresModoEscuro: {
      fundo: '#0f0f23',
      superficie: '#1a1a2e',
      cartao: '#16213e',
      texto: '#e6e6ff',
      textoClaro: '#a0a0cc',
      textoImportante: '#ffffff',
      primaria: '#6366f1',
      sucesso: '#10b981',
      destaque: '#f59e0b',
      borda: '#2d2d5a',
      gradiente: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    coresModoClaro: {
      fundo: '#ffffff',
      superficie: '#f8fafc',
      cartao: '#ffffff',
      texto: '#334155',
      textoClaro: '#64748b',
      textoImportante: '#0f172a',
      primaria: '#3b82f6',
      sucesso: '#10b981',
      destaque: '#f59e0b',
      borda: '#e2e8f0',
      gradiente: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    }
  };

  // ========== VERIFICAÇÃO DE DUPLICIDADE ==========
  if (document.getElementById('typeflow-popup')) return;

  // ========== DETECÇÃO DE DISPOSITIVO ==========
  const ehMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const tamanhoPopup = ehMobile ? 0.6 : 0.85; // 60% mobile, 85% PC

  // ========== SISTEMA DE TUTORIAL ==========
  const SistemaTutorial = {
    passos: [
      {
        titulo: "Bem-vindo ao Type Flow!",
        descricao: "Ferramenta de redação avançada com diversas funcionalidades para facilitar sua escrita.",
        icone: "⭐"
      },
      {
        titulo: "Botões Principais",
        descricao: "❤️ - Widgets de doação ativos<br>🤖 - Criar prompt para IA<br>☀️/🌙 - Alternar tema<br>🎮 - Ver tutorial novamente",
        icone: "🚀"
      },
      {
        titulo: "Como usar o Prompt para IA",
        descricao: "1. Acesse uma redação<br>2. Clique no botão 🤖<br>3. O prompt será copiado automaticamente<br>4. Cole em sua IA favorita",
        icone: "🤖"
      },
      {
        titulo: "Modo Escuro/Claro",
        descricao: "Clique no botão ☀️/🌙 para alternar entre os temas. Sua preferência será salva.",
        icone: "🎨"
      },
      {
        titulo: "Sistema de Doações",
        descricao: "Os widgets do LivePix estão sempre ativos para quem quiser apoiar o projeto.",
        icone: "❤️"
      },
      {
        titulo: "Desbloqueio de Colagem",
        descricao: "A colagem (Ctrl+V) está automaticamente desbloqueada em todos os campos de texto.",
        icone: "🔓"
      }
    ],

    mostrarTutorial() {
      const tutorial = document.createElement('div');
      tutorial.id = 'typeflow-tutorial';
      tutorial.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(15, 15, 35, 0.95);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000000;
        font-family: 'Inter', system-ui, sans-serif;
        color: #e6e6ff;
        backdrop-filter: blur(10px);
      `;

      let conteudoHTML = `
        <div style="
          background: ${CONFIGURACOES.coresModoEscuro.superficie};
          border-radius: 16px;
          padding: 30px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          border: 1px solid ${CONFIGURACOES.coresModoEscuro.borda};
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h1 style="font-size: 28px; margin: 0; color: #ffffff;">📚 Tutorial Type Flow</h1>
            <button id="fechar-tutorial" style="
              background: none;
              border: none;
              color: #e6e6ff;
              font-size: 24px;
              cursor: pointer;
              padding: 8px;
              border-radius: 8px;
              transition: background 0.2s;
            ">×</button>
          </div>
      `;

      this.passos.forEach((passo, index) => {
        conteudoHTML += `
          <div style="
            background: ${CONFIGURACOES.coresModoEscuro.cartao};
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            border: 1px solid ${CONFIGURACOES.coresModoEscuro.borda};
          ">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
              <div style="
                background: ${CONFIGURACOES.coresModoEscuro.gradiente};
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
              ">${passo.icone}</div>
              <h3 style="margin: 0; font-size: 18px; color: #ffffff;">${passo.titulo}</h3>
            </div>
            <p style="margin: 0; color: #a0a0cc; line-height: 1.6;">${passo.descricao}</p>
          </div>
        `;
      });

      conteudoHTML += `
          <div style="margin-top: 30px; text-align: center;">
            <button id="iniciar-experiencia" style="
              background: ${CONFIGURACOES.coresModoEscuro.gradiente};
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 10px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: transform 0.2s;
            ">Começar a usar!</button>
          </div>
        </div>
      `;

      tutorial.innerHTML = conteudoHTML;
      document.body.appendChild(tutorial);

      // Event listeners do tutorial
      document.getElementById('fechar-tutorial').addEventListener('click', () => {
        this.fecharTutorial();
      });

      document.getElementById('iniciar-experiencia').addEventListener('click', () => {
        this.fecharTutorial();
      });

      // Fechar com ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.fecharTutorial();
        }
      });
    },

    fecharTutorial() {
      const tutorial = document.getElementById('typeflow-tutorial');
      if (tutorial && tutorial.parentNode) {
        tutorial.style.opacity = '0';
        setTimeout(() => {
          tutorial.parentNode.removeChild(tutorial);
        }, 300);
      }
    }
  };

  // ========== SISTEMA DE WIDGETS LIVEPIX ==========
  const WidgetsLivePix = {
    widgets: {
      doacao: {
        id: 'e469d696-eab2-4c3f-9154-058e42a56b08',
        container: 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:9998;width:min(400px,95vw);overflow:hidden;background:transparent;pointer-events:none',
        iframe: 'width:800px;height:400px;border:none;transform:scale(0.5);transform-origin:top left;background:transparent;color-scheme:normal !important;pointer-events:none'
      },
      qr: {
        id: '0468d92a-238e-4720-abdf-75167b5c59d6',
        container: 'position:fixed;bottom:60px;right:0px;z-index:9998;height:225px;overflow:hidden;background:transparent;pointer-events:none',
        iframe: 'width:400px;height:600px;border:none;transform:scale(0.45);transform-origin:top right;background:transparent;color-scheme:normal !important;pointer-events:none'
      },
      doadores: {
        id: '36e12ce5-53b0-4d75-81bb-310e9d9023e0',
        container: 'position:fixed;top:50px;left:20px;z-index:9998;width:200px;overflow:hidden;background:transparent;pointer-events:none',
        iframe: 'width:300px;height:150px;border:none;transform:scale(0.5);transform-origin:top left;background:transparent;color-scheme:normal !important;pointer-events:none'
      }
    },

    iniciar() {
      this.criarWidgets();
      this.configurarEventListeners();
    },

    criarWidgets() {
      // Criar widget de doação (sempre)
      const containerDoacao = this.criarWidget(this.widgets.doacao);
      containerDoacao.id = 'livepix-doacao';
      document.body.appendChild(containerDoacao);
      this.containerDoacao = containerDoacao;

      // Criar QR Code e Doadores apenas se não for mobile
      if (!ehMobile) {
        const containerQR = this.criarWidget(this.widgets.qr);
        containerQR.id = 'livepix-qr';
        document.body.appendChild(containerQR);
        this.containerQR = containerQR;

        const containerDoadores = this.criarWidget(this.widgets.doadores);
        containerDoadores.id = 'livepix-doadores';
        document.body.appendChild(containerDoadores);
        this.containerDoadores = containerDoadores;
      }
    },

    criarWidget(config) {
      const container = document.createElement('div');
      container.style.cssText = config.container;
      
      const iframe = document.createElement('iframe');
      iframe.src = `https://widget.livepix.gg/embed/${config.id}`;
      iframe.style.cssText = config.iframe;
      iframe.allowTransparency = true;
      iframe.allow = 'autoplay; encrypted-media';
      
      container.appendChild(iframe);
      return container;
    },

    configurarEventListeners() {
      // Observador para ajustar posição do QR Code em páginas de perfil
      const observador = new MutationObserver(() => {
        if (this.containerQR) {
          const ehPaginaPerfil = window.location.pathname.includes('/profile');
          this.containerQR.style.bottom = ehPaginaPerfil ? '0px' : '60px';
        }
      });

      observador.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
      });
    }
  };

  // ========== SISTEMA DE SPLASH SCREEN ==========
  const TelaSplash = {
    mostrar() {
      const splash = document.createElement('div');
      splash.id = 'typeflow-splash';
      splash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: ${CONFIGURACOES.coresModoEscuro.fundo};
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000001;
        font-family: 'Inter', system-ui, sans-serif;
        color: ${CONFIGURACOES.coresModoEscuro.texto};
        transition: opacity 0.5s ease;
      `;

      splash.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 20px;">🌀</div>
          <h1 style="font-size: 28px; margin-bottom: 10px; color: ${CONFIGURACOES.coresModoEscuro.textoImportante};">Type Flow</h1>
          <p style="color: ${CONFIGURACOES.coresModoEscuro.textoClaro}; margin-bottom: 30px;">Ferramenta de Redação Avançada</p>
          <div style="
            width: 60px;
            height: 4px;
            background: ${CONFIGURACOES.coresModoEscuro.gradiente};
            border-radius: 2px;
            margin: 0 auto;
            position: relative;
            overflow: hidden;
          ">
            <div id="progresso-splash" style="
              position: absolute;
              top: 0;
              left: 0;
              height: 100%;
              background: ${CONFIGURACOES.coresModoEscuro.primaria};
              width: 0%;
              transition: width 0.3s ease;
            "></div>
          </div>
          <p style="color: ${CONFIGURACOES.coresModoEscuro.textoClaro}; font-size: 12px; margin-top: 20px;">Carregando recursos...</p>
        </div>
      `;

      document.body.appendChild(splash);
      this.splash = splash;
      this.animarProgresso();
    },

    animarProgresso() {
      const progresso = document.getElementById('progresso-splash');
      let largura = 0;
      
      const intervalo = setInterval(() => {
        largura += Math.random() * 15;
        if (largura >= 100) {
          largura = 100;
          clearInterval(intervalo);
        }
        progresso.style.width = largura + '%';
      }, 200);
    },

    esconder() {
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

  // ========== SISTEMA DE NOTIFICAÇÕES ==========
  const SistemaNotificacoes = {
    mostrar(mensagem, duracao = 3000, posicao = 'top') {
      const notificacao = document.createElement('div');
      notificacao.style.cssText = `
        position: fixed;
        ${posicao === 'top' ? 'top: 20px' : 'bottom: 20px'};
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: ${CONFIGURACOES.coresModoEscuro.superficie};
        color: ${CONFIGURACOES.coresModoEscuro.texto};
        padding: 12px 20px;
        border-radius: 12px;
        border: 1px solid ${CONFIGURACOES.coresModoEscuro.borda};
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

      notificacao.innerHTML = `
        <span>${this.obterIcone(mensagem)}</span>
        <span>${mensagem}</span>
      `;

      document.body.appendChild(notificacao);

      // Animar entrada
      setTimeout(() => {
        notificacao.style.opacity = '1';
        notificacao.style.transform = 'translateX(-50%) translateY(0)';
      }, 100);

      // Remover após duração
      setTimeout(() => {
        notificacao.style.opacity = '0';
        notificacao.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
          if (notificacao.parentNode) {
            notificacao.parentNode.removeChild(notificacao);
          }
        }, 300);
      }, duracao);
    },

    obterIcone(mensagem) {
      if (mensagem.includes('✅') || mensagem.includes('sucesso')) return '✅';
      if (mensagem.includes('❌') || mensagem.includes('erro')) return '❌';
      if (mensagem.includes('⭐') || mensagem.includes('bem-vindo')) return '⭐';
      if (mensagem.includes('🚀')) return '🚀';
      if (mensagem.includes('🌿')) return '🌿';
      if (mensagem.includes('🎁')) return '🎁';
      if (mensagem.includes('📚')) return '📚';
      return 'ℹ️';
    }
  };

  // ========== RASTREADOR DE FPS ==========
  const RastreadorFPS = {
    fps: 0,
    contadorQuadros: 0,
    ultimoTempo: performance.now(),
    elementoFPS: null,

    iniciar() {
      this.criarDisplayFPS();
      this.iniciarRastreamento();
    },

    criarDisplayFPS() {
      this.elementoFPS = document.createElement('div');
      this.elementoFPS.id = 'typeflow-fps';
      this.elementoFPS.style.cssText = `
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
      document.body.appendChild(this.elementoFPS);
      this.atualizarDisplay();
    },

    iniciarRastreamento() {
      const atualizarFPS = () => {
        this.contadorQuadros++;
        const tempoAtual = performance.now();
        
        if (tempoAtual - this.ultimoTempo >= 1000) {
          this.fps = Math.round((this.contadorQuadros * 1000) / (tempoAtual - this.ultimoTempo));
          this.contadorQuadros = 0;
          this.ultimoTempo = tempoAtual;
          this.atualizarDisplay();
        }
        
        requestAnimationFrame(atualizarFPS);
      };
      
      requestAnimationFrame(atualizarFPS);
    },

    atualizarDisplay() {
      if (this.elementoFPS) {
        const milissegundos = Math.round(1000 / Math.max(this.fps, 1));
        this.elementoFPS.innerHTML = `
          <div style="line-height: 1.4;">
            <div>FPS: ${this.fps}</div>
            <div>MS: ${milissegundos}ms</div>
            <div style="font-size: 10px; opacity: 0.8;">@_zx.lipe_</div>
          </div>
        `;
      }
    }
  };

  // ========== GESTÃO DE ESTADO ==========
  const GerenciadorEstado = {
    estado: {
      modoAtual: 'escuro',
      informacoesCapturadas: {},
      aplicandoEstilos: false,
      observadorAtivo: false,
      metaPalavras: 200,
      popupVisivel: true,
      digitando: false,
      filaDigitacao: [],
      minimizado: false,
      telaSplashMostrada: false,
      tutorialMostrado: false
    },
    
    atualizarEstado(novoEstado) {
      this.estado = { ...this.estado, ...novoEstado };
      this.notificarObservadores();
    },
    
    observadores: [],
    inscrever(callback) {
      this.observadores.push(callback);
    },
    
    notificarObservadores() {
      this.observadores.forEach(callback => callback(this.estado));
    },

    obterEstado() {
      return this.estado;
    }
  };

  // ========== SISTEMA DE UTILITÁRIOS ==========
  const Utilitarios = {
    debounce(funcao, espera) {
      let timeout;
      return function executarFuncao(...args) {
        const depois = () => {
          clearTimeout(timeout);
          funcao(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(depois, espera);
      };
    },

    async executarComSeguranca(operacao, mensagemErro) {
      try {
        return await operacao();
      } catch (erro) {
        console.error(`${mensagemErro}:`, erro);
        SistemaNotificacoes.mostrar(`❌ ${mensagemErro}`, 4000);
        return null;
      }
    },

    throttle(funcao, limite) {
      let emThrottle;
      return function(...args) {
        if (!emThrottle) {
          funcao.apply(this, args);
          emThrottle = true;
          setTimeout(() => emThrottle = false, limite);
        }
      };
    },

    obterTamanho(tamanhoBase) {
      return tamanhoBase * tamanhoPopup;
    },

    atraso(milissegundos) {
      return new Promise(resolve => setTimeout(resolve, milissegundos));
    }
  };

  // ========== GERENCIAMENTO DE TEMA ==========
  const GerenciadorTema = {
    alternarModoEscuro() {
      const estado = GerenciadorEstado.obterEstado();
      if (estado.modoAtual === 'escuro') {
        this.desativarModoEscuro();
      } else {
        this.ativarModoEscuroUniversal();
      }
    },

    ativarModoEscuroUniversal() {
      const estado = GerenciadorEstado.obterEstado();
      if (estado.aplicandoEstilos) return;
      GerenciadorEstado.atualizarEstado({ aplicandoEstilos: true, observadorAtivo: false });
      
      GerenciadorEstado.atualizarEstado({ modoAtual: 'escuro' });
      localStorage.setItem('toolpad-mode', 'escuro');
      document.documentElement.setAttribute('data-toolpad-color-scheme', 'escuro');
      this.aplicarEstilosModoEscuro();
      
      if (window.botaoModoEscuro) {
        window.botaoModoEscuro.innerHTML = '☀️';
        window.botaoModoEscuro.title = 'Alternar para Modo Claro';
      }
      
      setTimeout(() => {
        GerenciadorEstado.atualizarEstado({ observadorAtivo: true, aplicandoEstilos: false });
      }, 1000);
      
      SistemaNotificacoes.mostrar('🌙 Modo escuro ativado', 2000);
    },

    desativarModoEscuro() {
      const estado = GerenciadorEstado.obterEstado();
      if (estado.aplicandoEstilos) return;
      GerenciadorEstado.atualizarEstado({ aplicandoEstilos: true, observadorAtivo: false });
      
      GerenciadorEstado.atualizarEstado({ modoAtual: 'claro' });
      localStorage.removeItem('toolpad-mode');
      document.documentElement.removeAttribute('data-toolpad-color-scheme');
      
      const estilosEscuro = document.querySelectorAll('[data-modo-escuro="universal"]');
      estilosEscuro.forEach(style => style.remove());
      
      if (window.botaoModoEscuro) {
        window.botaoModoEscuro.innerHTML = '🌙';
        window.botaoModoEscuro.title = 'Alternar para Modo Escuro';
      }
      
      setTimeout(() => {
        GerenciadorEstado.atualizarEstado({ observadorAtivo: true, aplicandoEstilos: false });
      }, 1000);
      
      SistemaNotificacoes.mostrar('☀️ Modo claro ativado', 2000);
    },

    aplicarEstilosModoEscuro() {
      const estilosAnteriores = document.querySelectorAll('[data-modo-escuro="universal"]');
      estilosAnteriores.forEach(style => style.remove());
      
      const estiloEscuroUniversal = `
        body {
            background-color: ${CONFIGURACOES.coresModoEscuro.fundo} !important;
            color: ${CONFIGURACOES.coresModoEscuro.texto} !important;
        }
        [class*="MuiBox-root"], [class*="MuiPaper-root"], [class*="MuiCard-root"],
        [class*="container"], [class*="Container"], .main-content-container {
            background-color: ${CONFIGURACOES.coresModoEscuro.superficie} !important;
            color: ${CONFIGURACOES.coresModoEscuro.texto} !important;
        }
        [class*="MuiTypography"], p, span, div, h1, h2, h3, h4, h5, h6 {
            color: ${CONFIGURACOES.coresModoEscuro.texto} !important;
        }
        [class*="MuiInput"], [class*="MuiTextField"], input, textarea, select {
            background-color: ${CONFIGURACOES.coresModoEscuro.cartao} !important;
            color: ${CONFIGURACOES.coresModoEscuro.texto} !important;
            border-color: ${CONFIGURACOES.coresModoEscuro.borda} !important;
        }
      `;
      
      const styleSheet = document.createElement('style');
      styleSheet.setAttribute('data-modo-escuro', 'universal');
      styleSheet.textContent = estiloEscuroUniversal;
      document.head.appendChild(styleSheet);
    }
  };

  // ========== CAPTURA DE INFORMAÇÕES ==========
  const CapturaInformacoes = {
    capturarInformacoes() {
      const containers = document.querySelectorAll('div.css-skkg69');
      const informacoes = {};
      
      containers.forEach(container => {
        const elementoLabel = container.querySelector('p.MuiTypography-body1');
        const elementoValor = container.querySelector('p.MuiTypography-body2');
        
        if (elementoLabel && elementoValor) {
          const label = elementoLabel.textContent.replace(':', '').trim().toLowerCase();
          const valor = elementoValor.textContent.trim();
          informacoes[label] = valor;
          
          if (label.includes('palavras') || label.includes('número')) {
            const match = valor.match(/(\d+)/);
            if (match) {
              GerenciadorEstado.atualizarEstado({ metaPalavras: parseInt(match[1]) });
            }
          }
        }
      });
      
      GerenciadorEstado.atualizarEstado({ informacoesCapturadas: informacoes });
      return informacoes;
    },

    gerarPromptIA() {
      const estado = GerenciadorEstado.obterEstado();
      const genero = estado.informacoesCapturadas.gênero || 'desconhecido';
      const tema = estado.informacoesCapturadas.tema || 'desconhecido';
      const palavras = estado.informacoesCapturadas['número de palavras'] || estado.metaPalavras;
      
      return `Faça um texto do gênero ${genero} sobre ${tema} de ${palavras} palavras, com um título.`;
    },

    async copiarPromptParaAreaTransferencia() {
      const prompt = this.gerarPromptIA();
      
      try {
        await navigator.clipboard.writeText(prompt);
        SistemaNotificacoes.mostrar('✅ Prompt copiado para a área de transferência!', 3000);
      } catch (err) {
        const areaTexto = document.createElement('textarea');
        areaTexto.value = prompt;
        document.body.appendChild(areaTexto);
        areaTexto.select();
        try {
          document.execCommand('copy');
          SistemaNotificacoes.mostrar('✅ Prompt copiado para a área de transferência!', 3000);
        } catch (erroFallback) {
          SistemaNotificacoes.mostrar('❌ Erro ao copiar. Aqui está o prompt:<br><br>' + prompt, 6000);
        }
        document.body.removeChild(areaTexto);
      }
    }
  };

  // ========== SISTEMA DE DESBLOQUEIO DE COLAGEM ==========
  const DesbloqueadorColagem = {
    iniciar() {
      this.desbloquearColagem();
      this.configurarObservadorColagem();
    },

    desbloquearColagem() {
      console.log('🔓 Iniciando desbloqueio de colagem...');
      
      const campos = document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]');
      
      campos.forEach(campo => {
        campo.removeAttribute('onpaste');
        campo.removeAttribute('oncopy');
        campo.removeAttribute('oncut');
        
        campo.onpaste = null;
        campo.oncopy = null;
        campo.oncut = null;
        
        campo.addEventListener('paste', e => e.stopPropagation(), true);
        campo.addEventListener('copy', e => e.stopPropagation(), true);
        campo.addEventListener('cut', e => e.stopPropagation(), true);
      });
      
      console.log(`🔓 Bloqueios removidos de ${campos.length} campos`);
      
      setTimeout(() => {
        this.desbloqueioNuclear();
      }, 2000);
    },

    desbloqueioNuclear() {
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

    configurarObservadorColagem() {
      const observador = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              if (node.tagName === 'TEXTAREA' || node.tagName === 'INPUT') {
                this.desbloquearColagem();
              } else if (node.querySelectorAll) {
                const campos = node.querySelectorAll('textarea, input[type="text"]');
                if (campos.length > 0) {
                  this.desbloquearColagem();
                }
              }
            }
          });
        });
      });

      observador.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  };

  // ========== SISTEMA DE ARRASTAR ==========
  class GerenciadorArrastar {
    constructor(elemento) {
      this.elemento = elemento;
      this.arrastando = false;
      this.deslocamento = { x: 0, y: 0 };
      this.vincularEventos();
    }
    
    vincularEventos() {
      const cabecalho = this.elemento.querySelector('.tf-cabecalho');
      if (!cabecalho) return;

      cabecalho.addEventListener('mousedown', this.iniciarArrastar.bind(this));
      document.addEventListener('mousemove', Utilitarios.throttle(this.arrastar.bind(this), 16));
      document.addEventListener('mouseup', this.pararArrastar.bind(this));
      
      cabecalho.addEventListener('touchstart', this.iniciarArrastar.bind(this));
      document.addEventListener('touchmove', Utilitarios.throttle(this.arrastar.bind(this), 16));
      document.addEventListener('touchend', this.pararArrastar.bind(this));
    }
    
    iniciarArrastar(e) {
      this.arrastando = true;
      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;
      const rect = this.elemento.getBoundingClientRect();
      
      this.deslocamento.x = clientX - rect.left;
      this.deslocamento.y = clientY - rect.top;
      
      document.body.style.userSelect = 'none';
      this.elemento.style.transition = 'none';
    }
    
    arrastar(e) {
      if (!this.arrastando) return;
      
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      if (!clientX || !clientY) return;
      
      let esquerda = clientX - this.deslocamento.x;
      let topo = clientY - this.deslocamento.y;
      
      esquerda = Math.max(8, Math.min(window.innerWidth - this.elemento.offsetWidth - 8, esquerda));
      topo = Math.max(8, Math.min(window.innerHeight - this.elemento.offsetHeight - 8, topo));
      
      this.elemento.style.left = esquerda + 'px';
      this.elemento.style.top = topo + 'px';
      this.elemento.style.right = 'auto';
      this.elemento.style.bottom = 'auto';
    }
    
    pararArrastar() {
      this.arrastando = false;
      document.body.style.userSelect = '';
      this.elemento.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }
  }

  // ========== SISTEMA DE POPUP ==========
  const GerenciadorPopup = {
    iniciar() {
      this.criarPopup();
      this.configurarEventListeners();
      this.configurarComportamentoResponsivo();
    },

    criarPopup() {
      const estado = GerenciadorEstado.obterEstado();
      const cores = estado.modoAtual === 'escuro' ? CONFIGURACOES.coresModoEscuro : CONFIGURACOES.coresModoClaro;

      const larguraAtual = Utilitarios.obterTamanho(350);
      const paddingAtual = Utilitarios.obterTamanho(16);
      const bordaArredondadaAtual = Utilitarios.obterTamanho(16);

      const popup = document.createElement('div');
      popup.id = 'typeflow-popup';
      popup.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: ${larguraAtual}px;
        background: ${cores.superficie};
        color: ${cores.texto};
        padding: ${paddingAtual}px;
        border-radius: ${bordaArredondadaAtual}px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        z-index: 999999;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid ${cores.borda};
        backdrop-filter: blur(10px);
        max-height: 80px;
        overflow: hidden;
      `;

      this.criarCabecalho(popup, cores, estado.modoAtual);
      
      document.body.appendChild(popup);
      this.popup = popup;

      new GerenciadorArrastar(popup);
    },

    criarCabecalho(popup, cores, modoAtual) {
      const cabecalho = document.createElement('div');
      cabecalho.className = 'tf-cabecalho';
      cabecalho.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${Utilitarios.obterTamanho(8)}px;
        cursor: move;
      `;
      
      // Nome Type Flow
      const tituloEl = document.createElement('div');
      tituloEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: ${Utilitarios.obterTamanho(8)}px;">
          <div style="font-size: ${Utilitarios.obterTamanho(20)}px;">🌀</div>
          <div style="font-weight: 700; font-size: ${Utilitarios.obterTamanho(16)}px; color: ${cores.textoImportante};">Type Flow</div>
        </div>
      `;
      
      const containerControles = document.createElement('div');
      containerControles.style.cssText = `display: flex; gap: ${Utilitarios.obterTamanho(8)}px; align-items: center;`;
      
      // Botão Doação
      const botaoDoacao = document.createElement('button');
      botaoDoacao.innerHTML = '❤️';
      botaoDoacao.title = 'Apoiar o projeto - Widgets ativos';
      botaoDoacao.style.cssText = `
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        border: none;
        color: white;
        font-size: ${Utilitarios.obterTamanho(16)}px;
        cursor: pointer;
        width: ${Utilitarios.obterTamanho(36)}px;
        height: ${Utilitarios.obterTamanho(36)}px;
        border-radius: ${Utilitarios.obterTamanho(10)}px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      `;
      
      // Botão Prompt IA
      const botaoPrompt = document.createElement('button');
      botaoPrompt.innerHTML = '🤖';
      botaoPrompt.title = 'Criar Prompt para IA';
      botaoPrompt.style.cssText = `
        background: ${cores.gradiente};
        border: none;
        color: white;
        font-size: ${Utilitarios.obterTamanho(16)}px;
        cursor: pointer;
        width: ${Utilitarios.obterTamanho(36)}px;
        height: ${Utilitarios.obterTamanho(36)}px;
        border-radius: ${Utilitarios.obterTamanho(10)}px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      `;
      
      // Botão Modo Claro/Escuro
      window.botaoModoEscuro = document.createElement('button');
      window.botaoModoEscuro.innerHTML = modoAtual === 'escuro' ? '☀️' : '🌙';
      window.botaoModoEscuro.title = modoAtual === 'escuro' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro';
      window.botaoModoEscuro.style.cssText = `
        background: rgba(255,255,255,0.1);
        border: none;
        color: ${cores.texto};
        font-size: ${Utilitarios.obterTamanho(16)}px;
        cursor: pointer;
        width: ${Utilitarios.obterTamanho(36)}px;
        height: ${Utilitarios.obterTamanho(36)}px;
        border-radius: ${Utilitarios.obterTamanho(10)}px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
      `;

      // Botão Tutorial
      const botaoTutorial = document.createElement('button');
      botaoTutorial.innerHTML = '🎮';
      botaoTutorial.title = 'Abrir tutorial de uso';
      botaoTutorial.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        font-size: ${Utilitarios.obterTamanho(16)}px;
        cursor: pointer;
        width: ${Utilitarios.obterTamanho(36)}px;
        height: ${Utilitarios.obterTamanho(36)}px;
        border-radius: ${Utilitarios.obterTamanho(10)}px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      `;
      
      containerControles.appendChild(botaoDoacao);
      containerControles.appendChild(botaoPrompt);
      containerControles.appendChild(window.botaoModoEscuro);
      containerControles.appendChild(botaoTutorial);
      cabecalho.appendChild(tituloEl);
      cabecalho.appendChild(containerControles);
      popup.appendChild(cabecalho);

      // Efeitos hover
      [botaoDoacao, botaoPrompt, window.botaoModoEscuro, botaoTutorial].forEach(botao => {
        botao.addEventListener('mouseenter', function() {
          this.style.transform = 'scale(1.1)';
          this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        });
        botao.addEventListener('mouseleave', function() {
          this.style.transform = 'scale(1)';
          this.style.boxShadow = 'none';
        });
      });

      this.botaoDoacao = botaoDoacao;
      this.botaoPrompt = botaoPrompt;
      this.botaoTutorial = botaoTutorial;
    },

    configurarEventListeners() {
      // Botão Modo Claro/Escuro
      window.botaoModoEscuro.addEventListener('click', () => {
        GerenciadorTema.alternarModoEscuro();
      });

      // Botão Prompt IA
      this.botaoPrompt.addEventListener('click', () => {
        Utilitarios.executarComSeguranca(() => {
          const info = CapturaInformacoes.capturarInformacoes();
          
          if (info.tema || info.gênero) {
            CapturaInformacoes.copiarPromptParaAreaTransferencia();
          } else {
            SistemaNotificacoes.mostrar('ℹ️ Nenhuma informação encontrada. Verifique se está na página de redação.', 3000);
          }
        }, 'Erro ao criar prompt');
      });

      // Botão Doação - Mostra informações
      this.botaoDoacao.addEventListener('click', () => {
        SistemaNotificacoes.mostrar('❤️ Widgets de doação sempre ativos! Obrigado pelo apoio.', 3000);
      });

      // Botão Tutorial
      this.botaoTutorial.addEventListener('click', () => {
        SistemaTutorial.mostrarTutorial();
      });
    },

    configurarComportamentoResponsivo() {
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      
      const lidarComMudancaMobile = (e) => {
        if (e.matches) {
          this.popup.style.width = 'calc(100vw - 40px)';
          this.popup.style.left = '20px';
          this.popup.style.right = '20px';
          this.popup.style.top = '20px';
          this.popup.style.bottom = 'auto';
        } else {
          this.popup.style.width = '350px';
          this.popup.style.right = '20px';
          this.popup.style.left = 'auto';
          this.popup.style.top = '20px';
          this.popup.style.bottom = 'auto';
        }
      };
      
      mediaQuery.addListener(lidarComMudancaMobile);
      lidarComMudancaMobile(mediaQuery);
    }
  };

  // ========== SISTEMA DE LIMPEZA ==========
  const GerenciadorLimpeza = {
    iniciar() {
      this.configurarLimpeza();
    },

    configurarLimpeza() {
      const limpar = () => {
        if (window.typeflowObserver) {
          window.typeflowObserver.disconnect();
        }
        const elementoFPS = document.getElementById('typeflow-fps');
        if (elementoFPS) {
          elementoFPS.remove();
        }
        const widgetDoacao = document.getElementById('livepix-doacao');
        if (widgetDoacao) {
          widgetDoacao.remove();
        }
        const widgetQR = document.getElementById('livepix-qr');
        if (widgetQR) {
          widgetQR.remove();
        }
        const widgetDoadores = document.getElementById('livepix-doadores');
        if (widgetDoadores) {
          widgetDoadores.remove();
        }
      };
      
      window.addEventListener('beforeunload', limpar);
      return limpar;
    }
  };

  // ========== INICIALIZAÇÃO ==========
  async function iniciar() {
    // Mostrar tela splash primeiro
    TelaSplash.mostrar();
    
    // Inicializar componentes principais
    await Utilitarios.atraso(1000);
    
    GerenciadorPopup.iniciar();
    DesbloqueadorColagem.iniciar();
    WidgetsLivePix.iniciar();
    GerenciadorTema.ativarModoEscuroUniversal();
    RastreadorFPS.iniciar();
    GerenciadorLimpeza.iniciar();
    
    // Configurar observer
    window.typeflowObserver = new MutationObserver(function(mutations) {
      const estado = GerenciadorEstado.obterEstado();
      if (!estado.observadorAtivo) return;
      
      if (estado.modoAtual === 'escuro') {
        const atributoAtual = document.documentElement.getAttribute('data-toolpad-color-scheme');
        if (atributoAtual !== 'escuro') {
          document.documentElement.setAttribute('data-toolpad-color-scheme', 'escuro');
        }
      }
    });

    GerenciadorEstado.atualizarEstado({ observadorAtivo: true });
    window.typeflowObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-toolpad-color-scheme']
    });

    // Mostrar notificações de boas-vindas
    await Utilitarios.atraso(500);
    SistemaNotificacoes.mostrar('🌿 Type Flow carregado com sucesso!', 3000);
    
    await Utilitarios.atraso(1000);
    SistemaNotificacoes.mostrar(`🔓 Colagem desbloqueada automaticamente`, 3000);

    await Utilitarios.atraso(1000);
    SistemaNotificacoes.mostrar(`📚 Clique em 🎮 para ver o tutorial`, 3000);

    // Esconder splash screen
    await Utilitarios.atraso(1000);
    TelaSplash.esconder();
    
    // Mostrar tutorial automaticamente na primeira vez
    setTimeout(() => {
      SistemaTutorial.mostrarTutorial();
    }, 1500);

    GerenciadorEstado.atualizarEstado({ telaSplashMostrada: true });

    console.log(`🚀 Type Flow carregado com sucesso! (${ehMobile ? 'Mobile' : 'PC'})`);
  }

  // Iniciar a aplicação
  iniciar();
})();