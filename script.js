// ÖZKOM ALÜMİNYUM — shared script

document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav
  const burger = document.querySelector('.burger');
  const panel = document.querySelector('.mobile-panel');
  const scrim = document.querySelector('.scrim');
  const closeBtn = document.querySelector('.mobile-close');

  function closeNav(){
    burger?.classList.remove('open');
    panel?.classList.remove('open');
    scrim?.classList.remove('open');
    document.body.style.overflow = '';
  }
  function openNav(){
    burger?.classList.add('open');
    panel?.classList.add('open');
    scrim?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  burger?.addEventListener('click', () => {
    burger.classList.contains('open') ? closeNav() : openNav();
  });
  scrim?.addEventListener('click', closeNav);
  closeBtn?.addEventListener('click', closeNav);
  panel?.querySelectorAll('a[href]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#')) {
        e.preventDefault();
        closeNav();
        setTimeout(() => { window.location.href = href; }, 50);
      } else {
        closeNav();
      }
    });
  });

  // Marquee duplication for seamless loop (runs after CMS content is in place)
  function duplicateMarquees(){
    document.querySelectorAll('.marquee-track').forEach(track => {
      if (track.dataset.duplicated) return;
      track.innerHTML += track.innerHTML;
      track.dataset.duplicated = 'true';
    });
  }
  if (document.body.hasAttribute('data-cms-page')) {
    document.addEventListener('cms:ready', duplicateMarquees, { once: true });
    // Fallback in case cms-loader.js isn't present or fetch fails silently
    setTimeout(duplicateMarquees, 1200);
  } else {
    duplicateMarquees();
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -10% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // Header shadow on scroll
  const header = document.querySelector('.site-header');
  if (header){
    const onScroll = () => {
      header.style.boxShadow = window.scrollY > 8 ? '0 4px 20px rgba(22,24,27,.06)' : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();
  }

  // Hero Slider
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slider-dot');
  if (slides.length > 1) {
    let current = 0;
    let timer;

    function goTo(idx) {
      // Aktif slide'ı kapat
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = idx;

      // Yeni slide'ın yazılarını sıfırla (transition kapalıyken)
      const newSlide = slides[current];
      const texts = newSlide.querySelectorAll('.slide-brand, .slide-title');
      texts.forEach(el => {
        el.style.transition = 'none';
        el.style.opacity = '0';
        el.style.transform = 'translateY(18px)';
      });

      // Bir frame bekle, sonra aktif et
      requestAnimationFrame(() => {
        newSlide.classList.add('active');
        dots[current].classList.add('active');
        // Transition'ı geri aç ve animasyonu başlat
        setTimeout(() => {
          texts.forEach(el => {
            el.style.transition = '';
          });
        }, 50);
      });
    }

    function next() {
      goTo((current + 1) % slides.length);
    }

    function startTimer() {
      timer = setInterval(next, 4000);
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(timer);
        goTo(i);
        startTimer();
      });
    });

    // Touch/swipe desteği
    let touchStartX = 0;
    const sliderEl = document.querySelector('.hero-slider');
    sliderEl?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    sliderEl?.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        clearInterval(timer);
        goTo(diff > 0 ? (current + 1) % slides.length : (current - 1 + slides.length) % slides.length);
        startTimer();
      }
    });

    startTimer();
  }

  // Contact form (static demo — no backend)
  const form = document.querySelector('#contact-form');
  if (form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      btn.innerHTML = 'Gönderildi ✓';
      btn.style.background = '#1d8a4a';
      form.reset();
      setTimeout(() => { btn.innerHTML = original; btn.style.background = ''; }, 2800);
    });
  }
});
