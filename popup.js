// ========================================
// POPUP.JS - Interface Principal
// ========================================

// ========================================
// BIBLIOTECA DE PROMPTS - DADOS
// ========================================

const bibliotecaPrompts = [
  {
    id: "ugc_realista",
    titulo: "UGC Realista",
    descricao: "Avatar falando de forma natural e realista para camera",
    icone: "🎬",
    categoria: "UGC",
    placeholder: "Ex: Oi gente, tudo bem?",
    promptBase: "Video ugc realista, pessoa falando para camera, iluminacao natural, qualidade 4k, expressao natural, fundo clean"
  },
  {
    id: "ugc_entusiasmado",
    titulo: "UGC Entusiasmado",
    descricao: "Pessoa animada apresentando algo com energia",
    icone: "🤩",
    categoria: "UGC",
    placeholder: "Ex: Voces nao vao acreditar nisso!",
    promptBase: "Video ugc energetico, pessoa muito animada falando para camera, gesticulando, expressao empolgada, iluminacao vibrante, 4k"
  },
  {
    id: "ugc_review",
    titulo: "UGC Review",
    descricao: "Review autentico de produto ou servico",
    icone: "⭐",
    categoria: "UGC",
    placeholder: "Ex: Esse produto mudou minha vida",
    promptBase: "Video review autentico, pessoa mostrando produto, expressao sincera, iluminacao natural, ambiente domestico, qualidade 4k"
  },
  {
    id: "cinematic_epic",
    titulo: "Cinematografico Epico",
    descricao: "Cenas cinematograficas com visual dramatico",
    icone: "🎥",
    categoria: "Cinematic",
    placeholder: "Ex: Heroi caminhando em direcao ao por do sol",
    promptBase: "Cinematic epic scene, dramatic lighting, movie quality, wide angle, lens flare, depth of field, 4k cinematic"
  },
  {
    id: "cinematic_slow",
    titulo: "Slow Motion Dramatico",
    descricao: "Cenas em camera lenta com impacto visual",
    icone: "🎞️",
    categoria: "Cinematic",
    placeholder: "Ex: Gota de agua caindo em uma flor",
    promptBase: "Slow motion cinematic, dramatic lighting, high speed camera effect, detailed textures, professional cinematography, 4k"
  },
  {
    id: "cinematic_noir",
    titulo: "Film Noir",
    descricao: "Estilo classico de cinema noir",
    icone: "🖤",
    categoria: "Cinematic",
    placeholder: "Ex: Detetive acendendo um cigarro na chuva",
    promptBase: "Film noir style, black and white, dramatic shadows, venetian blinds lighting, 1940s aesthetic, cinematic composition"
  },
  {
    id: "produto_showcase",
    titulo: "Showcase de Produto",
    descricao: "Apresentacao elegante de produtos",
    icone: "📦",
    categoria: "Produto",
    placeholder: "Ex: Perfume de luxo dourado",
    promptBase: "Product showcase, clean background, professional studio lighting, rotating view, premium feel, 4k quality"
  },
  {
    id: "produto_lifestyle",
    titulo: "Produto Lifestyle",
    descricao: "Produto em contexto de uso real",
    icone: "🛍️",
    categoria: "Produto",
    placeholder: "Ex: Tenis esportivo em uma corrida",
    promptBase: "Product in lifestyle context, natural environment, authentic usage, cinematic lighting, aspirational feel, 4k"
  },
  {
    id: "produto_unboxing",
    titulo: "Unboxing Premium",
    descricao: "Experiencia de unboxing satisfatoria",
    icone: "📬",
    categoria: "Produto",
    placeholder: "Ex: Caixa de iPhone sendo aberta",
    promptBase: "Premium unboxing experience, hands opening box, satisfying reveal, clean aesthetic, soft lighting, ASMR feel, 4k"
  },
  {
    id: "lifestyle_wellness",
    titulo: "Lifestyle Wellness",
    descricao: "Momentos de bem-estar e autocuidado",
    icone: "🧘",
    categoria: "Lifestyle",
    placeholder: "Ex: Pessoa meditando ao nascer do sol",
    promptBase: "Wellness lifestyle, peaceful atmosphere, soft natural lighting, mindfulness moment, serene environment, 4k quality"
  },
  {
    id: "lifestyle_travel",
    titulo: "Travel Vlog",
    descricao: "Cenas de viagem e aventura",
    icone: "✈️",
    categoria: "Lifestyle",
    placeholder: "Ex: Turista admirando a Torre Eiffel",
    promptBase: "Travel vlog style, point of view shot, wanderlust aesthetic, golden hour lighting, adventure vibes, 4k cinematic"
  },
  {
    id: "lifestyle_food",
    titulo: "Food Content",
    descricao: "Comida apetitosa e gastronomia",
    icone: "🍕",
    categoria: "Lifestyle",
    placeholder: "Ex: Pizza saindo do forno com queijo derretendo",
    promptBase: "Food photography style, appetizing, steam rising, macro details, professional food lighting, 4k quality"
  },
  {
    id: "tutorial_tech",
    titulo: "Tutorial Tech",
    descricao: "Demonstracao de tecnologia e apps",
    icone: "📱",
    categoria: "Tutorial",
    placeholder: "Ex: Dedo tocando em um app na tela",
    promptBase: "Tech tutorial style, screen recording feel, clean interface, finger tapping, modern device, professional lighting, 4k"
  },
  {
    id: "tutorial_howto",
    titulo: "How To / DIY",
    descricao: "Passo a passo de como fazer algo",
    icone: "🔧",
    categoria: "Tutorial",
    placeholder: "Ex: Maos montando um movel",
    promptBase: "How to tutorial, hands demonstrating, step by step, clear view, instructional style, good lighting, 4k"
  },
  {
    id: "meme_viral",
    titulo: "Meme Viral",
    descricao: "Conteudo engracado estilo meme",
    icone: "😂",
    categoria: "Meme",
    placeholder: "Ex: Gato surpreso olhando para camera",
    promptBase: "Viral meme style, funny unexpected moment, expressive reaction, shareable content, internet humor aesthetic"
  },
  {
    id: "meme_reaction",
    titulo: "Reaction Video",
    descricao: "Reacoes exageradas e expressivas",
    icone: "😱",
    categoria: "Meme",
    placeholder: "Ex: Pessoa com expressao de choque total",
    promptBase: "Reaction video style, exaggerated facial expression, dramatic zoom, meme-worthy moment, expressive"
  },
  {
    id: "meme_trend",
    titulo: "TikTok Trend",
    descricao: "Estilo de trend viral do TikTok",
    icone: "🎵",
    categoria: "Meme",
    placeholder: "Ex: Pessoa fazendo transicao de roupa",
    promptBase: "TikTok trend style, transition effect, trendy aesthetic, vertical video feel, energetic, viral potential"
  }
];

// ========================================
// PROMPT LIBRARY MANAGER
// ========================================

class PromptLibraryManager {
  constructor() {
    this.templates = bibliotecaPrompts;
    this.selectedTemplate = null;
    this.promptQuantity = 3;
    this.userInputs = [];
  }

  getAll(filter = {}) {
    let filtered = [...this.templates];

    if (filter.categoria) {
      filtered = filtered.filter(t => t.categoria === filter.categoria);
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.titulo.toLowerCase().includes(search) ||
        t.descricao.toLowerCase().includes(search) ||
        t.categoria.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  get(id) {
    return this.templates.find(t => t.id === id);
  }

  selectTemplate(id) {
    this.selectedTemplate = this.get(id);
    return this.selectedTemplate;
  }

  setQuantity(qty) {
    this.promptQuantity = Math.max(1, Math.min(10, qty));
    this.userInputs = new Array(this.promptQuantity).fill('');
    return this.promptQuantity;
  }

  setUserInput(index, value) {
    if (index >= 0 && index < this.userInputs.length) {
      this.userInputs[index] = value;
    }
  }

  generatePrompts() {
    if (!this.selectedTemplate) return [];

    return this.userInputs.map((input, index) => {
      const userText = input.trim() || `[Prompt ${index + 1}]`;
      return {
        index: index + 1,
        userInput: userText,
        fullPrompt: `"${userText}"\n${this.selectedTemplate.promptBase}`
      };
    });
  }

  getGeneratedPromptsForQueue() {
    if (!this.selectedTemplate) return [];

    return this.userInputs
      .filter(input => input.trim())
      .map(input => ({
        scene: input.trim(),
        fullPrompt: `"${input.trim()}"\n${this.selectedTemplate.promptBase}`
      }));
  }
}

class TemplateManager {
  constructor() {
    this.templates = [];
    this.currentEditingId = null;
  }

  async loadTemplates() {
    const result = await chrome.storage.local.get(['templates']);
    this.templates = result.templates || [];
    return this.templates;
  }

  async saveTemplates() {
    await chrome.storage.local.set({ templates: this.templates });
  }

  create(templateData) {
    const template = {
      id: this.generateId(),
      name: templateData.name,
      description: templateData.description || '',
      category: templateData.category || 'custom',
      prefix: templateData.prefix || '',
      variable: '{scene}',
      suffix: templateData.suffix || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      favorite: templateData.favorite || false,
      exampleInput: templateData.exampleInput || '',
      exampleOutput: this.generatePrompt(templateData.prefix, templateData.exampleInput, templateData.suffix)
    };
    
    this.templates.push(template);
    this.saveTemplates();
    return template;
  }

  update(id, changes) {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return null;

    this.templates[index] = {
      ...this.templates[index],
      ...changes,
      updatedAt: new Date().toISOString()
    };

    if (changes.prefix || changes.suffix || changes.exampleInput) {
      const t = this.templates[index];
      t.exampleOutput = this.generatePrompt(t.prefix, t.exampleInput, t.suffix);
    }

    this.saveTemplates();
    return this.templates[index];
  }

  delete(id) {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    this.templates.splice(index, 1);
    this.saveTemplates();
    return true;
  }

  get(id) {
    return this.templates.find(t => t.id === id);
  }

  getAll(filter = {}) {
    let filtered = [...this.templates];

    if (filter.category) {
      filtered = filtered.filter(t => t.category === filter.category);
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search)
      );
    }

    if (filter.favorite) {
      filtered = filtered.filter(t => t.favorite);
    }

    return filtered;
  }

  duplicate(id) {
    const template = this.get(id);
    if (!template) return null;

    const duplicated = {
      ...template,
      id: this.generateId(),
      name: `${template.name} (cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    };

    this.templates.push(duplicated);
    this.saveTemplates();
    return duplicated;
  }

  generatePrompt(prefix, scene, suffix) {
    return `${prefix}${scene}${suffix}`.trim();
  }

  applyToScene(templateId, sceneText) {
    const template = this.get(templateId);
    if (!template) return sceneText;

    template.usageCount++;
    this.saveTemplates();

    return this.generatePrompt(template.prefix, sceneText, template.suffix);
  }

  generateId() {
    return 'template_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  exportTemplates() {
    return JSON.stringify(this.templates, null, 2);
  }

  importTemplates(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      if (!Array.isArray(imported)) throw new Error('Invalid format');
      
      imported.forEach(t => {
        t.id = this.generateId(); // Gera novos IDs
        this.templates.push(t);
      });
      
      this.saveTemplates();
      return true;
    } catch (error) {
      console.error('Error importing templates:', error);
      return false;
    }
  }
}

// ========================================
// UI Manager
// ========================================

class UIManager {
  constructor() {
    this.templateManager = new TemplateManager();
    this.promptLibrary = new PromptLibraryManager();
    this.currentTab = 'scenes';
    this.selectedTemplateId = null;
    this.scenes = [];
    this.processingState = null;

    // Video settings state
    this.videoSettings = {
      model: 'sora2',
      orientation: 'portrait',
      duration: '10'
    };

    this.initElements();
    this.initEventListeners();
    this.initVideoSettings();
    this.initLibrary();
    this.init();
  }

  initElements() {
    // Tabs
    this.tabButtons = document.querySelectorAll('.tab-btn');
    this.tabContents = document.querySelectorAll('.tab-content');

    // Scenes tab
    this.templateSelect = document.getElementById('template-select');
    this.scenesInput = document.getElementById('scenes-input');
    this.sceneCounter = document.getElementById('scene-counter');
    this.templateInfo = document.getElementById('template-info');
    this.previewPromptsBtn = document.getElementById('preview-prompts-btn');
    this.startGenerationBtn = document.getElementById('start-generation-btn');
    this.statusDisplay = document.getElementById('status-display');
    this.progressContainer = document.getElementById('progress-container');
    this.queueList = document.getElementById('queue-list');
    this.controlButtons = document.getElementById('control-buttons');
    this.pauseBtn = document.getElementById('pause-btn');
    this.stopBtn = document.getElementById('stop-btn');

    // Templates tab
    this.newTemplateBtn = document.getElementById('new-template-btn');
    this.templatesList = document.getElementById('templates-list');
    this.templateSearch = document.getElementById('template-search');
    this.categoryFilter = document.getElementById('category-filter');
    this.manageTemplatesBtn = document.getElementById('manage-templates-btn');

    // Template modal
    this.templateModal = document.getElementById('template-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.templateNameInput = document.getElementById('template-name-input');
    this.templateDescriptionInput = document.getElementById('template-description-input');
    this.templateCategoryInput = document.getElementById('template-category-input');
    this.templatePrefixInput = document.getElementById('template-prefix-input');
    this.templateSuffixInput = document.getElementById('template-suffix-input');
    this.templateExampleInput = document.getElementById('template-example-input');
    this.templateResultDisplay = document.getElementById('template-result-display');
    this.templateStats = document.getElementById('template-stats');
    this.templateFavoriteInput = document.getElementById('template-favorite-input');
    this.saveTemplateBtn = document.getElementById('save-template-btn');
    this.cancelTemplateBtn = document.getElementById('cancel-template-btn');

    // Preview modal
    this.previewModal = document.getElementById('preview-modal');
    this.previewList = document.getElementById('preview-list');
    this.confirmPreviewBtn = document.getElementById('confirm-preview-btn');
    this.backPreviewBtn = document.getElementById('back-preview-btn');

    // Settings
    this.autoDownloadCheckbox = document.getElementById('auto-download');
    this.notificationsCheckbox = document.getElementById('notifications');
    this.showPreviewCheckbox = document.getElementById('show-preview');
    this.retryOnErrorCheckbox = document.getElementById('retry-on-error');
    this.maxRetriesInput = document.getElementById('max-retries');
    this.exportTemplatesBtn = document.getElementById('export-templates-btn');
    this.importTemplatesBtn = document.getElementById('import-templates-btn');
    this.importFileInput = document.getElementById('import-file-input');

    // Modal close buttons
    this.modalCloseButtons = document.querySelectorAll('.modal-close');

    // Library elements
    this.openLibraryBtn = document.getElementById('open-library-btn');
    this.libraryModal = document.getElementById('library-modal');
    this.libraryGrid = document.getElementById('library-grid');
    this.librarySearch = document.getElementById('library-search');
    this.libraryCategoryFilter = document.getElementById('library-category-filter');

    // Config modal elements
    this.promptConfigModal = document.getElementById('prompt-config-modal');
    this.configTemplateIcon = document.getElementById('config-template-icon');
    this.configTemplateTitle = document.getElementById('config-template-title');
    this.configTemplateDesc = document.getElementById('config-template-desc');
    this.promptQuantityInput = document.getElementById('prompt-quantity');
    this.qtyMinusBtn = document.getElementById('qty-minus');
    this.qtyPlusBtn = document.getElementById('qty-plus');
    this.dynamicFieldsContainer = document.getElementById('dynamic-fields-container');
    this.promptsPreviewList = document.getElementById('prompts-preview-list');
    this.backToLibraryBtn = document.getElementById('back-to-library-btn');
    this.generateSequenceBtn = document.getElementById('generate-sequence-btn');
  }

  initEventListeners() {
    // Tabs
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    // Scenes input
    this.scenesInput.addEventListener('input', () => this.updateSceneCount());
    this.templateSelect.addEventListener('change', () => this.onTemplateSelect());
    this.manageTemplatesBtn.addEventListener('click', () => this.switchTab('templates'));
    
    // Buttons
    this.previewPromptsBtn.addEventListener('click', () => this.showPreviewModal());
    this.startGenerationBtn.addEventListener('click', () => this.startGeneration());
    this.pauseBtn.addEventListener('click', () => this.pauseGeneration());
    this.stopBtn.addEventListener('click', () => this.stopGeneration());

    // Templates
    this.newTemplateBtn.addEventListener('click', () => this.openTemplateModal());
    this.templateSearch.addEventListener('input', () => this.renderTemplates());
    this.categoryFilter.addEventListener('change', () => this.renderTemplates());
    
    // Template modal
    this.saveTemplateBtn.addEventListener('click', () => this.saveTemplate());
    this.cancelTemplateBtn.addEventListener('click', () => this.closeTemplateModal());
    this.templatePrefixInput.addEventListener('input', () => this.updateTemplatePreview());
    this.templateSuffixInput.addEventListener('input', () => this.updateTemplatePreview());
    this.templateExampleInput.addEventListener('input', () => this.updateTemplatePreview());

    // Preview modal
    this.confirmPreviewBtn.addEventListener('click', () => this.confirmAndStart());
    this.backPreviewBtn.addEventListener('click', () => this.closePreviewModal());

    // Settings
    this.autoDownloadCheckbox.addEventListener('change', () => this.saveSettings());
    this.notificationsCheckbox.addEventListener('change', () => this.saveSettings());
    this.showPreviewCheckbox.addEventListener('change', () => this.saveSettings());
    this.retryOnErrorCheckbox.addEventListener('change', () => this.saveSettings());
    this.maxRetriesInput.addEventListener('change', () => this.saveSettings());
    
    this.exportTemplatesBtn.addEventListener('click', () => this.exportTemplates());
    this.importTemplatesBtn.addEventListener('click', () => this.importFileInput.click());
    this.importFileInput.addEventListener('change', (e) => this.importTemplates(e));

    // Modal close
    this.modalCloseButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeTemplateModal();
        this.closePreviewModal();
        this.closeLibraryModal();
        this.closeConfigModal();
      });
    });

    // Close modals only with close button (not on outside click)

    // Listen for messages from background/content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'QUEUE_UPDATE') {
        this.updateQueueDisplay(message.data);
      } else if (message.type === 'STATUS_UPDATE') {
        this.updateStatusDisplay(message.data);
      }
    });
  }

  // ========================================
  // Video Settings Management
  // ========================================

  initVideoSettings() {
    // Get all setting triggers
    const settingTriggers = document.querySelectorAll('.setting-trigger');

    settingTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const settingItem = trigger.closest('.video-setting-item');
        const isOpen = settingItem.classList.contains('open');

        // Close all other dropdowns
        this.closeAllVideoDropdowns();

        // Toggle current dropdown
        if (!isOpen) {
          settingItem.classList.add('open');
        }
      });
    });

    // Handle dropdown option clicks
    const dropdownOptions = document.querySelectorAll('.dropdown-option');
    dropdownOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = option.closest('.setting-dropdown');
        const settingItem = option.closest('.video-setting-item');
        const settingType = settingItem.querySelector('.setting-trigger').dataset.setting;
        const value = option.dataset.value;

        // Update selection
        this.selectVideoOption(settingType, value, dropdown, settingItem);

        // Close dropdown
        settingItem.classList.remove('open');
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.video-setting-item')) {
        this.closeAllVideoDropdowns();
      }
    });

    // Load saved video settings
    this.loadVideoSettings();

    // Apply configuration button
    const applyConfigBtn = document.getElementById('apply-config-btn');
    if (applyConfigBtn) {
      applyConfigBtn.addEventListener('click', () => this.applyConfiguration());
    }
  }

  async applyConfiguration() {
    const applyBtn = document.getElementById('apply-config-btn');
    const originalContent = applyBtn.innerHTML;

    // Set loading state
    applyBtn.classList.add('loading');
    applyBtn.innerHTML = '<div class="spinner"></div> Aplicando...';
    applyBtn.disabled = true;

    try {
      // Get current active tab (should be Sora)
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.url?.includes('sora')) {
        throw new Error('Abra a página do Sora primeiro!');
      }

      // Send message to content script to apply settings
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'APPLY_VIDEO_SETTINGS',
        data: this.videoSettings
      });

      if (response?.success) {
        // Success state
        applyBtn.classList.remove('loading');
        applyBtn.classList.add('success');
        applyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Configuração Aplicada!
        `;

        // Reset after 2 seconds
        setTimeout(() => {
          applyBtn.classList.remove('success');
          applyBtn.innerHTML = originalContent;
          applyBtn.disabled = false;
        }, 2000);

        this.showNotification('Configurações aplicadas com sucesso!', 'success');
      } else {
        throw new Error(response?.error || 'Erro ao aplicar configurações');
      }

    } catch (error) {
      console.error('[Popup] Error applying config:', error);
      applyBtn.classList.remove('loading');
      applyBtn.innerHTML = originalContent;
      applyBtn.disabled = false;
      this.showNotification(error.message || 'Erro ao aplicar configurações', 'error');
    }
  }

  closeAllVideoDropdowns() {
    document.querySelectorAll('.video-setting-item.open').forEach(item => {
      item.classList.remove('open');
    });
  }

  selectVideoOption(settingType, value, dropdown, settingItem) {
    // Remove selected class from all options in this dropdown
    dropdown.querySelectorAll('.dropdown-option').forEach(opt => {
      opt.classList.remove('selected');
    });

    // Add selected class to clicked option
    const selectedOption = dropdown.querySelector(`[data-value="${value}"]`);
    selectedOption.classList.add('selected');

    // Update displayed value
    const valueDisplay = settingItem.querySelector('.setting-value');

    // Update the state
    this.videoSettings[settingType] = value;

    // Update display text based on setting type
    switch(settingType) {
      case 'model':
        const modelText = value === 'sora2pro' ? 'Sora 2 Pro' : 'Sora 2';
        valueDisplay.textContent = modelText;
        // Show/hide info icon for Sora 2
        const infoIcon = settingItem.querySelector('#model-info-icon');
        if (infoIcon) {
          infoIcon.style.display = value === 'sora2' ? 'inline-flex' : 'none';
        }
        break;

      case 'orientation':
        const orientationText = value === 'portrait' ? 'Portrait' : 'Landscape';
        valueDisplay.textContent = orientationText;
        // Update the icon in the trigger
        this.updateOrientationIcon(value);
        break;

      case 'duration':
        valueDisplay.textContent = value + 's';
        break;
    }

    // Save to storage
    this.saveVideoSettings();
  }

  updateOrientationIcon(orientation) {
    const iconContainer = document.getElementById('orientation-icon');
    if (!iconContainer) return;

    if (orientation === 'portrait') {
      iconContainer.innerHTML = '<path fill="currentColor" d="M10.759 1h2.482c.805 0 1.47 0 2.01.044.563.046 1.08.145 1.565.392a4 4 0 0 1 1.748 1.748c.247.485.346 1.002.392 1.564C19 5.29 19 5.954 19 6.758v10.483c0 .805 0 1.47-.044 2.01-.046.563-.145 1.08-.392 1.565a4 4 0 0 1-1.748 1.748c-.485.247-1.002.346-1.564.392-.541.044-1.206.044-2.01.044h-2.483c-.805 0-1.47 0-2.01-.044-.563-.046-1.08-.145-1.565-.392a4 4 0 0 1-1.748-1.748c-.247-.485-.346-1.002-.392-1.564C5 18.71 5 18.046 5 17.242V6.758c0-.805 0-1.47.044-2.01.046-.563.145-1.08.392-1.565a4 4 0 0 1 1.748-1.748c.485-.247 1.002-.346 1.564-.392C9.29 1 9.954 1 10.758 1M8.91 3.038c-.438.035-.663.1-.819.18a2 2 0 0 0-.874.874c-.08.156-.145.38-.18.819C7 5.361 7 5.943 7 6.8v10.4c0 .857 0 1.439.038 1.889.035.438.1.663.18.819a2 2 0 0 0 .874.874c.156.08.38.145.819.18C9.361 21 9.943 21 10.8 21h2.4c.857 0 1.439 0 1.889-.038.438-.035.663-.1.819-.18a2 2 0 0 0 .874-.874c.08-.156.145-.38.18-.819.037-.45.038-1.032.038-1.889V6.8c0-.857 0-1.439-.038-1.889-.035-.438-.1-.663-.18-.819a2 2 0 0 0-.874-.874c-.156-.08-.38-.145-.819-.18C14.639 3 14.057 3 13.2 3h-2.4c-.857 0-1.439 0-1.889.038"></path>';
    } else {
      iconContainer.innerHTML = '<path fill="currentColor" d="M6.759 5H17.24c.805 0 1.47 0 2.01.044.563.046 1.08.145 1.565.392a4 4 0 0 1 1.748 1.748c.247.485.346 1.002.392 1.564.044.541.044 1.206.044 2.01v2.483c0 .805 0 1.47-.044 2.01-.046.563-.145 1.08-.392 1.565a4 4 0 0 1-1.748 1.748c-.485.247-1.002.346-1.564.392-.541.044-1.206.044-2.01.044H6.758c-.805 0-1.47 0-2.01-.044-.563-.046-1.08-.145-1.565-.392a4 4 0 0 1-1.748-1.748c-.247-.485-.346-1.002-.392-1.564C1 14.71 1 14.046 1 13.242v-2.483c0-.805 0-1.47.044-2.01.046-.563.145-1.08.392-1.565a4 4 0 0 1 1.748-1.748c.485-.247 1.002-.346 1.564-.392C5.29 5 5.954 5 6.758 5M4.91 7.038c-.438.035-.663.1-.819.18a2 2 0 0 0-.874.874c-.08.156-.145.38-.18.819C3 9.361 3 9.943 3 10.8v2.4c0 .857 0 1.439.038 1.889.035.438.1.663.18.819a2 2 0 0 0 .874.874c.156.08.38.145.819.18C5.361 17 5.943 17 6.8 17h10.4c.857 0 1.439 0 1.889-.038.438-.035.663-.1.819-.18a2 2 0 0 0 .874-.874c.08-.156.145-.38.18-.819.037-.45.038-1.032.038-1.889v-2.4c0-.857 0-1.439-.038-1.889-.035-.438-.1-.663-.18-.819a2 2 0 0 0-.874-.874c-.156-.08-.38-.145-.819-.18C18.639 7 18.057 7 17.2 7H6.8c-.857 0-1.439 0-1.889.038"></path>';
    }
  }

  async loadVideoSettings() {
    try {
      const result = await chrome.storage.local.get(['videoSettings']);
      if (result.videoSettings) {
        this.videoSettings = { ...this.videoSettings, ...result.videoSettings };

        // Apply loaded settings to UI
        this.applyVideoSettingsToUI();
      }
    } catch (error) {
      console.error('[Popup] Error loading video settings:', error);
    }
  }

  applyVideoSettingsToUI() {
    // Apply model setting
    const modelDropdown = document.getElementById('model-dropdown');
    const modelItem = document.getElementById('model-setting');
    if (modelDropdown && modelItem) {
      this.selectVideoOptionUI('model', this.videoSettings.model, modelDropdown, modelItem);
    }

    // Apply orientation setting
    const orientationDropdown = document.getElementById('orientation-dropdown');
    const orientationItem = document.getElementById('orientation-setting');
    if (orientationDropdown && orientationItem) {
      this.selectVideoOptionUI('orientation', this.videoSettings.orientation, orientationDropdown, orientationItem);
    }

    // Apply duration setting
    const durationDropdown = document.getElementById('duration-dropdown');
    const durationItem = document.getElementById('duration-setting');
    if (durationDropdown && durationItem) {
      this.selectVideoOptionUI('duration', this.videoSettings.duration, durationDropdown, durationItem);
    }
  }

  selectVideoOptionUI(settingType, value, dropdown, settingItem) {
    // Remove selected class from all options
    dropdown.querySelectorAll('.dropdown-option').forEach(opt => {
      opt.classList.remove('selected');
    });

    // Add selected class to the option
    const selectedOption = dropdown.querySelector(`[data-value="${value}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
    }

    // Update displayed value
    const valueDisplay = settingItem.querySelector('.setting-value');

    switch(settingType) {
      case 'model':
        const modelText = value === 'sora2pro' ? 'Sora 2 Pro' : 'Sora 2';
        valueDisplay.textContent = modelText;
        const infoIcon = settingItem.querySelector('#model-info-icon');
        if (infoIcon) {
          infoIcon.style.display = value === 'sora2' ? 'inline-flex' : 'none';
        }
        break;

      case 'orientation':
        const orientationText = value === 'portrait' ? 'Portrait' : 'Landscape';
        valueDisplay.textContent = orientationText;
        this.updateOrientationIcon(value);
        break;

      case 'duration':
        valueDisplay.textContent = value + 's';
        break;
    }
  }

  async saveVideoSettings() {
    try {
      await chrome.storage.local.set({ videoSettings: this.videoSettings });
      console.log('[Popup] Video settings saved:', this.videoSettings);
    } catch (error) {
      console.error('[Popup] Error saving video settings:', error);
    }
  }

  async init() {
    console.log('[Popup] Initializing...');
    
    await this.templateManager.loadTemplates();
    console.log('[Popup] Templates loaded');
    
    await this.loadSettings();
    console.log('[Popup] Settings loaded');
    
    this.renderTemplates();
    this.populateTemplateSelect();
    this.checkProcessingState();
    
    console.log('[Popup] Initialization complete');
    
    // Não abrir janela automaticamente pois fecha o popup
    // A janela será aberta quando o usuário iniciar a geração
  }

  async openSoraWindow() {
    console.log('[Popup] openSoraWindow called');
    
    try {
      // Verificar se a configuração está ativada
      const settings = await this.getSettings();
      console.log('[Popup] Settings loaded:', settings);
      
      if (settings.autoOpenSora === false) {
        console.log('[Popup] Auto-open Sora is disabled in settings');
        return;
      }
      
      console.log('[Popup] Auto-open is enabled, sending message to background...');
      
      // Enviar mensagem para o background script fazer a abertura
      chrome.runtime.sendMessage({
        type: 'OPEN_SORA_WINDOW'
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Popup] Error sending message:', chrome.runtime.lastError);
        } else {
          console.log('[Popup] Background response:', response);
        }
      });
      
    } catch (error) {
      console.error('[Popup] ❌ Error in openSoraWindow:', error);
      console.error('[Popup] Error details:', error.message, error.stack);
    }
  }

  // ========================================
  // Tab Management
  // ========================================

  switchTab(tabName) {
    this.currentTab = tabName;
    
    this.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    this.tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    if (tabName === 'templates') {
      this.renderTemplates();
    }
  }

  // ========================================
  // Scenes Management
  // ========================================

  updateSceneCount() {
    const text = this.scenesInput.value.trim();
    const lines = text.split('\n').filter(line => line.trim());
    this.scenes = lines;
    this.sceneCounter.textContent = `${lines.length} cena${lines.length !== 1 ? 's' : ''} detectada${lines.length !== 1 ? 's' : ''}`;
    
    // Enable/disable buttons
    const hasScenes = lines.length > 0;
    this.previewPromptsBtn.disabled = !hasScenes;
    this.startGenerationBtn.disabled = !hasScenes;
  }

  onTemplateSelect() {
    this.selectedTemplateId = this.templateSelect.value;
    
    if (this.selectedTemplateId) {
      const template = this.templateManager.get(this.selectedTemplateId);
      if (template) {
        this.templateInfo.style.display = 'block';
        document.getElementById('template-name').textContent = template.name;
        document.getElementById('template-description').textContent = template.description || 'Sem descrição';
      }
    } else {
      this.templateInfo.style.display = 'none';
    }
  }

  // ========================================
  // Preview Modal
  // ========================================

  showPreviewModal() {
    if (this.scenes.length === 0) return;

    const template = this.selectedTemplateId ? this.templateManager.get(this.selectedTemplateId) : null;
    
    // Show template info
    const previewInfo = document.getElementById('preview-template-info');
    if (template) {
      previewInfo.innerHTML = `
        <strong>Template: ${template.name}</strong>
        <p>${template.description || ''}</p>
      `;
    } else {
      previewInfo.innerHTML = '<p><em>Nenhum template selecionado - usando texto original</em></p>';
    }

    // Generate previews
    this.previewList.innerHTML = '';
    this.scenes.forEach((scene, index) => {
      const fullPrompt = template 
        ? this.templateManager.generatePrompt(template.prefix, scene, template.suffix)
        : scene;

      const previewItem = document.createElement('div');
      previewItem.className = 'preview-item fade-in';
      previewItem.innerHTML = `
        <div class="preview-item-header">Cena ${index + 1}</div>
        <div class="preview-item-input">
          <label>Entrada:</label>
          <div class="text">${this.escapeHtml(scene)}</div>
        </div>
        <div class="preview-item-output">${this.escapeHtml(fullPrompt)}</div>
        <div class="preview-item-actions">
          <button class="btn-secondary" onclick="uiManager.editScenePrompt(${index})">✏️ Editar</button>
          <button class="btn-secondary" onclick="uiManager.copyPrompt('${this.escapeHtml(fullPrompt)}')">📋 Copiar</button>
        </div>
      `;
      this.previewList.appendChild(previewItem);
    });

    this.previewModal.classList.add('active');
  }

  closePreviewModal() {
    this.previewModal.classList.remove('active');
  }

  confirmAndStart() {
    this.closePreviewModal();
    this.startGeneration();
  }

  editScenePrompt(index) {
    const newText = prompt('Edite a cena:', this.scenes[index]);
    if (newText !== null && newText.trim()) {
      this.scenes[index] = newText.trim();
      const lines = this.scenesInput.value.split('\n');
      lines[index] = newText.trim();
      this.scenesInput.value = lines.join('\n');
      this.showPreviewModal(); // Refresh
    }
  }

  copyPrompt(text) {
    navigator.clipboard.writeText(text);
    this.showNotification('Prompt copiado!', 'success');
  }

  // ========================================
  // Generation Management
  // ========================================

  async startGeneration() {
    console.log('[Popup] startGeneration called');
    
    if (this.scenes.length === 0) {
      this.showNotification('Adicione pelo menos uma cena!', 'error');
      return;
    }

    // Check if should show preview
    const settings = await this.getSettings();
    if (settings.showPreview && !confirm('Iniciar geração de ' + this.scenes.length + ' vídeos?')) {
      console.log('[Popup] User cancelled');
      return;
    }

    // Abrir/focar janela do Sora ANTES de enviar
    console.log('[Popup] ===== SENDING OPEN_SORA_WINDOW MESSAGE =====');
    
    chrome.runtime.sendMessage(
      { type: 'OPEN_SORA_WINDOW' }, 
      async (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Popup] Error sending OPEN_SORA_WINDOW:', chrome.runtime.lastError);
          return;
        }
        
        console.log('[Popup] ===== SORA WINDOW RESPONSE =====');
        console.log('[Popup] Response:', response);
        
        // Aguardar um pouco para a janela abrir/focar
        console.log('[Popup] Waiting 1000ms for window to open...');
        await this.sleep(1000);
        console.log('[Popup] Wait complete, preparing prompts...');
        
        // Prepare prompts
        const template = this.selectedTemplateId ? this.templateManager.get(this.selectedTemplateId) : null;
        const prompts = this.scenes.map(scene => {
          return {
            scene: scene,
            fullPrompt: template 
              ? this.templateManager.generatePrompt(template.prefix, scene, template.suffix)
              : scene
          };
        });

        console.log('[Popup] Prepared', prompts.length, 'prompts');
        console.log('[Popup] Sending START_GENERATION message...');

        // Send to background script
        chrome.runtime.sendMessage({
          type: 'START_GENERATION',
          data: {
            prompts: prompts,
            templateId: this.selectedTemplateId,
            settings: settings,
            videoSettings: this.videoSettings
          }
        }, (startResponse) => {
          if (chrome.runtime.lastError) {
            console.error('[Popup] Error sending START_GENERATION:', chrome.runtime.lastError);
          } else {
            console.log('[Popup] START_GENERATION response:', startResponse);
          }
        });

        this.showNotification('Geração iniciada!', 'success');
        this.updateUIForProcessing();
      }
    );
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  pauseGeneration() {
    chrome.runtime.sendMessage({ type: 'PAUSE_GENERATION' });
    this.pauseBtn.textContent = '▶️ Retomar';
    this.pauseBtn.onclick = () => this.resumeGeneration();
  }

  resumeGeneration() {
    chrome.runtime.sendMessage({ type: 'RESUME_GENERATION' });
    this.pauseBtn.textContent = '⏸️ Pausar';
    this.pauseBtn.onclick = () => this.pauseGeneration();
  }

  stopGeneration() {
    if (confirm('Tem certeza que deseja parar a geração?')) {
      chrome.runtime.sendMessage({ type: 'STOP_GENERATION' });
      this.updateUIForIdle();
    }
  }

  updateUIForProcessing() {
    this.statusDisplay.innerHTML = '<p class="status-processing">⚙️ Processando...</p>';
    this.progressContainer.style.display = 'block';
    this.queueList.style.display = 'block';
    this.controlButtons.style.display = 'flex';
    this.startGenerationBtn.disabled = true;
  }

  updateUIForIdle() {
    this.statusDisplay.innerHTML = '<p class="status-idle">Aguardando início...</p>';
    this.progressContainer.style.display = 'none';
    this.queueList.style.display = 'none';
    this.controlButtons.style.display = 'none';
    this.startGenerationBtn.disabled = false;
  }

  updateQueueDisplay(queueData) {
    this.queueList.innerHTML = '';
    
    queueData.items.forEach(item => {
      const queueItem = document.createElement('div');
      queueItem.className = `queue-item ${item.status}`;
      
      let statusBadge = '';
      let statusIcon = '';
      
      switch(item.status) {
        case 'completed':
          statusBadge = 'status-badge-completed';
          statusIcon = '✅ Completo';
          break;
        case 'processing':
          statusBadge = 'status-badge-processing';
          statusIcon = '⏳ Gerando...';
          break;
        case 'failed':
          statusBadge = 'status-badge-failed';
          statusIcon = '❌ Erro';
          break;
        default:
          statusBadge = 'status-badge-pending';
          statusIcon = '⏸️ Aguardando';
      }
      
      queueItem.innerHTML = `
        <div class="queue-item-text">${this.escapeHtml(item.scene)}</div>
        <div class="queue-item-status ${statusBadge}">${statusIcon}</div>
      `;
      
      this.queueList.appendChild(queueItem);
    });

    // Update progress
    const completed = queueData.items.filter(i => i.status === 'completed').length;
    const total = queueData.items.length;
    const percentage = (completed / total) * 100;
    
    document.getElementById('progress-text').textContent = `Processando ${completed}/${total}`;
    document.getElementById('processing-count').textContent = `${queueData.currentProcessing} gerando`;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
  }

  updateStatusDisplay(statusData) {
    if (statusData.type === 'complete') {
      this.updateUIForIdle();
      this.showNotification('Todas as gerações foram concluídas!', 'success');
    } else if (statusData.type === 'error') {
      this.showNotification('Erro: ' + statusData.message, 'error');
    }
  }

  async checkProcessingState() {
    // Check if there's an ongoing process
    const result = await chrome.storage.local.get(['processingState']);
    if (result.processingState && result.processingState.status === 'processing') {
      this.updateUIForProcessing();
      // Request update from background
      chrome.runtime.sendMessage({ type: 'GET_QUEUE_STATUS' });
    }
  }

  // ========================================
  // Template Management
  // ========================================

  async renderTemplates() {
    const search = this.templateSearch.value;
    const category = this.categoryFilter.value;
    
    const templates = this.templateManager.getAll({ search, category });
    
    if (templates.length === 0) {
      this.templatesList.innerHTML = `
        <div class="empty-state">
          <p>📭 Nenhum template encontrado</p>
          <p class="small">Tente outra busca ou crie um novo template</p>
        </div>
      `;
      return;
    }

    this.templatesList.innerHTML = '';
    templates.forEach(template => {
      const card = this.createTemplateCard(template);
      this.templatesList.appendChild(card);
    });
  }

  createTemplateCard(template) {
    const card = document.createElement('div');
    card.className = 'template-card fade-in';
    
    const categoryIcons = {
      'animation-2d': '🎨',
      'animation-3d': '🎭',
      'realistic': '📷',
      'artistic': '🖼️',
      'music-video': '🎵',
      'custom': '✨'
    };

    const categoryNames = {
      'animation-2d': 'Animação 2D',
      'animation-3d': 'Animação 3D',
      'realistic': 'Realista',
      'artistic': 'Artístico',
      'music-video': 'Videoclipe',
      'custom': 'Personalizado'
    };

    card.innerHTML = `
      <div class="template-card-header">
        <div class="template-card-title">
          ${template.favorite ? '⭐ ' : ''}${this.escapeHtml(template.name)}
        </div>
        <div class="template-card-actions">
          <button class="btn-secondary" onclick="uiManager.editTemplate('${template.id}')">✏️</button>
          <button class="btn-danger" onclick="uiManager.deleteTemplate('${template.id}')">🗑️</button>
        </div>
      </div>
      <div class="template-card-meta">
        ${categoryIcons[template.category]} ${categoryNames[template.category]} • Usado ${template.usageCount} vezes
      </div>
      ${template.description ? `<div class="template-card-description">${this.escapeHtml(template.description)}</div>` : ''}
      <div class="template-card-preview">${this.escapeHtml(template.prefix)}{scene}${this.escapeHtml(template.suffix)}</div>
      <div class="template-card-footer">
        <button class="btn-secondary" onclick="uiManager.viewTemplate('${template.id}')">👁️ Ver completo</button>
        <button class="btn-secondary" onclick="uiManager.duplicateTemplate('${template.id}')">📋 Duplicar</button>
      </div>
    `;
    
    return card;
  }

  openTemplateModal(templateId = null) {
    this.templateManager.currentEditingId = templateId;
    
    if (templateId) {
      const template = this.templateManager.get(templateId);
      if (!template) return;
      
      this.modalTitle.textContent = '✏️ Editar Template';
      this.templateNameInput.value = template.name;
      this.templateDescriptionInput.value = template.description;
      this.templateCategoryInput.value = template.category;
      this.templatePrefixInput.value = template.prefix;
      this.templateSuffixInput.value = template.suffix;
      this.templateExampleInput.value = template.exampleInput;
      this.templateFavoriteInput.checked = template.favorite;
    } else {
      this.modalTitle.textContent = '✨ Criar Novo Template';
      this.templateNameInput.value = '';
      this.templateDescriptionInput.value = '';
      this.templateCategoryInput.value = 'custom';
      this.templatePrefixInput.value = '';
      this.templateSuffixInput.value = '';
      this.templateExampleInput.value = '';
      this.templateFavoriteInput.checked = false;
    }
    
    this.updateTemplatePreview();
    this.templateModal.classList.add('active');
  }

  closeTemplateModal() {
    this.templateModal.classList.remove('active');
    this.templateManager.currentEditingId = null;
  }

  updateTemplatePreview() {
    const prefix = this.templatePrefixInput.value;
    const suffix = this.templateSuffixInput.value;
    const example = this.templateExampleInput.value;
    
    if (!example) {
      this.templateResultDisplay.textContent = 'Digite um exemplo acima para ver o resultado';
      this.templateStats.textContent = '';
      return;
    }
    
    const result = this.templateManager.generatePrompt(prefix, example, suffix);
    this.templateResultDisplay.textContent = result;
    
    const words = result.split(/\s+/).length;
    const chars = result.length;
    this.templateStats.textContent = `📊 ${words} palavras, ~${chars} caracteres`;
  }

  async saveTemplate() {
    const name = this.templateNameInput.value.trim();
    const prefix = this.templatePrefixInput.value;
    const suffix = this.templateSuffixInput.value;
    
    if (!name) {
      this.showNotification('Nome do template é obrigatório!', 'error');
      return;
    }
    
    if (!prefix && !suffix) {
      this.showNotification('Template deve ter pelo menos um prefixo ou sufixo!', 'error');
      return;
    }
    
    const templateData = {
      name: name,
      description: this.templateDescriptionInput.value.trim(),
      category: this.templateCategoryInput.value,
      prefix: prefix,
      suffix: suffix,
      exampleInput: this.templateExampleInput.value.trim(),
      favorite: this.templateFavoriteInput.checked
    };
    
    if (this.templateManager.currentEditingId) {
      this.templateManager.update(this.templateManager.currentEditingId, templateData);
      this.showNotification('Template atualizado!', 'success');
    } else {
      this.templateManager.create(templateData);
      this.showNotification('Template criado!', 'success');
    }
    
    this.closeTemplateModal();
    this.renderTemplates();
    this.populateTemplateSelect();
  }

  editTemplate(id) {
    this.openTemplateModal(id);
  }

  deleteTemplate(id) {
    const template = this.templateManager.get(id);
    if (!template) return;
    
    if (confirm(`Tem certeza que deseja excluir "${template.name}"?`)) {
      this.templateManager.delete(id);
      this.renderTemplates();
      this.populateTemplateSelect();
      this.showNotification('Template excluído!', 'success');
    }
  }

  viewTemplate(id) {
    const template = this.templateManager.get(id);
    if (!template) return;
    
    alert(`Template: ${template.name}\n\nPrefixo:\n${template.prefix}\n\nVariável: {scene}\n\nSufixo:\n${template.suffix}\n\nExemplo:\n${template.exampleOutput}`);
  }

  duplicateTemplate(id) {
    const duplicated = this.templateManager.duplicate(id);
    if (duplicated) {
      this.renderTemplates();
      this.populateTemplateSelect();
      this.showNotification('Template duplicado!', 'success');
    }
  }

  populateTemplateSelect() {
    const templates = this.templateManager.getAll();
    const currentValue = this.templateSelect.value;
    
    this.templateSelect.innerHTML = '<option value="">Sem template</option>';
    
    templates.forEach(template => {
      const option = document.createElement('option');
      option.value = template.id;
      option.textContent = `${template.favorite ? '⭐ ' : ''}${template.name}`;
      this.templateSelect.appendChild(option);
    });
    
    // Restore selection if still exists
    if (currentValue && templates.find(t => t.id === currentValue)) {
      this.templateSelect.value = currentValue;
    }
  }

  exportTemplates() {
    const json = this.templateManager.exportTemplates();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sora-templates-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showNotification('Templates exportados!', 'success');
  }

  async importTemplates(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const success = this.templateManager.importTemplates(e.target.result);
      if (success) {
        this.renderTemplates();
        this.populateTemplateSelect();
        this.showNotification('Templates importados!', 'success');
      } else {
        this.showNotification('Erro ao importar templates!', 'error');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  }

  // ========================================
  // Settings
  // ========================================

  async loadSettings() {
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || {
      autoDownload: false,
      notifications: true,
      showPreview: true,
      retryOnError: true,
      maxRetries: 3
    };
    
    this.autoDownloadCheckbox.checked = settings.autoDownload;
    this.notificationsCheckbox.checked = settings.notifications;
    this.showPreviewCheckbox.checked = settings.showPreview;
    this.retryOnErrorCheckbox.checked = settings.retryOnError;
    this.maxRetriesInput.value = settings.maxRetries;
  }

  async saveSettings() {
    const settings = {
      autoDownload: this.autoDownloadCheckbox.checked,
      notifications: this.notificationsCheckbox.checked,
      showPreview: this.showPreviewCheckbox.checked,
      retryOnError: this.retryOnErrorCheckbox.checked,
      maxRetries: parseInt(this.maxRetriesInput.value)
    };
    
    await chrome.storage.local.set({ settings });
  }

  async getSettings() {
    const result = await chrome.storage.local.get(['settings']);
    return result.settings || {};
  }

  // ========================================
  // BIBLIOTECA DE PROMPTS
  // ========================================

  initLibrary() {
    // Open library button
    if (this.openLibraryBtn) {
      this.openLibraryBtn.addEventListener('click', () => this.openLibraryModal());
    }

    // Search and filter
    if (this.librarySearch) {
      this.librarySearch.addEventListener('input', () => this.renderLibraryCards());
    }

    if (this.libraryCategoryFilter) {
      this.libraryCategoryFilter.addEventListener('change', () => this.renderLibraryCards());
    }

    // Quantity controls
    if (this.qtyMinusBtn) {
      this.qtyMinusBtn.addEventListener('click', () => this.adjustQuantity(-1));
    }

    if (this.qtyPlusBtn) {
      this.qtyPlusBtn.addEventListener('click', () => this.adjustQuantity(1));
    }

    if (this.promptQuantityInput) {
      this.promptQuantityInput.addEventListener('change', () => {
        const qty = parseInt(this.promptQuantityInput.value) || 3;
        this.promptLibrary.setQuantity(qty);
        this.renderDynamicFields();
        this.updatePromptsPreview();
      });
    }

    // Back to library button
    if (this.backToLibraryBtn) {
      this.backToLibraryBtn.addEventListener('click', () => {
        this.closeConfigModal();
        this.openLibraryModal();
      });
    }

    // Generate sequence button
    if (this.generateSequenceBtn) {
      this.generateSequenceBtn.addEventListener('click', () => this.generateSequence());
    }
  }

  openLibraryModal() {
    this.renderLibraryCards();
    this.libraryModal.classList.add('active');
  }

  closeLibraryModal() {
    this.libraryModal.classList.remove('active');
  }

  openConfigModal(templateId) {
    const template = this.promptLibrary.selectTemplate(templateId);
    if (!template) return;

    // Update modal header
    this.configTemplateIcon.textContent = template.icone;
    this.configTemplateTitle.textContent = template.titulo;
    this.configTemplateDesc.textContent = template.descricao;

    // Reset quantity
    this.promptQuantityInput.value = 3;
    this.promptLibrary.setQuantity(3);

    // Render fields
    this.renderDynamicFields();
    this.updatePromptsPreview();

    // Close library, open config
    this.closeLibraryModal();
    this.promptConfigModal.classList.add('active');
  }

  closeConfigModal() {
    this.promptConfigModal.classList.remove('active');
  }

  renderLibraryCards() {
    const search = this.librarySearch?.value || '';
    const categoria = this.libraryCategoryFilter?.value || '';

    const templates = this.promptLibrary.getAll({ search, categoria });

    if (templates.length === 0) {
      this.libraryGrid.innerHTML = `
        <div class="library-empty" style="grid-column: 1 / -1;">
          <div class="library-empty-icon">📭</div>
          <p>Nenhum template encontrado</p>
        </div>
      `;
      return;
    }

    this.libraryGrid.innerHTML = '';

    templates.forEach(template => {
      const card = document.createElement('div');
      card.className = 'library-card';
      card.dataset.id = template.id;

      const tagClass = template.categoria.toLowerCase();

      card.innerHTML = `
        <span class="library-card-icon">${template.icone}</span>
        <h3 class="library-card-title">${this.escapeHtml(template.titulo)}</h3>
        <p class="library-card-description">${this.escapeHtml(template.descricao)}</p>
        <span class="library-card-tag ${tagClass}">${template.categoria}</span>
      `;

      card.addEventListener('click', () => this.openConfigModal(template.id));

      this.libraryGrid.appendChild(card);
    });
  }

  adjustQuantity(delta) {
    const current = parseInt(this.promptQuantityInput.value) || 3;
    const newValue = Math.max(1, Math.min(10, current + delta));
    this.promptQuantityInput.value = newValue;
    this.promptLibrary.setQuantity(newValue);
    this.renderDynamicFields();
    this.updatePromptsPreview();
  }

  renderDynamicFields() {
    const quantity = this.promptLibrary.promptQuantity;
    const template = this.promptLibrary.selectedTemplate;

    this.dynamicFieldsContainer.innerHTML = '';

    for (let i = 0; i < quantity; i++) {
      const field = document.createElement('div');
      field.className = 'dynamic-field';

      field.innerHTML = `
        <label>
          <span class="field-number">Prompt ${i + 1}</span> - Digite o texto
        </label>
        <input
          type="text"
          data-index="${i}"
          placeholder="${template?.placeholder || 'Digite seu texto aqui...'}"
          value="${this.promptLibrary.userInputs[i] || ''}"
        >
      `;

      const input = field.querySelector('input');
      input.addEventListener('input', (e) => {
        this.promptLibrary.setUserInput(i, e.target.value);
        this.updatePromptsPreview();
      });

      this.dynamicFieldsContainer.appendChild(field);
    }
  }

  updatePromptsPreview() {
    const prompts = this.promptLibrary.generatePrompts();

    if (prompts.length === 0) {
      this.promptsPreviewList.innerHTML = '<p style="color: #6c6c7c; text-align: center;">Preencha os campos acima para ver o preview</p>';
      return;
    }

    this.promptsPreviewList.innerHTML = '';

    prompts.forEach((prompt) => {
      const item = document.createElement('div');
      item.className = 'prompt-preview-item';

      const userText = prompt.userInput.startsWith('[') ? prompt.userInput : `"${prompt.userInput}"`;
      const baseText = this.promptLibrary.selectedTemplate?.promptBase || '';

      item.innerHTML = `
        <span class="user-text">${this.escapeHtml(userText)}</span><br>
        <span class="base-text">${this.escapeHtml(baseText)}</span>
      `;

      this.promptsPreviewList.appendChild(item);
    });
  }

  generateSequence() {
    const prompts = this.promptLibrary.getGeneratedPromptsForQueue();

    if (prompts.length === 0) {
      this.showNotification('Preencha pelo menos um campo!', 'error');
      return;
    }

    // Add prompts to scenes input
    const scenesText = prompts.map(p => p.fullPrompt).join('\n\n');

    // Append or replace scenes
    if (this.scenesInput.value.trim()) {
      const shouldAppend = confirm('Deseja adicionar aos prompts existentes? (Cancelar para substituir)');
      if (shouldAppend) {
        this.scenesInput.value = this.scenesInput.value.trim() + '\n\n' + scenesText;
      } else {
        this.scenesInput.value = scenesText;
      }
    } else {
      this.scenesInput.value = scenesText;
    }

    // Update scene count
    this.updateSceneCount();

    // Close modal
    this.closeConfigModal();

    // Show notification
    this.showNotification(`${prompts.length} prompts adicionados a fila!`, 'success');
  }

  // ========================================
  // Utilities
  // ========================================

  showNotification(message, type = 'info') {
    // You can implement a toast notification here
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // For now, just use browser notification if enabled
    this.getSettings().then(settings => {
      if (settings.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Sora Automation',
          message: message
        });
      }
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize
let uiManager;
document.addEventListener('DOMContentLoaded', () => {
  uiManager = new UIManager();
});
