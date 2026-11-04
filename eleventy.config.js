export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy("src/admin/config.yml");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");

  eleventyConfig.addCollection("produits", (api) =>
    api.getFilteredByGlob("src/produits/*.md")
      .filter((p) => p.data.publie !== false)
      .sort((a, b) => (a.data.ordre ?? 99) - (b.data.ordre ?? 99))
  );
  eleventyConfig.addCollection("articles", (api) =>
    api.getFilteredByGlob("src/blog/*.md")
      .filter((p) => p.data.publie !== false)
      .sort((a, b) => b.date - a.date)
  );

  const fmt = (n) => Number(n || 0).toLocaleString("fr-FR").replace(/[  ]/g, " ");
  eleventyConfig.addFilter("prix", (n, devise) => `${fmt(n)} ${devise || ""}`.trim());
  eleventyConfig.addFilter("dateFr", (d) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }));
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString());
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v).replace(/</g, "\\u003c"));
  eleventyConfig.addFilter("absolute", (path, base) => new URL(path || "/", base).href);
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("categories", (items) => [...new Set(items.map((p) => p.data.categorie))]);
  eleventyConfig.addFilter("catalogue", (items) =>
    items.map((p) => ({
      id: p.fileSlug, nom: p.data.title, cat: p.data.categorie, prix: p.data.prix,
      ancien: p.data.ancien_prix || 0, badge: p.data.badge || "", image: p.data.image || "",
      icone: p.data.icone || "console", url: p.url, stock: p.data.en_stock !== false,
    })));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
