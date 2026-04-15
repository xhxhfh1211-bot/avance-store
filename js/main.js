/* ============================================================
   AVANCE STORE · main.js
   - Promo bar dismiss (localStorage 기억)
   - Header scroll detection (.is-scrolled)
   - Mobile drawer toggle (스크롤 잠금)
   - data-year 자동 주입
   - Search overlay toggle
   의존: DOM (defer 로드 전제), main.css, components.css
============================================================ */

(function () {
  'use strict';

  /* --------------------------------
     0. Helpers
  -------------------------------- */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const lockScroll = () => {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  };
  const unlockScroll = () => {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  };

  /* --------------------------------
     1. Promo Bar — dismiss + remember
  -------------------------------- */
  const PROMO_KEY = 'avance.promoBar.dismissed';

  function initPromoBar() {
    const bar = qs('#promoBar');
    if (!bar) return;

    // 재방문 시 저장된 상태면 숨김
    try {
      if (localStorage.getItem(PROMO_KEY) === '1') {
        bar.setAttribute('hidden', '');
        return;
      }
    } catch (e) {
      /* localStorage 접근 불가 환경 — 조용히 무시 */
    }

    qsa('[data-promo-close]', bar).forEach((btn) => {
      btn.addEventListener('click', () => {
        bar.setAttribute('hidden', '');
        try {
          localStorage.setItem(PROMO_KEY, '1');
        } catch (e) { /* noop */ }
      });
    });
  }

  /* --------------------------------
     2. Header scroll detection
     10px 이상 스크롤 시 .is-scrolled
  -------------------------------- */
  function initHeaderScroll() {
    const header = qs('[data-header]');
    if (!header) return;

    const THRESHOLD = 10;
    let ticking = false;

    const update = () => {
      if (window.scrollY > THRESHOLD) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update(); // 초기 상태 반영
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --------------------------------
     3. Mobile Drawer toggle
  -------------------------------- */
  function initMobileDrawer() {
    const drawer = qs('#mobileDrawer');
    const toggles = qsa('[data-menu-toggle]');
    const closes  = qsa('[data-menu-close]');
    if (!drawer) return;

    const open = () => {
      drawer.hidden = false;
      // hidden 제거 직후 transition이 타도록 한 틱 지연
      requestAnimationFrame(() => {
        drawer.setAttribute('aria-hidden', 'false');
      });
      toggles.forEach((t) => t.setAttribute('aria-expanded', 'true'));
      lockScroll();
    };

    const close = () => {
      drawer.setAttribute('aria-hidden', 'true');
      toggles.forEach((t) => t.setAttribute('aria-expanded', 'false'));
      unlockScroll();
      // 전환이 끝난 뒤 hidden 복원 (600ms)
      window.setTimeout(() => {
        if (drawer.getAttribute('aria-hidden') === 'true') {
          drawer.hidden = true;
        }
      }, 600);
    };

    toggles.forEach((btn) => {
      btn.addEventListener('click', () => {
        const isOpen = drawer.getAttribute('aria-hidden') === 'false';
        isOpen ? close() : open();
      });
    });

    closes.forEach((btn) => {
      btn.addEventListener('click', close);
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.getAttribute('aria-hidden') === 'false') {
        close();
      }
    });

    // 드로어 내부 메뉴 링크 클릭 시 자동 닫기
    qsa('a', drawer).forEach((a) => {
      a.addEventListener('click', close);
    });
  }

  /* --------------------------------
     4. data-year 자동 주입
  -------------------------------- */
  function initAutoYear() {
    const year = new Date().getFullYear();
    qsa('[data-year]').forEach((el) => {
      el.textContent = String(year);
    });
  }

  /* --------------------------------
     5. Search toggle
     data-search-toggle 클릭 → #siteSearch 열기/닫기
     HTML에 #siteSearch가 없으면 조용히 무시 (선택적 기능)
  -------------------------------- */
  function initSearchToggle() {
    const toggles = qsa('[data-search-toggle]');
    const closes  = qsa('[data-search-close]');
    const overlay = qs('#siteSearch');
    if (!toggles.length) return;

    const open = () => {
      if (!overlay) return;
      overlay.hidden = false;
      requestAnimationFrame(() => {
        overlay.setAttribute('aria-hidden', 'false');
      });
      toggles.forEach((t) => t.setAttribute('aria-expanded', 'true'));
      lockScroll();

      const input = overlay.querySelector('input[type="search"], input[type="text"]');
      if (input) {
        window.setTimeout(() => input.focus(), 100);
      }
    };

    const close = () => {
      if (!overlay) return;
      overlay.setAttribute('aria-hidden', 'true');
      toggles.forEach((t) => t.setAttribute('aria-expanded', 'false'));
      unlockScroll();
      window.setTimeout(() => {
        if (overlay.getAttribute('aria-hidden') === 'true') {
          overlay.hidden = true;
        }
      }, 600);
    };

    toggles.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!overlay) {
          /* 검색 오버레이가 구현되기 전까지는 정보만 표시 — 추후 교체 */
          console.info('[AVANCE] 검색 오버레이(#siteSearch)가 아직 마크업되지 않았습니다.');
          return;
        }
        const isOpen = overlay.getAttribute('aria-hidden') === 'false';
        isOpen ? close() : open();
      });
    });

    closes.forEach((btn) => btn.addEventListener('click', close));

    document.addEventListener('keydown', (e) => {
      if (!overlay) return;
      if (e.key === 'Escape' && overlay.getAttribute('aria-hidden') === 'false') {
        close();
      }
    });
  }

  /* --------------------------------
     Boot
  -------------------------------- */
  function boot() {
    initAutoYear();
    initPromoBar();
    initHeaderScroll();
    initMobileDrawer();
    initSearchToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
