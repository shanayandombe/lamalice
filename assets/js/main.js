/**
 * main.js — La Malice
 * ---------------------------------------------------------------
 * Toute la logique front-end du site : navigation, animations,
 * rendu dynamique des collections (projets, contenus, galerie,
 * services, avis, FAQ), filtres, lightbox, page projet, formulaire.
 * Vanilla JS, sans dépendance. Respecte prefers-reduced-motion.
 * ---------------------------------------------------------------
 */

(function () {
  "use strict";

  const DATA = {
    projects: window.LA_MALICE_PROJECTS || [],
    categories: window.LA_MALICE_PROJECT_CATEGORIES || [],
    contents: window.LA_MALICE_CONTENTS || [],
    gallery: window.LA_MALICE_GALLERY || [],
    services: window.LA_MALICE_SERVICES || [],
    reviews: window.LA_MALICE_REVIEWS || [],
    faq: window.LA_MALICE_FAQ || [],
    settings: window.LA_MALICE_SETTINGS || {},
    about: window.LA_MALICE_ABOUT || {},
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", () => {
    injectGrain();
    setCurrentYear();
    initNavbar();
    initMobileMenu();
    setActiveNavLink();
    applySettingsToDom();
    initMarquee();
    initReveal();
    initHeroWordRotate();
    initFaqAccordion();
    initLightbox();
    initContactForm();

    renderServicesPreview();
    renderServicesFull();
    renderProjects();
    renderContents();
    renderGallery();
    renderReviews();
    renderFaq();
    renderAbout();
    renderProjectDetail();
    renderGalleryPreview();
  });

  // ---------------------------------------------------------------
  // Helpers génériques
  // ---------------------------------------------------------------

  function qs(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function qsa(sel, ctx) {
    return Array.from((ctx || document).querySelectorAll(sel));
  }
  function el(tag, attrs, html) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((key) => {
        if (key === "class") node.className = attrs[key];
        else if (key === "html") node.innerHTML = attrs[key];
        else node.setAttribute(key, attrs[key]);
      });
    }
    if (html) node.innerHTML = html;
    return node;
  }
  function fallbackImg(src) {
    return src && src.trim() !== "" ? src : "/assets/images/uploads/placeholder-project.jpg";
  }
  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("fr-CH", { year: "numeric", month: "long" });
  }

  // ---------------------------------------------------------------
  // Grain overlay (injecté une fois sur toutes les pages)
  // ---------------------------------------------------------------

  function injectGrain() {
    if (!qs(".grain")) {
      document.body.appendChild(el("div", { class: "grain" }));
    }
  }

  function setCurrentYear() {
    const node = qs("#year");
    if (node) node.textContent = new Date().getFullYear();
  }

  // ---------------------------------------------------------------
  // Navbar
  // ---------------------------------------------------------------

  function initNavbar() {
    const nav = qs(".navbar");
    if (!nav) return;
    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileMenu() {
    const toggle = qs(".nav-toggle");
    const links = qs(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("is-open");
      toggle.classList.toggle("is-active", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    qsa("a", links).forEach((link) => {
      link.addEventListener("click", () => {
        links.classList.remove("is-open");
        toggle.classList.remove("is-active");
        document.body.style.overflow = "";
      });
    });
  }

  function setActiveNavLink() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    qsa(".nav-link").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === path) link.classList.add("is-active");
    });
  }

  // ---------------------------------------------------------------
  // Paramètres du site → DOM (liens sociaux, textes, labels nav...)
  // ---------------------------------------------------------------

  function applySettingsToDom() {
    const s = DATA.settings;

    qsa("[data-settings-instagram]").forEach((node) => {
      if (s.instagram_url) node.setAttribute("href", s.instagram_url);
    });
    qsa("[data-settings-tiktok]").forEach((node) => {
      if (s.tiktok_url) {
        node.setAttribute("href", s.tiktok_url);
        node.classList.remove("hidden");
      } else {
        node.classList.add("hidden");
      }
    });
    qsa("[data-settings-linkedin]").forEach((node) => {
      if (s.linkedin_url) {
        node.setAttribute("href", s.linkedin_url);
        node.classList.remove("hidden");
      } else {
        node.classList.add("hidden");
      }
    });
    qsa("[data-settings-email]").forEach((node) => {
      if (s.email) {
        node.textContent = s.email;
        node.setAttribute("href", "mailto:" + s.email);
      }
    });
    qsa("[data-settings-phone]").forEach((node) => {
      if (s.phone) {
        node.textContent = s.phone;
        node.setAttribute("href", "tel:" + s.phone.replace(/\s+/g, ""));
      } else {
        node.classList.add("hidden");
      }
    });

    qsa("[data-nav-projects]").forEach((n) => (n.textContent = s.nav_label_projects || "Projets"));
    qsa("[data-nav-gallery]").forEach((n) => (n.textContent = s.nav_label_gallery || "Galerie"));
    qsa("[data-nav-about]").forEach((n) => (n.textContent = s.nav_label_about || "À propos"));
    qsa("[data-nav-contact]").forEach((n) => (n.textContent = s.nav_label_contact || "Contact"));
    qsa("[data-nav-cta]").forEach((n) => (n.textContent = s.nav_cta_text || "Travailler ensemble"));

    if (s.banner_show && s.banner_message) {
      qsa("[data-announce-bar]").forEach((n) => {
        n.textContent = s.banner_message;
        n.classList.remove("hidden");
      });
    }

    qsa("[data-settings-footer-text]").forEach((n) => {
      n.textContent = s.footer_text || "";
    });
  }

  // ---------------------------------------------------------------
  // Marquee (bandeau animé)
  // ---------------------------------------------------------------

  function initMarquee() {
    const track = qs(".marquee__track");
    if (!track) return;
    const group = qs(".marquee__group", track);
    if (group && !qs(".marquee__group + .marquee__group", track)) {
      track.appendChild(group.cloneNode(true));
    }
  }

  // ---------------------------------------------------------------
  // Reveal au scroll
  // ---------------------------------------------------------------

  function initReveal() {
    const targets = qsa("[data-reveal]");
    if (!targets.length) return;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    targets.forEach((t) => observer.observe(t));
  }

  // ---------------------------------------------------------------
  // Hero — mot qui change
  // ---------------------------------------------------------------

  function initHeroWordRotate() {
    const node = qs("[data-word-rotate]");
    if (!node) return;
    let words = [];
    try {
      words = JSON.parse(node.getAttribute("data-word-rotate"));
    } catch (e) {
      return;
    }
    if (!words || !words.length) return;
    if (reducedMotion) {
      node.textContent = words[0];
      return;
    }
    let i = 0;
    setInterval(() => {
      i = (i + 1) % words.length;
      node.style.opacity = 0;
      setTimeout(() => {
        node.textContent = words[i];
        node.style.opacity = 1;
      }, 220);
    }, 2400);
    node.style.transition = "opacity 0.2s ease";
  }

  // ---------------------------------------------------------------
  // Services — aperçu (home) + page complète
  // ---------------------------------------------------------------

  function renderServicesPreview() {
    const container = qs("[data-services-preview]");
    if (!container) return;
    const featured = DATA.services.filter((s) => s.visible !== false && s.featured);
    const list = featured.length ? featured : DATA.services.filter((s) => s.visible !== false);
    if (!list.length) {
      container.innerHTML = "";
      container.appendChild(emptyState("Services à compléter depuis l'admin."));
      return;
    }
    container.innerHTML = "";
    list.slice(0, 6).forEach((service, idx) => {
      container.appendChild(serviceCard(service, idx));
    });
  }

  function renderServicesFull() {
    const container = qs("[data-services-full]");
    if (!container) return;
    const list = DATA.services.filter((s) => s.visible !== false);
    if (!list.length) {
      container.appendChild(emptyState("Aucun service publié pour le moment."));
      return;
    }
    container.innerHTML = "";
    list.forEach((service, idx) => container.appendChild(serviceCard(service, idx)));
  }

  function serviceCard(service, idx) {
    const card = el("div", { class: "service-card", "data-reveal": "" });
    card.innerHTML = `
      <span class="service-card__index">0${idx + 1}</span>
      <h3 class="service-card__title">${escapeHtml(service.title)}</h3>
      <p class="service-card__text">${escapeHtml(service.short_description)}</p>
      <a class="service-card__link" href="${escapeHtml(service.button_link || "contact.html")}">
        ${escapeHtml(service.button_text || "En savoir plus")}
        <span class="btn-arrow" aria-hidden="true">→</span>
      </a>
    `;
    return card;
  }

  function emptyState(text) {
    return el("div", { class: "empty-state" }, escapeHtml(text));
  }

  // ---------------------------------------------------------------
  // PROJETS (projets.html) — grille + filtres
  // ---------------------------------------------------------------

  let activeProjectFilter = "all";

  function renderProjects() {
    const grid = qs("[data-projects-grid]");
    if (!grid) return;

    const filtersContainer = qs("[data-projects-filters]");
    const visibleCategories = DATA.categories.filter((c) => c.visible !== false);

    if (filtersContainer) {
      filtersContainer.innerHTML = "";
      filtersContainer.appendChild(filterButton("Tous", "all", true));
      visibleCategories.forEach((cat) => {
        filtersContainer.appendChild(filterButton(cat.name, cat.slug, false));
      });
      filtersContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;
        activeProjectFilter = btn.getAttribute("data-filter");
        qsa(".filter-btn", filtersContainer).forEach((b) =>
          b.classList.toggle("is-active", b === btn)
        );
        paintProjects(grid);
      });
    }

    paintProjects(grid);
  }

  function paintProjects(grid) {
    const items = DATA.projects.filter((p) => p.visible !== false);
    const filtered =
      activeProjectFilter === "all"
        ? items
        : items.filter((p) => p.category === activeProjectFilter);

    grid.innerHTML = "";
    if (!filtered.length) {
      grid.appendChild(emptyState("Projet à compléter — aucun projet dans cette catégorie pour le moment."));
      return;
    }

    filtered.forEach((project) => grid.appendChild(projectCard(project)));
  }

  function categoryName(slug) {
    const cat = DATA.categories.find((c) => c.slug === slug);
    return cat ? cat.name : slug;
  }

  function filterButton(label, value, active) {
    const btn = el(
      "button",
      { class: "filter-btn" + (active ? " is-active" : ""), "data-filter": value, type: "button" },
      escapeHtml(label)
    );
    return btn;
  }

  function projectCard(project) {
    const a = el("a", {
      class: "project-card",
      href: "projet.html?slug=" + encodeURIComponent(project.slug),
      "data-reveal": "",
    });
    const tags = (project.tags || []).slice(0, 3);
    a.innerHTML = `
      <img class="project-card__img" src="${fallbackImg(project.main_image)}" alt="${escapeHtml(project.client)}" loading="lazy">
      <div class="project-card__overlay">
        <span class="project-card__tag">${escapeHtml(categoryName(project.category) || "Projet")}</span>
        <div>
          <div class="project-card__client">${escapeHtml(project.client || "Projet à compléter")}</div>
          <div class="project-card__mission">${escapeHtml(project.mission_type || project.title || "")}</div>
          <div class="project-card__foot">
            <div class="project-card__tags">${tags.map((t) => `<span>#${escapeHtml(t)}</span>`).join("")}</div>
            <span class="project-card__arrow" aria-hidden="true">↗</span>
          </div>
        </div>
      </div>
    `;
    return a;
  }

  // ---------------------------------------------------------------
  // CONTENUS CRÉÉS — intégrés dans projets.html (section moodboard)
  // ---------------------------------------------------------------

  let activeContentFilter = "all";

  function renderContents() {
    const grid = qs("[data-contents-grid]");
    if (!grid) return;

    const filtersContainer = qs("[data-contents-filters]");
    const types = Array.from(
      new Set(DATA.contents.filter((c) => c.visible !== false).map((c) => c.type).filter(Boolean))
    );

    if (filtersContainer) {
      filtersContainer.innerHTML = "";
      filtersContainer.appendChild(filterButton("Tous", "all", true));
      types.forEach((type) => filtersContainer.appendChild(filterButton(type, type, false)));
      filtersContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;
        activeContentFilter = btn.getAttribute("data-filter");
        qsa(".filter-btn", filtersContainer).forEach((b) =>
          b.classList.toggle("is-active", b === btn)
        );
        paintContents(grid);
      });
    }

    paintContents(grid);
  }

  function paintContents(grid) {
    const items = DATA.contents.filter((c) => c.visible !== false);
    const filtered =
      activeContentFilter === "all" ? items : items.filter((c) => c.type === activeContentFilter);

    grid.innerHTML = "";
    if (!filtered.length) {
      grid.appendChild(emptyState("Contenu à compléter — aucun contenu dans ce filtre pour le moment."));
      return;
    }
    filtered.forEach((content) => grid.appendChild(contentCard(content)));
  }

  function contentCard(content) {
    const hasLink = content.external_link && content.external_link.trim() !== "";
    const wrapperTag = hasLink ? "a" : "div";
    const card = el(wrapperTag, {
      class: "content-card",
      "data-reveal": "",
    });
    if (hasLink) {
      card.setAttribute("href", content.external_link);
      card.setAttribute("target", "_blank");
      card.setAttribute("rel", "noopener");
    }
    card.innerHTML = `
      <img class="content-card__img" src="${fallbackImg(content.thumbnail)}" alt="${escapeHtml(content.title)}" loading="lazy">
      <span class="content-card__badge">${escapeHtml(content.type || "Contenu")}</span>
      <span class="content-card__play" aria-hidden="true">▶</span>
      <div class="content-card__info">
        <div class="content-card__client">${escapeHtml(content.client || "")}</div>
        <div class="content-card__title">${escapeHtml(content.title || "Contenu à compléter")}</div>
      </div>
    `;
    return card;
  }

  // ---------------------------------------------------------------
  // GALERIE
  // ---------------------------------------------------------------

  let activeGalleryFilter = "all";
  let galleryLightboxItems = [];

  function renderGallery() {
    const grid = qs("[data-gallery-grid]");
    if (!grid) return;

    const filtersContainer = qs("[data-gallery-filters]");
    const categories = Array.from(
      new Set(DATA.gallery.filter((g) => g.visible !== false).map((g) => g.category).filter(Boolean))
    );

    if (filtersContainer) {
      filtersContainer.innerHTML = "";
      filtersContainer.appendChild(filterButton("Tous", "all", true));
      categories.forEach((cat) => filtersContainer.appendChild(filterButton(cat, cat, false)));
      filtersContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;
        activeGalleryFilter = btn.getAttribute("data-filter");
        qsa(".filter-btn", filtersContainer).forEach((b) =>
          b.classList.toggle("is-active", b === btn)
        );
        paintGallery(grid);
      });
    }

    paintGallery(grid);
  }

  function paintGallery(grid) {
    const items = DATA.gallery.filter((g) => g.visible !== false);
    const filtered =
      activeGalleryFilter === "all" ? items : items.filter((g) => g.category === activeGalleryFilter);

    grid.innerHTML = "";
    galleryLightboxItems = filtered;

    if (!filtered.length) {
      grid.appendChild(emptyState("Image à remplacer — aucune image dans cette catégorie pour le moment."));
      return;
    }

    filtered.forEach((item, idx) => {
      const fig = el("div", { class: "masonry__item", "data-reveal": "", "data-gallery-index": idx });
      fig.innerHTML = `
        <img src="${fallbackImg(item.image)}" alt="${escapeHtml(item.alt || item.title || "Image à remplacer")}" loading="lazy">
        <span class="masonry__caption">${escapeHtml(item.caption || item.title || "")}</span>
      `;
      grid.appendChild(fig);
    });
  }

  // Rendu d'une galerie miroir sur la home (aperçu)
  function renderGalleryPreview() {
    const container = qs("[data-gallery-preview]");
    if (!container) return;
    const featured = DATA.gallery.filter((g) => g.visible !== false && g.featured);
    const list = featured.length ? featured : DATA.gallery.filter((g) => g.visible !== false);
    container.innerHTML = "";
    if (!list.length) {
      container.appendChild(emptyState("Image à remplacer."));
      return;
    }
    list.slice(0, 6).forEach((item) => {
      const fig = el("div", { class: "masonry__item", "data-reveal": "" });
      fig.innerHTML = `
        <img src="${fallbackImg(item.image)}" alt="${escapeHtml(item.alt || "Image à remplacer")}" loading="lazy">
        <span class="masonry__caption">${escapeHtml(item.caption || item.title || "")}</span>
      `;
      container.appendChild(fig);
    });
  }

  // ---------------------------------------------------------------
  // LIGHTBOX (galerie + page projet)
  // ---------------------------------------------------------------

  let lightboxItems = [];
  let lightboxIndex = 0;

  function initLightbox() {
    if (!qs(".lightbox")) {
      const lb = el(
        "div",
        { class: "lightbox" },
        `
        <button class="lightbox__nav lightbox__nav--prev" aria-label="Image précédente">‹</button>
        <img src="" alt="">
        <button class="lightbox__nav lightbox__nav--next" aria-label="Image suivante">›</button>
        <button class="lightbox__close" aria-label="Fermer">✕</button>
      `
      );
      document.body.appendChild(lb);
    }
    const lightbox = qs(".lightbox");
    const img = qs("img", lightbox);
    const closeBtn = qs(".lightbox__close", lightbox);
    const prevBtn = qs(".lightbox__nav--prev", lightbox);
    const nextBtn = qs(".lightbox__nav--next", lightbox);

    function open(items, index) {
      lightboxItems = items;
      lightboxIndex = index;
      updateImg();
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    function updateImg() {
      const item = lightboxItems[lightboxIndex];
      if (!item) return;
      img.src = item.src;
      img.alt = item.alt || "";
    }
    function close() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    function next() {
      lightboxIndex = (lightboxIndex + 1) % lightboxItems.length;
      updateImg();
    }
    function prev() {
      lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length;
      updateImg();
    }

    closeBtn.addEventListener("click", close);
    nextBtn.addEventListener("click", next);
    prevBtn.addEventListener("click", prev);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    });

    // Délégation de clic pour la galerie masonry
    document.addEventListener("click", (e) => {
      const masonryItem = e.target.closest(".masonry__item");
      if (masonryItem) {
        const items = qsa(".masonry__item").map((n) => {
          const imgNode = qs("img", n);
          return { src: imgNode.getAttribute("src"), alt: imgNode.getAttribute("alt") };
        });
        const index = qsa(".masonry__item").indexOf(masonryItem);
        open(items, index);
        return;
      }
      const projectImg = e.target.closest("[data-lightbox-gallery] img");
      if (projectImg) {
        const wrapper = e.target.closest("[data-lightbox-gallery]");
        const items = qsa("img", wrapper).map((n) => ({
          src: n.getAttribute("src"),
          alt: n.getAttribute("alt"),
        }));
        const index = qsa("img", wrapper).indexOf(projectImg);
        open(items, index);
      }
    });
  }

  // ---------------------------------------------------------------
  // AVIS
  // ---------------------------------------------------------------

  function renderReviews() {
    const container = qs("[data-reviews-grid]");
    if (!container) return;
    const list = DATA.reviews.filter((r) => r.visible !== false);
    container.innerHTML = "";
    if (!list.length) {
      container.appendChild(emptyState("Avis client à remplacer."));
      return;
    }
    list.forEach((review) => {
      const stars = "★".repeat(review.rating || 5) + "☆".repeat(Math.max(0, 5 - (review.rating || 5)));
      const card = el("div", { class: "review-card", "data-reveal": "" });
      card.innerHTML = `
        <div class="review-card__stars">${stars}</div>
        <p class="review-card__comment">${escapeHtml(review.comment)}</p>
        <div class="review-card__name">${escapeHtml(review.name)} — ${escapeHtml(review.project || "")}</div>
      `;
      container.appendChild(card);
    });
  }

  // ---------------------------------------------------------------
  // FAQ
  // ---------------------------------------------------------------

  function renderFaq() {
    const container = qs("[data-faq-list]");
    if (!container) return;
    const list = DATA.faq.filter((f) => f.visible !== false);
    container.innerHTML = "";
    if (!list.length) {
      container.appendChild(emptyState("Question à compléter."));
      return;
    }
    list.forEach((item) => {
      const faqItem = el("div", { class: "faq-item" });
      faqItem.innerHTML = `
        <button class="faq-item__q" type="button">
          ${escapeHtml(item.question)}
          <span class="faq-item__icon" aria-hidden="true"></span>
        </button>
        <div class="faq-item__a"><p>${escapeHtml(item.answer)}</p></div>
      `;
      container.appendChild(faqItem);
    });
    bindFaqEvents(container);
  }

  function initFaqAccordion() {
    const existing = qs("[data-faq-list]");
    if (existing && existing.children.length) bindFaqEvents(existing);
  }

  function bindFaqEvents(container) {
    qsa(".faq-item__q", container).forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".faq-item");
        const wasOpen = item.classList.contains("is-open");
        qsa(".faq-item", container).forEach((i) => i.classList.remove("is-open"));
        if (!wasOpen) item.classList.add("is-open");
      });
    });
  }

  // ---------------------------------------------------------------
  // À PROPOS
  // ---------------------------------------------------------------

  function renderAbout() {
    const about = DATA.about;
    if (!about || !Object.keys(about).length) return;

    setText("[data-about-title]", about.title);
    setText("[data-about-subtitle]", about.subtitle);
    setText("[data-about-intro]", about.intro_text);
    setText("[data-about-dance]", about.dance_text);
    setText("[data-about-career]", about.career_text);
    setText("[data-about-structure-title]", about.structure_title);
    setText("[data-about-structure-text]", about.structure_text);
    setText("[data-about-learned-title]", about.learned_title);

    const portrait = qs("[data-about-portrait]");
    if (portrait && about.portrait_image) portrait.setAttribute("src", about.portrait_image);

    const learnedGrid = qs("[data-about-learned-grid]");
    if (learnedGrid && about.learned_blocks) {
      learnedGrid.innerHTML = "";
      about.learned_blocks.forEach((block) => {
        const card = el("div", { class: "learned-card", "data-reveal": "" });
        card.innerHTML = `
          <div class="learned-card__title">${escapeHtml(block.title)}</div>
          <div class="learned-card__text">${escapeHtml(block.text)}</div>
        `;
        learnedGrid.appendChild(card);
      });
    }

    const timeline = qs("[data-about-timeline]");
    if (timeline && about.timeline) {
      timeline.innerHTML = "";
      about.timeline.forEach((step) => {
        const item = el("div", { class: "timeline-item", "data-reveal": "" });
        item.innerHTML = `
          <span class="timeline-item__tag">${escapeHtml(step.tag || "")}</span>
          <div class="timeline-item__label">${escapeHtml(step.label)}</div>
        `;
        timeline.appendChild(item);
      });
    }

    const danceSection = qs("[data-about-dance-section]");
    if (danceSection && about.show_dance_section === false) danceSection.classList.add("hidden");

    const careerSection = qs("[data-about-career-section]");
    if (careerSection && about.show_career_section === false) careerSection.classList.add("hidden");

    const timelineSection = qs("[data-about-timeline-section]");
    if (timelineSection && about.show_timeline === false) timelineSection.classList.add("hidden");

    const aboutGallery = qs("[data-about-gallery]");
    if (aboutGallery && about.gallery_images) {
      aboutGallery.innerHTML = "";
      about.gallery_images.forEach((img) => {
        const figure = el("div", { class: "masonry__item", "data-reveal": "" });
        figure.innerHTML = `<img src="${fallbackImg(img.image)}" alt="${escapeHtml(img.alt || "Image à remplacer")}" loading="lazy">`;
        aboutGallery.appendChild(figure);
      });
    }
  }

  function setText(selector, value) {
    const node = qs(selector);
    if (node && value) node.textContent = value;
  }

  // ---------------------------------------------------------------
  // PAGE DÉTAIL PROJET (projet.html?slug=...)
  // ---------------------------------------------------------------

  function renderProjectDetail() {
    const root = qs("[data-project-detail]");
    if (!root) return;

    const slug = getParam("slug");
    const project = DATA.projects.find((p) => p.slug === slug && p.visible !== false);

    const notFound = qs("[data-project-not-found]");

    if (!project) {
      root.classList.add("hidden");
      if (notFound) notFound.classList.remove("hidden");
      return;
    }

    if (notFound) notFound.classList.add("hidden");
    root.classList.remove("hidden");

    document.title = `${project.client} — ${project.title} | La Malice`;

    setText("[data-p-client]", project.client);
    setText("[data-p-mission]", project.mission_type);
    setText("[data-p-role]", project.role);
    setText("[data-p-category]", categoryName(project.category));
    setText("[data-p-category-info]", categoryName(project.category));
    setText("[data-p-status]", statusLabel(project.status));
    setText("[data-p-date]", formatDate(project.date));
    setText("[data-p-context]", project.context);
    setText("[data-p-mission-text]", project.project_mission);
    setText("[data-p-objectives]", project.objectives);
    setText("[data-p-results]", project.results);
    setText("[data-p-backstage]", project.backstage);

    const services = qs("[data-p-services]");
    if (services) {
      services.innerHTML = (project.services_done || [])
        .map((s) => `<span class="tag">${escapeHtml(s)}</span>`)
        .join("");
    }

    const tags = qs("[data-p-tags]");
    if (tags) {
      tags.innerHTML = (project.tags || [])
        .map((t) => `<span class="tag">#${escapeHtml(t)}</span>`)
        .join("");
    }

    const externalLink = qs("[data-p-external-link]");
    if (externalLink) {
      if (project.external_link) {
        externalLink.setAttribute("href", project.external_link);
        externalLink.classList.remove("hidden");
      } else {
        externalLink.classList.add("hidden");
      }
    }

    const mainImage = qs("[data-p-main-image]");
    if (mainImage) mainImage.setAttribute("src", fallbackImg(project.main_image));

    const gallery = qs("[data-p-gallery]");
    if (gallery) {
      gallery.innerHTML = "";
      const images = project.gallery && project.gallery.length ? project.gallery : [];
      images.forEach((img, idx) => {
        const imageEl = el("img", {
          src: fallbackImg(img.image),
          alt: img.alt || "Image à remplacer",
          loading: "lazy",
          class: idx % 3 === 0 ? "full" : "",
        });
        gallery.appendChild(imageEl);
      });
    }

    // Contenus liés (par client)
    const relatedContents = qs("[data-p-related-contents]");
    if (relatedContents) {
      const related = DATA.contents.filter(
        (c) => c.visible !== false && c.client === project.client
      );
      relatedContents.innerHTML = "";
      if (related.length) {
        related.forEach((content) => relatedContents.appendChild(contentCard(content)));
        const section = qs("[data-p-related-section]");
        if (section) section.classList.remove("hidden");
      } else {
        const section = qs("[data-p-related-section]");
        if (section) section.classList.add("hidden");
      }
    }

    // Navigation précédent / suivant
    const visibleProjects = DATA.projects.filter((p) => p.visible !== false);
    const currentIndex = visibleProjects.findIndex((p) => p.slug === project.slug);
    const prevProject = visibleProjects[(currentIndex - 1 + visibleProjects.length) % visibleProjects.length];
    const nextProject = visibleProjects[(currentIndex + 1) % visibleProjects.length];

    const prevLink = qs("[data-p-prev]");
    if (prevLink && prevProject) {
      prevLink.setAttribute("href", "projet.html?slug=" + encodeURIComponent(prevProject.slug));
      const span = qs("span", prevLink);
      if (span) span.textContent = prevProject.client;
    }
    const nextLink = qs("[data-p-next]");
    if (nextLink && nextProject) {
      nextLink.setAttribute("href", "projet.html?slug=" + encodeURIComponent(nextProject.slug));
      const span = qs("span", nextLink);
      if (span) span.textContent = nextProject.client;
    }
  }

  function statusLabel(status) {
    const map = {
      termine: "Terminé",
      "en-cours": "En cours",
      "projet-personnel": "Projet personnel",
      archive: "Archive",
    };
    return map[status] || status || "";
  }

  // ---------------------------------------------------------------
  // FORMULAIRE DE CONTACT (Netlify Forms)
  // ---------------------------------------------------------------

  function initContactForm() {
    const form = qs("[data-contact-form]");
    if (!form) return;

    const successMsg = qs("[data-form-success]");
    if (successMsg && DATA.settings.success_message) {
      successMsg.textContent = DATA.settings.success_message;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      })
        .then(() => {
          form.classList.add("hidden");
          if (successMsg) successMsg.classList.add("is-visible");
        })
        .catch(() => {
          // Fallback : soumission classique si le fetch échoue (ex. hors Netlify)
          form.submit();
        });
    });
  }
})();
