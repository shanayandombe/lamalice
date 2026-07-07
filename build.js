/**
 * build.js — La Malice
 * ---------------------------------------------------------------
 * Lit tous les fichiers YAML du dossier `content/` (alimentés par
 * Decap CMS) et génère `assets/js/la-malice-data.js`, un fichier JS
 * exposant des variables globales `window.LA_MALICE_*` utilisées
 * par toutes les pages du site.
 *
 * Ne modifie jamais `assets/js/la-malice-data.js` à la main :
 * il est régénéré à chaque build (`node build.js`).
 * ---------------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");

// Petit parseur YAML minimaliste (pas de dépendance npm nécessaire).
// Supporte : scalaires, listes simples, listes d'objets, objets imbriqués,
// chaînes entre guillemets, booléens, nombres, dates.
// Si js-yaml est installé, on l'utilise (plus robuste) ; sinon fallback.
let yaml;
try {
  yaml = require("js-yaml");
} catch (e) {
  yaml = null;
}

const CONTENT_DIR = path.join(__dirname, "content");
const OUTPUT_FILE = path.join(__dirname, "assets", "js", "la-malice-data.js");

// ---------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Fallback YAML parser très simple (couvre les besoins de ce projet).
// Utilisé uniquement si js-yaml n'est pas disponible dans l'environnement.
function simpleYamlParse(text) {
  const lines = text.split(/\r?\n/);
  const root = {};
  const stack = [{ indent: -1, node: root, key: null }];

  function setValue(obj, key, value) {
    obj[key] = value;
  }

  function parseScalar(raw) {
    if (raw === undefined) return "";
    let v = raw.trim();
    if (v === "" ) return "";
    if (v === "true") return true;
    if (v === "false") return false;
    if (/^-?\d+$/.test(v)) return parseInt(v, 10);
    if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      return v.slice(1, -1);
    }
    return v;
  }

  let i = 0;
  const arrayStack = [];

  // On utilise une approche récursive simplifiée basée sur l'indentation.
  function parseBlock(startIdx, minIndent) {
    const result = {};
    let idx = startIdx;
    let currentListKey = null;
    let list = null;

    while (idx < lines.length) {
      const rawLine = lines[idx];
      if (rawLine.trim() === "" || rawLine.trim().startsWith("#")) {
        idx++;
        continue;
      }
      const indent = rawLine.match(/^(\s*)/)[1].length;
      if (indent < minIndent) break;

      const trimmed = rawLine.trim();

      if (trimmed.startsWith("- ")) {
        // Élément de liste
        if (!list) {
          list = [];
        }
        const rest = trimmed.slice(2);
        if (rest.includes(":")) {
          // Liste d'objets — on reconstruit un bloc à partir de cette ligne
          const objIndent = indent + 2;
          const fakeLines = [" ".repeat(objIndent) + rest];
          let j = idx + 1;
          while (j < lines.length) {
            const li = lines[j];
            if (li.trim() === "") {
              j++;
              continue;
            }
            const lIndent = li.match(/^(\s*)/)[1].length;
            if (lIndent >= objIndent && !li.trim().startsWith("- ")) {
              fakeLines.push(li);
              j++;
            } else {
              break;
            }
          }
          const subParsed = parseBlock(0, objIndent, fakeLines);
          list.push(subParsed.result);
          idx = j;
          continue;
        } else {
          list.push(parseScalar(rest));
          idx++;
          continue;
        }
      }

      const colonIdx = trimmed.indexOf(":");
      if (colonIdx === -1) {
        idx++;
        continue;
      }
      const key = trimmed.slice(0, colonIdx).trim();
      const valueRaw = trimmed.slice(colonIdx + 1).trim();

      if (valueRaw === "") {
        // Bloc imbriqué (objet ou liste) sur les lignes suivantes
        const nested = parseBlock(idx + 1, indent + 1);
        result[key] = nested.result && Object.keys(nested.result).length
          ? nested.result
          : nested.list || [];
        idx = nested.nextIdx;
      } else {
        result[key] = parseScalar(valueRaw);
        idx++;
      }
    }

    return { result: list || result, list, nextIdx: idx };
  }

  function parseBlockWithLines(startIdx, minIndent, customLines) {
    const useLines = customLines || lines;
    // Ré-implémentation simplifiée réutilisant parseBlock sur les vraies lignes
    return parseBlock(startIdx, minIndent);
  }

  const parsed = parseBlock(0, 0);
  return parsed.result;
}

function parseYamlFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  if (yaml) {
    return yaml.load(raw) || {};
  }
  return simpleYamlParse(raw) || {};
}

function readCollection(folderName) {
  const dirPath = path.join(CONTENT_DIR, folderName);
  ensureDir(dirPath);
  const files = fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));

  const items = files.map((file) => {
    const data = parseYamlFile(path.join(dirPath, file));
    if (!data.slug) {
      const base = data.title || data.name || data.client || file.replace(/\.ya?ml$/, "");
      data.slug = slugify(base);
    }
    return data;
  });

  items.sort((a, b) => {
    const orderA = typeof a.order === "number" ? a.order : 9999;
    const orderB = typeof b.order === "number" ? b.order : 9999;
    if (orderA !== orderB) return orderA - orderB;
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  return items;
}

function readSettingsFile(fileName, defaults) {
  const filePath = path.join(CONTENT_DIR, "settings", fileName);
  ensureDir(path.join(CONTENT_DIR, "settings"));
  if (!fs.existsSync(filePath)) {
    return defaults || {};
  }
  const data = parseYamlFile(filePath);
  return Object.assign({}, defaults || {}, data);
}

// ---------------------------------------------------------------
// Lecture de toutes les collections
// ---------------------------------------------------------------

console.log("→ Lecture du contenu depuis /content ...");

const projects = readCollection("projets");
const projectCategories = readCollection("categories-projets");
const contents = readCollection("contenus");
const gallery = readCollection("galerie");
const services = readCollection("services");
const reviews = readCollection("avis");
const faq = readCollection("faq");

const defaultSiteSettings = {
  site_name: "La Malice",
  slogan: "Contenu, sites web & communication pour les projets qui veulent se montrer autrement.",
  email: "contact@lamalice.ch",
  instagram_url: "https://www.instagram.com/lamalice.ch/",
  success_message:
    "Merci, ton message est bien arrivé. Je te réponds bientôt avec toute la malice nécessaire.",
};

const settings = readSettingsFile("site.yml", defaultSiteSettings);
const about = readSettingsFile("about.yml", {});

// Filtrer les catégories visibles pour les filtres, mais garder toutes
// les catégories pour la résolution des noms.
projectCategories.forEach((cat) => {
  if (!cat.slug) cat.slug = slugify(cat.name);
});

// ---------------------------------------------------------------
// Génération du fichier JS final
// ---------------------------------------------------------------

const banner = `/**
 * ⚠️ FICHIER GÉNÉRÉ AUTOMATIQUEMENT — NE PAS MODIFIER À LA MAIN.
 * Généré par build.js à partir des fichiers YAML dans /content.
 * Pour mettre à jour ce fichier : modifie le contenu via l'admin
 * Decap CMS (/admin) ou les fichiers YAML, puis relance :
 *   node build.js
 * Dernière génération : ${new Date().toISOString()}
 */
`;

const output = `${banner}
window.LA_MALICE_PROJECTS = ${JSON.stringify(projects, null, 2)};

window.LA_MALICE_PROJECT_CATEGORIES = ${JSON.stringify(projectCategories, null, 2)};

window.LA_MALICE_CONTENTS = ${JSON.stringify(contents, null, 2)};

window.LA_MALICE_GALLERY = ${JSON.stringify(gallery, null, 2)};

window.LA_MALICE_SERVICES = ${JSON.stringify(services, null, 2)};

window.LA_MALICE_REVIEWS = ${JSON.stringify(reviews, null, 2)};

window.LA_MALICE_FAQ = ${JSON.stringify(faq, null, 2)};

window.LA_MALICE_SETTINGS = ${JSON.stringify(settings, null, 2)};

window.LA_MALICE_ABOUT = ${JSON.stringify(about, null, 2)};
`;

ensureDir(path.join(__dirname, "assets", "js"));
fs.writeFileSync(OUTPUT_FILE, output, "utf8");

console.log(`✓ ${projects.length} projet(s)`);
console.log(`✓ ${projectCategories.length} catégorie(s) de projet`);
console.log(`✓ ${contents.length} contenu(s) créé(s)`);
console.log(`✓ ${gallery.length} élément(s) de galerie`);
console.log(`✓ ${services.length} service(s)`);
console.log(`✓ ${reviews.length} avis`);
console.log(`✓ ${faq.length} question(s) FAQ`);
console.log("✓ Fichier généré : assets/js/la-malice-data.js");
