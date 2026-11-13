/* Interações acessíveis do modelo Nexo. Não há coleta de dados nem backend. */
(() => {
  'use strict';
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const smooth = reducedMotion.matches ? 'auto' : 'smooth';

  // Navegação responsiva e submenu.
  const menu = $('.menu-toggle');
  const nav = $('#main-nav');
  const dropdown = $('#specialty-dropdown');
  const specialtyTrigger = $('#specialty-trigger');
  function closeMenu() {
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Abrir menu');
    nav?.classList.remove('is-open');
    dropdown?.classList.remove('is-open');
    specialtyTrigger?.setAttribute('aria-expanded', 'false');
  }
  menu?.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!expanded));
    menu.setAttribute('aria-label', expanded ? 'Abrir menu' : 'Fechar menu');
    nav?.classList.toggle('is-open', !expanded);
  });
  specialtyTrigger?.addEventListener('click', () => {
    const expanded = specialtyTrigger.getAttribute('aria-expanded') === 'true';
    specialtyTrigger.setAttribute('aria-expanded', String(!expanded));
    dropdown?.classList.toggle('is-open', !expanded);
  });
  $$('#main-nav a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  // Filtros das áreas de cuidado.
  const specialtyCards = $$('.specialty-card');
  const specialtyFilters = $$('.specialty-filter');
  const specialtyStatus = $('#specialty-status');
  function filterSpecialties(group) {
    const groupId = specialtyFilters.some(control => control.dataset.specialty === group) ? group : 'todas';
    let visible = 0;
    specialtyCards.forEach(card => {
      const match = groupId === 'todas' || card.dataset.group === groupId;
      card.hidden = !match;
      if (match) visible += 1;
    });
    specialtyFilters.forEach(button => {
      const active = button.dataset.specialty === groupId;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (specialtyStatus) specialtyStatus.textContent = visible + (visible === 1 ? ' especialidade apresentada.' : ' especialidades apresentadas.');
  }
  specialtyFilters.forEach(button => button.addEventListener('click', () => filterSpecialties(button.dataset.specialty)));
  $$('[data-select-specialty]').forEach(link => link.addEventListener('click', () => filterSpecialties(link.dataset.selectSpecialty)));
  $$('[data-open-specialties]').forEach(button => button.addEventListener('click', () => {
    filterSpecialties(button.dataset.openSpecialties === 'essencial' ? 'todas' : 'terapias');
    $('#especialidades')?.scrollIntoView({behavior:smooth,block:'start'});
  }));

  // Modal de galeria. Imagens são ilustrativas do modelo.
  const photoNodes = $$('.gallery-photo');
  const galleryModal = $('#gallery-modal');
  const galleryPhoto = $('#gallery-modal-image');
  const galleryCaption = $('#gallery-caption');
  let galleryIndex = 0;
  function renderGallery(index) {
    if (!photoNodes.length) return;
    galleryIndex = (index + photoNodes.length) % photoNodes.length;
    const item = photoNodes[galleryIndex];
    const img = $('img',item);
    if (!img) return;
    galleryPhoto.src = img.src;
    galleryPhoto.alt = img.alt;
    galleryCaption.textContent = (item.querySelector('span')?.innerText || img.alt).replace('↗','').trim();
  }
  photoNodes.forEach((node,index) => node.addEventListener('click', () => {
    renderGallery(index);
    galleryModal?.showModal();
  }));
  $('#gallery-prev')?.addEventListener('click', () => renderGallery(galleryIndex - 1));
  $('#gallery-next')?.addEventListener('click', () => renderGallery(galleryIndex + 1));
  $('#close-gallery')?.addEventListener('click', () => galleryModal?.close());
  galleryModal?.addEventListener('click', event => { if (event.target === galleryModal) galleryModal.close(); });
  galleryModal?.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); renderGallery(galleryIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); renderGallery(galleryIndex + 1); }
  });

  // Depoimentos fictícios, com navegação na versão mobile e reordenação em desktop.
  const reviewsGrid = $('#reviews-grid');
  let reviewPosition = 0;
  function syncReviews() {
    const cards = $$('.review-card', reviewsGrid);
    cards.forEach((card,index) => card.classList.toggle('is-active',index === 0));
    const status = $('#review-progress');
    if (status) status.textContent = String(reviewPosition + 1).padStart(2,'0') + ' — 03';
  }
  $('#review-next')?.addEventListener('click', () => {
    const cards = $$('.review-card', reviewsGrid);
    if (cards.length) reviewsGrid.appendChild(cards[0]);
    reviewPosition = (reviewPosition + 1) % 3;
    syncReviews();
  });
  $('#review-prev')?.addEventListener('click', () => {
    const cards = $$('.review-card', reviewsGrid);
    if (cards.length) reviewsGrid.insertBefore(cards[cards.length - 1],cards[0]);
    reviewPosition = (reviewPosition + 2) % 3;
    syncReviews();
  });
  syncReviews();

  // Carrossel de atendimentos, com cálculo responsivo da largura do card.
  const treatmentTrack = $('#treatment-track');
  const treatmentViewport = $('#treatment-viewport');
  const treatmentSlides = $$('.treatment-slide',treatmentTrack);
  let treatmentIndex = 0;
  function maxTreatmentIndex() {
    if (!treatmentTrack || !treatmentViewport || !treatmentSlides.length) return 0;
    const gap = parseFloat(getComputedStyle(treatmentTrack).columnGap) || 0;
    const size = treatmentSlides[0].getBoundingClientRect().width + gap;
    if (!size) return 0;
    const maxOffset = treatmentTrack.scrollWidth - treatmentViewport.clientWidth;
    return Math.max(0,Math.ceil(maxOffset / size));
  }
  function renderTreatmentTrack() {
    if (!treatmentTrack || !treatmentSlides.length) return;
    const gap = parseFloat(getComputedStyle(treatmentTrack).columnGap) || 0;
    const size = treatmentSlides[0].getBoundingClientRect().width + gap;
    const maxOffset = Math.max(0,treatmentTrack.scrollWidth - treatmentViewport.clientWidth);
    const translate = Math.min(treatmentIndex * size,maxOffset);
    treatmentTrack.style.transform = 'translateX(-' + Math.max(0,translate) + 'px)';
  }
  function moveTreatments(delta) {
    const max = maxTreatmentIndex();
    treatmentIndex += delta;
    if (treatmentIndex > max) treatmentIndex = 0;
    if (treatmentIndex < 0) treatmentIndex = max;
    renderTreatmentTrack();
  }
  $('#treatment-prev')?.addEventListener('click', () => moveTreatments(-1));
  $('#treatment-next')?.addEventListener('click', () => moveTreatments(1));
  window.addEventListener('resize', () => {
    treatmentIndex = Math.min(treatmentIndex,maxTreatmentIndex());
    renderTreatmentTrack();
  }, {passive:true});
  window.addEventListener('load',renderTreatmentTrack);
  renderTreatmentTrack();

  // Solicitação local: cópia da mensagem pronta, nenhum envio automático.
  const bookingModal = $('#booking-modal');
  const bookingForm = $('#booking-form');
  const preparedPanel = $('#message-panel');
  const preparedMessage = $('#prepared-message');
  const bookingSpecialty = $('#booking-specialty');
  const bookingUnit = $('#booking-unit');
  function openBooking(trigger) {
    if (trigger?.dataset?.specialtyRequest && bookingSpecialty) bookingSpecialty.value = trigger.dataset.specialtyRequest;
    const unit = trigger?.dataset?.bookUnit;
    if (unit && bookingUnit) bookingUnit.value = unit;
    preparedPanel.hidden = true;
    $('#copy-status').textContent = '';
    if (bookingModal?.showModal) bookingModal.showModal();
    else $('#contato')?.scrollIntoView({behavior:smooth});
  }
  $$('[data-open-booking]').forEach(button => button.addEventListener('click', () => openBooking(button)));
  $('#close-booking')?.addEventListener('click', () => bookingModal?.close());
  bookingModal?.addEventListener('click', event => { if (event.target === bookingModal) bookingModal.close(); });
  bookingForm?.addEventListener('submit',event => {
    event.preventDefault();
    if (!bookingForm.reportValidity()) return;
    const v = new FormData(bookingForm);
    const nome = String(v.get('nome') || '').trim();
    const telefone = String(v.get('telefone') || '').trim();
    const unidade = String(v.get('unidade') || '').trim();
    const especialidade = String(v.get('especialidade') || '').trim();
    const mensagem = String(v.get('mensagem') || '').trim();
    const lines = [
      'Olá! Gostaria de solicitar informações sobre uma consulta.',
      '',
      'Nome: ' + nome,
      'Contato: ' + telefone,
      'Unidade: ' + unidade,
      'Área de interesse: ' + especialidade,
      ...(mensagem ? ['Observações: ' + mensagem] : []),
      '',
      'Poderiam me informar sobre disponibilidade e próximos passos?'
    ];
    preparedMessage.value = lines.join('\n');
    preparedPanel.hidden = false;
    preparedPanel.scrollIntoView({behavior:smooth,block:'nearest'});
  });
  $('#copy-message')?.addEventListener('click',async () => {
    if (!preparedMessage?.value) return;
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(preparedMessage.value);
      } else {
        preparedMessage.focus();
        preparedMessage.select();
        if (!document.execCommand('copy')) throw new Error('clipboard');
      }
      $('#copy-status').textContent = 'Mensagem copiada!';
    } catch {
      preparedMessage.focus();
      preparedMessage.select();
      $('#copy-status').textContent = 'Selecione o texto acima e copie manualmente.';
    }
  });

  // Revelação progressiva (com respeito à preferência por movimento reduzido).
  const reveals = $$('.reveal');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    reveals.forEach(node => node.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }), {threshold:.07,rootMargin:'0px 0px -30px 0px'});
    reveals.forEach(node => observer.observe(node));
  }

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();