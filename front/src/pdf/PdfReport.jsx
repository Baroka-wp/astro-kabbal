import './registerFonts';
import React from 'react';
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { styles, COLORS } from './pdfStyles';
import PdfMarkdown from './PdfMarkdown';
import {
  getSephirahBlockedMeaning,
  getRichSephirahData,
  getRichAspectInterpretation,
  getAspectInterpretation,
  getPlanetMeaning,
  getAspectPretty,
  getAspectSeverity,
  getAspectNature,
} from '../lib/kabbalisticInterpreter';
import {
  getAngelRemedeEntry,
  getRegleGeneraleAngeRemede,
  getSephirahAngelBlocage,
} from '../lib/angelRemedes';

const SIGN_LABELS = {
  Ari: 'Bélier',
  Tau: 'Taureau',
  Gem: 'Gémeaux',
  Can: 'Cancer',
  Leo: 'Lion',
  Vir: 'Vierge',
  Lib: 'Balance',
  Sco: 'Scorpion',
  Sag: 'Sagittaire',
  Cap: 'Capricorne',
  Aqu: 'Verseau',
  Pis: 'Poissons',
};

const DIGNITY_LABELS = {
  rulership: 'Domicile',
  exaltation: 'Exaltation',
  detriment: 'Exil',
  fall: 'Chute',
  neutral: 'Neutre',
};

const ASPECT_GLYPHS = {
  square: 'Carre',
  opposition: 'Opposition',
  quincunx: 'Quinconce',
  inconjunct: 'Quinconce',
};

const LEVEL_LABELS = {
  faible: 'Faible',
  modere: 'Modere',
  eleve: 'Eleve',
};

const formatDate = (date = new Date()) => {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const stripCitations = (text) => {
  if (!text) return '';
  return String(text).replace(/\[citation:[^\]]+\]/g, '').trim();
};

const pickDirectional = (value, direction) => {
  if (!value) return '';
  if (typeof value === 'string') return stripCitations(value);
  if (typeof value === 'object') {
    return stripCitations(value[direction] || value.descending || value.ascending || '');
  }
  return '';
};

const AngelRemedePdf = ({ entry }) => {
  const ar = entry?.ange_remede;
  if (!ar) return null;
  return (
    <View style={styles.angelBlock}>
      <Text style={styles.runInLabel}>Ange remède (72 noms / Shem ha-Mephorash)</Text>
      {entry?.position_degre_associe ? (
        <Text style={styles.smallMuted}>{entry.position_degre_associe}</Text>
      ) : null}
      <Text style={styles.paragraph}>
        <Text style={styles.bold}>Nom : </Text>
        {ar.nom}
      </Text>
      <Text style={styles.paragraph}>
        <Text style={styles.bold}>Degrés (tranche 5°) : </Text>
        {ar.degres}
      </Text>
      <Text style={styles.paragraph}>
        <Text style={styles.bold}>Sentier / porte : </Text>
        {ar.sentier}
      </Text>
      <Text style={styles.paragraph}>
        <Text style={styles.bold}>Psaume : </Text>
        {ar.psaume}
      </Text>
      <Text style={styles.paragraph}>
        <Text style={styles.bold}>Rituel : </Text>
        {ar.rituel}
      </Text>
    </View>
  );
};

// =========================
// COVER
// =========================
const CoverPage = ({ profile, generatedAt }) => (
  <Page size="A4" style={styles.coverPage}>
    <Text style={styles.coverTop}>22 Sentiers · Lecture Astro-Kabbalistique</Text>

    <View style={styles.coverCenter}>
      <Text style={styles.coverTitle}>L'Arbre de Vie</Text>
      <Text style={styles.coverSubtitle}>
        Carte natale, Sephiroth et chemins de libération
      </Text>
      <View style={styles.coverDivider} />

      <View style={styles.coverProfileBox}>
        <View style={styles.coverProfileRow}>
          <Text style={styles.coverProfileLabel}>Date de naissance</Text>
          <Text>{profile?.birth_date || '—'}</Text>
        </View>
        <View style={styles.coverProfileRow}>
          <Text style={styles.coverProfileLabel}>Heure</Text>
          <Text>{profile?.birth_time || '—'}</Text>
        </View>
        <View style={styles.coverProfileRow}>
          <Text style={styles.coverProfileLabel}>Lieu</Text>
          <Text>
            {profile?.city || '—'}
            {profile?.country ? `, ${profile.country}` : ''}
          </Text>
        </View>
      </View>
    </View>

    <Text style={styles.coverFooter}>Généré le {formatDate(generatedAt)}</Text>
    <Text
      style={styles.coverPageNumber}
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      fixed
    />
  </Page>
);

// =========================
// REUSABLE PAGE WRAPPER
// =========================
const ReportPage = ({ children, profile }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.pageHeader} fixed>
      <Text>22 SENTIERS</Text>
      <Text>{profile?.birth_date || ''}</Text>
    </View>
    {children}
    <Text
      style={styles.pageNumber}
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      fixed
    />
  </Page>
);

const TocPage = ({ profile, entries }) => (
  <ReportPage profile={profile}>
    <Text style={styles.partLabel}>Table des matières</Text>
    <Text style={styles.h1}>Sommaire</Text>
    <View style={styles.tocList}>
      {entries.map((entry) => (
        <View key={entry.id} style={styles.tocRow}>
          <Text style={styles.tocLabel}>{entry.label}</Text>
          <Text style={styles.tocPage}>{entry.page}</Text>
        </View>
      ))}
    </View>
  </ReportPage>
);

// =========================
// SYNTHESIS
// =========================
const SynthesisPage = ({ analysis, profile }) => {
  const sephiroth = analysis?.sephiroth_scores || [];
  const planets = analysis?.planets || [];
  const blocked = sephiroth.filter(
    (s) => s.has_hard_aspects || s.weak_dignity || ['modere', 'eleve'].includes(s.level)
  );
  const topPlanets = [...planets].sort((a, b) => (b.blocked_score || 0) - (a.blocked_score || 0)).slice(0, 3);

  const nFaible = sephiroth.filter((s) => s.level === 'faible').length;
  const nModere = sephiroth.filter((s) => s.level === 'modere').length;
  const nEleve = sephiroth.filter((s) => s.level === 'eleve').length;

  return (
    <ReportPage profile={profile}>
      <Text style={styles.partLabel}>I · Ouverture et tensions</Text>
      <Text style={styles.h1}>Aperçu Astro-Kabbalistique</Text>
      <Text style={styles.intro}>
        Cette synthèse projette votre carte natale sur les dix Sephiroth de l'Arbre de Vie. Chaque
        sphère est associée à une planète, dont la position et les aspects révèlent les zones
        d'ouverture, de tension ou de blocage à travailler.
      </Text>

      <Text style={styles.leadParagraph}>
        Parmi les dix sphères, {nFaible} se présentent avec une charge relativement légère, {nModere} avec
        une tension intermédiaire, et {nEleve} avec un degré de friction plus marqué — autant
        d’indices pour orienter l’écoute et le travail intérieur, sans hiérarchie de valeur, mais
        selon l’intensité du défi ressenti.
      </Text>

      <Text style={styles.h3}>Méthode des 72 anges (Shem ha-Mephorash)</Text>
      <Text style={styles.paragraph}>{getRegleGeneraleAngeRemede()}</Text>

      <Text style={styles.h2} minPresenceAhead={120}>
        État des Sephiroth
      </Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHead]}>
          <Text style={[styles.tableCell, { flex: 0.4, fontWeight: 600 }]}>#</Text>
          <Text style={[styles.tableCell, { flex: 1.4, fontWeight: 600 }]}>Sephirah</Text>
          <Text style={[styles.tableCell, { flex: 1.2, fontWeight: 600 }]}>Planète</Text>
          <Text style={[styles.tableCell, { flex: 0.7, fontWeight: 600 }]}>Score</Text>
          <Text style={[styles.tableCell, { flex: 1, fontWeight: 600 }]}>Niveau</Text>
        </View>
        {sephiroth.map((s) => (
          <View key={s.sephirah_id} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 0.4 }]}>{s.sephirah_id}</Text>
            <Text style={[styles.tableCell, { flex: 1.4 }]}>{s.sephirah_name}</Text>
            <View style={{ flex: 1.2, minWidth: 0, paddingRight: 4 }}>
              {s.planet_symbol ? (
                <Text
                  style={[styles.tableCell, { fontSize: 11, marginBottom: 1, lineHeight: 1.4 }]}
                >
                  <Text style={styles.symbolInline}>{s.planet_symbol}</Text>
                </Text>
              ) : null}
              <Text style={[styles.tableCell, { lineHeight: 1.45 }]}>
                {s.primary_planet}
                {s.secondary_planet ? ` / ${s.secondary_planet}` : ''}
              </Text>
            </View>
            <Text style={[styles.tableCell, { flex: 0.7 }]}>{s.score}</Text>
            <Text style={[styles.tableCell, { flex: 1, fontWeight: 600 }]}>
              {LEVEL_LABELS[s.level] || s.level}
            </Text>
          </View>
        ))}
      </View>

      {topPlanets.length > 0 && (
        <>
          <Text style={styles.h2} minPresenceAhead={90}>
            Planètes les plus chargées
          </Text>
          {topPlanets.map((planet) => (
            <View key={planet.name} style={styles.textBlock}>
              <Text style={styles.paragraph}>
                <Text style={styles.bold}>{planet.name}</Text>
                <Text> — indice de charge {planet.blocked_score}.</Text>
              </Text>
              <Text style={styles.smallMuted}>
                {SIGN_LABELS[planet.sign] || planet.sign || '—'} · Maison {planet.house || '—'} ·{' '}
                {DIGNITY_LABELS[planet.dignity_status] || 'Neutre'}
                {planet.hard_aspects?.length > 0
                  ? ` · Aspects difficiles : ${planet.hard_aspects.join(', ')}`
                  : ''}
              </Text>
            </View>
          ))}
        </>
      )}

      {blocked.length === 0 && (
        <View style={styles.noteBlock}>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Remarque.</Text> Aucune sphère ne ressort comme « dominée » par les
            mêmes critères de tension que d’autres. Votre Arbre se lit plutôt comme un ensemble fluide :
            usez de cette lecture pour ancrer ce qui est déjà ouvert, et peaufiner l’équilibre.
          </Text>
        </View>
      )}
    </ReportPage>
  );
};

// =========================
// IMAGE PAGES
// =========================
const ChartPage = ({ chartImage, profile }) => (
  <ReportPage profile={profile}>
    <Text style={styles.partLabel}>Figure</Text>
    <Text style={styles.h1}>Thème astral natal</Text>
    <Text style={styles.intro}>
      Représentation des planètes, signes et maisons telles qu'elles étaient configurées au moment
      et au lieu exacts de votre naissance.
    </Text>
    {chartImage ? (
      <View style={styles.imageBox}>
        <Image src={chartImage} style={{ width: '100%', maxHeight: 620, objectFit: 'contain' }} />
        <Text style={styles.imageCaption}>Thème natal généré par Kerykeion</Text>
      </View>
    ) : (
      <Text style={[styles.smallMuted, { marginTop: 6 }]}>
        Le thème astral n&apos;a pas pu être inclus dans le fichier (emplacement vide à compléter par une
        capture ultérieure).
      </Text>
    )}
  </ReportPage>
);

const TreePage = ({ treeImage, profile }) => (
  <ReportPage profile={profile}>
    <Text style={styles.partLabel}>Schéma</Text>
    <Text style={styles.h1}>Projection sur l&apos;Arbre de Vie</Text>
    <Text style={styles.intro}>
      Vos planètes natales placées sur les dix Sephiroth. Les flux dorés représentent les aspects
      difficiles (carrés, oppositions, quinconces) qui révèlent les nœuds énergétiques à travailler.
    </Text>
    {treeImage ? (
      <View style={styles.imageBox}>
        <Image src={treeImage} style={{ width: '100%', maxHeight: 620, objectFit: 'contain' }} />
        <Text style={styles.imageCaption}>
          Sphères colorées selon leur niveau de blocage · Lignes courbes : aspects difficiles
        </Text>
      </View>
    ) : (
      <Text style={[styles.smallMuted, { marginTop: 6 }]}>
        L&apos;illustration de l&apos;Arbre de Vie n&apos;a pas pu être exportée ici.
      </Text>
    )}
  </ReportPage>
);

// =========================
// SEPHIRAH DETAIL
// =========================
const SephirahPage = ({ sephirah, score, planet, paths, profile }) => {
  const richData = getRichSephirahData(sephirah.name);
  const blockedMeaning = getSephirahBlockedMeaning(sephirah.name);
  const angelSphereBlocage = getSephirahAngelBlocage(sephirah.name);
  const isBlocked =
    score?.has_hard_aspects || score?.weak_dignity || ['modere', 'eleve'].includes(score?.level);
  const expDesc = stripCitations(sephirah?.direction_experience?.descending || '');
  const expAsc = stripCitations(sephirah?.direction_experience?.ascending || '');

  const meditationDesc = stripCitations(pickDirectional(sephirah.meditation, 'descending') || '');
  const meditationAsc = stripCitations(pickDirectional(sephirah.meditation, 'ascending') || '');
  const messageDesc = stripCitations(pickDirectional(sephirah?.angel_message, 'descending') || '');
  const messageAsc = stripCitations(pickDirectional(sephirah?.angel_message, 'ascending') || '');
  const integrationDesc = stripCitations(pickDirectional(sephirah?.integration, 'descending') || '');
  const integrationAsc = stripCitations(pickDirectional(sephirah?.integration, 'ascending') || '');
  const qCorrDesc = stripCitations(
    pickDirectional(sephirah?.qliphoth_work?.corrective_meditation, 'descending') || ''
  );
  const qCorrAsc = stripCitations(
    pickDirectional(sephirah?.qliphoth_work?.corrective_meditation, 'ascending') || ''
  );
  const qRitDesc = stripCitations(pickDirectional(sephirah?.qliphoth_work?.ritual_action, 'descending') || '');
  const qRitAsc = stripCitations(pickDirectional(sephirah?.qliphoth_work?.ritual_action, 'ascending') || '');

  // Sentiers connectés
  const connectedPaths = (paths || []).filter(
    (p) => p?.connections?.from === sephirah.name || p?.connections?.to === sephirah.name
  );

  return (
    <ReportPage profile={profile}>
      <Text style={styles.eyebrow}>
        Chapitre · Sephirah {sephirah.id} · pilier {sephirah.pillar}
      </Text>
      <Text style={styles.h1}>
        {sephirah.name} — {sephirah.meaning}
      </Text>

      {score && (
        <View style={styles.textBlock}>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Planète principale : </Text>
            {score.planet_symbol ? <Text style={styles.symbolInline}>{score.planet_symbol}</Text> : ''}
            {score.planet_symbol ? ' ' : ''}
            {score.primary_planet}
            {score.secondary_planet ? ` / ${score.secondary_planet}` : ''}
            {'. '}
            <Text style={styles.bold}>Indice de charge : </Text>
            {score.score} / 100
            {'. '}
            <Text style={styles.bold}>Lecture de tension : </Text>
            {LEVEL_LABELS[score.level] || score.level}.
          </Text>
        </View>
      )}

      {/* Double mouvement (même contenu qu'à l'écran, onglet Direction) */}
      {(expDesc || expAsc) && (
        <View>
          <Text style={styles.h3} minPresenceAhead={72}>
            Descente & montée (expérience de la sphère)
          </Text>
          {!!expDesc && (
            <View>
              <Text style={styles.runInLabel}>Aller — descente (création)</Text>
              <Text style={styles.paragraph}>{expDesc}</Text>
            </View>
          )}
          {!!expAsc && (
            <View>
              <Text style={styles.runInLabel}>Retour — montée (retour à la source)</Text>
              <Text style={styles.paragraph}>{expAsc}</Text>
            </View>
          )}
        </View>
      )}

      {/* Signification kabbalistique */}
      {richData?.signification && (
        <View>
          <Text style={styles.h3}>Signification kabbalistique</Text>
          <PdfMarkdown source={richData.signification} />
        </View>
      )}

      {/* État planétaire */}
      {planet && (
        <View>
          <Text style={styles.h3}>État de la planète</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Signe : </Text>
            {SIGN_LABELS[planet.sign] || planet.sign || '—'}
            {'. '}
            <Text style={styles.bold}>Maison : </Text>
            {planet.house || '—'}
            {'. '}
            <Text style={styles.bold}>Dignité : </Text>
            {DIGNITY_LABELS[planet.dignity_status] || 'Neutre'}.
          </Text>
          {planet.factors?.aspect_hard?.active && (
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Aspects difficiles : </Text>
              {planet.factors.aspect_hard.detail}
            </Text>
          )}
          {planet.factors?.weak_dignity?.active && (
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Dignité : </Text>
              {planet.factors.weak_dignity.detail}
            </Text>
          )}
          {planet.factors?.difficult_house?.active && (
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Maison : </Text>
              {planet.factors.difficult_house.detail}
            </Text>
          )}
        </View>
      )}

      {/* Symptôme actuel si bloqué — interprétation générale + couche 72 anges */}
      {isBlocked && (blockedMeaning || angelSphereBlocage) && (
        <View style={styles.noteBlock}>
          <Text style={styles.runInLabel}>Lecture d&apos;un blocage sur cette sphère</Text>
          {blockedMeaning ? (
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Synthèse kabbalistique : </Text>
              {blockedMeaning}
            </Text>
          ) : null}
          {angelSphereBlocage ? (
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Lecture 72 anges (Shem ha-Mephorash) : </Text>
              {angelSphereBlocage}
            </Text>
          ) : null}
        </View>
      )}

      {/* Ange tutélaire */}
      {sephirah?.angel && (
        <View>
          <Text style={styles.h3}>Ange tutélaire</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>{sephirah.angel.name}</Text>
            {sephirah.angel.alternate_names?.length > 0
              ? ` — aussi : ${sephirah.angel.alternate_names.join(', ')}`
              : ''}
          </Text>
          <Text style={styles.paragraph}>{sephirah.angel.function}</Text>
        </View>
      )}

      {/* Méditation (aller / retour, comme dans l'interface) */}
      {(meditationDesc || meditationAsc) && (
        <View>
          <Text style={styles.h3}>Méditation guidée (aller / retour)</Text>
          {meditationDesc && (
            <View>
              <Text style={styles.runInLabel}>Aller (descente)</Text>
              <Text style={styles.paragraph}>{meditationDesc}</Text>
            </View>
          )}
          {meditationAsc && (meditationAsc !== meditationDesc || !meditationDesc) && (
            <View>
              <Text style={styles.runInLabel}>Retour (montée)</Text>
              <Text style={styles.paragraph}>{meditationAsc}</Text>
            </View>
          )}
        </View>
      )}

      {/* Message angélique */}
      {(messageDesc || messageAsc) && (
        <View>
          <Text style={styles.h3}>Message angélique (aller / retour)</Text>
          {messageDesc && (
            <View>
              <Text style={styles.runInLabel}>Aller (descente)</Text>
              <View style={styles.quoteBlock}>
                <Text style={[styles.paragraph, styles.italic, { marginBottom: 0 }]}>{messageDesc}</Text>
                <Text style={[styles.smallMuted, { marginTop: 8, textAlign: 'right' }]}>
                  — {sephirah?.angel?.name}
                </Text>
              </View>
            </View>
          )}
          {messageAsc && (messageAsc !== messageDesc || !messageDesc) && (
            <View>
              <Text style={styles.runInLabel}>Retour (montée)</Text>
              <View style={styles.quoteBlock}>
                <Text style={[styles.paragraph, styles.italic, { marginBottom: 0 }]}>{messageAsc}</Text>
                <Text style={[styles.smallMuted, { marginTop: 8, textAlign: 'right' }]}>
                  — {sephirah?.angel?.name}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Intégration */}
      {(integrationDesc || integrationAsc) && (
        <View>
          <Text style={styles.h3}>Intégration quotidienne (aller / retour)</Text>
          {integrationDesc && (
            <View>
              <Text style={styles.runInLabel}>Aller (descente)</Text>
              <Text style={styles.paragraph}>{integrationDesc}</Text>
            </View>
          )}
          {integrationAsc && (integrationAsc !== integrationDesc || !integrationDesc) && (
            <View>
              <Text style={styles.runInLabel}>Retour (montée)</Text>
              <Text style={styles.paragraph}>{integrationAsc}</Text>
            </View>
          )}
        </View>
      )}

      {/* Qliphoth */}
      {sephirah?.qliphoth && (
        <View>
          <Text style={styles.h3}>Travail d'ombre (Qliphoth)</Text>
          {sephirah.qliphoth.demon && (
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Démon : </Text>
              {sephirah.qliphoth.demon}
            </Text>
          )}
          {(sephirah.qliphoth.meaning || sephirah.qliphoth.meaing) && (
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Signification : </Text>
              {sephirah.qliphoth.meaning || sephirah.qliphoth.meaing}
            </Text>
          )}
          {sephirah.qliphoth.shadow && (
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Ombre : </Text>
              {stripCitations(sephirah.qliphoth.shadow)}
            </Text>
          )}
          {sephirah?.qliphoth?.function && (
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Fonction (ombre) : </Text>
              {stripCitations(sephirah.qliphoth.function)}
            </Text>
          )}
          {(qCorrDesc || qCorrAsc) && (
            <View>
              <Text style={styles.runInLabel}>Méditation corrective</Text>
              {qCorrDesc && (
                <View>
                  <Text style={styles.smallMuted}>Aller (descendant)</Text>
                  <Text style={styles.paragraph}>{qCorrDesc}</Text>
                </View>
              )}
              {qCorrAsc && qCorrAsc !== qCorrDesc && (
                <View>
                  <Text style={styles.smallMuted}>Retour (ascendant)</Text>
                  <Text style={styles.paragraph}>{qCorrAsc}</Text>
                </View>
              )}
            </View>
          )}
          {(qRitDesc || qRitAsc) && (
            <View>
              <Text style={styles.runInLabel}>Action rituelle</Text>
              {qRitDesc && (
                <View>
                  <Text style={styles.smallMuted}>Aller (descendant)</Text>
                  <Text style={styles.paragraph}>{qRitDesc}</Text>
                </View>
              )}
              {qRitAsc && qRitAsc !== qRitDesc && (
                <View>
                  <Text style={styles.smallMuted}>Retour (ascendant)</Text>
                  <Text style={styles.paragraph}>{qRitAsc}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Aspects sur cette planète */}
      {planet?.hard_aspect_links?.length > 0 && (
        <View>
          <Text style={styles.h3}>Aspects difficiles actifs</Text>
          {planet.hard_aspect_links.map((link, idx) => {
            const rich = getRichAspectInterpretation({
              sephirahName: sephirah.name,
              aspect: link.aspect,
              otherPlanet: link.target_planet,
            });
            const fallback = getAspectInterpretation({
              sephirahName: sephirah.name,
              aspect: link.aspect,
              otherPlanet: link.target_planet,
            });
            const planetMeaning = getPlanetMeaning(link.target_planet);
            const angelEntry = getAngelRemedeEntry({
              sephirahName: sephirah.name,
              aspect: link.aspect,
              otherPlanet: link.target_planet,
            });
            return (
              <View key={`asp-${idx}`} style={styles.aspectBlock}>
                <Text style={styles.paragraph}>
                  <Text style={styles.bold}>{ASPECT_GLYPHS[link.aspect] || link.aspect}</Text>
                  <Text> avec </Text>
                  <Text style={styles.bold}>{link.target_planet}</Text>
                  {planetMeaning ? (
                    <Text>
                      <Text> — </Text>
                      {planetMeaning}
                    </Text>
                  ) : null}
                </Text>
                {rich ? (
                  <View style={{ marginTop: 2 }}>
                    {rich.titre && (
                      <Text style={[styles.paragraph, styles.italic, { color: COLORS.textMuted }]}>
                        {rich.titre}
                      </Text>
                    )}
                    {rich.probleme && <PdfMarkdown source={`**Problème :** ${rich.probleme}`} />}
                    {rich.resultat_kabalistique && (
                      <PdfMarkdown source={`**Résultat :** ${rich.resultat_kabalistique}`} />
                    )}
                    {rich.symptomes && <PdfMarkdown source={`**Symptômes :** ${rich.symptomes}`} />}
                    {rich.pathologie && (
                      <PdfMarkdown source={`**Pathologie :** ${rich.pathologie}`} />
                    )}
                  </View>
                ) : (
                  <Text style={[styles.paragraph, { marginTop: 4 }]}>{fallback.text}</Text>
                )}
                <AngelRemedePdf entry={angelEntry} />
              </View>
            );
          })}
        </View>
      )}

      {/* Sentiers connectés */}
      {connectedPaths.length > 0 && (
        <View>
          <Text style={styles.h3} minPresenceAhead={64}>
            Sentiers connectés
          </Text>
          {connectedPaths.map((path) => (
            <Text key={path.id} style={styles.paragraph}>
              <Text style={styles.bold}>
                {path.letter?.transliteration}
                {' ('}
                <Text style={styles.hebrewInline}>{path.letter?.hebrew || ''}</Text>
                {')'}
              </Text>
              {' — '}
              {path.connections?.from}
              {' '}
              <Text style={styles.symbolInline}>→</Text>
              {' '}
              {path.connections?.to}
              {path.angel?.name ? ` — Ange ${path.angel.name}` : ''}
            </Text>
          ))}
        </View>
      )}
    </ReportPage>
  );
};

// =========================
// ASPECT DETAIL
// =========================
const AspectsPage = ({ aspectFlows, profile }) => {
  if (!aspectFlows || aspectFlows.length === 0) return null;

  return (
    <ReportPage profile={profile}>
      <Text style={styles.partLabel}>II · Lectures d&apos;aspects</Text>
      <Text style={styles.h1} minPresenceAhead={100}>
        Aspects difficiles
      </Text>
      <Text style={styles.intro}>
        Chaque aspect dur (carré, opposition, quinconce) suggère un flux de tension entre deux
        Sephiroth. Sous chaque intitulé, la lecture s&apos;enchaîne verticalement : intitulé du
        motif, ressenti, piste d&apos;intégration, comme dans un chapitre de chevet.
      </Text>

      {aspectFlows.map((flow, idx) => {
        const rich = getRichAspectInterpretation({
          sephirahName: flow.fromSephirahName,
          aspect: flow.aspect,
          otherPlanet: flow.toPlanet,
        });
        const fallback = getAspectInterpretation({
          sephirahName: flow.fromSephirahName,
          aspect: flow.aspect,
          otherPlanet: flow.toPlanet,
        });
        const severity = getAspectSeverity(flow.aspect);
        const nature = getAspectNature(flow.aspect);
        const angelEntry = getAngelRemedeEntry({
          sephirahName: flow.fromSephirahName,
          aspect: flow.aspect,
          otherPlanet: flow.toPlanet,
        });

        return (
          <View key={`flow-${idx}`} style={styles.aspectBlock}>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>{getAspectPretty(flow.aspect)}</Text>
              <Text>
                {' '}
                — {flow.fromSephirahName} ({flow.fromPlanet}) et {flow.toSephirahName} (
                {flow.toPlanet})
              </Text>
            </Text>
            <Text style={styles.smallMuted}>
              {nature ? `Nature : ${nature}. ` : ''}
              {severity ? `Sévérité : ${severity}.` : ''}
            </Text>

            {rich ? (
              <View style={{ marginTop: 4 }}>
                {rich.titre && (
                  <Text style={[styles.paragraph, styles.italic, { color: COLORS.textMuted }]}>
                    {rich.titre}
                  </Text>
                )}
                {rich.probleme && <PdfMarkdown source={`**Problème :** ${rich.probleme}`} />}
                {rich.resultat_kabalistique && (
                  <PdfMarkdown source={`**Résultat :** ${rich.resultat_kabalistique}`} />
                )}
                {rich.symptomes && <PdfMarkdown source={`**Symptômes :** ${rich.symptomes}`} />}
                {rich.pathologie && (
                  <PdfMarkdown source={`**Pathologie :** ${rich.pathologie}`} />
                )}
              </View>
            ) : (
              <Text style={[styles.paragraph, { marginTop: 6 }]}>{fallback.text}</Text>
            )}
            <AngelRemedePdf entry={angelEntry} />
          </View>
        );
      })}
    </ReportPage>
  );
};

// =========================
// MAIN DOCUMENT
// =========================
const PdfReport = ({
  analysis,
  sephirothData,
  pathsData,
  chartImage,
  treeImage,
  aspectFlows,
  generatedAt,
}) => {
  const profile = analysis?.profile || {};
  const sephiroth = sephirothData?.sephiroth || [];
  const sephirothScores = analysis?.sephiroth_scores || [];
  const planets = analysis?.planets || [];

  const scoreById = Object.fromEntries(sephirothScores.map((s) => [s.sephirah_id, s]));
  const planetByName = Object.fromEntries(planets.map((p) => [p.name, p]));

  // Trier : sphères bloquées d'abord (eleve, modere), puis le reste
  const sortedSephiroth = [...sephiroth].sort((a, b) => {
    const sa = scoreById[a.id]?.score || 0;
    const sb = scoreById[b.id]?.score || 0;
    return sb - sa;
  });

  const tocEntries = [];
  let currentPage = 3; // 1: couverture, 2: sommaire

  tocEntries.push({ id: 'synthesis', label: 'Aperçu Astro-Kabbalistique', page: currentPage++ });

  if (chartImage) {
    tocEntries.push({ id: 'chart', label: 'Thème astral natal', page: currentPage++ });
  }

  if (treeImage) {
    tocEntries.push({ id: 'tree', label: "Projection sur l'Arbre de Vie", page: currentPage++ });
  }

  if (aspectFlows?.length > 0) {
    tocEntries.push({ id: 'aspects', label: 'Aspects difficiles', page: currentPage++ });
  }

  sortedSephiroth.forEach((sephirah) => {
    tocEntries.push({
      id: `sephirah-${sephirah.id}`,
      label: `Sephirah ${sephirah.id} — ${sephirah.name}`,
      page: currentPage++,
    });
  });

  return (
    <Document
      author="22 Sentiers"
      title="Lecture Astro-Kabbalistique"
      subject="Carte natale projetée sur l'Arbre de Vie"
    >
      <CoverPage profile={profile} generatedAt={generatedAt} />
      <TocPage profile={profile} entries={tocEntries} />
      <SynthesisPage analysis={analysis} profile={profile} />
      {chartImage && <ChartPage chartImage={chartImage} profile={profile} />}
      {treeImage && <TreePage treeImage={treeImage} profile={profile} />}
      {aspectFlows?.length > 0 && (
        <AspectsPage aspectFlows={aspectFlows} profile={profile} />
      )}
      {sortedSephiroth.map((sephirah) => {
        const score = scoreById[sephirah.id];
        const planet = score ? planetByName[score.primary_planet] : null;
        return (
          <SephirahPage
            key={sephirah.id}
            sephirah={sephirah}
            score={score}
            planet={planet}
            paths={pathsData?.paths || []}
            profile={profile}
          />
        );
      })}
    </Document>
  );
};

export default PdfReport;
