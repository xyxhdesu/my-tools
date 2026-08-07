(() => {
  const cards = [...document.querySelectorAll("#site-grid .site-card")];
  const filters = [...document.querySelectorAll("[data-filter]")];
  const subfilterList = document.querySelector("#subfilter-list");
  const search = document.querySelector("#site-search");
  const resultCount = document.querySelector("#result-count");
  const emptyResults = document.querySelector("#empty-results");
  let activeFilter = "全部";
  let activeSubfilter = "全部";

  const renderSubfilters = () => {
    if (!subfilterList) return;
    const subcategories = [...new Set(cards
      .filter((card) => card.dataset.category === activeFilter)
      .map((card) => card.dataset.subcategory)
      .filter(Boolean))];
    if (activeFilter === "全部" || subcategories.length === 0) {
      activeSubfilter = "全部";
      subfilterList.replaceChildren();
      subfilterList.hidden = true;
      return;
    }
    if (activeSubfilter !== "全部" && !subcategories.includes(activeSubfilter)) activeSubfilter = "全部";
    subfilterList.replaceChildren();
    ["全部", ...subcategories].forEach((subcategory) => {
      const button = document.createElement("button");
      button.className = "subfilter-button";
      button.type = "button";
      button.dataset.subfilter = subcategory;
      button.textContent = subcategory;
      button.classList.toggle("is-active", subcategory === activeSubfilter);
      subfilterList.append(button);
    });
    subfilterList.hidden = false;
  };

  const updateLibrary = () => {
    const query = (search?.value || "").trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const categoryMatch = activeFilter === "全部" || card.dataset.category === activeFilter;
      const subcategoryMatch = activeSubfilter === "全部" || card.dataset.subcategory === activeSubfilter;
      const searchMatch = !query || card.dataset.search.includes(query);
      const shouldShow = categoryMatch && subcategoryMatch && searchMatch;
      card.hidden = !shouldShow;
      if (shouldShow) visible += 1;
    });
    if (resultCount) resultCount.textContent = visible;
    if (emptyResults) emptyResults.hidden = visible !== 0;
  };

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      activeSubfilter = "全部";
      filters.forEach((item) => item.classList.toggle("is-active", item === button));
      renderSubfilters();
      updateLibrary();
    });
  });
  subfilterList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-subfilter]");
    if (!button) return;
    activeSubfilter = button.dataset.subfilter;
    subfilterList.querySelectorAll("[data-subfilter]").forEach((item) => item.classList.toggle("is-active", item === button));
    updateLibrary();
  });
  search?.addEventListener("input", updateLibrary);
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement !== search) {
      event.preventDefault();
      search?.focus();
    }
  });

  const easterTrigger = document.querySelector("[data-easter-trigger]");
  const secretDialog = document.querySelector("#secret-dialog");
  const secretClose = document.querySelector("[data-secret-close]");
  const easterClicks = [];
  easterTrigger?.addEventListener("click", () => {
    const now = Date.now();
    easterClicks.push(now);
    while (easterClicks.length && now - easterClicks[0] > 2500) easterClicks.shift();
    if (easterClicks.length >= 5) {
      secretDialog?.showModal();
      easterClicks.length = 0;
    }
  });
  secretClose?.addEventListener("click", () => secretDialog?.close());

  const container = document.querySelector("[data-blog-index]");
  const list = document.querySelector("#blog-updates");
  if (!container || !list) return;
  const formatDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? "最新文章" : new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  };
  const renderPosts = (posts) => {
    list.replaceChildren();
    posts.slice(0, 3).forEach((post) => {
      const link = document.createElement("a");
      const date = document.createElement("time");
      const title = document.createElement("h3");
      link.className = "update-card";
      link.href = new URL(post.permalink || post.RelPermalink || post.url || "/", container.dataset.blogIndex).href;
      date.dateTime = post.date || "";
      date.textContent = formatDate(post.date);
      title.textContent = post.title || "未命名文章";
      link.append(date, title);
      list.append(link);
    });
  };
  fetch(container.dataset.blogIndex)
    .then((response) => { if (!response.ok) throw new Error("Blog index unavailable"); return response.json(); })
    .then((posts) => { if (!Array.isArray(posts) || posts.length === 0) throw new Error("No posts"); renderPosts(posts); })
    .catch(() => { list.innerHTML = '<p class="empty">最近更新将在博客发布后显示。</p>'; });
})();
