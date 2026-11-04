(function () {
  const B = window.BOUTIQUE, P = window.PRODUITS || [];
  const $ = (s) => document.querySelector(s);
  const fmt = (n) => Number(n).toLocaleString("fr-FR").replace(/[  ]/g, " ") + " " + B.devise;
  const waLink = (t) => `https://wa.me/${B.whatsapp}${t ? "?text=" + encodeURIComponent(t) : ""}`;
  const byId = (id) => P.find((p) => p.id === id);
  const KEY = "panier_mib";
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { cart = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };

  const thumb = (p) => p.image ? `<img src="${esc(p.image)}" alt="">` : `<img src="/assets/img/logo-wide.png" alt="" style="width:70%;height:auto;object-fit:contain">`;

  function render() {
    const ids = Object.keys(cart).filter(byId);
    const count = ids.reduce((s, id) => s + cart[id], 0);
    const total = ids.reduce((s, id) => s + cart[id] * byId(id).prix, 0);
    $("#cartCount").textContent = count;
    $("#cartTotal").textContent = fmt(total);
    $("#cartFoot").style.display = ids.length ? "grid" : "none";
    $("#cartItems").innerHTML = ids.length
      ? ids.map((id) => {
          const p = byId(id);
          return `<div class="item">
            <a href="${p.url}" class="item-thumb">${thumb(p)}</a>
            <div class="item-info">
              <b>${esc(p.nom)}</b><span>${fmt(p.prix)}</span>
              <div class="qty">
                <button type="button" data-q="${id}" data-d="-1" aria-label="Moins">−</button><span>${cart[id]}</span><button type="button" data-q="${id}" data-d="1" aria-label="Plus">+</button>
                <button type="button" class="rm" data-rm="${id}">Retirer</button>
              </div>
            </div></div>`;
        }).join("")
      : '<div class="empty">Votre panier est vide.<br>Ajoutez des produits pour commander.</div>';
  }

  $("#cartItems").addEventListener("click", (e) => {
    const q = e.target.closest("[data-q]"), r = e.target.closest("[data-rm]");
    if (q) { const id = q.dataset.q; cart[id] += Number(q.dataset.d); if (cart[id] <= 0) delete cart[id]; }
    else if (r) delete cart[r.dataset.rm];
    else return;
    save(); render();
  });

  window.addToCart = (id) => { const p = byId(id); if (!p) return; cart[id] = (cart[id] || 0) + 1; save(); render(); toast(`${p.nom} ajouté au panier`); };
  window.openCart = () => { $("#drawer").classList.add("open"); $("#overlay").classList.add("open"); };
  window.closeCart = () => { $("#drawer").classList.remove("open"); $("#overlay").classList.remove("open"); };
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

  const mode = $("#mode"), adr = $("#adresse");
  adr.required = true;
  mode.onchange = () => { const liv = mode.value === "Livraison"; adr.style.display = liv ? "" : "none"; adr.required = liv; };

  $("#orderForm").onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const ids = Object.keys(cart).filter(byId);
    const total = ids.reduce((s, id) => s + cart[id] * byId(id).prix, 0);
    const lignes = ids.map((id) => `• ${cart[id]} × ${byId(id).nom} — ${fmt(cart[id] * byId(id).prix)}`).join("\n");
    let msg = `🛒 *Nouvelle commande — ${B.nom}*\n\n${lignes}\n\n*Total : ${fmt(total)}*\n\n`;
    msg += `👤 Nom : ${f.get("nom")}\n📞 Tél : ${f.get("tel")}\n🚚 Mode : ${f.get("mode")}\n`;
    if (f.get("mode") === "Livraison") msg += `📍 Adresse : ${f.get("adresse")}\n`;
    if (f.get("note")) msg += `📝 Remarque : ${f.get("note")}\n`;
    window.open(waLink(msg), "_blank");
  };

  // Filtres de la page boutique
  const filters = $("#filters");
  if (filters) filters.addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    filters.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c === b));
    document.querySelectorAll("#grid .card").forEach((c) => { c.style.display = b.dataset.c === "Tous" || c.dataset.cat === b.dataset.c ? "" : "none"; });
  });

  let tt;
  function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => el.classList.remove("show"), 1800); }

  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
  render();
})();
