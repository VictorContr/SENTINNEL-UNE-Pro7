/**
 * ══════════════════════════════════════════════════════════════════
 * markdown.js — Núcleo de renderizado de texto para SENTINNEL-UNE.
 * ══════════════════════════════════════════════════════════════════
 */

/**
 * Sanitiza entidades peligrosas para prevenir inyecciones XSS.
 * @param {string} texto_sm_vc 
 * @returns {string}
 */
export const escaparHTML_sm_vc = (texto_sm_vc) => {
  if (!texto_sm_vc) return '';
  const entidades_sm_vc = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return texto_sm_vc.replace(/[&<>"']/g, (char_sm_vc) => entidades_sm_vc[char_sm_vc]);
};

/**
 * Parsea sintaxis Markdown básica y emojis corporativos a HTML semántico.
 * @param {string} contenido_sm_vc 
 * @returns {string}
 */
export const renderMarkdown_sm_vc = (contenido_sm_vc) => {
  if (!contenido_sm_vc) return '';

  try {
    // 1. Saneamiento inicial
    let html_sm_vc = escaparHTML_sm_vc(contenido_sm_vc);

    // 2. Reemplazo de Emojis por Material Icons (Estándar Quasar)
    const mapaIcons_sm_vc = [
      { regex: /🏆/g, icon: 'emoji_events', color: 'text-warning' },
      { regex: /✅/g, icon: 'check_circle', color: 'text-positive' },
      { regex: /❌/g, icon: 'cancel',        color: 'text-negative' },
      { regex: /🔄/g, icon: 'sync',          color: 'text-info' },
      { regex: /🤖/g, icon: 'smart_toy',     color: 'text-sn-acento' },
      { regex: /📝/g, icon: 'warning',       color: 'text-warning' }
    ];

    mapaIcons_sm_vc.forEach((item_sm_vc) => {
      html_sm_vc = html_sm_vc.replace(
        item_sm_vc.regex,
        `<i class="q-icon material-icons ${item_sm_vc.color}" aria-hidden="true" role="presentation" style="font-size:1.1em;vertical-align:middle;">${item_sm_vc.icon}</i>`
      );
    });

    // 3. Sintaxis Markdown
    // Negritas
    html_sm_vc = html_sm_vc.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
    
    // Cursivas
    html_sm_vc = html_sm_vc.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

    // Enlaces seguros
    html_sm_vc = html_sm_vc.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-sn-acento" style="text-decoration:underline;font-weight:600;">$1</a>'
    );

    // Saltos de línea
    html_sm_vc = html_sm_vc.replace(/\n/g, '<br/>');

    return html_sm_vc;

  } catch (err_sm_vc) {
    console.error('[SENTINNEL] Error en renderMarkdown_sm_vc:', err_sm_vc);
    return escaparHTML_sm_vc(contenido_sm_vc);
  }
};
