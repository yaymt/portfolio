// ===== CONFIGURATION =====
const DATA_PATH = {
  profile: "data/profile.json",
  projects: "data/projects.json",
  certifications: "data/certifications.json",
  skills: "data/skills.json",
  socials: "data/socials.json",
};

// ===== UTILITY FUNCTIONS =====
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

// ===== DARK MODE =====
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

// ===== NAV TOGGLE =====
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

// ===== ACTIVE NAV LINK =====
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
    if (
      link.getAttribute("href") === `#${currentSection}` ||
      link.getAttribute("href") === `index.html#${currentSection}`
    ) {
      link.classList.add("active");
    }
  });
}
window.addEventListener("scroll", updateActiveNav);
window.addEventListener("load", updateActiveNav);

// ===== BACK TO TOP =====
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  backToTop.classList.toggle("show", window.scrollY > 400);
});
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===== SCROLL ANIMATIONS =====
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

// ===== RENDER PROFILE =====
async function renderProfile() {
  const data = await fetchJSON(DATA_PATH.profile);
  if (!data) return;
  document.querySelector(".hero-name").textContent = data.name;
  document.querySelector(".hero-title").textContent = data.title;
  document.getElementById("heroBio").textContent = data.bio;
  document.getElementById("aboutText").innerHTML = `<p>${data.about}</p>`;
  document.getElementById("aboutInfo").innerHTML = `
        <p><i class="fas fa-location-dot"></i> ${data.location || ""}</p>
        <p><i class="fas fa-envelope"></i> <a href="mailto:${data.email}">${data.email}</a></p>
    `;
  document.getElementById("contactEmail").textContent = data.email;
  const resumeLink = document.getElementById("resumeLink");
  if (resumeLink && data.resume) {
    resumeLink.href = data.resume;
    resumeLink.style.display = "inline-flex";
  } else if (resumeLink) {
    resumeLink.style.display = "none";
  }
}

// ===== RENDER SOCIALS =====
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

// ===== RENDER SKILLS =====
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

// ===== RENDER STATS =====
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

// ===== PROJECT DETAILS (Full Page) =====
let projectsData = [];

function buildDetailsHTML(project) {
  const thumb = project.thumbnail || "public/images/placeholder.jpg";
  let galleryHTML = "";
  if (project.gallery && project.gallery.length) {
    galleryHTML = `
            <h3 class="details-section-title">📸 Gallery</h3>
            <div class="details-gallery">
                ${project.gallery
                  .map(
                    (img) => `
                    <img src="${img}" alt="${project.title}" loading="lazy" onclick="window.open('${img}','_blank')" />
                `,
                  )
                  .join("")}
            </div>
        `;
  }
  let videoHTML = "";
  if (project.youtube) {
    const vid = extractYouTubeID(project.youtube);
    if (vid) {
      videoHTML = `
                <h3 class="details-section-title">🎬 Video Demo</h3>
                <div class="details-video">
                    <iframe src="https://www.youtube.com/embed/${vid}" allowfullscreen loading="lazy" title="${project.title}"></iframe>
                </div>
            `;
    }
  }
  let featuresHTML = "";
  if (project.features && project.features.length) {
    featuresHTML = `
            <h3 class="details-section-title">✨ Key Features</h3>
            <ul class="details-features">
                ${project.features.map((f) => `<li>${f}</li>`).join("")}
            </ul>
        `;
  }
  let linksHTML = "";
  if (project.github || project.demo || project.docs) {
    linksHTML = `
            <h3 class="details-section-title">🔗 Links</h3>
            <div class="details-links">
                ${project.github ? `<a href="${project.github}" target="_blank" rel="noopener" class="link-github" aria-label="View on GitHub"><i class="fab fa-github"></i> View on GitHub</a>` : ""}
                ${project.demo ? `<a href="${project.demo}" target="_blank" rel="noopener" class="link-demo"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ""}
                ${project.docs ? `<a href="${project.docs}" target="_blank" rel="noopener" class="link-docs"><i class="fas fa-file-alt"></i> Documentation</a>` : ""}
            </div>
        `;
  }
  const techHTML =
    project.technologies && project.technologies.length
      ? `
        <h3 class="details-section-title">🛠️ Technologies</h3>
        <div class="details-tech">
            ${project.technologies.map((t) => `<span>${t}</span>`).join("")}
        </div>
    `
      : "";
  const dateHTML = project.date
    ? `
        <div class="details-date">
            <i class="far fa-calendar-alt"></i> ${new Date(project.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </div>
    `
    : "";
  return `
        <img src="${thumb}" alt="${project.title}" class="details-thumbnail" loading="lazy" />
        <span class="details-category">${project.category || "Uncategorized"}</span>
        <h2 class="details-title">${project.title}</h2>
        ${dateHTML}
        <p class="details-description">${project.description || "No description available."}</p>
        ${techHTML}
        ${featuresHTML}
        ${galleryHTML}
        ${videoHTML}
        ${linksHTML}
    `;
}

function extractYouTubeID(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// عرض المشروع المحدد في صفحة منفصلة
async function renderProjectDetail() {
  const params = new URLSearchParams(window.location.search);
  const projectId = parseInt(params.get("project"));
  const body = document.getElementById("body");
  const detailSection = document.getElementById("project-detail-section");
  const projectGrid = document.querySelector(".projects");

  if (projectId) {
    body.classList.add("project-detail-view");
    if (detailSection) detailSection.style.display = "block";
    if (projectGrid) projectGrid.style.display = "none";
  } else {
    body.classList.remove("project-detail-view");
    if (detailSection) detailSection.style.display = "none";
    if (projectGrid) projectGrid.style.display = "block";
  }

  if (!projectId) return;

  // تحميل البيانات إذا لم تكن محملة
  if (!projectsData.length) {
    const data = await fetchJSON(DATA_PATH.projects);
    if (data) projectsData = data;
  }

  const project = projectsData.find((p) => p.id === projectId);
  const container = document.getElementById("projectDetailContent");
  if (!project) {
    container.innerHTML = `<p style="text-align:center; color:var(--text-secondary); padding:60px 0;">Project not found. <a href="index.html#projects">Back to projects</a></p>`;
    return;
  }
  container.innerHTML = buildDetailsHTML(project);
  // Scroll to top of detail section
  if (detailSection) {
    setTimeout(() => {
      detailSection.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }
}

// ===== RENDER PROJECTS =====
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
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary);">No projects in this category.</p>`;
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
                    <a href="?project=${p.id}" class="btn-details">
                        <i class="fas fa-info-circle"></i> View Details
                    </a>
                </div>
            </div>
        `;
    })
    .join("");

  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("click", function (e) {
      if (e.target.closest(".btn-details") || e.target.closest("a")) return;
      const id = parseInt(this.dataset.projectId);
      window.location.href = `?project=${id}`;
    });
  });
  document
    .querySelectorAll(".project-card.fade-up")
    .forEach((el) => observer.observe(el));
}

// ===== PROJECT FILTERS =====
async function setupFilters() {
  const data = await fetchJSON(DATA_PATH.projects);
  if (!data) return;
  const cats = ["all", ...new Set(data.map((p) => p.category).filter(Boolean))];
  const container = document.getElementById("projectFilters");
  container.innerHTML = cats
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

// ===== RENDER CERTIFICATIONS =====
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

// ===== FOOTER YEAR =====
document.getElementById("footerYear").textContent = new Date().getFullYear();

// ===== INIT =====
async function init() {
  await renderStats();
  await renderProfile();
  await renderSocials();
  await renderSkills();
  await setupFilters();
  await renderCertifications();
  await renderProjects("all");
  setTimeout(updateActiveNav, 500);

  // Check if project detail is requested
  await renderProjectDetail();
}

document.addEventListener("DOMContentLoaded", init);

// ===== RE-RENDER ON POPSTATE (Back/Forward) =====
window.addEventListener("popstate", () => {
  renderProjectDetail();
});
