# La Malice — Site portfolio

Site vitrine / portfolio de **La Malice**, studio créatif personnel (création de contenu, community management, communication digitale, sites web, contenu événementiel).

Compte Instagram : [@lamalice.ch](https://www.instagram.com/lamalice.ch/)

Le site est 100 % statique (HTML / CSS / JS vanilla), administrable sans code via **Decap CMS**, et prêt à déployer sur **Netlify**.

---

## 1. Structure du projet

```
la-malice/
├── index.html              Accueil
├── a-propos.html            À propos (danse + parcours pro)
├── services.html            Services
├── projets.html              Projets + Contenus créés (intégrés)
├── projet.html                Détail d'un projet (?slug=...)
├── galerie.html               Galerie masonry
├── contact.html                Formulaire de contact
├── assets/
│   ├── css/styles.css        Design system complet
│   ├── js/main.js             Toute la logique (rendu, filtres, lightbox...)
│   ├── js/la-malice-data.js   ⚠️ Généré automatiquement, ne pas éditer à la main
│   └── images/uploads/        Images uploadées depuis l'admin
├── admin/
│   ├── index.html             Interface Decap CMS
│   └── config.yml              Configuration des collections admin
├── content/                    Contenu administrable (fichiers YAML)
│   ├── projets/
│   ├── categories-projets/
│   ├── contenus/
│   ├── galerie/
│   ├── services/
│   ├── avis/
│   ├── faq/
│   └── settings/ (site.yml, about.yml)
├── build.js                    Génère la-malice-data.js depuis /content
├── package.json
├── netlify.toml
└── README.md
```

**Important — le site n'a volontairement pas de page `contenus.html` séparée** : les "Contenus créés" (Reels, TikToks, photos, stories...) s'affichent directement dans une section dédiée de `projets.html`, sous la grille des projets. Ils restent gérés depuis une collection admin à part (`Contenus créés`), simplement affichés ailleurs.

---

## 2. Comment ça marche

1. Tu ajoutes / modifies du contenu depuis l'admin (`/admin`) → Decap CMS écrit des fichiers YAML dans `content/`.
2. Netlify relance le build (`node build.js`) à chaque publication.
3. `build.js` lit tous les fichiers YAML et génère `assets/js/la-malice-data.js`, qui expose les variables :
   - `window.LA_MALICE_PROJECTS`
   - `window.LA_MALICE_PROJECT_CATEGORIES`
   - `window.LA_MALICE_CONTENTS`
   - `window.LA_MALICE_GALLERY`
   - `window.LA_MALICE_SERVICES`
   - `window.LA_MALICE_REVIEWS`
   - `window.LA_MALICE_FAQ`
   - `window.LA_MALICE_SETTINGS`
   - `window.LA_MALICE_ABOUT`
4. `assets/js/main.js` lit ces variables et construit dynamiquement toutes les pages (cartes projets, filtres, galerie, FAQ, avis, page détail projet, etc.).

**Ne jamais modifier `assets/js/la-malice-data.js` à la main** — il est régénéré à chaque build et toute modification manuelle sera écrasée.

---

## 3. Lancer le build en local

Prérequis : [Node.js](https://nodejs.org/) (version 18 ou plus).

```bash
npm install     # installe js-yaml (une seule fois)
node build.js   # génère assets/js/la-malice-data.js
```

Puis ouvre `index.html` dans un navigateur (ou utilise un petit serveur local, ex. `npx serve .`).

---

## 4. Déployer sur Netlify

1. Pousse ce dossier dans un dépôt Git (GitHub, GitLab ou Bitbucket).
2. Sur [app.netlify.com](https://app.netlify.com), clique sur **Add new site → Import an existing project**, puis connecte ton dépôt.
3. Paramètres de build :
   - **Build command** : `node build.js`
   - **Publish directory** : `.`
4. Clique sur **Deploy**.

### Activer Decap CMS (interface d'administration)

1. Dans Netlify, va dans **Site configuration → Identity** et clique sur **Enable Identity**.
2. Dans **Identity → Registration**, choisis "Invite only" (recommandé) pour que seule toi puisses créer un compte.
3. Dans **Identity → Services**, active **Git Gateway**. C'est ce qui permet à Decap CMS d'écrire dans ton dépôt Git sans que tu aies besoin d'un compte GitHub personnel connecté.
4. Va sur `https://TON-SITE.netlify.app/admin` et connecte-toi via l'invitation reçue par email.

### Configurer Netlify Forms

Le formulaire de contact (`contact.html`) utilise déjà `data-netlify="true"` : Netlify détecte automatiquement le formulaire au moment du build, à condition qu'il soit présent tel quel dans le HTML statique (c'est le cas ici — pas besoin de configuration supplémentaire).

Pour tester :
1. Déploie le site.
2. Va dans **Site configuration → Forms** sur Netlify : le formulaire `contact` doit apparaître dans la liste après le premier déploiement.
3. Remplis et envoie le formulaire depuis le site en ligne : la soumission doit apparaître dans **Forms → contact**.
4. Tu peux configurer une notification par email dans **Forms → Form notifications**.

---

## 5. Utiliser l'admin au quotidien

Toutes les actions suivantes se font depuis `/admin`, sans toucher au code.

### Ajouter un projet
1. Va dans **Projets → New Projets**.
2. Remplis au minimum : entreprise/client, titre, catégorie, statut, description courte, image principale.
3. Choisis "Visible" et éventuellement "Mis en avant" pour qu'il apparaisse sur la home.
4. Publie. Le projet apparaît automatiquement dans `projets.html` et est accessible via `projet.html?slug=...`.

### Ajouter une catégorie de projet
1. Va dans **Catégories de projets → New Catégories de projets**.
2. Donne un nom et un slug (ex. "Podcast" / `podcast`).
3. Publie : le filtre apparaît automatiquement sur `projets.html`, à condition que "Visible" soit coché.
4. Si tu décoches "Visible" sur une catégorie, son filtre disparaît (les projets liés restent visibles si eux-mêmes sont visibles).

### Ajouter un contenu créé (Reel, TikTok, photo...)
1. Va dans **Contenus créés → New Contenus créés**.
2. Choisis le type, ajoute une miniature, un client lié et éventuellement un lien externe.
3. Publie : le contenu apparaît dans la section "Contenus créés" en bas de `projets.html`.

### Ajouter une image à la galerie
1. Va dans **Galerie → New Galerie**.
2. Ajoute l'image, un texte alternatif (important pour le SEO et l'accessibilité) et une catégorie.
3. Publie : l'image apparaît dans `galerie.html` et, si "Mis en avant" est coché, potentiellement sur la home.

### Modifier les services
1. Va dans **Services**, choisis un service existant ou crée-en un nouveau.
2. Modifie le texte, les prestations incluses, le prix indicatif, etc.
3. Décoche "Visible" pour le masquer sans le supprimer.

### Modifier la page À propos
1. Va dans **Paramètres du site → Page À propos**.
2. Modifie les textes (intro, danse, parcours pro), le portrait, la galerie et la timeline.
3. Publie : `a-propos.html` se met à jour automatiquement.

### Modifier les paramètres généraux du site
1. Va dans **Paramètres du site → Paramètres généraux**.
2. Modifie l'email, l'Instagram, les textes du hero, le message de succès du formulaire, les labels de navigation, etc.

---

## 6. Fichiers à ne pas modifier à la main

- `assets/js/la-malice-data.js` → généré par `build.js`, toute modification manuelle sera perdue.
- Les fichiers dans `content/` peuvent être modifiés directement en Git si besoin, mais l'usage prévu est de passer par `/admin`.

---

## 7. Ajouter des images manuellement (hors admin)

Si tu préfères ajouter des images directement en code plutôt que via l'admin :
1. Dépose l'image dans `assets/images/uploads/`.
2. Réfère-toi à elle avec le chemin `/assets/images/uploads/nom-du-fichier.jpg` dans le champ image concerné (YAML ou admin).
3. Privilégie le format `.webp` pour de meilleures performances quand c'est possible.

---

## 8. Performance & accessibilité

- HTML / CSS / JS vanilla, sans framework ni librairie lourde.
- Images en lazy-loading (`loading="lazy"`).
- Respect de `prefers-reduced-motion` (les animations sont désactivées si l'utilisateur le demande).
- Formulaires avec labels, focus clavier visible, lightbox fermable avec `Échap`.
- Contenus vides remplacés par des placeholders clairs ("Projet à compléter", "Image à remplacer", etc.) plutôt que de casser l'affichage.

---

Studio créatif : **La Malice** — [@lamalice.ch](https://www.instagram.com/lamalice.ch/)
