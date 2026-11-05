(function () {
  const B = window.BOUTIQUE, P = window.PRODUITS || [], IC = window.ICONES || {};
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const fmt = (n) => Number(n).toLocaleString("fr-FR").replace(/[  ]/g, " ") + " " + B.devise;
  const waLink = (t) => `https://wa.me/${B.whatsapp}${t ? "?text=" + encodeURIComponent(t) : ""}`;
  const byId = (key) => P.find((p) => p.id === String(key).split("|")[0]);
  const variante = (key) => String(key).split("|")[1] || "";
  const nomLigne = (key) => byId(key).nom + (variante(key) ? ` (${variante(key)})` : "");
  const imgLigne = (key) => { const p = byId(key), v = (p.couleurs || []).find((c) => c.nom === variante(key)); return v && v.image ? { ...p, image: v.image } : p; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const remise = (p) => (p.ancien && p.ancien > p.prix ? Math.round((1 - p.prix / p.ancien) * 100) : 0);
  const visuel = (p) => (p.image ? `<img src="${esc(p.image)}" alt="${esc(p.nom)}" loading="lazy">` : IC[p.icone] || IC.console || "");
  const KEY = "panier_mib";

  /* ---------- Panier ---------- */
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { cart = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };
  const totalPanier = () => Object.keys(cart).filter(byId).reduce((s, id) => s + cart[id] * byId(id).prix, 0);

  function render() {
    const ids = Object.keys(cart).filter(byId);
    const count = ids.reduce((s, id) => s + cart[id], 0);
    $("#cartCount").textContent = count;
    $("#cartTotal").textContent = fmt(totalPanier());
    $("#cartFoot").style.display = ids.length ? "grid" : "none";
    $("#cartItems").innerHTML = ids.length
      ? ids.map((id) => {
          const p = byId(id);
          return `<div class="item">
            <a href="${p.url}" class="item-thumb">${visuel(imgLigne(id))}</a>
            <div class="item-info">
              <b>${esc(nomLigne(id))}</b><span>${fmt(p.prix)}</span>
              <div class="qty">
                <button type="button" data-q="${id}" data-d="-1" aria-label="Moins">−</button><span>${cart[id]}</span><button type="button" data-q="${id}" data-d="1" aria-label="Plus">+</button>
                <button type="button" class="rm" data-rm="${id}">Retirer</button>
              </div>
            </div></div>`;
        }).join("")
      : '<div class="empty">Votre panier est vide.<br>Ajoutez des produits pour commander.</div>';
    renderPay();
  }

  $("#cartItems").addEventListener("click", (e) => {
    const q = e.target.closest("[data-q]"), r = e.target.closest("[data-rm]");
    if (q) { const id = q.dataset.q; cart[id] += Number(q.dataset.d); if (cart[id] <= 0) delete cart[id]; }
    else if (r) delete cart[r.dataset.rm];
    else return;
    save(); render();
  });

  window.addToCart = (id, couleur) => {
    const p = byId(id); if (!p) return;
    if (p.couleurs && p.couleurs.length && !couleur) { location.href = p.url; return; }
    const key = couleur ? `${id}|${couleur}` : id;
    cart[key] = (cart[key] || 0) + 1; save(); render(); toast(`${nomLigne(key)} ajouté au panier`);
  };
  window.openCart = () => { $("#drawer").classList.add("open"); $("#overlay").classList.add("open"); };
  window.closeCart = () => { $("#drawer").classList.remove("open"); $("#overlay").classList.remove("open"); };
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

  /* ---------- Livraison & paiement ---------- */
  const mode = $("#mode"), adr = $("#adresse");
  adr.required = true;
  mode.onchange = () => { const liv = mode.value === "Livraison"; adr.style.display = liv ? "" : "none"; adr.required = liv; };

  const ref = "MIB-" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  const methode = () => { const r = document.querySelector('input[name="paiement"]:checked'); return r ? r.value : ""; };
  const infoPaiement = () => (B.paiements || []).find((m) => m.nom === methode());

  function renderPay() {
    const m = infoPaiement(), box = $("#payBox"), tr = $("#transaction");
    if (!box) return;
    if (m) {
      box.style.display = "";
      box.innerHTML = `<p><b>1.</b> ${esc(m.consigne)}</p>
        <div class="pay-num"><span>Numéro ${esc(m.nom)}</span><b>${esc(m.numero)}</b><small>${esc(m.titulaire)}</small>
        <button type="button" class="copy" data-copy="${esc(m.numero.replace(/\s/g, ""))}">Copier</button></div>
        <div class="pay-num"><span>Montant à envoyer</span><b>${fmt(totalPanier())}</b></div>
        <div class="pay-num"><span>Motif / référence commande</span><b>${ref}</b></div>
        <p><b>2.</b> Indiquez ci-dessous la référence de la transaction, puis envoyez la commande sur WhatsApp. Vous pouvez aussi joindre la capture du paiement dans la discussion.</p>`;
      tr.style.display = ""; tr.required = true;
    } else {
      box.style.display = "none"; tr.style.display = "none"; tr.required = false;
    }
  }
  $$('input[name="paiement"]').forEach((r) => (r.onchange = renderPay));
  $("#payBox").addEventListener("click", (e) => {
    const b = e.target.closest("[data-copy]"); if (!b) return;
    try { navigator.clipboard.writeText(b.dataset.copy); toast("Numéro copié"); } catch (err) {}
  });

  $("#orderForm").onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const ids = Object.keys(cart).filter(byId);
    const lignes = ids.map((id) => `• ${cart[id]} × ${nomLigne(id)} — ${fmt(cart[id] * byId(id).prix)}`).join("\n");
    let msg = `🛒 *Nouvelle commande ${ref} — ${B.nom}*\n\n${lignes}\n\n*Total : ${fmt(totalPanier())}*\n\n`;
    msg += `👤 Nom : ${f.get("nom")}\n📞 Tél : ${f.get("tel")}\n🚚 ${f.get("mode")}\n`;
    if (f.get("mode") === "Livraison") msg += `📍 Adresse : ${f.get("adresse")}\n`;
    msg += `💳 Paiement : ${methode()}\n`;
    if (infoPaiement()) msg += `🧾 Réf. transaction : ${f.get("transaction")}\n`;
    if (f.get("note")) msg += `📝 Remarque : ${f.get("note")}\n`;
    window.open(waLink(msg), "_blank");
  };

  /* ---------- Diaporama ---------- */
  const slides = $$("#slider .slide"), dots = $$("#slider .dots button");
  if (slides.length > 1) {
    let i = 0, timer;
    const go = (n) => { i = (n + slides.length) % slides.length; slides.forEach((s, k) => s.classList.toggle("on", k === i)); dots.forEach((d, k) => d.classList.toggle("on", k === i)); };
    const auto = () => { clearInterval(timer); timer = setInterval(() => go(i + 1), 5000); };
    dots.forEach((d, k) => (d.onclick = () => { go(k); auto(); }));
    auto();
  }

  /* ---------- Boutique : filtres, tri, catégorie dans l'URL ---------- */
  const filters = $("#filters"), grid = $("#grid");
  if (filters && grid) {
    const cards = $$("#grid .card");
    const apply = (cat) => {
      let n = 0;
      cards.forEach((c) => {
        const ok = cat === "Tous" || (cat === "promo" ? Number(c.dataset.remise) > 0 : c.dataset.cat === cat);
        c.style.display = ok ? "" : "none"; if (ok) n++;
      });
      filters.querySelectorAll(".chip").forEach((b) => b.classList.toggle("on", b.dataset.c === cat));
      const label = cat === "Tous" ? "Toute la boutique" : cat === "promo" ? "🔥 Promos" : cat;
      $("#shopTitle").textContent = label; $("#crumbCat").textContent = label;
      $("#shopCount").textContent = n + (n > 1 ? " produits" : " produit");
      $("#noResult").hidden = n > 0;
    };
    filters.addEventListener("click", (e) => {
      const b = e.target.closest(".chip"); if (!b) return;
      apply(b.dataset.c);
      const u = new URL(location.href); b.dataset.c === "Tous" ? u.searchParams.delete("cat") : u.searchParams.set("cat", b.dataset.c); history.replaceState(null, "", u);
    });
    $("#sort").onchange = (e) => {
      const v = e.target.value, key = (c) => Number(c.dataset[v.startsWith("prix") ? "prix" : v === "remise" ? "remise" : "ordre"]);
      cards.sort((a, b) => (v === "prix-desc" || v === "remise" ? key(b) - key(a) : key(a) - key(b))).forEach((c) => grid.appendChild(c));
    };
    apply(new URLSearchParams(location.search).get("cat") || "Tous");
  }

  /* ---------- Recherche ---------- */
  const sg = $("#searchGrid");
  if (sg) {
    const params = new URLSearchParams(location.search), q = (params.get("q") || "").trim(), cat = params.get("cat") || "";
    const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const mots = norm(q).split(/\s+/).filter(Boolean);
    const res = P.filter((p) => (!cat || p.cat === cat) && mots.every((m) => norm([p.nom, p.cat, p.resume, p.marque].join(" ")).includes(m)));
    const input = document.querySelector('.search input[name="q"]'), sel = document.querySelector('.search select[name="cat"]');
    if (input) input.value = q; if (sel) sel.value = cat;
    $("#searchTitle").textContent = q ? `Résultats pour « ${q} »` : cat ? cat : "Tous les produits";
    $("#searchCount").textContent = res.length + (res.length > 1 ? " produits trouvés" : " produit trouvé");
    sg.innerHTML = res.map((p) => {
      const r = remise(p);
      return `<article class="card">
        <a href="${p.url}" class="thumb">${r ? `<span class="badge promo">-${r}%</span>` : p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}${visuel(p)}</a>
        <div class="body"><span class="cat">${esc(p.cat)}</span><h3><a href="${p.url}">${esc(p.nom)}</a></h3><p class="desc">${esc(p.resume)}</p>
        <div class="row"><div class="price">${fmt(p.prix)}${p.ancien ? `<span class="old">${fmt(p.ancien)}</span>` : ""}</div>
        ${p.stock ? `<button class="add" type="button" onclick="addToCart('${p.id}')" aria-label="Ajouter au panier"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg></button>` : ""}</div></div></article>`;
    }).join("");
    $("#searchEmpty").hidden = res.length > 0;
    $("#searchWa").href = waLink(`Bonjour ${B.nom}, je cherche : ${q}`);
  }

  /* ---------- Choix de la couleur ---------- */
  const sw = $("#swatches");
  if (sw) sw.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-couleur]"); if (!b) return;
    sw.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
    $("#couleurChoisie").textContent = b.dataset.couleur;
    $("#btnAjout").dataset.couleur = b.dataset.couleur;
    if (b.dataset.img && $("#mainPhoto")) $("#mainPhoto").src = b.dataset.img;
    const wa = $("#btnWa"); if (wa) wa.href = wa.dataset.base + encodeURIComponent(" — couleur : " + b.dataset.couleur);
  });

  /* ---------- Galerie produit ---------- */
  const thumbs = $("#thumbs");
  if (thumbs) thumbs.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-src]"); if (!b) return;
    $("#mainPhoto").src = b.dataset.src;
    thumbs.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
  });

  let tt;
  function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => el.classList.remove("show"), 1800); }

  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
  render();
})();
