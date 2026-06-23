// ===== CONFIGURATION =====
const DATA_PATH = {
  projects: "data/projects.json",
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

// ===== BUILD DETAILS HTML =====
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

  // تحديث عنوان الصفحة
  document.getElementById("pageTitle").textContent =
    `${project.title} · Yousef Tawfiq`;
  document.querySelector('meta[name="description"]').content =
    project.description || "Project details";

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

// ===== RENDER PROJECT DETAIL =====
async function renderProjectDetail() {
  const params = new URLSearchParams(window.location.search);
  const projectId = parseInt(params.get("id"));
  const container = document.getElementById("projectDetailContent");

  if (!projectId) {
    container.innerHTML = `
            <div class="project-not-found">
                <h2>No project specified</h2>
                <p><a href="index.html#projects">← Back to projects</a></p>
            </div>
        `;
    return;
  }

  const data = await fetchJSON(DATA_PATH.projects);
  if (!data) {
    container.innerHTML = `
            <div class="project-not-found">
                <h2>Error loading projects</h2>
                <p><a href="index.html#projects">← Back to projects</a></p>
            </div>
        `;
    return;
  }

  const project = data.find((p) => p.id === projectId);
  if (!project) {
    container.innerHTML = `
            <div class="project-not-found">
                <h2>Project not found</h2>
                <p><a href="index.html#projects">← Back to projects</a></p>
            </div>
        `;
    return;
  }

  container.innerHTML = buildDetailsHTML(project);
}

// ===== FOOTER YEAR =====
document.getElementById("footerYear").textContent = new Date().getFullYear();

// ===== INIT =====
document.addEventListener("DOMContentLoaded", renderProjectDetail);

// ===== RE-RENDER ON POPSTATE (Back/Forward) =====
window.addEventListener("popstate", renderProjectDetail);
