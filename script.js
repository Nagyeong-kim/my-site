/*
  script.js — NK Laser & Optics Laboratory
  - 다크모드, 검색 기능, 부드러운 상호작용 담당
  - 수정 위치: 검색 API 또는 테마 동작을 변경하려면 이 파일을 편집하세요
*/

(function(){
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const resInput = document.getElementById('res-query');
  const searchButtons = document.querySelectorAll('.search-buttons button');

  /* 다크 모드 초기화 및 토글 */
  function initTheme(){
    const saved = localStorage.getItem('lab-theme');
    if(saved){
      root.setAttribute('data-theme', saved);
      if(themeToggle) themeToggle.setAttribute('aria-pressed', saved === 'dark');
    } else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
      root.setAttribute('data-theme','dark');
      if(themeToggle) themeToggle.setAttribute('aria-pressed', 'true');
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
    localStorage.setItem('lab-theme', next);
  }

  if(themeToggle){
    themeToggle.addEventListener('click', toggleTheme);
  }

  /* 리소스 검색 핸들러 */
  function openResource(platform, query){
    if(!query) return;
    const q = encodeURIComponent(query);
    let url = '';
    switch(platform){
      case 'patents': url = `https://patents.google.com/?q=${q}`; break;
      case 'arxiv': url = `https://arxiv.org/search/?query=${q}&searchtype=all`; break;
      case 'ieee': url = `https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=${q}`; break;
      case 'scholar':
      default: url = `https://scholar.google.com/scholar?q=${q}`; break;
    }
    window.open(url, '_blank', 'noopener');
  }

  if(searchButtons && resInput){
    searchButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const platform = btn.getAttribute('data-target');
        const q = resInput.value.trim();
        if(!q){
          resInput.focus();
          return;
        }
        openResource(platform, q);
      });
    });
    // 엔터를 누르면 기본적으로 Scholar에서 검색
    resInput.addEventListener('keydown', (e) => {
      if(e.key === 'Enter'){
        e.preventDefault();
        const q = resInput.value.trim();
        if(q) openResource('scholar', q);
      }
    });
  }

  /* 부드러운 스크롤 (네비게이션) */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(href === '#') return;
      const target = document.querySelector(href);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior: 'smooth'});
      }
    });
  });

  /* IndexedDB 초기화 (데이터 복원) */
  async function initializeSampleData(){
    // Calendar 샘플 데이터
    const calendarDB = await new Promise((resolve, reject) => {
      const req = indexedDB.open('calendar-db', 1);
      req.onupgradeneeded = (e) => {
        const idb = e.target.result;
        if(!idb.objectStoreNames.contains('events')) idb.createObjectStore('events', {keyPath:'id', autoIncrement:true});
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    const calendarStore = calendarDB.transaction('events', 'readwrite').objectStore('events');
    const existingEvents = await new Promise((resolve) => {
      const req = calendarStore.getAll();
      req.onsuccess = () => resolve(req.result);
    });

    // 기존 데이터가 없으면 샘플 추가
    if(existingEvents.length === 0){
      const sampleEvents = [
        {
          title: 'Beam Shaping Research',
          date: '2025-12-15',
          startDate: '2025-12-15',
          endDate: '2025-12-17',
          importance: true,
          repeat: 'none',
          groupId: 1
        },
        {
          title: 'Lab Meeting',
          date: '2025-12-16',
          startDate: '2025-12-16',
          endDate: '2025-12-16',
          importance: false,
          repeat: 'weekly',
          repeatEnd: '2025-12-31',
          groupId: 2
        },
        {
          title: 'Equipment Maintenance',
          date: '2025-12-20',
          startDate: '2025-12-20',
          endDate: '2025-12-20',
          importance: true,
          repeat: 'none',
          groupId: 3
        },
        {
          title: 'Conference Presentation',
          date: '2025-12-25',
          startDate: '2025-12-25',
          endDate: '2025-12-26',
          importance: true,
          repeat: 'none',
          groupId: 4
        }
      ];

      sampleEvents.forEach(event => {
        calendarStore.add(event);
      });
    }

    // Equipment 샘플 데이터
    const equipmentDB = await new Promise((resolve, reject) => {
      const req = indexedDB.open('equipment-db', 1);
      req.onupgradeneeded = (e) => {
        const idb = e.target.result;
        if(!idb.objectStoreNames.contains('equipment')) idb.createObjectStore('equipment', {keyPath:'id', autoIncrement:true});
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    const equipmentStore = equipmentDB.transaction('equipment', 'readwrite').objectStore('equipment');
    const existingEquipment = await new Promise((resolve) => {
      const req = equipmentStore.getAll();
      req.onsuccess = () => resolve(req.result);
    });

    // 기존 데이터가 없으면 샘플 추가
    if(existingEquipment.length === 0){
      const sampleEquipment = [
        {
          name: 'High-Power Fiber Laser',
          category: 'Laser',
          model: 'IPG YLS-50000',
          serial: 'YLS-50K-20250101',
          quantity: 1,
          status: 'active',
          location: 'Lab A',
          date: '2024-03-15',
          dateUnknown: false,
          notes: '50W fiber laser system for beam shaping experiments'
        },
        {
          name: 'Spatial Light Modulator',
          category: 'Optics',
          model: 'Thorlabs SLM505',
          serial: 'SLM-505-001',
          quantity: 1,
          status: 'active',
          location: 'Lab B',
          date: '2024-06-20',
          dateUnknown: false,
          notes: '512x512 pixel phase modulation'
        },
        {
          name: 'Laser Power Meter',
          category: 'Measurement',
          model: 'Coherent LaserCheck',
          serial: 'LC-20250001',
          quantity: 2,
          status: 'active',
          location: 'Lab A',
          date: '2025-01-10',
          dateUnknown: false,
          notes: 'Digital laser power measurement'
        },
        {
          name: 'Optical Bench',
          category: 'Equipment',
          model: 'Newport MB4000A',
          serial: 'MB4K-0552',
          quantity: 1,
          status: 'maintenance',
          location: 'Lab C',
          date: '2023-11-05',
          dateUnknown: false,
          notes: 'Precision optical alignment platform'
        },
        {
          name: 'Dichroic Mirror Set',
          category: 'Optics',
          model: 'Various',
          serial: 'DCM-SET-2024',
          quantity: 8,
          status: 'active',
          location: 'Storage',
          dateUnknown: true,
          notes: 'High-power dichroic mirrors for wavelength separation'
        }
      ];

      sampleEquipment.forEach(item => {
        equipmentStore.add(item);
      });
    }
  }

  // 페이지 로드 시 데이터 초기화
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initializeSampleData);
  } else {
    initializeSampleData();
  }

  /* 초기화 */
  initTheme();
})();
