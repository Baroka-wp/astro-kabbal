import { StyleSheet } from '@react-pdf/renderer';

/** Correspond aux familles enregistrées dans ./registerFonts.js */
export const FAMILY_BODY = 'Cormorant Garamond';
export const FAMILY_DISPLAY = 'Cinzel';

/**
 * Palette sobre : lecture « livre », pas d'encarts colorés (la page de garde garde son fond dédié).
 */
export const COLORS = {
  bg: '#ffffff',
  text: '#1c1917',
  textMuted: '#57534e',
  rule: '#d6d3d1',
  ruleStrong: '#a8a29e',
  display: '#292524',
  cover: '#1a0f2e',
  coverAccent: '#fbbf24',
};

export const styles = StyleSheet.create({
  page: {
    padding: '56 56 64 56',
    fontFamily: FAMILY_BODY,
    fontSize: 11,
    color: COLORS.text,
    lineHeight: 1.62,
    backgroundColor: COLORS.bg,
  },

  pageHeader: {
    position: 'absolute',
    top: 28,
    left: 56,
    right: 56,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.rule,
    fontSize: 7.5,
    fontFamily: FAMILY_DISPLAY,
    fontWeight: 400,
    color: COLORS.textMuted,
    letterSpacing: 2,
  },

  pageNumber: {
    position: 'absolute',
    bottom: 28,
    left: 56,
    right: 56,
    textAlign: 'center',
    fontSize: 8,
    fontFamily: FAMILY_BODY,
    color: COLORS.textMuted,
  },

  // ——— Page de garde (thème sombre inchangé dans l’esprit, polices unifiées) ———
  coverPage: {
    backgroundColor: COLORS.cover,
    color: '#fef3c7',
    padding: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    fontFamily: FAMILY_BODY,
  },

  coverTop: {
    fontSize: 8.5,
    letterSpacing: 4,
    fontFamily: FAMILY_DISPLAY,
    fontWeight: 600,
    color: COLORS.coverAccent,
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  coverCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },

  coverTitle: {
    fontSize: 36,
    fontFamily: FAMILY_DISPLAY,
    fontWeight: 700,
    color: '#fef3c7',
    textAlign: 'center',
    letterSpacing: 1,
  },

  coverSubtitle: {
    fontSize: 13.5,
    color: '#fbbf24',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: FAMILY_BODY,
    fontWeight: 400,
    letterSpacing: 1.5,
    marginTop: -2,
  },

  coverDivider: {
    width: 72,
    height: 0.5,
    backgroundColor: COLORS.coverAccent,
    marginVertical: 10,
  },

  coverProfileBox: {
    marginTop: 28,
    border: `0.5 solid ${COLORS.coverAccent}`,
    borderRadius: 2,
    padding: '18 32',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 280,
  },

  coverProfileRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10.5,
    color: '#fef3c7',
    fontFamily: FAMILY_BODY,
  },

  coverProfileLabel: {
    color: '#d4af37',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontSize: 7.5,
    fontFamily: FAMILY_DISPLAY,
    fontWeight: 600,
  },

  coverFooter: {
    fontSize: 7.5,
    color: '#d4af37',
    textAlign: 'center',
    letterSpacing: 2,
    fontFamily: FAMILY_DISPLAY,
  },

  // ——— Titres de chapitre (lecture verticale) ———
  partLabel: {
    fontSize: 7.5,
    fontFamily: FAMILY_DISPLAY,
    fontWeight: 600,
    letterSpacing: 3,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  h1: {
    fontSize: 20,
    fontFamily: FAMILY_DISPLAY,
    fontWeight: 600,
    color: COLORS.display,
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  h2: {
    fontSize: 13.5,
    fontFamily: FAMILY_DISPLAY,
    fontWeight: 600,
    color: COLORS.display,
    marginTop: 18,
    marginBottom: 8,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.rule,
  },

  h3: {
    fontSize: 11,
    fontFamily: FAMILY_DISPLAY,
    fontWeight: 600,
    color: COLORS.display,
    marginTop: 16,
    marginBottom: 6,
    letterSpacing: 0.4,
  },

  intro: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: 14,
    lineHeight: 1.65,
  },

  paragraph: {
    fontSize: 11,
    color: COLORS.text,
    marginBottom: 7,
    lineHeight: 1.62,
  },

  leadParagraph: {
    fontSize: 11.2,
    color: COLORS.text,
    marginBottom: 10,
    lineHeight: 1.68,
  },

  bold: {
    fontFamily: FAMILY_BODY,
    fontWeight: 700,
  },

  /** Titres de sous-sections dans le fil du texte (pas d’encart) */
  runInLabel: {
    fontFamily: FAMILY_DISPLAY,
    fontSize: 9.5,
    fontWeight: 600,
    letterSpacing: 0.6,
    color: COLORS.textMuted,
    marginTop: 12,
    marginBottom: 4,
  },

  italic: {
    fontStyle: 'italic',
  },

  // Blocs discrets (bordure fine, pas de fond)
  textBlock: {
    marginBottom: 8,
    paddingLeft: 2,
  },

  noteBlock: {
    marginTop: 8,
    marginBottom: 10,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.ruleStrong,
  },

  angelBlock: {
    marginTop: 8,
    marginBottom: 8,
    paddingTop: 6,
    paddingBottom: 4,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.rule,
  },

  /** Encadré minimal pour citations / messages (fond blanc) */
  quoteBlock: {
    marginTop: 6,
    marginBottom: 10,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: COLORS.rule,
  },

  table: {
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
    borderColor: COLORS.rule,
    marginTop: 6,
    marginBottom: 14,
  },

  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: COLORS.rule,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },

  tableHead: {
    backgroundColor: '#fafaf9',
    fontFamily: FAMILY_DISPLAY,
    fontSize: 8.5,
    fontWeight: 600,
    color: COLORS.textMuted,
    letterSpacing: 0.4,
  },

  tableCell: {
    fontSize: 10,
    color: COLORS.text,
    minWidth: 0,
  },

  imageBox: {
    borderWidth: 0.5,
    borderColor: COLORS.rule,
    padding: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    marginVertical: 8,
  },

  imageCaption: {
    fontSize: 8.5,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },

  hairline: {
    borderTopWidth: 0.5,
    borderTopColor: COLORS.rule,
    marginVertical: 14,
  },

  /** Ancien « eyebrow » : garde l’esprit, police display */
  eyebrow: {
    fontSize: 7.5,
    letterSpacing: 3,
    color: COLORS.textMuted,
    fontFamily: FAMILY_DISPLAY,
    fontWeight: 600,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  /** Aspect : simple filet, pas de fond ocre */
  aspectBlock: {
    marginTop: 10,
    marginBottom: 6,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.display,
  },

  smallMuted: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    lineHeight: 1.5,
  },

  rowStats: {
    marginBottom: 4,
  },
});
