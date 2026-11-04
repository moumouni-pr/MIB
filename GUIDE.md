# Guide MIB GAMING — mettre le site en ligne et le gérer

Ce guide vous accompagne pas à pas. Comptez environ **1 heure** la première fois.

---

## Étape 1 — Mettre le site en ligne (gratuit, 10 min)

1. Allez sur **https://app.netlify.com/signup** et cliquez sur **« Sign up with GitHub »** (connectez-vous avec votre compte GitHub `moumouni-pr`).
2. Cliquez sur **« Add new project » → « Import an existing project » → « GitHub »**.
3. Autorisez Netlify, puis choisissez le dépôt **`mib-gaming`**.
4. Ne changez rien aux réglages (ils sont déjà dans le fichier `netlify.toml`) et cliquez sur **« Deploy »**.
5. Au bout d'une minute environ, votre site est en ligne à une adresse du type `https://xxxx.netlify.app`.
   Dans **Site configuration → Change site name**, vous pouvez la renommer, par exemple en `mibgaming.netlify.app`.

## Étape 2 — Votre propre nom de domaine `mibgaming.com` (≈ 10-15 €/an)

Un nom de domaine à vous fait **beaucoup** pour la confiance des clients et pour Google.

1. Dans Netlify : **Domain management → Add a domain** → tapez `mibgaming.com`.
   - Si le nom est libre, vous pouvez l'acheter directement là, et tout se configure automatiquement.
   - Si `mibgaming.com` est déjà pris, essayez par exemple `mib-gaming.com` ou `mibgaming.shop`.
2. Le cadenas HTTPS (site sécurisé) s'active tout seul en quelques minutes.
3. **Important :** ensuite, dans l'espace admin (voir étape 3), ouvrez **Paramètres de la boutique** et mettez votre adresse finale dans **« Adresse du site »**, par exemple `https://mibgaming.com`.

## Étape 3 — Activer votre espace admin (10 min, une seule fois)

L'espace admin se trouve à l'adresse **`https://votre-site/admin/`**. Pour qu'il vous laisse entrer, il faut relier GitHub et Netlify :

1. Allez sur **https://github.com/settings/developers** → **« New OAuth App »**.
   - *Application name* : `MIB GAMING Admin`
   - *Homepage URL* : l'adresse de votre site (ex : `https://mibgaming.com`)
   - *Authorization callback URL* : **`https://api.netlify.com/auth/done`**
   - Cliquez sur **« Register application »**.
2. Copiez le **Client ID**, puis cliquez sur **« Generate a new client secret »** et copiez le **secret**.
3. Dans Netlify : **Project configuration → Access & security → OAuth → Install provider → GitHub**, puis collez le Client ID et le secret.
4. Ouvrez `https://votre-site/admin/` et cliquez sur **« Se connecter avec GitHub »**. ✅

## Étape 4 — Apparaître sur Google quand on tape « MIB GAMING »

Le site est **déjà préparé pour Google** : titres, descriptions, fiche « Magasin » avec logo, adresse et horaires, fiches produits avec prix, plan du site (`sitemap.xml`). Il reste à **prévenir Google** :

1. **Google Search Console** (le plus important pour le site)
   - Allez sur **https://search.google.com/search-console** → **Ajouter une propriété** → **Domaine** → `mibgaming.com`.
   - Google vous donne un code TXT. Dans Netlify : **Domains → mibgaming.com → DNS settings → Add new record → TXT**, collez le code, puis cliquez sur **Valider** dans Google.
   - Dans **Sitemaps**, ajoutez `sitemap.xml` et cliquez sur **Envoyer**.
   - Dans **Inspection de l'URL**, collez l'adresse de votre page d'accueil et cliquez sur **Demander l'indexation**.
2. **Fiche Google Business Profile** (pour apparaître sur Google Maps, avec photos, horaires et avis)
   - Allez sur **https://business.google.com** → créez la fiche **MIB GAMING**, catégorie *Magasin de jeux vidéo*, et indiquez l'adresse, le téléphone et **le lien de votre site**.
   - Google vérifie la fiche (par vidéo, téléphone ou courrier). C'est souvent ce qui fait apparaître la boutique **en premier** quand on cherche son nom.
3. **Bing** (utilisé aussi par Yahoo et DuckDuckGo) : sur **https://www.bing.com/webmasters**, choisissez « Importer depuis Google Search Console ».
4. **Mettez le lien du site partout** : Facebook, Instagram, TikTok, statut et profil **WhatsApp Business**, cartes de visite, sacs, affiches en boutique.

⏳ Comptez en général **quelques jours à 2-3 semaines** avant que le site apparaisse sur Google pour « MIB GAMING ». Publier régulièrement des articles et obtenir des avis Google accélère les choses.

---

## Utiliser l'espace admin au quotidien

Allez sur `https://votre-site/admin/` et connectez-vous avec GitHub. Vous y trouvez 3 rubriques :

| Rubrique | Ce que vous pouvez faire |
|---|---|
| **Produits** | Ajouter ou modifier un produit : nom, prix, prix barré pour une promo, photo, étiquette « Nouveau » ou « Promo », en stock ou en rupture, description |
| **Articles (Actualités)** | Écrire des articles (arrivages, promos, conseils) avec images, titres, listes… |
| **Paramètres de la boutique** | Numéro WhatsApp, adresse, horaires, slogan, réseaux sociaux, chiffres clés de l'accueil |

Après chaque modification, cliquez sur **« Publier » → « Publier maintenant »**. Le site se met à jour tout seul en **1 à 2 minutes**.

### Conseils pour bien apparaître sur Google
- **Résumé des produits et des articles** : écrivez une phrase claire avec des mots que les clients tapent sur Google, par exemple « PS5 Slim neuve à Bamako, livraison en 24h ».
- **Photos** : utilisez de vraies photos de vos produits et de votre boutique, carrées de préférence.
- **Articles** : un article par semaine ou toutes les deux semaines suffit, par exemple pour les arrivages, une comparaison de consoles, les jeux du mois ou les promos de fin d'année.

---

## Infos techniques (pour un développeur)

- Générateur de site : [Eleventy](https://www.11ty.dev/) 3. Lancez `npm install` puis `npm start` pour le voir en local, ou `npm run build` pour produire le site dans `_site/`.
- Espace admin : [Decap CMS](https://decapcms.org/), configuré dans `src/admin/config.yml`.
- Contenus : les produits sont dans `src/produits/*.md`, les articles dans `src/blog/*.md`, les paramètres dans `src/_data/site.json`, les images envoyées dans `src/assets/uploads/`.
- Panier et commande WhatsApp : `src/assets/js/cart.js`.
