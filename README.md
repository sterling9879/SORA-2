# 🎬 Sora 2 Automation Extension

Extensão para Chrome que automatiza a geração em lote de vídeos no Sora 2, com sistema de templates e gerenciamento inteligente de fila.

## 📋 Funcionalidades

### ✨ Principais Recursos

- **🎨 Sistema de Templates**: Crie, edite e reutilize templates de prompts
- **📝 Geração em Lote**: Adicione múltiplas cenas (uma por linha) e gere todos os vídeos automaticamente
- **⚙️ Gerenciamento Inteligente**: Respeita o limite de 3 vídeos simultâneos do Sora 2
- **👁️ Preview de Prompts**: Visualize como ficará cada prompt antes de iniciar
- **📊 Monitoramento em Tempo Real**: Acompanhe o progresso de cada vídeo
- **🔄 Sistema de Retry**: Tenta novamente automaticamente em caso de falha
- **💾 Auto-download**: (Opcional) Baixa vídeos automaticamente ao concluir
- **📁 Import/Export**: Compartilhe seus templates com outros usuários

### 🎨 Sistema de Templates

Templates permitem você criar estruturas reutilizáveis de prompts. Por exemplo:

**Template "Estilo Simpsons":**
- Prefixo: `simpson style, animated scene, vibrant colors, `
- Variável: `{scene}`
- Sufixo: `, 4k quality, studio lighting, detailed animation`

**Entrada:** `Homer vai até a casa`  
**Resultado:** `simpson style, animated scene, vibrant colors, Homer vai até a casa, 4k quality, studio lighting, detailed animation`

## 📦 Instalação

### Método 1: Instalação Manual (Recomendado)

1. **Baixe a extensão**
   - Faça download do arquivo ZIP
   - Extraia em uma pasta no seu computador

2. **Abra o Chrome**
   - Digite `chrome://extensions/` na barra de endereços
   - Ative o "Modo do desenvolvedor" (canto superior direito)

3. **Carregue a extensão**
   - Clique em "Carregar sem compactação"
   - Selecione a pasta `sora-automation` que você extraiu
   - A extensão será instalada!

4. **Pronto!**
   - Você verá o ícone 🎬 na barra de ferramentas
   - Clique nele para abrir a interface

## 🚀 Como Usar

### 1️⃣ Criar um Template (Opcional)

1. Clique no ícone da extensão
2. Vá para a aba "🎨 Templates"
3. Clique em "+ Novo Template"
4. Preencha:
   - **Nome**: Ex: "Estilo Anime"
   - **Prefixo**: Texto que vem antes da cena
   - **Sufixo**: Texto que vem depois da cena
5. Teste com um exemplo para ver o resultado
6. Clique em "💾 Salvar Template"

### 2️⃣ Gerar Vídeos em Lote

1. Na aba "📝 Cenas":
   - Selecione um template (ou deixe sem template)
   - Cole suas cenas, **uma por linha**:
     ```
     Homer vai até a casa
     Homer entra em casa
     Homer abre a geladeira
     Homer pega uma cerveja
     ```

2. (Opcional) Clique em "👁️ Preview dos Prompts" para ver como ficará cada um

3. Clique em "▶️ Iniciar Geração"

4. **A extensão fará automaticamente:**
   - ✅ Navegar para a página do Sora
   - ✅ Enviar os primeiros 3 prompts
   - ✅ Monitorar quando cada vídeo terminar (detecta thumbnail desfocado)
   - ✅ Enviar o próximo prompt assim que um slot ficar livre
   - ✅ Manter sempre 3 vídeos gerando simultaneamente
   - ✅ Notificar quando tudo terminar

### 3️⃣ Acompanhar o Progresso

- **Status em tempo real**: Veja quantos vídeos estão gerando, completos, ou falharam
- **Barra de progresso**: Visualize o andamento geral
- **Lista de cenas**: Cada cena mostra seu status individual
- **Controles**: Pause, retome ou pare a geração a qualquer momento

## ⚙️ Configurações

Na aba "⚙️ Config" você pode personalizar:

- **Auto-download**: Baixar vídeos automaticamente ao concluir
- **Notificações**: Receber alertas quando processos importantes acontecem
- **Preview antes de iniciar**: Mostrar confirmação antes de começar
- **Retry em caso de erro**: Tentar novamente automaticamente
- **Máximo de tentativas**: Quantas vezes tentar antes de desistir

## 🎯 Casos de Uso

### Exemplo 1: Série Animada
Crie episódios inteiros com templates consistentes:
- Template: "Cartoon Style"
- Cenas: Uma por cena do episódio
- Resultado: Todos os vídeos no mesmo estilo visual

### Exemplo 2: Storyboard para Cliente
Gere múltiplas versões de uma mesma cena:
- Sem template (descrições diretas)
- Cenas: Variações da mesma ideia
- Resultado: Opções para apresentar ao cliente

### Exemplo 3: Conteúdo para Redes Sociais
Crie vários vídeos curtos de uma vez:
- Template: "Realistic TikTok Style"
- Cenas: Diferentes hooks/ganchos
- Resultado: Semana de conteúdo em alguns minutos

## 🔧 Como Funciona (Técnico)

### Detecção de Conclusão
A extensão detecta quando um vídeo termina através de:
1. **Thumbnail desfocado/blur** = Vídeo ainda gerando
2. **Thumbnail nítido** = Vídeo completo
3. **Monitoramento contínuo** na página `/drafts` a cada 3 segundos

### Gerenciamento de Fila
1. Extensão mantém uma fila de prompts
2. Envia os primeiros 3 para o Sora
3. Monitora a página `/drafts` continuamente
4. Quando detecta conclusão, envia o próximo da fila
5. Mantém sempre 3 vídeos em processamento (respeitando o limite do Sora)

### Arquitetura
- **popup.js**: Interface do usuário e gerenciamento de templates
- **content.js**: Interage com a página do Sora (preenche campos, monitora status)
- **background.js**: Service worker que coordena tudo e mantém estado
- **Chrome Storage**: Salva templates, configurações e estado do processo

## ❓ FAQ

### A extensão funciona com Sora 1?
Não, foi desenvolvida especificamente para o Sora 2.

### Posso usar enquanto faço outras coisas?
Sim! A extensão continua trabalhando mesmo se você minimizar o navegador. Apenas não feche a aba do Sora.

### E se minha internet cair durante o processo?
A extensão tem sistema de retry. Quando a internet voltar, ela tentará novamente os vídeos que falharam.

### Quantos vídeos posso gerar de uma vez?
Tecnicamente ilimitado, mas lembre-se:
- Sora só processa 3 por vez
- Cada vídeo leva alguns minutos
- 100 vídeos levaria aproximadamente 5-8 horas

### Posso editar um prompt individual antes de gerar?
Sim! No preview dos prompts, você pode editar cada um individualmente.

### Como compartilho meus templates?
1. Vá em "⚙️ Config"
2. Clique em "⬇️ Exportar Templates"
3. Envie o arquivo JSON para quem quiser
4. A pessoa importa com "⬆️ Importar Templates"

## 🐛 Solução de Problemas

### Extensão não aparece
- Verifique se está em `chrome://extensions/`
- Certifique-se que "Modo desenvolvedor" está ativado
- Tente recarregar a extensão

### Vídeos não estão sendo detectados como completos
- Verifique se está na página `/drafts`
- Aguarde pelo menos 10 segundos após geração começar
- Atualize a página manualmente se necessário

### "Create video" button não funciona
- Certifique-se que está logado no Sora
- Verifique se o campo de prompt está visível
- Tente recarregar a página do Sora

### Extensão parou no meio do processo
- Abra o popup da extensão
- Clique em "⏸️ Pausar" e depois "▶️ Retomar"
- Se não resolver, pare e inicie novamente

## 📝 Notas Importantes

- ⚠️ **Não feche a aba do Sora** enquanto a extensão está processando
- ⚠️ **Mantenha o navegador aberto** (pode minimizar)
- ⚠️ **Respeite os limites do Sora** - a extensão já faz isso automaticamente
- ⚠️ **Verifique seus vídeos** na página `/drafts` após conclusão

## 🔒 Privacidade

Esta extensão:
- ✅ Roda apenas localmente no seu navegador
- ✅ Não envia dados para servidores externos
- ✅ Não coleta informações pessoais
- ✅ Armazena templates apenas no seu Chrome
- ✅ É open-source - você pode revisar o código

## 📄 Licença

MIT License - Use livremente!

## 🤝 Contribuindo

Encontrou um bug? Tem uma sugestão?
- Abra uma issue no GitHub
- Envie um pull request
- Entre em contato!

---

**Desenvolvido com ❤️ para a comunidade Sora**

Versão 1.0.0 - Janeiro 2025
