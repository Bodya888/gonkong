/* ============================================================
   ГОНКОНГ — интерактив
   Вся анимация живёт в CSS (transitions); JS лишь переключает
   классы, управляет панелью меню и обрабатывает форму.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 1. Тень шапки при скролле ---------- */
  const header = document.getElementById("header");
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 2. Выезжающая панель с изображением меню ---------- */
  const panel = document.getElementById("menuPanel");
  const overlay = document.getElementById("overlay");
  const closeBtn = document.getElementById("closeMenu");
  const menuImage = document.getElementById("menuImage");
  const menuScroll = panel ? panel.querySelector(".menu-panel__scroll") : null;
  const menuBtns = document.querySelectorAll(".hero-slider__btn");
  let lastFocused = null;
  let currentSrc = null;

  // подставляем картинку меню + запасной вариант, обновляем подписи
  function setMenuImage(src, fallback, title) {
    menuImage.onerror = () => {
      menuImage.onerror = null;
      if (fallback) menuImage.src = fallback;
    };
    menuImage.src = src;
    menuImage.alt = "Меню — " + (title || "");
    panel.setAttribute("aria-label", "Меню — " + (title || ""));
    currentSrc = src;
    if (menuScroll) menuScroll.scrollTop = 0;
  }

  function openMenu(btn) {
    const src = btn.dataset.menu;
    const fallback = btn.dataset.fallback;
    const title = btn.dataset.title;
    // горизонтальные меню (коктейли, бар) — широкая панель до центра экрана
    panel.classList.toggle("menu-panel--wide", btn.dataset.orient === "landscape");
    const isOpen = panel.classList.contains("is-open");

    if (isOpen && src === currentSrc) return;      // тот же раздел уже открыт

    if (isOpen) {
      // переключение раздела: плавно гасим текущее фото, ставим новое, проявляем
      menuImage.classList.add("is-swapping");
      window.setTimeout(() => {
        setMenuImage(src, fallback, title);
        const reveal = () => menuImage.classList.remove("is-swapping");
        if (menuImage.complete && menuImage.naturalWidth) requestAnimationFrame(reveal);
        else menuImage.addEventListener("load", reveal, { once: true });
        window.setTimeout(reveal, 500);            // страховка, если load не придёт
      }, 300);
      return;
    }

    // первое открытие
    lastFocused = btn;
    setMenuImage(src, fallback, title);
    overlay.hidden = false;
    void panel.offsetWidth;                         // форс-reflow: фиксируем старт, чтобы сыграл slide-in
    overlay.classList.add("is-open");
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    lockScroll(true);
    closeBtn.focus();
  }

  function closeMenu() {
    if (!panel.classList.contains("is-open")) return;
    overlay.classList.remove("is-open");
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    lockScroll(false);
    window.setTimeout(() => {                        // прячем оверлей после завершения fade
      if (!overlay.classList.contains("is-open")) overlay.hidden = true;
    }, 420);
    if (lastFocused) lastFocused.focus();
  }

  // блокируем скролл фона без сдвига макета (компенсируем ширину скроллбара)
  function lockScroll(on) {
    if (on) {
      const sbw = window.innerWidth - document.documentElement.clientWidth;
      if (sbw > 0) document.body.style.setProperty("--sbw", sbw + "px");
      document.body.classList.add("is-locked");
    } else {
      document.body.classList.remove("is-locked");
      document.body.style.removeProperty("--sbw");
    }
  }

  if (panel && overlay && closeBtn && menuImage) {
    menuBtns.forEach((btn) => btn.addEventListener("click", () => openMenu(btn)));
    closeBtn.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- 3. Галерея: masonry-прокрутка реализована на чистом CSS ---------- */

  /* ---------- 4. Форма бронирования ---------- */
  const form = document.getElementById("bookingForm");
  if (form) {
    // подставляем сегодняшнюю дату как минимум
    const dateInput = document.getElementById("date");
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      dateInput.min = today;
    }
    const submitBtn = form.querySelector(".booking__submit");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const payload = {
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        date: document.getElementById("date").value,
        time: document.getElementById("time").value,
        guests: document.getElementById("guests").value,
      };
      const original = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Отправляем…";
      try {
        const r = await fetch("/api/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await r.json().catch(() => ({}));
        if (r.ok && data.ok) {
          alert("Спасибо! Мы свяжемся с вами для подтверждения.");
          form.reset();
        } else {
          alert("Не удалось отправить заявку. Позвоните нам: +7 (903) 301-11-09");
        }
      } catch (err) {
        alert("Нет связи с сервером. Позвоните нам: +7 (903) 301-11-09");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = original;
      }
    });
  }

  /* ---------- 5. Появление секций при скролле ---------- */
  const reveals = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- 6. Цветок в логотипе вращается при скролле ---------- */
  const flower = document.getElementById("heroFlower");
  if (flower && !reduceMotion) {
    const SPEED = 0.3; // градусов на каждый пиксель прокрутки
    let ticking = false;
    const spin = () => {
      flower.style.transform = "rotate(" + (window.scrollY * SPEED) + "deg)";
      ticking = false;
    };
    spin();
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(spin); ticking = true; }
    }, { passive: true });
  }

  /* ---------- 7. Hero-слайдер «Наше меню»: переключение категорий ---------- */
  const slider = document.getElementById("menuSlider");
  if (slider) {
    const bgs = slider.querySelectorAll(".hero-slider__bg");
    const thumbs = slider.querySelectorAll(".strip__thumb");
    const titleEl = document.getElementById("sliderTitle");
    const viewBtn = document.getElementById("sliderView");

    const selectCat = (cat) => {
      const thumb = [...thumbs].find((t) => t.dataset.cat === cat);
      if (!thumb) return;
      thumbs.forEach((t) => {
        const on = t === thumb;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      bgs.forEach((b) => b.classList.toggle("is-active", b.dataset.cat === cat));
      // плавная смена заголовка
      titleEl.style.opacity = "0";
      window.setTimeout(() => {
        titleEl.textContent = thumb.dataset.title;
        titleEl.style.opacity = "1";
      }, 220);
      // кнопка «Посмотреть меню» теперь открывает меню выбранной категории
      viewBtn.dataset.menu = thumb.dataset.menu;
      viewBtn.dataset.fallback = thumb.dataset.fallback;
      viewBtn.dataset.title = thumb.dataset.title;
      viewBtn.dataset.orient = thumb.dataset.orient;
    };

    thumbs.forEach((t) => t.addEventListener("click", () => selectCat(t.dataset.cat)));
  }
})();
