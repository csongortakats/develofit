(() => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    const closeMenu = (returnFocus = false) => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Menü megnyitása");
      nav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      if (returnFocus) toggle.focus();
    };

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Menü megnyitása" : "Menü bezárása");
      nav.classList.toggle("is-open", !open);
      document.body.classList.toggle("menu-open", !open);
    });

    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") closeMenu(true);
    });
    document.addEventListener("click", event => {
      if (toggle.getAttribute("aria-expanded") === "true" &&
          !nav.contains(event.target) &&
          !toggle.contains(event.target)) closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.style.transitionDelay = `${Number(entry.target.dataset.delay || 0)}ms`;
        entry.target.classList.add("is-visible");
        current.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    items.forEach(item => observer.observe(item));
  } else {
    items.forEach(item => item.classList.add("is-visible"));
  }

  const mailtoForm = document.querySelector("[data-mailto-form]");
  if (mailtoForm instanceof HTMLFormElement) {
    const status = mailtoForm.querySelector("[role=status]");
    mailtoForm.addEventListener("submit", event => {
      event.preventDefault();
      const formData = new FormData(mailtoForm);
      const subject = "Üzenet a DeveloFit weboldaláról";
      const body = [
        `Név: ${formData.get("name")}`,
        `E-mail: ${formData.get("email")}`,
        `Telefonszám: ${formData.get("phone") || "-"}`,
        `Témakör: ${formData.get("topic") || "-"}`,
        `Adatvédelmi hozzájárulás: igen`,
        "",
        "Üzenet:",
        formData.get("message")
      ].join("\n");
      if (status) status.textContent = "A levelezőalkalmazás megnyitása...";
      window.location.href = `mailto:info@develofit.hu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }
})();
