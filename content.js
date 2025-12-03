// ========================================
// content.js — Sora Automation v4.0.0
// MODO PENDING CHECK: Monitora slots vazios
//
// Fluxo:
// 1. Envia os primeiros 3 rapidamente
// 2. Monitora o "pending" via interceptação de rede
// 3. Quando pending === "[]", espera 5s e envia próximo
// ========================================

class SoraAutomation {
  constructor() {
    this.version = '4.0.0';
    console.log(`%c[Sora v${this.version}] ===== PENDING CHECK MODE =====`, 'color: #00ff00; font-weight: bold; font-size: 14px');

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

    // Configurações
    this.initialBurst = 3;              // Enviar 3 no início
    this.waitBetweenBurst = 3000;       // 3 segundos entre os iniciais
    this.waitAfterEmptySlot = 5000;     // 5 segundos após detectar slot vazio
    this.pendingCheckInterval = 2000;   // Checar pending a cada 2 segundos

    // Pending tracking
    this.lastPendingData = null;
    this.pendingCheckTimer = null;
    this.waitingForSlot = false;

    // Bind
    this.handleMessage = this.handleMessage.bind(this);
    this.processQueue = this.processQueue.bind(this);
    this.sendPrompt = this.sendPrompt.bind(this);
    this.checkPending = this.checkPending.bind(this);

    // Interceptar requisições de rede para capturar pending
    this.setupNetworkInterceptor();

    // Listener de mensagens
    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      this.handleMessage(msg, sendResponse);
      return true;
    });

    // Criar UI flutuante
    this.createFloatingUI();

    console.log(`[Sora v${this.version}] Ready - Modo Pending Check`);
  }

  // ============================================================
  // INTERCEPTOR DE REDE - Captura respostas de pending
  // ============================================================
  setupNetworkInterceptor() {
    const self = this;

    // Interceptar fetch
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const response = await originalFetch.apply(this, args);

      // Clonar response para ler o body
      const url = args[0]?.url || args[0];
      if (typeof url === 'string' && url.includes('pending')) {
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

    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      this._soraUrl = url;
      return originalXHROpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      if (this._soraUrl && this._soraUrl.includes('pending')) {
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

    this.log('🔌 Network interceptor ativo', 'color: #00ffaa');
  }

  // ============================================================
  // HANDLER DE PENDING
  // ============================================================
  onPendingResponse(responseText, url) {
    try {
      const data = JSON.parse(responseText);
      this.lastPendingData = data;

      // Log do pending
      const isEmpty = Array.isArray(data) && data.length === 0;
      const count = Array.isArray(data) ? data.length : '?';

      if (isEmpty) {
        console.log(`%c[Sora v${this.version}] 📭 PENDING: [] (SLOT VAZIO!)`, 'color: #00ff00; font-weight: bold');
      } else {
        console.log(`%c[Sora v${this.version}] 📬 PENDING: ${count} item(s)`, 'color: #ffaa00');
      }

      // Se estamos aguardando slot e encontramos vazio
      if (this.waitingForSlot && isEmpty) {
        this.onEmptySlotDetected();
      }

      // Atualizar UI
      this.updateFloatingUI();

    } catch (e) {
      // Não é JSON válido, ignorar
    }
  }

  // ============================================================
  // DETECÇÃO DE SLOT VAZIO
  // ============================================================
  onEmptySlotDetected() {
    if (!this.isActive || this.isPaused) return;
    if (this.currentIndex >= this.prompts.length) return;

    this.log('🎯 Slot vazio detectado! Enviando próximo em 5s...', 'color: #00ff00; font-weight: bold');
    this.waitingForSlot = false;

    // Esperar 5 segundos e enviar próximo
    setTimeout(() => {
      if (this.isActive && !this.isPaused) {
        this.sendNextPrompt();
      }
    }, this.waitAfterEmptySlot);
  }

  // ============================================================
  // FORÇAR CHECK DE PENDING
  // ============================================================
  async checkPending() {
    // Tentar fazer uma requisição que retorne o pending
    // Isso depende da API do Sora - vamos tentar recarregar a página parcialmente
    // ou simplesmente esperar o próximo request natural

    try {
      // Tentar buscar dados de pending diretamente
      const response = await fetch('https://sora.chatgpt.com/backend-api/v1/video/pending', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const text = await response.text();
        this.onPendingResponse(text, 'manual-check');
      }
    } catch (e) {
      // API pode não existir nesse path, usar scroll para forçar refresh
      this.log('📡 Aguardando atualização de pending...', 'color: #888888');
    }
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
        this.applyVideoSettings(msg.data).then(result => {
          sendResponse(result);
        }).catch(err => {
          sendResponse({ success: false, error: err.message });
        });
        return true; // Keep channel open for async response

      default:
        sendResponse({ error: 'Unknown message' });
    }
  }

  // ============================================================
  // APPLY VIDEO SETTINGS TO SORA UI
  // ============================================================
  async applyVideoSettings(settings) {
    this.log('🎛️ Aplicando configurações de vídeo...', 'color: #667eea; font-weight: bold');
    this.log(`   Model: ${settings.model}`);
    this.log(`   Orientation: ${settings.orientation}`);
    this.log(`   Duration: ${settings.duration}s`);

    try {
      // Find and click the settings dropdown button
      const settingsButton = await this.findSettingsButton();

      if (!settingsButton) {
        this.log('❌ Botão de configurações não encontrado. Elementos na página:', 'color: #ff0000');
        this.debugPageElements();
        throw new Error('Botão de configurações não encontrado. Verifique se está na página do Sora.');
      }

      this.log(`   ✅ Botão encontrado: ${settingsButton.textContent?.substring(0, 50)}`, 'color: #00ff00');

      // Click to open main dropdown
      settingsButton.click();
      await this.sleep(500);

      // Apply each setting
      const settingsToApply = [
        { name: 'Model', value: settings.model === 'sora2pro' ? 'Sora 2 Pro' : 'Sora 2' },
        { name: 'Orientation', value: settings.orientation === 'portrait' ? 'Portrait' : 'Landscape' },
        { name: 'Duration', value: settings.duration === '15' ? '15 second' : '10 second' }
      ];

      for (const setting of settingsToApply) {
        await this.applyIndividualSetting(setting.name, setting.value, settingsButton);
      }

      // Close any open dropdown by pressing Escape or clicking outside
      document.body.click();
      await this.sleep(100);

      this.log('✅ Configurações aplicadas com sucesso!', 'color: #00ff00; font-weight: bold');
      return { success: true };

    } catch (error) {
      this.error('❌ Erro ao aplicar configurações:', error);
      return { success: false, error: error.message };
    }
  }

  debugPageElements() {
    // Log useful elements for debugging
    const buttons = document.querySelectorAll('button');
    this.log(`   Buttons encontrados: ${buttons.length}`);
    buttons.forEach((btn, i) => {
      const text = btn.textContent?.trim().substring(0, 100);
      if (text && text.length > 0) {
        this.log(`   [${i}] ${text}`);
      }
    });

    const menuItems = document.querySelectorAll('[role="menuitem"], [role="menu"], [aria-haspopup]');
    this.log(`   Menu items encontrados: ${menuItems.length}`);
  }

  async findSettingsButton() {
    // Strategy 1: Find button with current settings display (e.g., "Sora 2", "Portrait", "10s")
    const allButtons = document.querySelectorAll('button');

    for (const btn of allButtons) {
      const text = btn.textContent || '';
      // Look for button that shows video settings info
      if ((text.includes('Sora 2') || text.includes('Sora2')) &&
          (text.includes('Portrait') || text.includes('Landscape') || text.includes('10') || text.includes('15'))) {
        this.log('   Encontrado via texto combinado', 'color: #00aaff');
        return btn;
      }
    }

    // Strategy 2: Find button with video-related text
    for (const btn of allButtons) {
      const text = btn.textContent || '';
      if (text.includes('Sora 2') && !text.includes('Automation')) {
        this.log('   Encontrado via "Sora 2"', 'color: #00aaff');
        return btn;
      }
    }

    // Strategy 3: Find any trigger with aria-haspopup that contains settings text
    const triggers = document.querySelectorAll('[aria-haspopup="menu"], [aria-haspopup="true"]');
    for (const trigger of triggers) {
      const text = trigger.textContent || '';
      if (text.includes('Model') || text.includes('Orientation') || text.includes('Duration') ||
          text.includes('Sora') || text.includes('Portrait') || text.includes('Landscape')) {
        this.log('   Encontrado via aria-haspopup', 'color: #00aaff');
        return trigger;
      }
    }

    // Strategy 4: Look for Radix dropdown triggers
    const radixTriggers = document.querySelectorAll('[data-radix-collection-item]');
    for (const trigger of radixTriggers) {
      const text = trigger.textContent || '';
      if (text.includes('Sora') || text.includes('Portrait') || text.includes('Landscape')) {
        this.log('   Encontrado via Radix', 'color: #00aaff');
        return trigger;
      }
    }

    // Strategy 5: Find by class patterns common in settings buttons
    const settingsSelectors = [
      'button[class*="settings"]',
      'button[class*="option"]',
      'button[class*="config"]',
      'button[class*="menu"]',
      '[class*="popover"] button',
      '[class*="dropdown"] button'
    ];

    for (const selector of settingsSelectors) {
      try {
        const el = document.querySelector(selector);
        if (el) {
          this.log(`   Encontrado via selector: ${selector}`, 'color: #00aaff');
          return el;
        }
      } catch (e) {
        // Invalid selector, skip
      }
    }

    return null;
  }

  async applyIndividualSetting(settingName, value, mainButton) {
    this.log(`   📝 Configurando ${settingName}: ${value}`);

    // Check if dropdown is open, if not open it
    let menu = document.querySelector('[role="menu"]');
    if (!menu) {
      mainButton.click();
      await this.sleep(400);
      menu = document.querySelector('[role="menu"]');
    }

    if (!menu) {
      this.log(`   ⚠️ Menu não aberto para ${settingName}`, 'color: #ffaa00');
      return;
    }

    // Find the menu item for this setting (Model, Orientation, or Duration)
    const menuItems = document.querySelectorAll('[role="menuitem"]');
    let settingTrigger = null;

    for (const item of menuItems) {
      const text = item.textContent || '';
      if (text.includes(settingName)) {
        settingTrigger = item;
        break;
      }
    }

    if (settingTrigger) {
      // Hover/click to open submenu
      settingTrigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      await this.sleep(200);
      settingTrigger.click();
      await this.sleep(400);
    }

    // Now find and click the value option
    const option = this.findOptionByValue(value);
    if (option) {
      this.log(`   ✅ Opção encontrada: ${value}`, 'color: #00ff00');
      option.click();
      await this.sleep(300);
    } else {
      this.log(`   ⚠️ Opção não encontrada: ${value}`, 'color: #ffaa00');
    }

    // Close submenu by clicking outside or pressing escape
    document.body.click();
    await this.sleep(200);
  }

  findOptionByValue(value) {
    // Look for radio menu items first (submenus typically use menuitemradio)
    const radioOptions = document.querySelectorAll('[role="menuitemradio"]');
    for (const opt of radioOptions) {
      const text = opt.textContent || '';
      if (text.toLowerCase().includes(value.toLowerCase())) {
        return opt;
      }
    }

    // Then try regular menu items
    const menuItems = document.querySelectorAll('[role="menuitem"]');
    for (const opt of menuItems) {
      const text = opt.textContent || '';
      if (text.toLowerCase().includes(value.toLowerCase())) {
        return opt;
      }
    }

    // Try finding by span text within menus
    const allSpans = document.querySelectorAll('[role="menu"] span, [data-radix-popper-content-wrapper] span');
    for (const span of allSpans) {
      const text = span.textContent || '';
      if (text.toLowerCase().includes(value.toLowerCase())) {
        // Find clickable parent
        const clickable = span.closest('[role="menuitemradio"]') ||
                         span.closest('[role="menuitem"]') ||
                         span.closest('button') ||
                         span.closest('[data-radix-collection-item]');
        if (clickable) return clickable;
      }
    }

    // Last resort: try clicking any element with matching text
    const allElements = document.querySelectorAll('*');
    for (const el of allElements) {
      if (el.children.length === 0 || el.tagName === 'SPAN') {
        const text = el.textContent || '';
        if (text.trim().toLowerCase() === value.toLowerCase() ||
            text.trim().toLowerCase().includes(value.toLowerCase())) {
          const clickable = el.closest('[role="menuitemradio"]') ||
                           el.closest('[role="menuitem"]') ||
                           el.closest('button');
          if (clickable) return clickable;
        }
      }
    }

    return null;
  }

  // ============================================================
  // QUEUE MANAGEMENT
  // ============================================================
  startQueue(data) {
    if (!data?.prompts?.length) {
      this.error('❌ Sem prompts');
      return;
    }

    this.log('🎬 Iniciando fila PENDING CHECK', 'color: #00ffff; font-weight: bold; font-size: 16px');

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

    this.log(`📋 Total de prompts: ${this.prompts.length}`);
    this.log(`⚡ Primeiros ${Math.min(this.initialBurst, this.prompts.length)} serão enviados rapidamente`);
    this.log(`📭 Depois: Aguarda pending vazio + 5s`);

    // Mostrar UI
    this.showFloatingUI();

    // Começar processamento
    this.processQueue();
  }

  stopQueue() {
    this.log('⏹️ Parando fila', 'color: #ff0000');
    this.isActive = false;
    this.waitingForSlot = false;

    if (this.pendingCheckTimer) {
      clearInterval(this.pendingCheckTimer);
      this.pendingCheckTimer = null;
    }

    this.updateFloatingUI();
  }

  pauseQueue() {
    this.log('⏸️ Pausando fila', 'color: #ffaa00');
    this.isPaused = true;
    this.updateFloatingUI();
  }

  resumeQueue() {
    this.log('▶️ Retomando fila', 'color: #00ff00');
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

    // Fase 1: BURST inicial - enviar os 3 primeiros rapidamente
    const burstCount = Math.min(this.initialBurst, this.prompts.length);

    this.log('═══════════════════════════════', 'color: #00ffff');
    this.log(`⚡ FASE BURST: Enviando ${burstCount} prompts`, 'color: #00ffff; font-weight: bold');
    this.log('═══════════════════════════════', 'color: #00ffff');

    for (let i = 0; i < burstCount && this.isActive && !this.isPaused; i++) {
      const prompt = this.prompts[this.currentIndex];
      const promptNumber = this.currentIndex + 1;

      this.log(`⚡ BURST [${promptNumber}/${burstCount}]: ${prompt.scene?.substring(0, 50) || 'Prompt'}...`, 'color: #00ffaa');

      const success = await this.sendPrompt(prompt.fullPrompt);

      if (success) {
        this.stats.sent++;
        this.currentIndex++;
        this.log(`✅ Enviado! (${this.stats.sent}/${this.prompts.length})`, 'color: #00ff00');
      } else {
        this.stats.errors++;
        this.log(`❌ Erro ao enviar`, 'color: #ff0000');
        // Tentar mesmo assim avançar
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
      this.log('═══════════════════════════════', 'color: #ffaa00');
      this.log('📭 FASE PENDING: Monitorando slots vazios', 'color: #ffaa00; font-weight: bold');
      this.log('═══════════════════════════════', 'color: #ffaa00');

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

    this.log('👀 Iniciando monitoramento de pending...', 'color: #888888');

    // Verificar periodicamente
    this.pendingCheckTimer = setInterval(() => {
      if (!this.isActive || this.isPaused) return;

      // Verificar se o último pending detectado era vazio
      if (this.lastPendingData && Array.isArray(this.lastPendingData) && this.lastPendingData.length === 0) {
        // Já detectou vazio, o handler vai processar
        return;
      }

      // Forçar check
      this.checkPending();

    }, this.pendingCheckInterval);
  }

  // ============================================================
  // ENVIO DO PRÓXIMO PROMPT
  // ============================================================
  async sendNextPrompt() {
    if (!this.isActive || this.isPaused) return;
    if (this.currentIndex >= this.prompts.length) {
      this.onComplete();
      return;
    }

    const prompt = this.prompts[this.currentIndex];
    const promptNumber = this.currentIndex + 1;

    this.log('═══════════════════════════════', 'color: #ffaa00');
    this.log(`📤 ENVIANDO [${promptNumber}/${this.prompts.length}]`, 'color: #ffaa00; font-weight: bold');
    this.log(`   • Scene: ${prompt.scene?.substring(0, 50) || 'Prompt'}...`);

    const success = await this.sendPrompt(prompt.fullPrompt);

    if (success) {
      this.stats.sent++;
      this.currentIndex++;
      this.log(`✅ Enviado! (${this.stats.sent}/${this.prompts.length})`, 'color: #00ff00');
    } else {
      this.stats.errors++;
      this.log(`❌ Erro ao enviar`, 'color: #ff0000');
      this.currentIndex++; // Avançar mesmo assim
    }

    this.updateFloatingUI();

    // Continuar monitorando pending para o próximo
    if (this.currentIndex < this.prompts.length) {
      this.waitingForSlot = true;
      this.log('👀 Aguardando próximo slot vazio...', 'color: #888888');
    } else {
      this.onComplete();
    }
  }

  // ============================================================
  // ENVIO INDIVIDUAL
  // ============================================================
  async sendPrompt(text) {
    try {
      // Aguardar página carregar
      await this.sleep(1000);

      // Buscar textarea
      const textarea = await this.findTextarea();
      if (!textarea) {
        this.error('❌ Textarea não encontrada');
        return false;
      }

      // Preencher
      this.log('   • Preenchendo prompt...');
      await this.fillTextarea(textarea, text);
      await this.sleep(1500);

      // Buscar botão
      const button = await this.findCreateButton();
      if (!button) {
        this.error('❌ Botão Create não encontrado');
        return false;
      }

      // Clicar
      this.log('   • Clicando em Create...');
      button.click();

      // Aguardar um pouco
      await this.sleep(2000);

      // Limpar textarea para próximo
      await this.fillTextarea(textarea, '');

      return true;

    } catch (err) {
      this.error('❌ Erro ao enviar:', err);
      return false;
    }
  }

  // ============================================================
  // DOM HELPERS
  // ============================================================
  async findTextarea() {
    const selectors = [
      'textarea[placeholder*="Describe" i]',
      'textarea[placeholder*="vídeo" i]',
      'textarea[placeholder*="video" i]',
      'textarea'
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && !el.disabled && el.offsetParent !== null) {
        return el;
      }
    }

    return null;
  }

  async findCreateButton() {
    const buttons = document.querySelectorAll('button');

    for (const btn of buttons) {
      if (btn.disabled) continue;

      // Buscar por span.sr-only
      const srOnly = btn.querySelector('span.sr-only');
      if (srOnly && /create video/i.test(srOnly.textContent || '')) {
        return btn;
      }

      // Buscar por aria-label
      const ariaLabel = btn.getAttribute('aria-label') || '';
      if (ariaLabel.toLowerCase().includes('create')) {
        return btn;
      }
    }

    return null;
  }

  async fillTextarea(textarea, text) {
    textarea.focus();
    await this.sleep(100);

    textarea.click();
    await this.sleep(100);

    // Usar setter nativo
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;

    if (setter) {
      setter.call(textarea, text);
    } else {
      textarea.value = text;
    }

    // Disparar eventos
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));

    await this.sleep(200);
  }

  // ============================================================
  // UI FLUTUANTE
  // ============================================================
  createFloatingUI() {
    // Remover se já existe
    const existing = document.getElementById('sora-automation-ui');
    if (existing) existing.remove();

    const ui = document.createElement('div');
    ui.id = 'sora-automation-ui';
    ui.innerHTML = `
      <div class="sora-ui-header">
        <span class="sora-ui-title">🎬 Sora Automation</span>
        <button class="sora-ui-minimize" title="Minimizar">−</button>
      </div>
      <div class="sora-ui-body">
        <div class="sora-ui-status">
          <span class="sora-ui-status-dot"></span>
          <span class="sora-ui-status-text">Aguardando...</span>
        </div>
        <div class="sora-ui-progress">
          <div class="sora-ui-progress-bar"></div>
        </div>
        <div class="sora-ui-stats">
          <span class="sora-ui-sent">0</span> enviados
          <span class="sora-ui-pending-count">| Pending: --</span>
        </div>
        <div class="sora-ui-actions">
          <button class="sora-ui-btn sora-ui-btn-pause" disabled>⏸️</button>
          <button class="sora-ui-btn sora-ui-btn-stop" disabled>⏹️</button>
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
        width: 280px;
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
        margin-bottom: 12px;
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
      minimizeBtn.textContent = ui.classList.contains('minimized') ? '+' : '−';
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
    const progressBar = ui.querySelector('.sora-ui-progress-bar');
    const sentCount = ui.querySelector('.sora-ui-sent');
    const pendingCount = ui.querySelector('.sora-ui-pending-count');
    const pauseBtn = ui.querySelector('.sora-ui-btn-pause');
    const stopBtn = ui.querySelector('.sora-ui-btn-stop');

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
    if (this.lastPendingData && Array.isArray(this.lastPendingData)) {
      pendingCount.textContent = `| Pending: ${this.lastPendingData.length}`;
      pendingCount.style.color = this.lastPendingData.length === 0 ? '#00ff00' : '#ffaa00';
    }

    // Buttons
    pauseBtn.disabled = !this.isActive;
    stopBtn.disabled = !this.isActive;
    pauseBtn.textContent = this.isPaused ? '▶️' : '⏸️';
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
  // FINALIZAÇÃO
  // ============================================================
  onComplete() {
    const totalTime = Date.now() - this.stats.startTime;
    const minutes = Math.floor(totalTime / 60000);
    const seconds = Math.floor((totalTime % 60000) / 1000);

    this.log('═══════════════════════════════', 'color: #00ff00');
    this.log('🎊 FILA COMPLETA!', 'color: #00ff00; font-weight: bold; font-size: 16px');
    this.log(`   • Total enviado: ${this.stats.sent}/${this.prompts.length}`);
    this.log(`   • Erros: ${this.stats.errors}`);
    this.log(`   • Tempo total: ${minutes}m ${seconds}s`);
    this.log('═══════════════════════════════', 'color: #00ff00');

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
      pendingCount: this.lastPendingData ? (Array.isArray(this.lastPendingData) ? this.lastPendingData.length : null) : null
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
  console.log('%c[Sora Automation] ===== v4.0.0 PENDING CHECK MODE =====', 'color: #00ff00; font-weight: bold; font-size: 14px');
  console.log('%c[Sora] ⚡ Primeiros 3: Modo BURST', 'color: #00ffaa');
  console.log('%c[Sora] 📭 Depois: Aguarda pending = [] + 5s', 'color: #ffaa00');

  const automation = new SoraAutomation();
  window._soraAutomation = automation;
})();
