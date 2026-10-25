/* =========================================================
   Yves Achour — comportements du site
   ========================================================= */
(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  const anchors = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  const sections = anchors
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  /* ---------- En-tête : état au défilement ---------- */
  const onScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  const closeNav = () => {
    document.body.classList.remove("nav-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  };

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });

    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });

    document.addEventListener("click", (e) => {
      if (!document.body.classList.contains("nav-open")) return;
      if (e.target.closest(".site-nav") || e.target.closest(".nav-toggle")) return;
      closeNav();
    });
  }

  /* ---------- Apparition au défilement ---------- */
  const reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    // Léger décalage pour les éléments d'une même grille
    document.querySelectorAll(".cards, .stats, .pillars, .lang-list, .side-stack, .timeline").forEach((group) => {
      Array.from(group.children).forEach((child, i) => {
        if (child.classList.contains("reveal")) {
          child.style.setProperty("--delay", Math.min(i * 70, 420) + "ms");
        }
      });
    });

    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Lien actif dans la navigation ---------- */
  if ("IntersectionObserver" in window && sections.length) {
    const setActive = (id) => {
      anchors.forEach((a) => {
        const isCurrent = a.getAttribute("href") === "#" + id;
        a.classList.toggle("is-active", isCurrent && !a.classList.contains("nav-cta"));
        if (isCurrent) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    };

    const spy = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5] }
    );

    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Année du pied de page ---------- */
  const year = document.getElementById("annee");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Défilement doux avec compensation d'en-tête ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight + 8 : 8);
      window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      history.replaceState(null, "", id);

      // Déplace le focus clavier vers la section ciblée
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
})();
