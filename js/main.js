// ============================================================
// CONFIGURATION
// ============================================================
const DATA_PATH = {
  profile: "data/profile.json",
  projects: "data/projects.json",
  certifications: "data/certifications.json",
  skills: "data/skills.json",
  socials: "data/socials.json",
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch ${url}:`, err);
    return null;
  }
}

function $(sel, parent = document) {
  return parent.querySelector(sel);
}
function $$(sel, parent = document) {
  return [...parent.querySelectorAll(sel)];
}

// ============================================================
// DARK MODE
// ============================================================
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const storedTheme = localStorage.getItem("theme") || "light";

if (storedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  themeIcon.className = "fas fa-sun";
} else {
  themeIcon.className = "fas fa-moon";
}

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  if (isDark) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
    themeIcon.className = "fas fa-moon";
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    themeIcon.className = "fas fa-sun";
  }
});

// ============================================================
// NAV TOGGLE (Mobile)
// ============================================================
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", navLinks.classList.contains("open"));
});

$$("a", navLinks).forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ============================================================
// ACTIVE NAV LINK (Scroll Spy)
// ============================================================
const sections = document.querySelectorAll("section[id]");
const navLinksAll = document.querySelectorAll(".nav-links a");

function updateActiveNav() {
  let currentSection = "";
  const scrollPos = window.scrollY + 120;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    if (scrollPos >= top && scrollPos < top + height) {
      currentSection = section.getAttribute("id");
    }
  });

  navLinksAll.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${currentSection}`) {
      link.classList.add("active");
    }
  });
}

window.addEventListener("scroll", updateActiveNav);
window.addEventListener("load", updateActiveNav);

// ============================================================
// BACK TO TOP
// ============================================================
const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  backToTop.classList.toggle("show", window.scrollY > 400);
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ============================================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================================
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
);

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
});

// ============================================================
// RENDER PROFILE
// ============================================================
async function renderProfile() {
  const data = await fetchJSON(DATA_PATH.profile);
  if (!data) return;

  // Hero
  document.querySelector(".hero-name").textContent = data.name;
  document.querySelector(".hero-title").textContent = data.title;
  document.getElementById("heroBio").textContent = data.bio;

  // About
  document.getElementById("aboutText").innerHTML = `<p>${data.about}</p>`;
  document.getElementById("aboutInfo").innerHTML = `
        <p><i class="fas fa-location-dot"></i> ${data.location || ""}</p>
        <p><i class="fas fa-envelope"></i> <a href="mailto:${data.email}">${data.email}</a></p>
    `;

  // Contact
  document.getElementById("contactEmail").textContent = data.email;

  // Resume
  const resumeLink = document.getElementById("resumeLink");
  if (resumeLink && data.resume) {
    resumeLink.href = data.resume;
    resumeLink.style.display = "inline-flex";
  } else if (resumeLink) {
    resumeLink.style.display = "none";
  }
}

// ============================================================
// RENDER SOCIALS
// ============================================================
async function renderSocials() {
  const data = await fetchJSON(DATA_PATH.socials);
  if (!data) return;

  const html = data
    .map(
      (s) => `
        <a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.platform}">
            <i class="${s.icon}"></i>
        </a>
    `,
    )
    .join("");

  document.getElementById("heroSocial").innerHTML = html;
  document.getElementById("footerSocial").innerHTML = html;

  const contactSocial = document.getElementById("contactSocialLinks");
  if (contactSocial) contactSocial.innerHTML = html;
}

// ============================================================
// RENDER SKILLS
// ============================================================
async function renderSkills() {
  const data = await fetchJSON(DATA_PATH.skills);
  if (!data) return;

  const grid = document.getElementById("skillsGrid");
  grid.innerHTML = data
    .map(
      (skill) => `
        <div class="skill-item fade-up">
            ${skill.icon ? `<i class="${skill.icon}"></i>` : ""}
            <span>${skill.name}</span>
        </div>
    `,
    )
    .join("");

  document
    .querySelectorAll(".skill-item.fade-up")
    .forEach((el) => observer.observe(el));
}

// ============================================================
// RENDER STATS (Projects & Certifications count)
// ============================================================
async function renderStats() {
  const projects = await fetchJSON(DATA_PATH.projects);
  const certs = await fetchJSON(DATA_PATH.certifications);
  if (!projects || !certs) return;

  document.getElementById("heroStats").innerHTML = `
        <div class="stat-item fade-up">
            <span class="stat-number">${projects.length}</span>
            <span class="stat-label">Projects</span>
        </div>
        <div class="stat-item fade-up">
            <span class="stat-number">${certs.length}</span>
            <span class="stat-label">Certifications</span>
        </div>
    `;

  document
    .querySelectorAll(".hero-stats .stat-item")
    .forEach((el) => observer.observe(el));
}

// ============================================================
// RENDER PROJECTS
// ============================================================
let projectsData = [];

async function renderProjects(filter = "all") {
  if (!projectsData.length) {
    const data = await fetchJSON(DATA_PATH.projects);
    if (!data) return;
    projectsData = data;
  }

  const filtered =
    filter === "all"
      ? projectsData
      : projectsData.filter((p) => p.category === filter);
  const grid = document.getElementById("projectsGrid");

  if (!filtered.length) {
    grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:var(--text-secondary);">No projects in this category.</p>`;
    return;
  }

  grid.innerHTML = filtered
    .map((p, i) => {
      const tech = p.technologies
        ? p.technologies.map((t) => `<span>${t}</span>`).join("")
        : "";
      const date = p.date
        ? new Date(p.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "";

      return `
            <div class="project-card fade-up" style="transition-delay:${i * 0.05}s" data-project-id="${p.id}">
                <img src="${p.thumbnail || "public/images/placeholder.jpg"}" alt="${p.title}" class="project-thumb" loading="lazy" />
                <div class="project-body">
                    <span class="project-category">${p.category || "Uncategorized"}</span>
                    <h3 class="project-title">${p.title}</h3>
                    <p class="project-desc">${p.description || ""}</p>
                    ${tech ? `<div class="project-tech">${tech}</div>` : ""}
                    ${date ? `<div class="project-date"><i class="far fa-calendar-alt"></i> ${date}</div>` : ""}
                    <a href="project-detail.html?id=${p.id}" class="btn-details">
                        <i class="fas fa-info-circle"></i> View Details
                    </a>
                </div>
            </div>
        `;
    })
    .join("");

  // Click on card to navigate to detail page
  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("click", function (e) {
      if (e.target.closest(".btn-details") || e.target.closest("a")) return;
      const id = parseInt(this.dataset.projectId);
      window.location.href = `project-detail.html?id=${id}`;
    });
  });

  document
    .querySelectorAll(".project-card.fade-up")
    .forEach((el) => observer.observe(el));
}

// ============================================================
// PROJECT FILTERS
// ============================================================
async function setupFilters() {
  const data = await fetchJSON(DATA_PATH.projects);
  if (!data) return;

  const categories = [
    "all",
    ...new Set(data.map((p) => p.category).filter(Boolean)),
  ];
  const container = document.getElementById("projectFilters");

  container.innerHTML = categories
    .map(
      (cat) =>
        `<button class="filter-btn ${cat === "all" ? "active" : ""}" data-filter="${cat}">${cat === "all" ? "All" : cat}</button>`,
    )
    .join("");

  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    $$(".filter-btn", container).forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderProjects(btn.dataset.filter);
  });
}

// ============================================================
// RENDER CERTIFICATIONS
// ============================================================
async function renderCertifications() {
  const data = await fetchJSON(DATA_PATH.certifications);
  if (!data) return;

  const grid = document.getElementById("certGrid");
  grid.innerHTML = data
    .map((c, i) => {
      const date = c.date
        ? new Date(c.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "";

      return `
            <div class="cert-card fade-up" style="transition-delay:${i * 0.1}s">
                <img src="${c.image || "public/images/cert-placeholder.png"}" alt="${c.name}" loading="lazy" />
                <h4 class="cert-name">${c.name}</h4>
                <p class="cert-issuer">${c.issuer || ""}</p>
                ${date ? `<p class="cert-date">${date}</p>` : ""}
                ${c.credentialUrl ? `<a href="${c.credentialUrl}" target="_blank" class="cert-link">View Credential</a>` : ""}
            </div>
        `;
    })
    .join("");

  document
    .querySelectorAll(".cert-card.fade-up")
    .forEach((el) => observer.observe(el));
}

// ============================================================
// FOOTER YEAR
// ============================================================
document.getElementById("footerYear").textContent = new Date().getFullYear();

// ============================================================
// INITIALIZATION
// ============================================================
async function init() {
  await renderStats();
  await renderProfile();
  await renderSocials();
  await renderSkills();
  await setupFilters();
  await renderCertifications();
  await renderProjects("all");
  setTimeout(updateActiveNav, 500);
}

document.addEventListener("DOMContentLoaded", init);
