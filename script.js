(function bootstrapPrelaunchLanding() {
  const storageKey = "klinip_prelaunch_theme";
  const config = window.KLINIP_PRELAUNCH_CONFIG || {};
  const body = document.body;
  const navLinks = Array.from(document.querySelectorAll("[data-scroll-target]"));

  function applyTheme(theme) {
    body.classList.toggle("theme-dark", theme === "dark");
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch {
      // Ignore storage errors in private browsing.
    }
  }

  function resolvePreferredTheme() {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved === "light" || saved === "dark") return saved;
    } catch {
      // Ignore storage errors in private browsing.
    }

    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function bindLink(selector, url) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (!url) {
        element.setAttribute("data-disabled", "true");
        element.setAttribute("aria-disabled", "true");
        element.href = "#";
        return;
      }

      element.removeAttribute("data-disabled");
      element.removeAttribute("aria-disabled");
      element.href = url;
    });
  }

  applyTheme(resolvePreferredTheme());

  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeToggleLabel = themeToggle?.querySelector(".theme-toggle-label");

  function refreshThemeToggle() {
    const isDark = body.classList.contains("theme-dark");
    if (themeToggleLabel) {
      themeToggleLabel.textContent = isDark ? "Modo oscuro" : "Tema";
    }
    themeToggle?.setAttribute("aria-pressed", isDark ? "true" : "false");
  }

  themeToggle?.addEventListener("click", () => {
    const nextTheme = body.classList.contains("theme-dark") ? "light" : "dark";
    applyTheme(nextTheme);
    refreshThemeToggle();
  });

  refreshThemeToggle();

  navLinks.forEach((button) => {
    button.addEventListener("click", () => {
      const sectionId = button.getAttribute("data-scroll-target");
      const target = sectionId ? document.getElementById(sectionId) : null;
      if (!target) return;

      navLinks.forEach((link) => link.classList.remove("active"));
      button.classList.add("active");
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const waitlistForm = document.querySelector("[data-waitlist-form]");
  const formStatus = document.querySelector("[data-form-status]");

  if (waitlistForm) {
    if (config.waitlistFormAction) {
      waitlistForm.action = config.waitlistFormAction;
      waitlistForm.method = "POST";
    }

    waitlistForm.addEventListener("submit", (event) => {
      if (!config.waitlistFormAction) {
        event.preventDefault();
        if (formStatus) {
          formStatus.textContent =
            "Formulario listo. Falta conectar el destino de env\u00edo en config.js para recibir los registros.";
          formStatus.classList.remove("is-success");
          formStatus.classList.add("is-error");
        }
        return;
      }

      if (formStatus) {
        formStatus.textContent = "Enviando tu solicitud...";
        formStatus.classList.remove("is-error");
        formStatus.classList.add("is-success");
      }
    });
  }

  bindLink("[data-app-link]", config.appUrl);
  bindLink("[data-waitlist-link]", config.waitlistUrl);
  bindLink("[data-payment-link]", config.paymentUrl || config.plusPlanUrl || config.familyPlanUrl);
  bindLink("[data-plus-link]", config.plusPlanUrl || config.paymentUrl);
  bindLink("[data-family-link]", config.familyPlanUrl || config.paymentUrl);
  bindLink("[data-enterprise-link]", config.enterpriseUrl || config.whatsappUrl || config.emailUrl);
  bindLink("[data-whatsapp-link]", config.whatsappUrl);
  bindLink("[data-email-link]", config.emailUrl);
})();
