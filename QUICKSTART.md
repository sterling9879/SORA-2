# ⚡ Guia Rápido Visual - Sora 2 Automation

## 📦 Instalação (2 minutos)

```
1. Extrair ZIP → 📁 sora-automation/
2. Chrome → chrome://extensions/
3. Ativar "Modo desenvolvedor" 🔧
4. "Carregar sem compactação" → Selecionar pasta
5. Pronto! ✅
```

---

## 🎬 Primeiro Uso

### Interface Principal

```
┌─────────────────────────────────────────┐
│ 🎬 SORA 2 AUTOMATION                    │
├─────────────────────────────────────────┤
│ [📝 Cenas] [🎨 Templates] [⚙️ Config]  │
├─────────────────────────────────────────┤
│                                          │
│ Selecione um Template:                   │
│ [Sem template ▼] [🎨 Gerenciar]        │
│                                          │
│ Suas Cenas (uma por linha):             │
│ ┌─────────────────────────────────────┐ │
│ │ Homer vai até a casa                │ │
│ │ Homer entra em casa                 │ │
│ │ Homer abre a geladeira              │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ 3 cenas detectadas                       │
│                                          │
│ [👁️ Preview] [▶️ Iniciar Geração]      │
│                                          │
│ Status: Aguardando início...            │
│                                          │
└─────────────────────────────────────────┘
```

---

## 🎨 Criar Template

### Modal de Template

```
┌─────────────────────────────────────────┐
│ ✨ Criar Novo Template              [×] │
├─────────────────────────────────────────┤
│                                          │
│ Nome do Template *                       │
│ ┌─────────────────────────────────────┐ │
│ │ Estilo Simpsons                     │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Categoria: [Animation 2D ▼]            │
│                                          │
│ ───────────────────────────────────────│
│                                          │
│ Prefixo *                                │
│ ┌─────────────────────────────────────┐ │
│ │ simpson style, animated, vibrant    │ │
│ │ colors,                             │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Variável: {scene}                        │
│                                          │
│ Sufixo *                                 │
│ ┌─────────────────────────────────────┐ │
│ │ , 4k quality, studio lighting       │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ───────────────────────────────────────│
│                                          │
│ 👁️ PREVIEW                              │
│                                          │
│ Teste: Homer come rosquinha              │
│                                          │
│ Resultado:                               │
│ simpson style, animated, vibrant         │
│ colors, Homer come rosquinha, 4k         │
│ quality, studio lighting                 │
│                                          │
│ [Cancelar]          [💾 Salvar Template]│
└─────────────────────────────────────────┘
```

---

## 📊 Durante Processamento

```
┌─────────────────────────────────────────┐
│ Status: ⚙️ Processando...               │
│                                          │
│ Processando 2/5        2 gerando         │
│ ████████████░░░░░░░░░ 40%               │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ ✅ Homer vai até a casa    [Completo]│ │
│ │ ✅ Homer entra em casa     [Completo]│ │
│ │ ⏳ Homer abre geladeira    [Gerando] │ │
│ │ ⏳ Homer pega cerveja      [Gerando] │ │
│ │ ⏸️ Homer bebe cerveja      [Fila]    │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ [⏸️ Pausar]  [🛑 Parar]                 │
└─────────────────────────────────────────┘
```

---

## 🎯 Fluxo de Trabalho Típico

```
1️⃣ Criar Template (uma vez)
   ↓
2️⃣ Escrever Cenas
   ↓
3️⃣ Selecionar Template
   ↓
4️⃣ Preview (opcional)
   ↓
5️⃣ Iniciar Geração
   ↓
6️⃣ Aguardar (pode minimizar)
   ↓
7️⃣ Receber Notificação
   ↓
8️⃣ Baixar Vídeos em /drafts
```

---

## 💡 Dicas Pro

### ✅ Faça
- ✅ Use templates para consistência
- ✅ Teste com 2-3 vídeos primeiro
- ✅ Mantenha navegador aberto
- ✅ Agrupe cenas por tema/estilo
- ✅ Exporte seus melhores templates

### ❌ Evite
- ❌ Fechar aba do Sora durante processo
- ❌ Gerar 100+ vídeos sem testar antes
- ❌ Usar prompts muito longos (>500 chars)
- ❌ Modificar vídeos enquanto gera

---

## 📈 Exemplos de Uso

### Caso 1: Websérie Animada
```
Template: "Cartoon Network Style"
Cenas: 10 cenas do episódio 1
Tempo: ~30-40 minutos
Resultado: Episódio completo
```

### Caso 2: Testes de Conceito
```
Template: Nenhum
Cenas: 5 variações da mesma ideia
Tempo: ~15-20 minutos
Resultado: Opções para cliente
```

### Caso 3: Conteúdo Social
```
Template: "TikTok Viral Style"
Cenas: 20 hooks diferentes
Tempo: ~1-2 horas
Resultado: Mês de conteúdo
```

---

## 🔢 Matemática do Tempo

```
Tempo por vídeo: ~5-7 minutos
Simultâneos: 3 vídeos

10 vídeos  = ~20-25 minutos
50 vídeos  = ~2-3 horas
100 vídeos = ~4-6 horas
```

**Dica**: Inicie à noite e acorde com tudo pronto! 😴

---

## 🆘 Problemas Comuns

### "Não está funcionando"
```
Solução:
1. Verifique se está em sora.chatgpt.com
2. Atualize a página
3. Recarregue extensão em chrome://extensions/
```

### "Travou no meio"
```
Solução:
1. Abra popup da extensão
2. Clique "Pausar" e depois "Retomar"
3. Se não resolver: Pare e reinicie
```

### "Vídeos não detectados"
```
Solução:
1. Aguarde 10-15 segundos
2. Atualize página /drafts
3. Verifique se thumbnail está nítido
```

---

## 🎓 Níveis de Uso

### 🥉 Iniciante
- Usar sem templates
- 5-10 vídeos por vez
- Um estilo por sessão

### 🥈 Intermediário
- Criar 2-3 templates
- 20-30 vídeos por vez
- Usar preview antes de gerar

### 🥇 Avançado
- Biblioteca de 10+ templates
- 50+ vídeos por sessão
- Import/export templates
- Workflow automatizado

---

## 🎉 Pronto para Começar!

```
1. Instale a extensão
2. Vá para sora.chatgpt.com/profile
3. Clique no ícone 🎬
4. Cole algumas cenas
5. Clique "▶️ Iniciar"
6. Magia acontece! ✨
```

---

**Boa sorte com suas criações! 🚀**

*Precisa de ajuda? Leia o README.md completo!*
