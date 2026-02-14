export type StructuredContentLocale = "en" | "es";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqBlock {
  heading: string;
  pairs: FaqItem[];
}

interface ProductHighlightBlock {
  heading: string;
  points: string[];
}

interface LanguageBlocks {
  faq: FaqBlock;
  productHighlight: ProductHighlightBlock;
}

const CONTENT_LIBRARY: Record<StructuredContentLocale, LanguageBlocks> = {
  en: {
    faq: {
      heading: "FAQ: Getting Started",
      pairs: [
        {
          question: "How do I start using the platform?",
          answer:
            "Log in, complete your profile, and follow the onboarding checklist on your dashboard.",
        },
        {
          question: "Is the platform available in multiple languages?",
          answer:
            "Yes, we support several languages. Use the language switcher in the top-right corner.",
        },
      ],
    },
    productHighlight: {
      heading: "Feature Highlight: Smart Multilingual SEO",
      points: [
        "Automatically generates localized meta titles and descriptions.",
        "Keeps content organized for each language and region.",
        "Helps you repurpose blog posts into emails and social snippets.",
      ],
    },
  },
  es: {
    faq: {
      heading: "Preguntas frecuentes: Primeros pasos",
      pairs: [
        {
          question: "¿Cómo empiezo a usar la plataforma?",
          answer:
            "Inicia sesión, completa tu perfil y sigue la lista de verificación de configuración en tu panel.",
        },
        {
          question: "¿La plataforma está disponible en varios idiomas?",
          answer:
            "Sí, ofrecemos varios idiomas. Usa el selector de idioma en la parte superior derecha.",
        },
      ],
    },
    productHighlight: {
      heading: "Destacado del día: SEO inteligente multilingüe",
      points: [
        "Genera automáticamente títulos y descripciones meta localizadas.",
        "Mantiene el contenido organizado para cada idioma y región.",
        "Te ayuda a reutilizar publicaciones en correos electrónicos y fragmentos sociales.",
      ],
    },
  },
};

function faqRowsHtml(faqItems: FaqItem[]) {
  return faqItems
    .map(
      ({ question, answer }) =>
        `<tr>
          <td style="padding: 0 0 14px;">
            <p style="margin: 0; color: #4A3728; font-weight: 700;">Q: ${question}</p>
            <p style="margin: 6px 0 0; color: #666;">A: ${answer}</p>
          </td>
        </tr>`
    )
    .join("");
}

function bulletPointsHtml(points: string[]) {
  return points
    .map(
      (point) =>
        `<li style="margin: 0 0 10px; color: #666; line-height: 1.6;">${point}</li>`
    )
    .join("");
}

export function renderStructuredContentSectionsHtml(locale: StructuredContentLocale): string {
  const blocks = CONTENT_LIBRARY[locale];

  const faqHeading = blocks.faq.heading;
  const faqPairs = faqRowsHtml(blocks.faq.pairs);
  const productHeading = blocks.productHighlight.heading;
  const productPoints = bulletPointsHtml(blocks.productHighlight.points);

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fff; border-radius: 10px; border: 1px solid #E7D9CC; margin-bottom: 24px; overflow: hidden;">
      <tr>
        <td style="padding: 24px; border-bottom: 1px solid #E7D9CC;">
          <h3 style="margin: 0 0 14px; color: #4A3728; font-size: 20px;">${faqHeading}</h3>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${faqPairs}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 24px; background-color: #FDF8F3;">
          <h3 style="margin: 0 0 14px; color: #4A3728; font-size: 20px;">${productHeading}</h3>
          <ul style="margin: 0 0 0 22px; padding: 0;">
            ${productPoints}
          </ul>
        </td>
      </tr>
    </table>
  `.trim();
}

export function getStructuredContentLocaleLabel(locale: StructuredContentLocale): string {
  return locale === "es" ? "Spanish" : "English";
}
