<div align="center">
	<h1>LUMARI <small style="font-size:60%">v0.2.5-alfa</small></h1>
	<p><strong>Protótipo acadêmico estático (HTML/CSS/JS)</strong> explorando UX com áudio persistente, navegação parcial (PJAX leve) e simulação de métricas emocionais.</p>
	<p>
		<a href="https://necromante96official.github.io/LUMARI/">🌐 Acessar Demo</a>
	</p>
</div>

---

## ✨ Visão Geral
LUMARI é um experimento de interface focado em continuidade de experiência e microinterações emocionais. Apesar de estático, simula jornadas de dois perfis (Público e Criador), incluindo:
- Áudio de fundo persistente entre páginas (sem cortes ao navegar)
- Sons de clique leves para reforço sensorial
- Navegação parcial (PJAX) para manter estado/áudio
- Página de Criador com tendências agregadas (fictícias) por rede social
- Feeds temáticos por emoção (Alegre / Acolhedor / Misto) com filtros

> Este repositório é acadêmico e não implementa backend real nem segurança de autenticação. Fluxos de login/cadastro são mocks em `localStorage`.

## 🔍 Público-alvo
Estudantes, designers de produto, entusiastas de prototipagem, pesquisadores de UX sensorial e devs curiosos sobre padrões de continuidade (som + navegação parcial) em ambientes estáticos.

## 🚩 Limitações
- Sem persistência segura (apenas `localStorage`)
- Métricas e tendências são totalmente simuladas
- Não há build tooling; foco em simplicidade

## 🆕 Versão Atual: 0.2.5-alfa
Principais mudanças desta versão:
| Categoria | Alteração |
|-----------|-----------|
| Documentação | Atualização do `README` com nova seção "Ferramentas e tecnologias" e padronização de notas de versão |
| UI | Página de Créditos atualizada para um layout em cards mais legível para o público |
| Ferramentas | Lista de ferramentas e recomendações adicionada (Dev tooling opcional documentado) |
| Manutenção | Ajuste de versões e pequenas correções de documentação para facilitar deploy e contribuição |

### Atualização a partir da série 0.1.x
Nenhuma ação manual necessária além de obter a nova versão. Caso tenha clonado antes: verifique se `js/main.js.backup` foi removido (não é mais necessário).

## 🚀 Como Executar Localmente
Opção 1 – Abrir direto o `index.html` (funciona, mas sem servidor não há cabeçalhos adequados para futuros recursos PWA).

Opção 2 – Servidor estático simples (recomendado):
```sh
python3 -m http.server 8080
# Acesse: http://localhost:8080
```

Explore:
1. Escolha Público ou Criador.
2. Aceite (ou não) os termos simulados.
3. Perceba o áudio contínuo ao navegar (links internos `.html`).

## 🗂 Estrutura Essencial
```
index.html              # Landing
404.html                # Página de erro
css/styles.css          # Estilos principais + tema claro opcional + modais
js/main.js              # Áudio global, PJAX leve, acordeões, termos, confete
pages/                  # Demais páginas (about, features, credits, feeds, login, signup, homes)
logo/                   # Imagens de redes e logomarca
sound/                  # Música de fundo e som de clique
```

## 🔧 Recursos Principais
- Áudio persistente (elemento <audio> reaproveitado + navegação interceptada)
- PJAX leve com rehidratação de `<main>` e execução de scripts da página alvo
- Acordeões com animação de altura progressiva
- Simulação de métricas emocionais e tendências com PRNG seed baseado no usuário
- Armazenamento de última emoção → redireciono rápido (com `?force=1` para ignorar)

## �️ Ferramentas e tecnologias (v0.2.5-alfa)
Ferramentas e recursos usados ou recomendados para desenvolvimento e manutenção do projeto:

- HTML5, CSS3 (Flexbox/Grid) — marcação semântica e layout responsivo.  
- JavaScript (ES6+) — lógica de interação, PJAX e manipulação DOM.  
- Fetch API e History API — navegação parcial e gerenciamento de histórico.  
- Web Audio / Media APIs — reprodução contínua, autoplay best-effort e controle de som.  
- BroadcastChannel e localStorage — sincronização entre abas e persistência local.  
- Otimização de ativos — imagens em WebP/AVIF, compressão e lazy-loading.  
- Ferramentas de desenvolvimento (opcionais): Node.js, npm/yarn, Vite ou Webpack para bundling e dev server.  
- Qualidade: ESLint e Prettier; TypeScript opcional para tipagem estática.  
- Testes/auditoria: Lighthouse, axe-core; Playwright ou Cypress para E2E (opcional).  
- Controle e deploy: Git, GitHub, GitHub Actions; hospedagem: GitHub Pages / Netlify / Vercel.  
- Design: Figma / Canva para protótipos e assets.  
- Ferramentas de produtividade/IA: ChatGPT, Copilot usados como auxílio em pesquisa e iterações.

Observação: itens marcados como "opcionais" não são necessários para executar o protótipo localmente, mas são recomendados para evolução, testes e automação.

## �🔐 Avisos de Segurança
- Não usar para produção real de autenticação
- Dados em `localStorage` não são criptografados
- Não há sanitização robusta (input controlado, mas protótipo)

## 🤝 Contribuindo
1. Abra uma issue descrevendo ideia/melhoria
2. Fork + branch temática (`feat/`, `fix/` ou `exp/`)
3. Pull Request com contexto claro (screenshots ajudam)

Sugestões futuras fáceis:
- `manifest.json` + ícones → modo instalável (PWA)
- Extração de CSS inline específico dos feeds para arquivo separado
- Modo “reduzir animações” via `prefers-reduced-motion`
- Teste visual automatizado (ex.: Playwright) para validar regressões de layout

## 🧪 Testes
Por ser estático, testes não foram configurados. Caso queira evoluir:
- Adicionar suíte de lint (ESLint) + formatação (Prettier)
- Usar Playwright para verificar se navegação PJAX mantém áudio tocando

## 📜 Changelog Histórico
v0.2.5-alfa (atual)
- Atualização do `README` com a nova seção "Ferramentas e tecnologias" (v0.2.5-alfa).  
- Página de Créditos: layout atualizado para cards mais legíveis ao público.  
- Documentação e notas de versão padronizadas; recomendações de tooling adicionadas.  

v0.2.4-alfa
- Caixa “Sugestões” (landing) com modal e armazenamento local.
- Força seleção diária de humor (reseta a cada dia ou via `?force=1`).
- Rebalanceamento e coerência das métricas dos três feeds (comentários no código justificando proporções).
- Integração suave com áudio persistente e efeitos de clique.

v0.2.3-alfa
- Lazy loading de logos dos feeds.
- Remoção de `onerror` inline → fallback por classe `.img-fallback`.
- Estilos de foco consistentes com `:focus-visible`.
- Função `formatMetric` para valores numéricos compactos.
- Refinado alt da logo principal (primeira ocorrência contextualizada).
- Limpeza de comentários CSS desnecessários.

v0.2.2-alfa
- Feeds expandidos (diversidade de exemplos para testes de UX).
- Inicialização resiliente dos feeds (não depende apenas de `DOMContentLoaded`).
- Evento `lumari:pjax:after` adicionado no ciclo de navegação parcial.
- Meta `format-detection` adicionada para todos os HTML (Android/iOS não auto-linkar números ou emails).
- Área de toque maior em links de navegação (melhor ergonomia móvel).

v0.2.1-alfa
- Fix: uso de id correto `globalAudio` nos fallbacks locais das páginas `home-public.html` e `home-creator.html`.
- Removido arquivo de backup legado `js/main.js.backup`.
- Ajustes menores de documentação.

v0.2.0-alfa
- Skip-link + `id="main"` em todas as páginas
- Meta descriptions + theme-color + favicon padronizado
- Bug fix: persistência de emoção corrigida em `home-public.html`
- Remoção de `js/main.js.backup` (intenção original; efetivada na 0.2.1)
- Remoção de link inválido `admin.html`

v0.1.9-alfa
- Persistência da última emoção escolhida para o público (`localStorage` + autoredirecionamento)
- Filtros de conteúdo por tipo (Todos / Vídeos / Texto) nos feeds

v0.1.8-alfa
- Reorganização geral do README
- Remoção de hooks locais de push automático

v0.1.7-alfa
- Reversão de push automático
- Melhorias de fluxo de documentação

v0.1.6-alfa
- Ajustes e estabilidade dos acordeões

v0.1.5-alfa
- Tendências em tempo real (mock) com mini-logos
- Login/Signup usando `pjaxLoad` quando possível

v0.1.4
- Responsividade mobile aprimorada

v0.1.3
- Ajustes de grid/métricas criador

v0.1.2
- Termos de Uso (modal) + tela de recusa

v0.1.1
- Sons de clique

v0.1.0
- PJAX inicial mantendo áudio

v0.0.x (0.0.9 → 0.0.1)
- Iterações iniciais: acessibilidade básica, visuais, feeds, autenticação mock

v0.0.0-alfa
- Estrutura inicial

## 🏅 Menção Honrosa
Projeto acadêmico (Curso de Marketing – Senac Viamão/RS) desenvolvido colaborativamente por:
- Júlia Silva
- Lucas Tavares
- Maluana Amaral
- Muriel Rosa

Cada integrante contribuiu com pesquisa, conceito e execução para que o protótipo unisse teoria e prática de forma consistente.

---

Caso queira que eu avance com PWA (manifest + icons) ou extração de CSS dos feeds, abra uma issue ou solicite diretamente.

Boa exploração! 🎧
