/**
 * Polices embarquées (via @fontsource) pour un rendu PDF digne d'un « livre de la vie »,
 * en cohérence avec l'esthétique mystique (serif) du site.
 * Doit être importé avant tout rendu @react-pdf.
 */
import { Font } from '@react-pdf/renderer';

/* WOFF (pas WOFF2) : le moteur de polices du PDF côté navigateur gère plus fiabiliment le WOFF
 * qu’il n’analyse le WOFF2, ce qui évitait des RangeError: DataView sur setUint16. */
import cormorant400 from '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff?url';
import cormorant400Italic from '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff?url';
import cormorant600 from '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff?url';
import cormorant700 from '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-700-normal.woff?url';

import cinzel400 from '@fontsource/cinzel/files/cinzel-latin-400-normal.woff?url';
import cinzel600 from '@fontsource/cinzel/files/cinzel-latin-600-normal.woff?url';
import cinzel700 from '@fontsource/cinzel/files/cinzel-latin-700-normal.woff?url';
import notoSymbols400 from '@fontsource/noto-sans-symbols/files/noto-sans-symbols-symbols-400-normal.woff?url';

Font.register({
  family: 'Cormorant Garamond',
  fonts: [
    { src: cormorant400, fontWeight: 400, fontStyle: 'normal' },
    { src: cormorant400Italic, fontWeight: 400, fontStyle: 'italic' },
    { src: cormorant600, fontWeight: 600, fontStyle: 'normal' },
    { src: cormorant700, fontWeight: 700, fontStyle: 'normal' },
  ],
});

Font.register({
  family: 'Cinzel',
  fonts: [
    { src: cinzel400, fontWeight: 400, fontStyle: 'normal' },
    { src: cinzel600, fontWeight: 600, fontStyle: 'normal' },
    { src: cinzel700, fontWeight: 700, fontStyle: 'normal' },
  ],
});

Font.register({
  family: 'Noto Sans Symbols',
  fonts: [{ src: notoSymbols400, fontWeight: 400, fontStyle: 'normal' }],
});
