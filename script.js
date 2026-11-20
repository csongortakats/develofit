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
    const email = mailtoForm.querySelector("#contact-email");
    const phone = mailtoForm.querySelector("#contact-phone");
    const name = mailtoForm.querySelector("#contact-name");
    const message = mailtoForm.querySelector("#contact-message");
    const topic = mailtoForm.querySelector("#contact-topic");
    const consent = mailtoForm.querySelector("#contact-consent");

    const updateFieldState = (field, showError = true) => {
      if (!field) return;
      setFieldValidity();
      const error = mailtoForm.querySelector(`#${field.id}-error`);
      const label = mailtoForm.querySelector(`label[for="${field.id}"]`);
      const invalid = showError && !field.checkValidity();
      field.classList.toggle("is-invalid", invalid);
      field.setAttribute("aria-invalid", String(invalid));
      if (label) label.classList.toggle("is-invalid", invalid);
      if (error) {
        error.textContent = invalid ? (field.validationMessage || "Ezt a mezőt ellenőrizni kell.") : "";
      }
      if (error) {
        if (invalid) field.setAttribute("aria-describedby", error.id);
        else field.removeAttribute("aria-describedby");
      }
      return invalid;
    };

    const setFieldValidity = () => {
      if (email) {
        email.setCustomValidity(email.validity.patternMismatch
          ? "Adj meg egy érvényes e-mail-címet, például: nev@example.hu"
          : "");
      }
      if (phone) {
        const digits = phone.value.replace(/\D/g, "");
        if (phone.value && (digits.length < 7 || digits.length > 15)) {
          phone.setCustomValidity("A telefonszám 7–15 számjegyet tartalmazzon.");
        } else if (phone.value && /[^0-9 +\-()]/.test(phone.value)) {
          phone.setCustomValidity("A telefonszám csak számokat és a +, -, (, ) jeleket tartalmazhatja.");
        } else {
          phone.setCustomValidity("");
        }
      }
      if (name) name.setCustomValidity(name.value.trim().length < 2 ? "Kérjük, adjon meg legalább 2 karakterből álló nevet." : "");
      if (message) message.setCustomValidity(message.value.trim().length < 10 ? "Az üzenet legyen legalább 10 karakter hosszú." : "");
      if (topic) topic.setCustomValidity(topic.value ? "" : "Kérjük, válasszon témakört.");
      if (consent) consent.setCustomValidity(consent.checked ? "" : "Az adatvédelmi tájékoztató elfogadása kötelező.");
    };

    [email, phone, name, message, topic, consent].forEach(field => {
      if (field) {
        const eventName = field === consent || field === topic ? "change" : "input";
        field.addEventListener(eventName, () => {
          updateFieldState(field);
          if (field === consent) {
            const consentLabel = field.closest(".contact-consent");
            consentLabel?.classList.toggle("is-invalid", !field.checkValidity());
          }
          if (status) status.textContent = "";
        });
        field.addEventListener("blur", () => {
          updateFieldState(field);
        });
      }
    });

    mailtoForm.addEventListener("invalid", event => {
      setFieldValidity();
      if (event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        updateFieldState(event.target);
      }
      if (status && event.target instanceof HTMLElement) {
        status.textContent = event.target.validationMessage || "Kérjük, ellenőrizze a megadott adatokat.";
        status.classList.add("is-error");
      }
    }, true);

    mailtoForm.addEventListener("submit", event => {
      event.preventDefault();
      setFieldValidity();
      [email, phone, name, message, topic, consent].forEach(field => {
        if (field) updateFieldState(field);
      });
      if (!mailtoForm.checkValidity()) {
        if (status) status.textContent = "Nem küldhető el: ellenőrizze a pirossal jelölt vagy hiányzó adatokat.";
        status?.classList.add("is-error");
        mailtoForm.reportValidity();
        return;
      }
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
      if (status) {
        status.textContent = "A levelezőalkalmazás megnyitása...";
        status.classList.remove("is-error");
      }
      window.location.href = `mailto:info@develofit.hu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }
})();
