// main.js - LUMARI
// Áudio persistente + PJAX leve + clique sonoro

document.addEventListener('DOMContentLoaded', () => {
  if(window.lumariAudioInitialized) return;
  window.lumariAudioInitialized = true;
  
  const UNMUTED_KEY = 'lumari_unmuted';
  const TERMS_KEY = 'lumari_terms_accepted';
  const toggle = document.getElementById('audioToggle');
  // Descobrir prefixo relativo até a raiz onde ficam /sound e /logo
  const basePrefix = (function(){
    try{
      const path = location.pathname;
      return path.includes('/pages/') ? '../' : '';
    }catch(e){ return ''; }
  })();
  
  // Criar áudio global
  let audioRef = document.getElementById('globalAudio');
  if(!audioRef){
    audioRef = document.createElement('audio');
    audioRef.id = 'globalAudio';
    audioRef.src = basePrefix + 'sound/sound.mp3';
    audioRef.loop = true;
    audioRef.volume = 1;
    audioRef.preload = 'auto';
    document.body.appendChild(audioRef);
  }

  // Som de click
  let clickAudioRef = document.getElementById('globalClickAudio');
  if(!clickAudioRef){
    clickAudioRef = document.createElement('audio');
    clickAudioRef.id = 'globalClickAudio';
    clickAudioRef.src = basePrefix + 'sound/mouse-click.mp3';
    clickAudioRef.volume = 0.3;
    clickAudioRef.preload = 'auto';
    document.body.appendChild(clickAudioRef);
  }

  function playClickSound(){
    try{ 
      if(clickAudioRef && localStorage.getItem(UNMUTED_KEY)==='true'){ 
        clickAudioRef.currentTime=0; 
        clickAudioRef.play(); 
      } 
    }catch(e){}
  }

  // UI do toggle
  function updateToggleUI(){
    if(!toggle) return;
    if(audioRef.muted){
        // Atualiza ícone e estados acessíveis
        toggle.textContent = '🔇';
        toggle.classList.remove('active');
        toggle.setAttribute('aria-pressed', 'false');
        toggle.setAttribute('aria-label', 'Ativar som');
      } else {
        // ícone de som ativo
        toggle.textContent = '🔊';
        toggle.classList.add('active');
        toggle.setAttribute('aria-pressed', 'true');
        toggle.setAttribute('aria-label', 'Desativar som');
    }
  }

  // Autoplay
  async function attemptAutoplay(){
    try{
      audioRef.muted = false;
      await audioRef.play();
      localStorage.setItem(UNMUTED_KEY,'true');
      updateToggleUI();
      return true;
    }catch(e){
      try{
        audioRef.muted = true;
        await audioRef.play();
        localStorage.setItem(UNMUTED_KEY,'false');
        updateToggleUI();
        return true;
      }catch(err){ 
        return false; 
      }
    }
  }

  // Toggle
  if(toggle){
    toggle.addEventListener('click', async (e)=>{
      e.preventDefault();
      try{
        if(audioRef.paused) await audioRef.play();
        audioRef.muted = !audioRef.muted;
        localStorage.setItem(UNMUTED_KEY, String(!audioRef.muted));
        updateToggleUI();
      }catch(e){}
    });
  }

  // PJAX simples que mantém áudio
  function normalizeHref(h){
    try{
      if(!h || h==='') return '';
      if(h.startsWith('#') || h.startsWith('mailto:') || h.startsWith('tel:')) return h;
      if(h.startsWith('http')) return h;
      let base = location.origin + location.pathname.replace(/\/[^\/]*$/, '/');
      if(base.includes('/pages/')) base = base.split('/pages/')[0] + '/';
      if(h.startsWith('./')) h = h.slice(2);
      if(h.startsWith('../')) return base + h.slice(3);
      if(h.startsWith('/')) return location.origin + h;
      return base + h;
    }catch(e){ 
      return h; 
    }
  }

  async function pjaxLoad(url, addToHistory=true){
    // SALVAR estado do áudio antes da navegação
    const wasPlaying = !audioRef.paused;
    const wasMuted = audioRef.muted;
    
    try{
      const res = await fetch(url, {cache:'no-store'});
      if(!res.ok){ window.location.href=url; return; }
      
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text,'text/html');
      // Coletar e injetar <style> inline do novo documento no <head> atual (evita perder CSS específico ao usar PJAX)
      try{
        const newStyles = Array.from(doc.head.querySelectorAll('style'));
        const curHead = document.head;
        const existingHashes = new Set(Array.from(curHead.querySelectorAll('style[data-pjax-style]')).map(s=>s.getAttribute('data-hash')));
        newStyles.forEach(st=>{
          const content = st.textContent || '';
          const hash = String(content.length) + '-' + (content.split('').reduce((a,c)=> (a + c.charCodeAt(0)) % 100000, 0));
          if(existingHashes.has(hash)) return;
          const clone = document.createElement('style');
          clone.textContent = content;
          clone.setAttribute('data-pjax-style', '1');
          clone.setAttribute('data-hash', hash);
          curHead.appendChild(clone);
        });
      }catch(e){}
      const newMain = doc.querySelector('main.container');
      if(!newMain){ window.location.href=url; return; }
      
      const curMain = document.querySelector('main.container');
      if(curMain) curMain.innerHTML = newMain.innerHTML;
      
  // Executar scripts da nova página (exceto este próprio)
      try{
        const scripts = Array.from(doc.querySelectorAll('script'));
        scripts.forEach(s=>{
          if(s.src && s.src.includes('main.js')) return; // evitar recarregar main.js
          const sc = document.createElement('script');
          if(s.src) sc.src = s.src;
          sc.text = s.textContent || '';
          document.body.appendChild(sc);
          setTimeout(()=>{ try{ sc.remove(); }catch(e){} }, 100);
        });
      }catch(e){}
      
  if(doc.title) document.title = doc.title;
      if(addToHistory) history.pushState({url}, '', url);
      
      // RESTAURAR estado do áudio IMEDIATAMENTE
      try{
        if(wasPlaying && audioRef.paused){
          await audioRef.play();
        }
        audioRef.muted = wasMuted;
        updateToggleUI();
      }catch(e){}
      
      // Re-adicionar event listeners e acordeões
      addClickSounds();
      enhanceAccordions();
      // Emitir evento custom informando que a troca PJAX terminou
      try{ document.dispatchEvent(new CustomEvent('lumari:pjax:after', { detail:{ url } })); }catch(e){}
      
    }catch(e){ 
      window.location.href=url; 
    }
  }

  // Event listener para links
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a'); 
    if(!a) return;
    const href = a.getAttribute('href'); 
    if(!href) return;
    
    const normalized = normalizeHref(href);
    
    if(normalized.startsWith('#')){
      // Âncoras internas
      return;
    }
    
    if(normalized.startsWith('mailto:') || normalized.startsWith('tel:')) return;
    if(a.target === '_blank') return;
    
    if(normalized.endsWith('.html') || normalized === '' || normalized === './'){
      e.preventDefault(); 
      pjaxLoad(normalized, true);
    }
  });

  // Sons de click
  function addClickSounds(){
    document.querySelectorAll('button, .btn, .access-card, summary, a').forEach(el => {
      if(el.dataset.clickInited) return; 
      el.dataset.clickInited = '1';
      el.addEventListener('click', playClickSound);
    });
  }

  // Acordeões com transição suave para .accordion-content
  function enhanceAccordions(){
    document.querySelectorAll('details').forEach(detail=>{
      if(detail.dataset.accordion) return;
      detail.dataset.accordion = '1';
      const content = detail.querySelector('.accordion-content');
      if(!content) return;

      // Estado inicial respeitando atributo 'open'
      if(detail.hasAttribute('open')){
        content.classList.add('open');
        content.style.height = 'auto';
      } else {
        content.classList.remove('open');
        content.style.height = '0px';
      }

      function openContent(){
        content.classList.add('open');
        // Se estava em 0, anima até scrollHeight e depois fixa em auto
        const start = content.getBoundingClientRect().height;
        content.style.height = start + 'px';
        void content.offsetHeight; // reflow
        const target = content.scrollHeight;
        content.style.height = target + 'px';
        const onEnd = ()=>{
          content.style.height = 'auto';
          content.removeEventListener('transitionend', onEnd);
        };
        content.addEventListener('transitionend', onEnd);
      }

      function closeContent(){
        // Se estava em auto, define a altura atual antes de animar para 0
        const start = content.getBoundingClientRect().height;
        content.style.height = start + 'px';
        void content.offsetHeight; // reflow
        content.style.height = '0px';
        const onEnd = ()=>{
          content.classList.remove('open');
          content.removeEventListener('transitionend', onEnd);
        };
        content.addEventListener('transitionend', onEnd);
      }

      detail.addEventListener('toggle', ()=>{
        if(detail.open){ openContent(); } else { closeContent(); }
      });
    });
  }

  // Inicialização
  const el = document.getElementById('year'); 
  if(el) el.textContent = new Date().getFullYear();
  
  enhanceAccordions();
  addClickSounds();
  attemptAutoplay();
  
  // Tentar tocar no primeiro gesto
  const handler = async ()=>{
    try{
      if(audioRef.paused) await audioRef.play();
      const wasUnmuted = localStorage.getItem(UNMUTED_KEY) === 'true';
      if(wasUnmuted && audioRef.muted){
        audioRef.muted = false;
        updateToggleUI();
      }
    }catch(e){}
    window.removeEventListener('pointerdown', handler);
    window.removeEventListener('keydown', handler);
  };
  window.addEventListener('pointerdown', handler);
  window.addEventListener('keydown', handler);
  
  // Utilitário para resolver link da Home correto (raiz x /pages)
  function resolveHomeHref(){
    try{ return location.pathname.includes('/pages/') ? '../index.html' : 'index.html'; }catch(e){ return 'index.html'; }
  }

  // ===== Termos de Uso (modal com conteúdo por perfil) =====
  function createTermsModal(role){
    if(document.getElementById('termsModal')) return;
    const modal = document.createElement('div');
    modal.id = 'termsModal';
    modal.className = 'modal-backdrop';
    const card = document.createElement('div');
    card.className = 'modal-card';
    const isCreator = String(role||'').toLowerCase()==='creator';
    const title = isCreator ? 'Termo de Uso – Criador de Conteúdo' : 'Termo de Uso – Público Geral';
    const body = isCreator ? `
      <p>Bem-vindo(a), criador(a)! A LUMARI foi desenvolvida para apoiar você na produção de conteúdos digitais mais estratégicos, emocionais e conectados ao público. Aqui, unimos tecnologia, pesquisa acadêmica e inovação para ampliar seu impacto no mercado digital.</p>
      <h4>1. Uso da Plataforma</h4>
      <p>O uso é destinado à criação, publicação e análise de conteúdos digitais, respeitando princípios de ética, segurança, privacidade e direitos autorais. É proibido publicar conteúdos ilegais, discriminatórios, violentos, enganosos ou que comprometam a integridade da plataforma e de seus usuários.</p>
      <h4>2. Privacidade e Dados</h4>
      <p>Seus dados e os de seus seguidores serão tratados com segurança e confidencialidade. A plataforma pode solicitar permissão para usar câmera (expressões faciais) e áudio/microfone (tom de voz) como ferramentas de apoio às métricas emocionais. O uso é opcional, mas recomendado para análises mais completas.</p>
      <h4>3. Relatórios e Estratégia</h4>
      <p>Você terá acesso a relatórios que unem métricas tradicionais (visualizações, retenção, compartilhamentos) a métricas emocionais (atenção, surpresa, alegria, frustração). Esses relatórios servem como apoio estratégico; a responsabilidade pelo uso e interpretação é exclusivamente sua.</p>
      <h4>4. Responsabilidade do Criador</h4>
  <p>O criador é responsável pelo conteúdo publicado e deve garantir que não viole direitos de terceiros. A LUMARI poderá suspender conteúdos que não estejam em conformidade com os termos.</p>
      <h4>5. Aceite</h4>
      <p>Ao prosseguir, você declara estar de acordo com estes termos e autoriza (se desejar) o uso dos recursos opcionais de análise emocional.</p>
  <p style="margin-top:8px;color:var(--muted)">👉 Se aceitar, clique em “Aceitar e Continuar” para acessar a LUMARI como Criador de Conteúdo.</p>
    ` : `
  <p>Bem-vindo(a) à LUMARI! Nossa missão é oferecer uma experiência digital inovadora, combinando neuromarketing, inteligência artificial e ciência do comportamento para tornar seu consumo de conteúdo mais humano, relevante e consciente.</p>
      <h4>1. Uso da Plataforma</h4>
      <p>O acesso é destinado ao uso pessoal, respeitando princípios de ética, segurança e responsabilidade digital. É proibido utilizar a plataforma para fins ilegais, ofensivos ou que prejudiquem outros usuários.</p>
      <h4>2. Privacidade e Dados</h4>
      <p>Seus dados serão tratados de forma segura e confidencial, de acordo com legislações de proteção de dados. A plataforma pode solicitar permissão para o uso da câmera (expressões faciais) e do áudio/microfone (tom de voz) para melhorar a análise emocional. O uso é opcional e depende da sua autorização.</p>
      <h4>3. Experiência Personalizada</h4>
      <p>Com base nas suas interações e emoções detectadas, oferecemos recomendações e relatórios que tornam sua experiência mais envolvente e alinhada ao seu perfil.</p>
      <h4>4. Aceite</h4>
      <p>Ao prosseguir, você concorda com os termos e com o uso opcional das ferramentas de análise emocional.</p>
  <p style="margin-top:8px;color:var(--muted)">👉 Se aceitar, clique em “Aceitar e Continuar” para acessar a LUMARI.</p>
    `;
    card.innerHTML = `
      <div class="modal-header">
        <div class="modal-title">${title}</div>
      </div>
      <div class="modal-body">${body}</div>
      <div class="modal-actions">
        <button class="btn btn-decline" id="termsDecline">Não Aceito</button>
        <button class="btn btn-accept" id="termsAccept">Aceitar e Continuar</button>
      </div>
    `.trim();
    modal.appendChild(card);
    document.body.appendChild(modal);
    requestAnimationFrame(()=>{ modal.classList.add('show'); });
    
    document.getElementById('termsAccept').addEventListener('click', ()=>{
      try{ localStorage.setItem(TERMS_KEY, 'true'); }catch(e){}
      modal.classList.remove('show');
      setTimeout(()=>{ try{ modal.remove(); }catch(e){} }, 280);
      try{ document.dispatchEvent(new CustomEvent('lumari:termsAccepted')); }catch(e){}
    });
    document.getElementById('termsDecline').addEventListener('click', ()=>{
      modal.classList.remove('show');
      setTimeout(()=>{ try{ modal.remove(); }catch(e){} showDenyScreen(role); }, 200);
      try{ document.dispatchEvent(new CustomEvent('lumari:termsDeclined')); }catch(e){}
    });
  }
  
  function showDenyScreen(role){
    if(document.getElementById('denyScreen')) return;
    const wrap = document.createElement('div');
    wrap.id = 'denyScreen';
    wrap.className = 'deny-screen';
    const isCreator = String(role||'').toLowerCase()==='creator';
    const title = isCreator ? 'Criador de Conteúdo – Acesso Negado' : 'Público Geral – Acesso Negado';
    const desc = isCreator
      ? 'Você optou por não aceitar os Termos de Uso da LUMARI. Sem essa autorização, não será possível utilizar as ferramentas de criação e análise de conteúdo, pois o aceite é necessário para proteger os direitos da comunidade e garantir a qualidade das interações dentro da plataforma.'
      : 'Você optou por não aceitar os Termos de Uso da LUMARI. Sem essa autorização, infelizmente não será possível acessar os conteúdos da plataforma, já que o aceite é essencial para garantir uma experiência segura, personalizada e em conformidade com nossas diretrizes.';
    const homeHref = resolveHomeHref();
    wrap.innerHTML = `
      <div class="deny-card">
        <h2>${title}</h2>
        <p>${desc}</p>
        <div style="display:flex;gap:10px;justify-content:center">
          <button class="btn btn-accept" id="backToTerms">Voltar aos Termos</button>
          <a href="${homeHref}" class="btn btn-decline">Ir para Home</a>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
    const back = document.getElementById('backToTerms');
    if(back){ back.addEventListener('click', ()=>{ try{ wrap.remove(); }catch(e){} createTermsModal(role); }); }
  }
  
  function ensureTermsAcceptedOrShow(role){
    try{
      const ok = localStorage.getItem(TERMS_KEY) === 'true';
      if(!ok){ createTermsModal(role); return false; }
      return true;
    }catch(e){ createTermsModal(role); return false; }
  }
  
  // Expor utilitários no escopo global
  try{
    window.createTermsModal = createTermsModal;
    window.ensureTermsAcceptedOrShow = ensureTermsAcceptedOrShow;
    // Expor pjaxLoad e som de clique para uso em páginas (login/signup) sem recarregar a página inteira
    window.pjaxLoad = pjaxLoad;
    window.lumariPlayClick = playClickSound;
    // Formatação compacta de métricas numéricas (ex.: 2100 -> 2.1K)
    window.formatMetric = function formatMetric(value){
      if(value == null) return '';
      if(typeof value === 'string'){
        // já pode estar formatado (contém letra ou ponto com K/M/B)
        if(/[a-zA-Z]/.test(value)) return value;
        const num = Number(value.replace(/[^0-9.]/g,''));
        if(!isFinite(num)) return value;
        value = num;
      }
      if(typeof value !== 'number') return String(value);
      const abs = Math.abs(value);
      const round = (n, d=1)=>{
        const p = Math.pow(10,d);
        return Math.round(n*p)/p;
      };
      if(abs >= 1_000_000_000) return round(value/1_000_000_000,1)+'B';
      if(abs >= 1_000_000) return round(value/1_000_000,1)+'M';
      if(abs >= 10_000) return Math.round(value/1000)+'K'; // acima de 10K sem decimal
      if(abs >= 1_000) return round(value/1_000,1)+'K';
      return String(value);
    };
  }catch(e){}

  // ===== Efeito de boas-vindas (tremor + confetes + menção honrosa) =====
  (function welcomeHonors(){
    try{
      // Evita repetir na mesma sessão
      if(sessionStorage.getItem('lumari_honors_shown') === '1') return;
      sessionStorage.setItem('lumari_honors_shown','1');

      // Tremor breve no body
      document.body.classList.add('shake-once');
      setTimeout(()=>{ document.body.classList.remove('shake-once'); }, 700);

      // Confetes simples
      const container = document.createElement('div');
      container.className = 'confetti-container';
      const colors = ['#7c4dff','#5e3cff','#ff6b6b','#ffd166','#06d6a0','#4dabf7'];
      const COUNT = 50;
      for(let i=0;i<COUNT;i++){
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random()*100 + 'vw';
        c.style.background = colors[Math.floor(Math.random()*colors.length)];
        c.style.animationDuration = (1.8 + Math.random()*1.6) + 's, ' + (1 + Math.random()*1.2) + 's';
        c.style.animationDelay = (Math.random()*0.6) + 's, 0s';
        c.style.transform = 'translateY(-20px) rotate(' + (Math.random()*360) + 'deg)';
        container.appendChild(c);
      }
      document.body.appendChild(container);
      // limpeza automática após alguns segundos
      setTimeout(()=>{ try{ container.remove(); }catch(e){} }, 3500);

      // Modal de Menção Honrosa
      if(document.getElementById('honorsModal')) return;
      const modal = document.createElement('div');
      modal.id = 'honorsModal';
      modal.className = 'modal-backdrop honors';
      const card = document.createElement('div');
      card.className = 'modal-card';
      card.innerHTML = `
        <div class="modal-header">
          <div class="modal-title">Menção Honrosa</div>
        </div>
        <div class="modal-body">
          <p>Este projeto acadêmico, desenvolvido no âmbito do curso de Marketing do Senac Viamão – RS, representa o esforço coletivo, a criatividade e a dedicação de um grupo comprometido em transformar ideias em soluções inovadoras.</p>
          <p>Um agradecimento especial aos alunos que deram vida a este trabalho:</p>
          <ul>
            <li>Júlia Silva</li>
            <li>Lucas Tavares</li>
            <li>Maluana Amaral</li>
            <li>Muriel Rosa</li>
          </ul>
          <p>Cada um contribuiu com talento, pesquisa e empenho para que este projeto fosse concluído com excelência, unindo teoria e prática em um resultado inspirador.</p>
        </div>
        <div class="modal-actions" style="justify-content:center">
          <button class="btn btn-accept" id="honorsOk">Obrigado a todos, clique para começar!</button>
        </div>
      `;
      modal.appendChild(card);
      document.body.appendChild(modal);
      requestAnimationFrame(()=>{ modal.classList.add('show'); });

      const ok = modal.querySelector('#honorsOk');
      if(ok){ ok.addEventListener('click', ()=>{
        try{ modal.classList.remove('show'); }catch(e){}
        setTimeout(()=>{ try{ modal.remove(); }catch(e){} }, 280);
      }); }
    }catch(e){}
  })();
});
