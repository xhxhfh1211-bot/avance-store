/* ============================================================
   AVANCE STORE · swiper-init.js
   - Hero 캐러셀 초기화
   - 인디케이터(.hero__indicator) 동기화
   - Swiper 미로드 / hero 요소 없음 / 슬라이드 1개 → 조용히 종료
   의존: https://cdn.jsdelivr.net/npm/swiper@11 (layout.html/index.html에서 로드)
============================================================ */

(function () {
  'use strict';

  /* --------------------------------
     Helpers
  -------------------------------- */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* --------------------------------
     Hero Swiper
  -------------------------------- */
  function initHeroSwiper() {
    // Swiper 라이브러리 없으면 종료
    if (typeof window.Swiper === 'undefined') {
      console.info('[AVANCE] Swiper 라이브러리를 찾지 못했습니다. 캐러셀 비활성.');
      return;
    }

    const hero = qs('.hero');
    if (!hero) return;

    // 기대 마크업:
    //   .hero > .swiper > .swiper-wrapper > .swiper-slide * N
    //   .hero > .hero__indicators > .hero__indicator * N
    //
    // 현재 main/index.html은 단일 hero__bg 구조 → Swiper 마크업 미존재.
    // 이 경우 인디케이터만 시각적으로 움직이는 폴백 루프를 돌림.
    const swiperEl = qs('.swiper', hero);
    const indicators = qsa('.hero__indicator', hero);

    if (!swiperEl) {
      runIndicatorFallback(indicators);
      return;
    }

    const slides = qsa('.swiper-slide', swiperEl);
    if (slides.length <= 1) {
      // 슬라이드가 하나뿐이면 자동재생 없음 — Swiper만 정적으로 초기화
      new window.Swiper(swiperEl, {
        loop: false,
        allowTouchMove: false,
      });
      syncIndicators(indicators, 0);
      return;
    }

    const swiper = new window.Swiper(swiperEl, {
      loop: true,
      speed: 600,
      effect: 'fade',
      fadeEffect: { crossFade: true },
      allowTouchMove: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      a11y: {
        prevSlideMessage: '이전 슬라이드',
        nextSlideMessage: '다음 슬라이드',
      },
      on: {
        init(instance) {
          syncIndicators(indicators, instance.realIndex);
        },
        slideChange(instance) {
          syncIndicators(indicators, instance.realIndex);
        },
      },
    });

    // 인디케이터 클릭 → 해당 슬라이드로
    indicators.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        swiper.slideToLoop(i, 600);
      });
    });

    // 탭 이동 중에는 autoplay 일시정지 (배터리/성능)
    document.addEventListener('visibilitychange', () => {
      if (!swiper.autoplay) return;
      document.hidden ? swiper.autoplay.stop() : swiper.autoplay.start();
    });
  }

  /* --------------------------------
     Indicator sync
  -------------------------------- */
  function syncIndicators(indicators, activeIndex) {
    if (!indicators || !indicators.length) return;
    indicators.forEach((btn, i) => {
      const active = i === activeIndex;
      btn.classList.toggle('is-active', active);
      if (active) {
        btn.setAttribute('aria-current', 'true');
      } else {
        btn.removeAttribute('aria-current');
      }
    });
  }

  /* --------------------------------
     Fallback — Swiper 마크업이 아직 없을 때
     인디케이터만 5초 주기로 돌아가며 활성화
     (hero 배경은 고정, 시각적 리듬만 유지)
  -------------------------------- */
  function runIndicatorFallback(indicators) {
    if (!indicators || indicators.length <= 1) return;

    let idx = indicators.findIndex((b) => b.classList.contains('is-active'));
    if (idx < 0) idx = 0;
    syncIndicators(indicators, idx);

    let timer = window.setInterval(() => {
      idx = (idx + 1) % indicators.length;
      syncIndicators(indicators, idx);
    }, 5000);

    // 클릭 시 즉시 이동 + 타이머 재시작
    indicators.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        idx = i;
        syncIndicators(indicators, idx);
        window.clearInterval(timer);
        timer = window.setInterval(() => {
          idx = (idx + 1) % indicators.length;
          syncIndicators(indicators, idx);
        }, 5000);
      });
    });

    // 탭 비활성화 시 일시정지
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        window.clearInterval(timer);
      } else {
        timer = window.setInterval(() => {
          idx = (idx + 1) % indicators.length;
          syncIndicators(indicators, idx);
        }, 5000);
      }
    });
  }

  /* --------------------------------
     Boot
  -------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroSwiper);
  } else {
    initHeroSwiper();
  }
})();
