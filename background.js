// ========================================
// BACKGROUND.JS - Service Worker
// ========================================

class BackgroundManager {
  constructor() {
    this.processingState = null;
    this.init();
  }

  init() {
    console.log('[Background] Service worker initialized');
    
    // Listen for messages
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep channel open for async
    });

    // Listen for extension installation
    chrome.runtime.onInstalled.addListener(() => {
      console.log('[Background] Extension installed/updated');
      this.initializeStorage();
    });

    // Setup action handler (icon click)
    this.setupActionHandler();

    // Load saved state
    this.loadState();
  }

  setupActionHandler() {
    // Quando clicar no ícone, abre janela popup separada (como DivinoExpress)
    chrome.action.onClicked.addListener(async () => {
      console.log('[Background] Extension icon clicked, opening popup window...');
      
      try {
        // Verificar se já existe janela popup do painel aberta
        const allWindows = await chrome.windows.getAll({ populate: true });
        const existingPopup = allWindows.find(w => 
          w.type === 'popup' && 
          w.tabs && 
          w.tabs.some(t => t.url && t.url.includes('popup.html'))
        );
        
        if (existingPopup) {
          // Se já existe, apenas focar
          console.log('[Background] Found existing popup window, focusing...');
          await chrome.windows.update(existingPopup.id, { focused: true });
        } else {
          // Criar nova janela popup
          console.log('[Background] Creating new popup window...');
          await chrome.windows.create({
            url: chrome.runtime.getURL('popup.html'),
            type: 'popup',
            width: 480,
            height: 720,
            left: 100,
            top: 50,
            focused: true
          });
          console.log('[Background] ✅ Popup window created');
        }
      } catch (error) {
        console.error('[Background] Error opening popup window:', error);
      }
    });
  }

  async initializeStorage() {
    const result = await chrome.storage.local.get(['templates', 'settings', 'processingState']);
    
    if (!result.templates) {
      await chrome.storage.local.set({ templates: [] });
    }
    
    if (!result.settings) {
      await chrome.storage.local.set({
        settings: {
          autoDownload: false,
          notifications: true,
          showPreview: true,
          retryOnError: true,
          maxRetries: 3
        }
      });
    }
  }

  async loadState() {
    const result = await chrome.storage.local.get(['processingState']);
    if (result.processingState) {
      this.processingState = result.processingState;
      console.log('[Background] Loaded processing state:', this.processingState);
    }
  }

  async saveState() {
    await chrome.storage.local.set({ processingState: this.processingState });
  }

  async handleMessage(message, sender, sendResponse) {
    console.log('[Background] Received message:', message.type);

    try {
      switch (message.type) {
        case 'OPEN_SORA_WINDOW':
          await this.openSoraTab();
          sendResponse({ success: true, message: 'Sora window opened/focused' });
          break;

        case 'START_GENERATION':
          await this.startGeneration(message.data, sender.tab);
          sendResponse({ success: true });
          break;

        case 'PAUSE_GENERATION':
          await this.pauseGeneration();
          sendResponse({ success: true });
          break;

        case 'RESUME_GENERATION':
          await this.resumeGeneration();
          sendResponse({ success: true });
          break;

        case 'STOP_GENERATION':
          await this.stopGeneration();
          sendResponse({ success: true });
          break;

        case 'GET_QUEUE_STATUS':
          const status = await this.getQueueStatus();
          sendResponse(status);
          break;

        case 'STATUS_UPDATE':
          // Forward status update from content script to popup
          this.broadcastToPopup(message);
          sendResponse({ success: true });
          break;

        case 'QUEUE_COMPLETE':
          await this.onQueueComplete(message.data);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('[Background] Error handling message:', error);
      sendResponse({ error: error.message });
    }
  }

  async startGeneration(data, tab) {
    console.log('[Background] Starting generation with', data.prompts.length, 'prompts');

    // Find or create Sora tab
    const soraTab = await this.findOrCreateSoraTab();
    
    console.log('[Background] Sora tab ID:', soraTab.id);
    console.log('[Background] Waiting for tab to be ready...');
    
    // Wait for tab to be ready
    await this.sleep(3000);
    
    // Inject content script to ensure it's loaded
    try {
      console.log('[Background] Injecting content script...');
      await chrome.scripting.executeScript({
        target: { tabId: soraTab.id },
        files: ['content.js']
      });
      console.log('[Background] ✅ Content script injected');
      
      // Wait a bit for script to initialize
      await this.sleep(1000);
    } catch (error) {
      console.log('[Background] Content script might already be injected:', error.message);
    }
    
    // Save processing state
    this.processingState = {
      status: 'processing',
      prompts: data.prompts,
      templateId: data.templateId,
      settings: data.settings,
      startedAt: new Date().toISOString(),
      tabId: soraTab.id
    };
    await this.saveState();

    console.log('[Background] Sending START_QUEUE message to content script...');
    console.log('[Background] Data being sent:', {
      promptsCount: data.prompts.length,
      firstPrompt: data.prompts[0]
    });

    // Send message to content script
    chrome.tabs.sendMessage(soraTab.id, {
      type: 'START_QUEUE',
      data: {
        prompts: data.prompts,
        settings: data.settings
      }
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Background] Error sending message:', chrome.runtime.lastError);
      } else {
        console.log('[Background] Message sent successfully, response:', response);
      }
    });

    // Show notification
    if (data.settings.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Sora Automation',
        message: `Iniciando geração de ${data.prompts.length} vídeos`
      });
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async pauseGeneration() {
    if (!this.processingState || !this.processingState.tabId) return;

    this.processingState.status = 'paused';
    await this.saveState();

    chrome.tabs.sendMessage(this.processingState.tabId, {
      type: 'PAUSE_QUEUE'
    });
  }

  async resumeGeneration() {
    if (!this.processingState || !this.processingState.tabId) return;

    this.processingState.status = 'processing';
    await this.saveState();

    chrome.tabs.sendMessage(this.processingState.tabId, {
      type: 'RESUME_QUEUE'
    });
  }

  async stopGeneration() {
    if (!this.processingState || !this.processingState.tabId) return;

    chrome.tabs.sendMessage(this.processingState.tabId, {
      type: 'STOP_QUEUE'
    });

    this.processingState = null;
    await this.saveState();
  }

  async getQueueStatus() {
    if (!this.processingState || !this.processingState.tabId) {
      return { status: 'idle' };
    }

    try {
      const response = await chrome.tabs.sendMessage(this.processingState.tabId, {
        type: 'GET_STATUS'
      });
      return response;
    } catch (error) {
      console.error('[Background] Error getting queue status:', error);
      return { status: 'error', error: error.message };
    }
  }

  async onQueueComplete(data) {
    console.log('[Background] Queue complete:', data);

    if (this.processingState && this.processingState.settings.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Sora Automation - Concluído!',
        message: `${data.completed} vídeos gerados com sucesso!\n${data.failed > 0 ? `${data.failed} falharam.` : ''}`
      });
    }

    // Clear state
    this.processingState = null;
    await this.saveState();

    // Broadcast completion to popup
    this.broadcastToPopup({
      type: 'STATUS_UPDATE',
      data: {
        type: 'complete',
        stats: data
      }
    });
  }

  async findOrCreateSoraTab() {
    console.log('[Background] findOrCreateSoraTab called');
    
    // Procurar QUALQUER aba/janela do Sora (não apenas popup)
    const allWindows = await chrome.windows.getAll({ populate: true });
    console.log('[Background] Checking all windows for Sora tabs...');
    
    // Procurar em todas as janelas (popup, normal, etc)
    for (const window of allWindows) {
      if (window.tabs) {
        const soraTab = window.tabs.find(t => t.url && t.url.includes('sora.chatgpt.com'));
        if (soraTab) {
          console.log('[Background] ✅ Found existing Sora tab:', soraTab.id, 'in window:', window.id);
          // Focar a janela e a aba
          await chrome.windows.update(window.id, { focused: true });
          await chrome.tabs.update(soraTab.id, { active: true });
          return soraTab;
        }
      }
    }

    // Se não encontrou nenhuma aba do Sora, criar nova janela popup
    console.log('[Background] No Sora tab found, creating new popup window...');
    const newWindow = await chrome.windows.create({
      url: 'https://sora.chatgpt.com/profile',
      type: 'popup',
      width: 1200,
      height: 900,
      left: 100,
      top: 50,
      focused: true
    });

    // Aguardar página carregar
    if (newWindow.tabs && newWindow.tabs[0]) {
      const tab = newWindow.tabs[0];
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, 10000); // Max 10 seconds
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
          if (tabId === tab.id && info.status === 'complete') {
            clearTimeout(timeout);
            chrome.tabs.onUpdated.removeListener(listener);
            resolve();
          }
        });
      });
      console.log('[Background] Page loaded in new popup window');
      return tab;
    }

    return null;
  }

  async openSoraTab() {
    console.log('[Background] Opening/focusing Sora tab...');
    
    try {
      // Procurar QUALQUER aba/janela do Sora (não apenas popup)
      const allWindows = await chrome.windows.getAll({ populate: true });
      console.log('[Background] Total windows found:', allWindows.length);
      
      // Procurar em todas as janelas
      for (const window of allWindows) {
        if (window.tabs) {
          const soraTab = window.tabs.find(t => t.url && t.url.includes('sora.chatgpt.com'));
          if (soraTab) {
            console.log('[Background] ✅ Found existing Sora tab:', soraTab.id, 'in window:', window.id, 'type:', window.type);
            // Focar a janela e a aba
            await chrome.windows.update(window.id, { focused: true });
            await chrome.tabs.update(soraTab.id, { active: true });
            return { success: true, action: 'focused', windowId: window.id, tabId: soraTab.id };
          }
        }
      }
      
      // Se não encontrou, criar nova janela popup
      console.log('[Background] No Sora tab found, creating new popup window...');
      
      const newWindow = await chrome.windows.create({
        url: 'https://sora.chatgpt.com/profile',
        type: 'popup',
        width: 1200,
        height: 900,
        left: 100,
        top: 50,
        focused: true
      });
      
      console.log('[Background] ✅ Created new Sora popup window:', newWindow.id);
      console.log('[Background] Window details:', {
        id: newWindow.id,
        type: newWindow.type,
        width: newWindow.width,
        height: newWindow.height
      });
      
      return { success: true, action: 'created', windowId: newWindow.id };
      
    } catch (error) {
      console.error('[Background] ❌ Error opening Sora popup window:', error);
      console.error('[Background] Error stack:', error.stack);
      
      // Fallback: tentar criar janela normal se popup falhar
      try {
        console.log('[Background] Attempting fallback: creating normal window...');
        const fallbackWindow = await chrome.windows.create({
          url: 'https://sora.chatgpt.com/profile',
          type: 'normal',
          focused: true
        });
        console.log('[Background] ✅ Created fallback window:', fallbackWindow.id);
        return { success: true, action: 'created_fallback', windowId: fallbackWindow.id };
      } catch (fallbackError) {
        console.error('[Background] ❌ Fallback also failed:', fallbackError);
        return { success: false, error: fallbackError.message };
      }
    }
  }

  broadcastToPopup(message) {
    // Try to send to popup if it's open
    chrome.runtime.sendMessage(message).catch(() => {
      // Popup is not open, that's fine
    });
  }
}

// Initialize
const backgroundManager = new BackgroundManager();
