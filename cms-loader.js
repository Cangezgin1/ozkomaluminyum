// ÖZKOM ALÜMİNYUM — CMS content loader
// Reads JSON from /content/*.json and injects text into elements
// marked with data-cms="path.to.field" attributes.
// Falls back silently to the static HTML text if a key is missing
// or the JSON can't be fetched (e.g. opened via file://).

(function () {
  const PAGE = document.body.getAttribute('data-cms-page');
  if (!PAGE) return;

  const SETTINGS_URL = 'content/settings.json';
  const PAGE_URL = `content/${PAGE}.json`;

  function get(obj, path) {
    return path.split('.').reduce((acc, key) => {
      if (acc == null) return undefined;
      const m = key.match(/^(.+)\[(\d+)\]$/);
      if (m) {
        const arr = acc[m[1]];
        return Array.isArray(arr) ? arr[parseInt(m[2], 10)] : undefined;
      }
      return acc[key];
    }, obj);
  }

  function applyData(root, data) {
    root.querySelectorAll('[data-cms]').forEach((el) => {
      const key = el.getAttribute('data-cms');
      const val = get(data, key);
      if (val === undefined || val === null) return;
      if (el.hasAttribute('data-cms-attr')) {
        el.setAttribute(el.getAttribute('data-cms-attr'), val);
      } else {
        el.textContent = val;
      }
    });

    // Repeatable lists: containers marked data-cms-list="key" get their
    // children re-rendered from a template marked data-cms-item inside them.
    root.querySelectorAll('[data-cms-list]').forEach((container) => {
      const key = container.getAttribute('data-cms-list');
      const items = get(data, key);
      if (!Array.isArray(items)) return;
      const template = container.querySelector('[data-cms-item]');
      if (!template) return;
      const frag = document.createDocumentFragment();
      items.forEach((item) => {
        const node = template.cloneNode(true);
        node.removeAttribute('data-cms-item');
        const fieldTargets = node.hasAttribute('data-cms-field')
          ? [node, ...node.querySelectorAll('[data-cms-field]')]
          : [...node.querySelectorAll('[data-cms-field]')];
        fieldTargets.forEach((fieldEl) => {
          const fieldKey = fieldEl.getAttribute('data-cms-field');
          const fieldVal = (typeof item === 'string' || fieldKey === 'self')
            ? item
            : get(item, fieldKey);
          if (fieldVal !== undefined) fieldEl.textContent = fieldVal;
        });
        frag.appendChild(node);
      });
      container.innerHTML = '';
      container.appendChild(frag);
    });
  }

  function applySettings(data) {
    document.querySelectorAll('[data-cms-settings]').forEach((el) => {
      const key = el.getAttribute('data-cms-settings');
      const val = get(data, key);
      if (val === undefined || val === null || val === '') return;
      if (el.hasAttribute('data-cms-attr')) {
        el.setAttribute(el.getAttribute('data-cms-attr'), val);
      } else {
        el.textContent = val;
      }
    });
  }

  async function loadJSON(url) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async function init() {
    const [settings, pageData] = await Promise.all([
      loadJSON(SETTINGS_URL),
      loadJSON(PAGE_URL),
    ]);
    if (settings) applySettings(settings);
    if (pageData) applyData(document, pageData);
    document.dispatchEvent(new CustomEvent('cms:ready'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
