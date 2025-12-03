// ========================================
// content.js — Sora Automation v5.0.0
// API MODE: Usa endpoints diretos da API
//
// Fluxo:
// 1. Intercepta headers de autenticacao
// 2. Usa POST /backend/nf/create para criar videos
// 3. Monitora GET /backend/nf/pending para slots
// ========================================

class SoraAutomation {
  constructor() {
    this.version = '5.0.0';
    console.log(`%c[Sora v${this.version}] ===== API MODE =====`, 'color: #00ff00; font-weight: bold; font-size: 14px');

    // Estado
    this.prompts = [];
    this.currentIndex = 0;
    this.isActive = false;
    this.isPaused = false;
    this.stats = {
      sent: 0,
      errors: 0,
      startTime: null
    };

    // Configuracoes de video (padrao)
    this.videoSettings = {
      model: 'sy_8',
      orientation: 'portrait',
      duration: 10, // em segundos
      size: 'small'
    };

    // Configuracoes de timing
    this.initialBurst = 3;              // Enviar 3 no inicio
    this.waitBetweenBurst = 3000;       // 3 segundos entre os iniciais
    this.waitAfterEmptySlot = 5000;     // 5 segundos apos detectar slot vazio
    this.pendingCheckInterval = 2000;   // Checar pending a cada 2 segundos

    // Pending tracking
    this.lastPendingData = null;
    this.pendingCheckTimer = null;
    this.waitingForSlot = false;

    // Headers capturados
    this.capturedHeaders = {
      authorization: null,
      'oai-device-id': null,
      'openai-sentinel-token': null
    };

    // Bind
    this.handleMessage = this.handleMessage.bind(this);
    this.processQueue = this.processQueue.bind(this);
    this.sendPromptViaAPI = this.sendPromptViaAPI.bind(this);
    this.checkPending = this.checkPending.bind(this);

    // Interceptar requisicoes de rede para capturar headers
    this.setupNetworkInterceptor();

    // Listener de mensagens
    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      this.handleMessage(msg, sendResponse);
      return true;
    });

    // Criar UI flutuante
    this.createFloatingUI();

    // Tentar extrair device-id do cookie
    this.extractDeviceIdFromCookie();

    console.log(`[Sora v${this.version}] Ready - API Mode`);
  }

  // ============================================================
  // EXTRAIR DEVICE ID DO COOKIE
  // ============================================================
  extractDeviceIdFromCookie() {
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'oai-did') {
          this.capturedHeaders['oai-device-id'] = value;
          this.log(`Device ID extraido do cookie: ${value.substring(0, 8)}...`, 'color: #00ff00');
          break;
        }
      }
    } catch (e) {
      this.error('Erro ao extrair device ID do cookie:', e);
    }
  }

  // ============================================================
  // INTERCEPTOR DE REDE - Captura headers e respostas
  // ============================================================
  setupNetworkInterceptor() {
    const self = this;

    // Interceptar fetch para capturar headers
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const url = args[0]?.url || args[0];
      const options = args[1] || {};

      // Capturar headers de requisicoes para o backend do Sora
      if (typeof url === 'string' && url.includes('sora.chatgpt.com')) {
        const headers = options.headers || {};

        // Capturar Authorization
        if (headers.authorization || headers.Authorization) {
          self.capturedHeaders.authorization = headers.authorization || headers.Authorization;
          self.log('Authorization capturado!', 'color: #00ff00');
        }

        // Capturar oai-device-id
        if (headers['oai-device-id']) {
          self.capturedHeaders['oai-device-id'] = headers['oai-device-id'];
        }

        // Capturar openai-sentinel-token
        if (headers['openai-sentinel-token']) {
          self.capturedHeaders['openai-sentinel-token'] = headers['openai-sentinel-token'];
        }
      }

      const response = await originalFetch.apply(this, args);

      // Processar respostas de pending
      if (typeof url === 'string' && (url.includes('/nf/pending') || url.includes('/pending'))) {
        try {
          const clone = response.clone();
          const text = await clone.text();
          self.onPendingResponse(text, url);
        } catch (e) {
          // Ignorar erros de parsing
        }
      }

      return response;
    };

    // Interceptar XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    const originalXHRSetHeader = XMLHttpRequest.prototype.setRequestHeader;

    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      this._soraUrl = url;
      this._soraMethod = method;
      this._soraHeaders = {};
      return originalXHROpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
      if (this._soraUrl && this._soraUrl.includes('sora.chatgpt.com')) {
        this._soraHeaders[name.toLowerCase()] = value;

        if (name.toLowerCase() === 'authorization') {
          self.capturedHeaders.authorization = value;
        }
        if (name.toLowerCase() === 'oai-device-id') {
          self.capturedHeaders['oai-device-id'] = value;
        }
        if (name.toLowerCase() === 'openai-sentinel-token') {
          self.capturedHeaders['openai-sentinel-token'] = value;
        }
      }
      return originalXHRSetHeader.apply(this, [name, value]);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      if (this._soraUrl && (this._soraUrl.includes('/nf/pending') || this._soraUrl.includes('/pending'))) {
        this.addEventListener('load', function() {
          try {
            self.onPendingResponse(this.responseText, this._soraUrl);
          } catch (e) {
            // Ignorar
          }
        });
      }
      return originalXHRSend.apply(this, args);
    };

    this.log('Network interceptor ativo (captura headers + pending)', 'color: #00ffaa');
  }

  // ============================================================
  // HANDLER DE PENDING
  // ============================================================
  onPendingResponse(responseText, url) {
    try {
      const data = JSON.parse(responseText);
      this.lastPendingData = data;

      // O endpoint /nf/pending retorna um array de tasks
      const tasks = Array.isArray(data) ? data : (data.tasks || data.items || []);
      const isEmpty = tasks.length === 0;
      const runningCount = tasks.filter(t => t.status === 'running' || t.status === 'pending').length;

      if (isEmpty) {
        console.log(`%c[Sora v${this.version}] PENDING: [] (SLOT VAZIO!)`, 'color: #00ff00; font-weight: bold');
      } else {
        console.log(`%c[Sora v${this.version}] PENDING: ${runningCount} task(s) running/pending`, 'color: #ffaa00');
      }

      // Se estamos aguardando slot e encontramos vazio
      if (this.waitingForSlot && isEmpty) {
        this.onEmptySlotDetected();
      }

      // Atualizar UI
      this.updateFloatingUI();

    } catch (e) {
      // Nao e JSON valido, ignorar
    }
  }

  // ============================================================
  // DETECCAO DE SLOT VAZIO
  // ============================================================
  onEmptySlotDetected() {
    if (!this.isActive || this.isPaused) return;
    if (this.currentIndex >= this.prompts.length) return;

    this.log('Slot vazio detectado! Enviando proximo em 5s...', 'color: #00ff00; font-weight: bold');
    this.waitingForSlot = false;

    // Esperar 5 segundos e enviar proximo
    setTimeout(() => {
      if (this.isActive && !this.isPaused) {
        this.sendNextPrompt();
      }
    }, this.waitAfterEmptySlot);
  }

  // ============================================================
  // FORCAR CHECK DE PENDING
  // ============================================================
  async checkPending() {
    try {
      const headers = this.buildHeaders();

      if (!headers.authorization) {
        this.log('Aguardando captura de authorization...', 'color: #888888');
        return;
      }

      const response = await fetch('https://sora.chatgpt.com/backend/nf/pending', {
        method: 'GET',
        credentials: 'include',
        headers: headers
      });

      if (response.ok) {
        const text = await response.text();
        this.onPendingResponse(text, 'manual-check');
      }
    } catch (e) {
      this.log('Aguardando atualizacao de pending...', 'color: #888888');
    }
  }

  // ============================================================
  // CONSTRUIR HEADERS PARA REQUISICOES
  // ============================================================
  buildHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.capturedHeaders.authorization) {
      headers['Authorization'] = this.capturedHeaders.authorization;
    }

    if (this.capturedHeaders['oai-device-id']) {
      headers['oai-device-id'] = this.capturedHeaders['oai-device-id'];
    }

    if (this.capturedHeaders['openai-sentinel-token']) {
      headers['openai-sentinel-token'] = this.capturedHeaders['openai-sentinel-token'];
    }

    return headers;
  }

  // ============================================================
  // MESSAGE HANDLER
  // ============================================================
  handleMessage(msg, sendResponse) {
    switch (msg.type) {
      case 'START_QUEUE':
        this.startQueue(msg.data);
        sendResponse({ success: true });
        break;

      case 'STOP_QUEUE':
        this.stopQueue();
        sendResponse({ success: true });
        break;

      case 'PAUSE_QUEUE':
        this.pauseQueue();
        sendResponse({ success: true });
        break;

      case 'RESUME_QUEUE':
        this.resumeQueue();
        sendResponse({ success: true });
        break;

      case 'GET_STATUS':
        sendResponse(this.getStatus());
        break;

      case 'APPLY_VIDEO_SETTINGS':
        this.applyVideoSettings(msg.data);
        sendResponse({ success: true });
        break;

      case 'GET_DRAFTS':
        this.getDrafts().then(drafts => {
          sendResponse({ success: true, drafts });
        }).catch(err => {
          sendResponse({ success: false, error: err.message });
        });
        return true;

      default:
        sendResponse({ error: 'Unknown message' });
    }
  }

  // ============================================================
  // APLICAR CONFIGURACOES DE VIDEO
  // ============================================================
  applyVideoSettings(settings) {
    this.log('Aplicando configuracoes de video...', 'color: #667eea; font-weight: bold');

    // Mapear orientacao
    if (settings.orientation) {
      this.videoSettings.orientation = settings.orientation; // portrait, landscape, square
    }

    // Mapear duracao para n_frames
    if (settings.duration) {
      const durationSec = parseInt(settings.duration);
      // 150 = 5s, 300 = 10s, 450 = 20s (30 frames por segundo)
      this.videoSettings.duration = durationSec;
    }

    // Mapear modelo
    if (settings.model) {
      // sora2 -> sy_8, sora2pro -> outro valor se existir
      this.videoSettings.model = settings.model === 'sora2pro' ? 'sy_8_pro' : 'sy_8';
    }

    this.log(`   Model: ${this.videoSettings.model}`);
    this.log(`   Orientation: ${this.videoSettings.orientation}`);
    this.log(`   Duration: ${this.videoSettings.duration}s`);
  }

  // ============================================================
  // OBTER DRAFTS CONCLUIDOS
  // ============================================================
  async getDrafts(limit = 15) {
    try {
      const headers = this.buildHeaders();

      const response = await fetch(`https://sora.chatgpt.com/backend/project_y/profile/drafts?limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (e) {
      this.error('Erro ao obter drafts:', e);
      throw e;
    }
  }

  // ============================================================
  // QUEUE MANAGEMENT
  // ============================================================
  startQueue(data) {
    if (!data?.prompts?.length) {
      this.error('Sem prompts');
      return;
    }

    this.log('Iniciando fila API MODE', 'color: #00ffff; font-weight: bold; font-size: 16px');

    // Aplicar configuracoes de video se fornecidas
    if (data.settings?.videoSettings) {
      this.applyVideoSettings(data.settings.videoSettings);
    }

    // Reset
    this.prompts = data.prompts;
    this.currentIndex = 0;
    this.isActive = true;
    this.isPaused = false;
    this.waitingForSlot = false;
    this.stats = {
      sent: 0,
      errors: 0,
      startTime: Date.now()
    };

    this.log(`Total de prompts: ${this.prompts.length}`);
    this.log(`Primeiros ${Math.min(this.initialBurst, this.prompts.length)} serao enviados rapidamente`);
    this.log(`Depois: Aguarda pending vazio + 5s`);

    // Mostrar UI
    this.showFloatingUI();

    // Comecar processamento
    this.processQueue();
  }

  stopQueue() {
    this.log('Parando fila', 'color: #ff0000');
    this.isActive = false;
    this.waitingForSlot = false;

    if (this.pendingCheckTimer) {
      clearInterval(this.pendingCheckTimer);
      this.pendingCheckTimer = null;
    }

    this.updateFloatingUI();
  }

  pauseQueue() {
    this.log('Pausando fila', 'color: #ffaa00');
    this.isPaused = true;
    this.updateFloatingUI();
  }

  resumeQueue() {
    this.log('Retomando fila', 'color: #00ff00');
    this.isPaused = false;
    this.updateFloatingUI();

    // Se estava aguardando slot, continuar
    if (this.waitingForSlot) {
      this.startPendingMonitor();
    }
  }

  // ============================================================
  // PROCESSAMENTO DA FILA
  // ============================================================
  async processQueue() {
    if (!this.isActive) return;

    // Verificar se temos headers necessarios
    if (!this.capturedHeaders.authorization) {
      this.log('Aguardando captura de headers... Faca uma acao na pagina (ex: clique em algo)', 'color: #ffaa00');

      // Tentar novamente em 2 segundos
      setTimeout(() => {
        if (this.isActive && !this.capturedHeaders.authorization) {
          this.processQueue();
        } else if (this.isActive) {
          this.processQueue();
        }
      }, 2000);
      return;
    }

    // Fase 1: BURST inicial - enviar os 3 primeiros rapidamente
    const burstCount = Math.min(this.initialBurst, this.prompts.length);

    this.log('===============================', 'color: #00ffff');
    this.log(`FASE BURST: Enviando ${burstCount} prompts via API`, 'color: #00ffff; font-weight: bold');
    this.log('===============================', 'color: #00ffff');

    for (let i = 0; i < burstCount && this.isActive && !this.isPaused; i++) {
      const prompt = this.prompts[this.currentIndex];
      const promptNumber = this.currentIndex + 1;

      this.log(`BURST [${promptNumber}/${burstCount}]: ${prompt.scene?.substring(0, 50) || 'Prompt'}...`, 'color: #00ffaa');

      const success = await this.sendPromptViaAPI(prompt.fullPrompt);

      if (success) {
        this.stats.sent++;
        this.currentIndex++;
        this.log(`Enviado via API! (${this.stats.sent}/${this.prompts.length})`, 'color: #00ff00');
      } else {
        this.stats.errors++;
        this.log(`Erro ao enviar via API`, 'color: #ff0000');
        this.currentIndex++;
      }

      this.updateFloatingUI();

      // Pequena pausa entre envios do burst
      if (i < burstCount - 1 && this.isActive && !this.isPaused) {
        await this.sleep(this.waitBetweenBurst);
      }
    }

    // Fase 2: Modo PENDING CHECK
    if (this.currentIndex < this.prompts.length && this.isActive) {
      this.log('===============================', 'color: #ffaa00');
      this.log('FASE PENDING: Monitorando slots vazios', 'color: #ffaa00; font-weight: bold');
      this.log('===============================', 'color: #ffaa00');

      this.waitingForSlot = true;
      this.startPendingMonitor();
    } else if (this.currentIndex >= this.prompts.length) {
      this.onComplete();
    }
  }

  // ============================================================
  // MONITOR DE PENDING
  // ============================================================
  startPendingMonitor() {
    // Limpar timer anterior
    if (this.pendingCheckTimer) {
      clearInterval(this.pendingCheckTimer);
    }

    this.log('Iniciando monitoramento de pending...', 'color: #888888');

    // Verificar periodicamente
    this.pendingCheckTimer = setInterval(() => {
      if (!this.isActive || this.isPaused) return;

      // Verificar se o ultimo pending detectado era vazio
      const tasks = Array.isArray(this.lastPendingData) ? this.lastPendingData :
                    (this.lastPendingData?.tasks || this.lastPendingData?.items || []);

      if (tasks.length === 0) {
        // Ja detectou vazio, o handler vai processar
        return;
      }

      // Forcar check
      this.checkPending();

    }, this.pendingCheckInterval);
  }

  // ============================================================
  // ENVIO DO PROXIMO PROMPT
  // ============================================================
  async sendNextPrompt() {
    if (!this.isActive || this.isPaused) return;
    if (this.currentIndex >= this.prompts.length) {
      this.onComplete();
      return;
    }

    const prompt = this.prompts[this.currentIndex];
    const promptNumber = this.currentIndex + 1;

    this.log('===============================', 'color: #ffaa00');
    this.log(`ENVIANDO [${promptNumber}/${this.prompts.length}]`, 'color: #ffaa00; font-weight: bold');
    this.log(`   Scene: ${prompt.scene?.substring(0, 50) || 'Prompt'}...`);

    const success = await this.sendPromptViaAPI(prompt.fullPrompt);

    if (success) {
      this.stats.sent++;
      this.currentIndex++;
      this.log(`Enviado via API! (${this.stats.sent}/${this.prompts.length})`, 'color: #00ff00');
    } else {
      this.stats.errors++;
      this.log(`Erro ao enviar via API`, 'color: #ff0000');
      this.currentIndex++; // Avancar mesmo assim
    }

    this.updateFloatingUI();

    // Continuar monitorando pending para o proximo
    if (this.currentIndex < this.prompts.length) {
      this.waitingForSlot = true;
      this.log('Aguardando proximo slot vazio...', 'color: #888888');
    } else {
      this.onComplete();
    }
  }

  // ============================================================
  // ENVIO VIA API DIRETA
  // ============================================================
  async sendPromptViaAPI(promptText) {
    try {
      const headers = this.buildHeaders();

      if (!headers.Authorization) {
        this.error('Authorization header nao disponivel. Faca uma acao na pagina primeiro.');
        return false;
      }

      // Calcular n_frames baseado na duracao
      // 150 = 5s, 300 = 10s, 450 = 20s
      let nFrames = 300; // padrao 10s
      if (this.videoSettings.duration === 5) nFrames = 150;
      else if (this.videoSettings.duration === 10) nFrames = 300;
      else if (this.videoSettings.duration === 15) nFrames = 450;
      else if (this.videoSettings.duration === 20) nFrames = 600;

      const payload = {
        kind: 'video',
        prompt: promptText,
        title: null,
        orientation: this.videoSettings.orientation, // portrait, landscape, square
        size: this.videoSettings.size || 'small',
        n_frames: nFrames,
        inpaint_items: [],
        remix_target_id: null,
        metadata: null,
        cameo_ids: null,
        cameo_replacements: null,
        model: this.videoSettings.model || 'sy_8',
        style_id: null,
        audio_caption: null,
        audio_transcript: null,
        video_caption: null,
        storyboard_id: null
      };

      this.log(`Payload: ${JSON.stringify(payload).substring(0, 100)}...`, 'color: #888888');

      const response = await fetch('https://sora.chatgpt.com/backend/nf/create', {
        method: 'POST',
        credentials: 'include',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        this.log(`API Response OK: ${JSON.stringify(result).substring(0, 100)}`, 'color: #00ff00');
        return true;
      } else {
        const errorText = await response.text();
        this.error(`API Error ${response.status}: ${errorText.substring(0, 200)}`);
        return false;
      }

    } catch (err) {
      this.error('Erro ao enviar via API:', err);
      return false;
    }
  }

  // ============================================================
  // UI FLUTUANTE
  // ============================================================
  createFloatingUI() {
    // Remover se ja existe
    const existing = document.getElementById('sora-automation-ui');
    if (existing) existing.remove();

    const ui = document.createElement('div');
    ui.id = 'sora-automation-ui';
    ui.innerHTML = `
      <div class="sora-ui-header">
        <span class="sora-ui-title">Sora Automation v${this.version}</span>
        <button class="sora-ui-minimize" title="Minimizar">-</button>
      </div>
      <div class="sora-ui-body">
        <div class="sora-ui-status">
          <span class="sora-ui-status-dot"></span>
          <span class="sora-ui-status-text">Aguardando...</span>
        </div>
        <div class="sora-ui-auth">
          <span class="sora-ui-auth-status">Auth: --</span>
        </div>
        <div class="sora-ui-progress">
          <div class="sora-ui-progress-bar"></div>
        </div>
        <div class="sora-ui-stats">
          <span class="sora-ui-sent">0</span> enviados
          <span class="sora-ui-pending-count">| Pending: --</span>
        </div>
        <div class="sora-ui-actions">
          <button class="sora-ui-btn sora-ui-btn-pause" disabled>||</button>
          <button class="sora-ui-btn sora-ui-btn-stop" disabled>X</button>
        </div>
      </div>
    `;

    // Estilos
    const style = document.createElement('style');
    style.textContent = `
      #sora-automation-ui {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 300px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 999999;
        overflow: hidden;
        display: none;
        animation: slideUp 0.3s ease-out;
      }

      #sora-automation-ui.visible {
        display: block;
      }

      #sora-automation-ui.minimized .sora-ui-body {
        display: none;
      }

      @keyframes slideUp {
        from { transform: translateY(100px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      .sora-ui-header {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
      }

      .sora-ui-title {
        color: white;
        font-weight: 600;
        font-size: 14px;
      }

      .sora-ui-minimize {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .sora-ui-minimize:hover {
        background: rgba(255,255,255,0.3);
      }

      .sora-ui-body {
        padding: 16px;
      }

      .sora-ui-status {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .sora-ui-auth {
        margin-bottom: 12px;
        font-size: 11px;
      }

      .sora-ui-auth-status {
        color: #888;
      }

      .sora-ui-auth-status.captured {
        color: #00ff00;
      }

      .sora-ui-status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #888;
      }

      .sora-ui-status-dot.active {
        background: #00ff00;
        animation: pulse 1.5s infinite;
      }

      .sora-ui-status-dot.waiting {
        background: #ffaa00;
        animation: pulse 1.5s infinite;
      }

      .sora-ui-status-dot.paused {
        background: #ff6600;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      .sora-ui-status-text {
        color: #fff;
        font-size: 13px;
      }

      .sora-ui-progress {
        background: rgba(255,255,255,0.1);
        height: 8px;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 12px;
      }

      .sora-ui-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        width: 0%;
        transition: width 0.3s ease;
      }

      .sora-ui-stats {
        color: rgba(255,255,255,0.7);
        font-size: 12px;
        margin-bottom: 12px;
      }

      .sora-ui-sent {
        color: #00ff00;
        font-weight: bold;
      }

      .sora-ui-pending-count {
        color: #ffaa00;
      }

      .sora-ui-actions {
        display: flex;
        gap: 8px;
      }

      .sora-ui-btn {
        flex: 1;
        padding: 10px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .sora-ui-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .sora-ui-btn-pause {
        background: rgba(255,170,0,0.2);
        color: #ffaa00;
      }

      .sora-ui-btn-pause:hover:not(:disabled) {
        background: rgba(255,170,0,0.3);
      }

      .sora-ui-btn-stop {
        background: rgba(255,0,0,0.2);
        color: #ff4444;
      }

      .sora-ui-btn-stop:hover:not(:disabled) {
        background: rgba(255,0,0,0.3);
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(ui);

    // Event listeners
    const minimizeBtn = ui.querySelector('.sora-ui-minimize');
    const pauseBtn = ui.querySelector('.sora-ui-btn-pause');
    const stopBtn = ui.querySelector('.sora-ui-btn-stop');

    minimizeBtn.addEventListener('click', () => {
      ui.classList.toggle('minimized');
      minimizeBtn.textContent = ui.classList.contains('minimized') ? '+' : '-';
    });

    pauseBtn.addEventListener('click', () => {
      if (this.isPaused) {
        this.resumeQueue();
      } else {
        this.pauseQueue();
      }
    });

    stopBtn.addEventListener('click', () => {
      if (confirm('Parar a fila?')) {
        this.stopQueue();
      }
    });

    // Drag
    this.makeDraggable(ui);
  }

  showFloatingUI() {
    const ui = document.getElementById('sora-automation-ui');
    if (ui) {
      ui.classList.add('visible');
    }
  }

  hideFloatingUI() {
    const ui = document.getElementById('sora-automation-ui');
    if (ui) {
      ui.classList.remove('visible');
    }
  }

  updateFloatingUI() {
    const ui = document.getElementById('sora-automation-ui');
    if (!ui) return;

    const statusDot = ui.querySelector('.sora-ui-status-dot');
    const statusText = ui.querySelector('.sora-ui-status-text');
    const authStatus = ui.querySelector('.sora-ui-auth-status');
    const progressBar = ui.querySelector('.sora-ui-progress-bar');
    const sentCount = ui.querySelector('.sora-ui-sent');
    const pendingCount = ui.querySelector('.sora-ui-pending-count');
    const pauseBtn = ui.querySelector('.sora-ui-btn-pause');
    const stopBtn = ui.querySelector('.sora-ui-btn-stop');

    // Atualizar status de autenticacao
    if (this.capturedHeaders.authorization) {
      authStatus.textContent = 'Auth: Capturado';
      authStatus.className = 'sora-ui-auth-status captured';
    } else {
      authStatus.textContent = 'Auth: Aguardando...';
      authStatus.className = 'sora-ui-auth-status';
    }

    // Atualizar status
    statusDot.className = 'sora-ui-status-dot';

    if (!this.isActive) {
      statusText.textContent = 'Aguardando...';
    } else if (this.isPaused) {
      statusDot.classList.add('paused');
      statusText.textContent = 'Pausado';
    } else if (this.waitingForSlot) {
      statusDot.classList.add('waiting');
      statusText.textContent = 'Aguardando slot vazio...';
    } else {
      statusDot.classList.add('active');
      statusText.textContent = `Enviando ${this.currentIndex + 1}/${this.prompts.length}`;
    }

    // Progress
    const progress = this.prompts.length > 0 ? (this.stats.sent / this.prompts.length) * 100 : 0;
    progressBar.style.width = `${progress}%`;

    // Stats
    sentCount.textContent = this.stats.sent;

    // Pending count
    const tasks = Array.isArray(this.lastPendingData) ? this.lastPendingData :
                  (this.lastPendingData?.tasks || this.lastPendingData?.items || []);
    pendingCount.textContent = `| Pending: ${tasks.length}`;
    pendingCount.style.color = tasks.length === 0 ? '#00ff00' : '#ffaa00';

    // Buttons
    pauseBtn.disabled = !this.isActive;
    stopBtn.disabled = !this.isActive;
    pauseBtn.textContent = this.isPaused ? '>' : '||';
  }

  makeDraggable(element) {
    const header = element.querySelector('.sora-ui-header');
    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - element.offsetLeft;
      offsetY = e.clientY - element.offsetTop;
      element.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      element.style.left = (e.clientX - offsetX) + 'px';
      element.style.top = (e.clientY - offsetY) + 'px';
      element.style.right = 'auto';
      element.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      element.style.transition = '';
    });
  }

  // ============================================================
  // FINALIZACAO
  // ============================================================
  onComplete() {
    const totalTime = Date.now() - this.stats.startTime;
    const minutes = Math.floor(totalTime / 60000);
    const seconds = Math.floor((totalTime % 60000) / 1000);

    this.log('===============================', 'color: #00ff00');
    this.log('FILA COMPLETA!', 'color: #00ff00; font-weight: bold; font-size: 16px');
    this.log(`   Total enviado: ${this.stats.sent}/${this.prompts.length}`);
    this.log(`   Erros: ${this.stats.errors}`);
    this.log(`   Tempo total: ${minutes}m ${seconds}s`);
    this.log('===============================', 'color: #00ff00');

    this.isActive = false;
    this.waitingForSlot = false;

    if (this.pendingCheckTimer) {
      clearInterval(this.pendingCheckTimer);
      this.pendingCheckTimer = null;
    }

    this.updateFloatingUI();

    // Notificar popup
    chrome.runtime.sendMessage({
      type: 'QUEUE_COMPLETE',
      data: {
        completed: this.stats.sent,
        failed: this.stats.errors,
        total: this.prompts.length
      }
    });
  }

  // ============================================================
  // STATUS
  // ============================================================
  getStatus() {
    const tasks = Array.isArray(this.lastPendingData) ? this.lastPendingData :
                  (this.lastPendingData?.tasks || this.lastPendingData?.items || []);

    return {
      isActive: this.isActive,
      isPaused: this.isPaused,
      version: this.version,
      mode: this.waitingForSlot ? 'PENDING_CHECK' : 'BURST',
      total: this.prompts.length,
      current: this.currentIndex,
      sent: this.stats.sent,
      errors: this.stats.errors,
      remaining: this.prompts.length - this.currentIndex,
      pendingCount: tasks.length,
      hasAuth: !!this.capturedHeaders.authorization
    };
  }

  // ============================================================
  // LOGGING
  // ============================================================
  log(message, style = '') {
    const prefix = `[Sora v${this.version}]`;
    if (style) {
      console.log(`%c${prefix} ${message}`, style);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  error(message, err = null) {
    console.error(`[Sora v${this.version}] ${message}`, err || '');
  }

  sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
}

// ========================================
// BOOTSTRAP
// ========================================
(() => {
  console.log('%c[Sora Automation] ===== v5.0.0 API MODE =====', 'color: #00ff00; font-weight: bold; font-size: 14px');
  console.log('%c[Sora] Usando endpoints diretos da API', 'color: #00ffaa');
  console.log('%c[Sora] POST /backend/nf/create | GET /backend/nf/pending', 'color: #ffaa00');

  const automation = new SoraAutomation();
  window._soraAutomation = automation;
})();
