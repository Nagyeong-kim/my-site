/*
  script.js
  - 수정 위치 안내: 초기 테마 설정, 토글 텍스트, 갤러리 항목 동작을 이 파일에서 변경하세요.
*/

(function(){
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const modal = document.getElementById('img-modal');
  const modalImg = document.getElementById('modal-image');
  const modalCaption = document.getElementById('modal-caption');
  const modalClose = document.getElementById('modal-close');

  // 초기 테마 설정: 로컬 스토리지 우선, 그 다음 시스템 선호
  function initTheme(){
    const saved = localStorage.getItem('site-theme');
    if(saved){
      root.setAttribute('data-theme', saved);
      themeToggle.setAttribute('aria-pressed', saved === 'dark');
    } else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
      root.setAttribute('data-theme','dark');
      themeToggle.setAttribute('aria-pressed', 'true');
    }
  }

  function toggleTheme(){
    const cur = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    if(next === 'dark'){
      root.setAttribute('data-theme','dark');
      themeToggle.setAttribute('aria-pressed','true');
    } else {
      root.removeAttribute('data-theme');
      themeToggle.setAttribute('aria-pressed','false');
    }
    localStorage.setItem('site-theme', next);
  }

  themeToggle && themeToggle.addEventListener('click', toggleTheme);

  // 갤러리 모달 동작
  function openModal(src, alt){
    modalImg.src = src;
    modalImg.alt = alt || '';
    modalCaption.textContent = alt || '';
    modal.setAttribute('aria-hidden','false');
    // 포커스 관리: 모달 안으로 포커스 이동
    modalClose.focus();
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    modalImg.src = '';
    modalCaption.textContent = '';
  }

  // 갤러리 항목에 클릭 이벤트 연결
  document.querySelectorAll('.gallery-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const src = btn.getAttribute('data-src');
      const alt = btn.getAttribute('data-alt') || btn.querySelector('img')?.alt || '';
      openModal(src, alt);
    });
  });

  // 모달 닫기 핸들러
  modalClose && modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if(e.target === modal) closeModal();
  });

  // 키보드: ESC로 모달 닫기
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      if(modal.getAttribute('aria-hidden') === 'false') closeModal();
    }
  });

  // 초기화
  initTheme();
})();
