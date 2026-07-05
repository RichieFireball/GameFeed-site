const DOWNLOAD_URL = "https://gamefeed.site/download/GameFeed-Setup.exe";

const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");

const updateHeader = () => {
  header?.classList.toggle("scrolled", window.scrollY > 18);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuToggle?.addEventListener("click", () => {
  const isOpen = menu?.classList.toggle("open") ?? false;
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

menu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll("[data-download]").forEach((button) => {
  button.addEventListener("click", () => {
    window.location.href = DOWNLOAD_URL;
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
document.querySelector("[data-year]").textContent = new Date().getFullYear();
