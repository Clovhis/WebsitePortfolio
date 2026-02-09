/* Minimal, dependency-free enhancements for GitHub Pages */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);

  // Footer year
  const y = $("#y");
  if (y) y.textContent = String(new Date().getFullYear());

  // Reveal-on-scroll (subtle)
  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    for (const el of revealEls) io.observe(el);
  } else {
    for (const el of revealEls) el.classList.add("is-visible");
  }

  // Tool marquee (logos, slowly right-to-left)
  const track = $("#tool-marquee");
  if (!track) return;

  const tools = [
    { slug: "microsoftazure", name: "Azure", color: "#0078D4" },
    { slug: "ansible", name: "Ansible", color: "#EE0000" },
    { slug: "grafana", name: "Grafana", color: "#F46800" },
    { slug: "kubernetes", name: "Kubernetes", color: "#326CE5" },
    { slug: "docker", name: "Docker", color: "#2496ED" },
    { slug: "helm", name: "Helm", color: "#0F1689" },
    { slug: "github", name: "GitHub", color: "#181717" },
    { slug: "linux", name: "Linux", color: "#FCC624" },
    { slug: "windows11", name: "Windows", color: "#0078D4" },
    { slug: "azuredevops", name: "Azure DevOps", color: "#0078D7" },
  ];

  const loadSvg = async (slug) => {
    const res = await fetch(`assets/icons/${slug}.svg`, { cache: "force-cache" });
    if (!res.ok) throw new Error(`Failed to load icon: ${slug}`);
    const text = await res.text();

    const doc = new DOMParser().parseFromString(text, "image/svg+xml");
    const svg = doc.documentElement;
    // Prevent nested titles from becoming verbose for screen readers; the visible text is enough.
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.removeAttribute("role");
    return svg;
  };

  const buildTool = async ({ slug, name, color }) => {
    const el = document.createElement("div");
    el.className = "tool";
    el.style.setProperty("--tool", color);
    el.dataset.tool = slug;

    try {
      el.appendChild(await loadSvg(slug));
    } catch {
      // If an icon fails to load, keep the label and move on.
    }

    const label = document.createElement("span");
    label.textContent = name;
    el.appendChild(label);
    return el;
  };

  const setup = async () => {
    // Render once, then clone to create a seamless loop.
    const firstBatch = await Promise.all(tools.map(buildTool));
    for (const el of firstBatch) track.appendChild(el);

    // Duplicate content to enable a continuous scroll.
    for (const el of firstBatch) {
      const clone = el.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    }

    // Start animation only if it makes sense (content wider than frame).
    requestAnimationFrame(() => {
      const frame = track.parentElement;
      if (!frame) return;
      if (track.scrollWidth > frame.clientWidth + 40) {
        track.classList.add("is-animating");
      }
    });
  };

  setup();
})();

