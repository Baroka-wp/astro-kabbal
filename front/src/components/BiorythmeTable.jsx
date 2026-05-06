import React, { useEffect, useMemo, useRef } from 'react';
import './BiorythmeTable.css';

const ANGELS = [
  'Vehuiah', 'Yeliel', 'Sitael', 'Elemiah', 'Mahasiah', 'Lelahel', 'Achaiah', 'Cahetel',
  'Haziel', 'Aladiah', 'Lauviah', 'Hahaiah', 'Iezalel', 'Mebahel', 'Hariel', 'Hakamiah',
  'Lauviah II', 'Caliel', 'Leuviah', 'Pahaliah', 'Nelchael', 'Yeiayel', 'Melahel', 'Haheuiah',
  'Nith-haiah', 'Haaiah', 'Yerathel', 'Seheiah', 'Reiyel', 'Omael', 'Lecabel', 'Vasariah',
  'Yehuiah', 'Lehahiah', 'Chavakiah', 'Menadel', 'Aniel', 'Haamiah', 'Rehael', 'Ieiazel',
  'Hahahel', 'Mikael', 'Veuliah', 'Yelahiah', 'Sehaliah', 'Ariel', 'Asaliah', 'Mihael',
  'Vehuel', 'Daniel', 'Hahasiah', 'Imamiah', 'Nanael', 'Nithael', 'Mebahiah', 'Poyel',
  'Nemamiah', 'Yeialel', 'Harahel', 'Mitzrael', 'Umabel', 'Iah-hel', 'Anauel', 'Mehiel',
  'Damabiah', 'Manakel', 'Eyael', 'Habuhiah', 'Rochel', 'Jabamiah', 'Haiaiel', 'Mumiah',
];

const RONDES = ['Feu', 'Eau', 'Air', 'Terre', 'Quintes'];

const SIGNS = [
  { glyph: '♈', name: 'Bélier', base: 0 },
  { glyph: '♉', name: 'Taureau', base: 30 },
  { glyph: '♊', name: 'Gémeaux', base: 60 },
  { glyph: '♋', name: 'Cancer', base: 90 },
  { glyph: '♌', name: 'Lion', base: 120 },
  { glyph: '♍', name: 'Vierge', base: 150 },
  { glyph: '♎', name: 'Balance', base: 180 },
  { glyph: '♏', name: 'Scorpion', base: 210 },
  { glyph: '♐', name: 'Sagittaire', base: 240 },
  { glyph: '♑', name: 'Capricorne', base: 270 },
  { glyph: '♒', name: 'Verseau', base: 300 },
  { glyph: '♓', name: 'Poissons', base: 330 },
];

const EXACT_POINTS = [
  { col72: 0, sephirah: 'Keter', aspect: 'Conjonction', symbol: '☌' },
  { col72: 6, sephirah: 'Hochmah', aspect: 'Semi-Sextile', symbol: '⌄' },
  { col72: 9, sephirah: 'Binah', aspect: 'Semi-Carré', symbol: '∠' },
  { col72: 12, sephirah: 'Hesed', aspect: 'Sextile', symbol: '✶' },
  { col72: 18, sephirah: 'Gueburah', aspect: 'Carré', symbol: '□' },
  { col72: 21, sephirah: 'Tiphereth', aspect: 'Cuadri-Trigone', symbol: '△▽' },
  { col72: 24, sephirah: 'Netzah', aspect: 'Trigone', symbol: '△' },
  { col72: 27, sephirah: 'Hod', aspect: 'Sesqui-Carré', symbol: '□∠' },
  { col72: 30, sephirah: 'Yesod', aspect: 'Quinconce', symbol: '⌶' },
  { col72: 35, sephirah: 'Malkuth', aspect: 'Opposition', symbol: '☍' },
  { col72: 41, sephirah: 'Yesod', aspect: 'Quinconce', symbol: '⌶' },
  { col72: 44, sephirah: 'Hod', aspect: 'Sesqui-Carré', symbol: '□∠' },
  { col72: 47, sephirah: 'Netzah', aspect: 'Trigone', symbol: '△' },
  { col72: 50, sephirah: 'Tiphereth', aspect: 'Cuadri-Trigone', symbol: '△▽' },
  { col72: 53, sephirah: 'Gueburah', aspect: 'Carré', symbol: '□' },
  { col72: 59, sephirah: 'Hesed', aspect: 'Sextile', symbol: '✶' },
  { col72: 62, sephirah: 'Binah', aspect: 'Semi-Carré', symbol: '∠' },
  { col72: 65, sephirah: 'Hochmah', aspect: 'Semi-Sextile', symbol: '⌄' },
  { col72: 71, sephirah: 'Keter', aspect: 'Conjonction', symbol: '☌' },
];

const EXACT_BY_COL72 = Object.fromEntries(EXACT_POINTS.map((item) => [item.col72, item]));

function getAspectPhase(col72) {
  const exact = EXACT_BY_COL72[col72];
  if (exact) {
    return {
      symbol: exact.symbol,
      label: exact.aspect,
      exact: true,
    };
  }

  const sorted = EXACT_POINTS.map((p) => p.col72).sort((a, b) => a - b);
  let prev = sorted[sorted.length - 1];
  let next = sorted[0];

  for (let idx = 0; idx < sorted.length; idx += 1) {
    if (sorted[idx] < col72) prev = sorted[idx];
    if (sorted[idx] > col72) {
      next = sorted[idx];
      break;
    }
  }

  const prevPoint = EXACT_BY_COL72[prev];
  const nextPoint = EXACT_BY_COL72[next];
  return {
    symbol: `${prevPoint.symbol}→${nextPoint.symbol}`,
    label: `Entre ${prevPoint.aspect} et ${nextPoint.aspect}`,
    exact: false,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function buildAnniversaryDate(year, monthIndex, day) {
  const safeDay = monthIndex === 1 ? Math.min(day, 28) : day;
  return new Date(year, monthIndex, safeDay);
}

function diffDays(a, b) {
  return Math.floor((a.getTime() - b.getTime()) / DAY_MS);
}

export default function BiorythmeTable({
  natalSignIdx,
  natalDegree,
  birthDate,
  transitAbsIdx,
  transitDate,
  onTransitDateChange,
}) {
  const tableWrapRef = useRef(null);
  const todayRowRef = useRef(null);

  if (!Number.isFinite(Number(natalSignIdx)) || !Number.isFinite(Number(natalDegree))) {
    return (
      <section className="bio-module">
        <div className="bio-today-widget">
          <h3>Biorythme indisponible</h3>
          <p>Données natales incomplètes. Relancez le calcul de votre carte du ciel.</p>
        </div>
      </section>
    );
  }

  const safeNatalSignIdx = Number.isFinite(natalSignIdx) ? natalSignIdx : 0;
  const safeNatalDegree = Math.min(30, Math.max(1, Math.round(Number(natalDegree) || 1)));
  const safeTransit = Math.min(359, Math.max(0, Number(transitAbsIdx) || 0));
  const safeBirthDate = /^\d{4}-\d{2}-\d{2}$/.test(String(birthDate || ''))
    ? String(birthDate)
    : null;
  const safeTransitDate = /^\d{4}-\d{2}-\d{2}$/.test(String(transitDate || ''))
    ? String(transitDate)
    : null;

  const computed = useMemo(() => {
    const natalAbsIdx = SIGNS[safeNatalSignIdx].base + (safeNatalDegree - 1);
    const natalEmotifIdx = natalAbsIdx % 72;
    const natalEmotifAngel = ANGELS[natalEmotifIdx];
    const birthRefDate = safeBirthDate ? new Date(`${safeBirthDate}T00:00:00`) : null;
    const selectedDate = safeTransitDate ? new Date(`${safeTransitDate}T00:00:00`) : null;
    let colToday = ((safeTransit - natalAbsIdx + 360) % 360);
    let cycleStart = null;
    if (birthRefDate && selectedDate && Number.isFinite(birthRefDate.getTime()) && Number.isFinite(selectedDate.getTime())) {
      const birthMonth = birthRefDate.getMonth();
      const birthDay = birthRefDate.getDate();
      const thisYearAnniv = buildAnniversaryDate(selectedDate.getFullYear(), birthMonth, birthDay);
      cycleStart = selectedDate < thisYearAnniv
        ? buildAnniversaryDate(selectedDate.getFullYear() - 1, birthMonth, birthDay)
        : thisYearAnniv;
      const delta = diffDays(selectedDate, cycleStart);
      const mod365 = ((delta % 365) + 365) % 365;
      colToday = mod365;
    }

    const rows = Array.from({ length: 365 }, (_, i) => {
      const col72 = i % 72;
      const absReal = (natalAbsIdx + i) % 360;
      const signIdx = Math.floor(absReal / 30);
      const degInSign = (absReal % 30) + 1;
      const rondeIdx = Math.floor(i / 72);
      const exact = EXACT_BY_COL72[col72];
      const rowDate = cycleStart && Number.isFinite(cycleStart.getTime())
        ? new Date(cycleStart.getFullYear(), cycleStart.getMonth(), cycleStart.getDate() + i)
        : null;
      const rowDateLabel = rowDate
        ? `${String(rowDate.getDate()).padStart(2, '0')}/${String(rowDate.getMonth() + 1).padStart(2, '0')}`
        : '—';

      const cosmicIdx = col72;

      return {
        idx: i,
        rowDateLabel,
        ronde: RONDES[rondeIdx],
        rondeIdx,
        cosmicIdx,
        cosmicAngel: ANGELS[cosmicIdx],
        sign: SIGNS[signIdx],
        degInSign,
        sephirah: exact?.sephirah || '',
        aspectLabel: exact?.aspect || '',
        aspectSymbol: exact?.symbol || '',
      };
    });

    const todayRow = rows[colToday] || rows[0];
    const phase = getAspectPhase(colToday % 72);

    return {
      natalAbsIdx,
      natalEmotifIdx,
      natalEmotifAngel,
      colToday,
      rows,
      todayRow,
      phase,
    };
  }, [safeNatalSignIdx, safeNatalDegree, safeTransit, safeBirthDate, safeTransitDate]);

  useEffect(() => {
    const row = todayRowRef.current;
    if (!row) return;

    // Double RAF pour attendre le layout complet (table + sticky header).
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        row.scrollIntoView({
          block: 'center',
          inline: 'nearest',
          behavior: 'smooth',
        });
      });
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, [computed.colToday]);

  return (
    <section className="bio-module">
      <div className="bio-today-widget">
        <div className="bio-summary-header">
          <h3>📅 Résumé du jour · Soleil du jour (auto) · {safeTransit}° absolu · cycle 365 j</h3>
          <label className="bio-summary-date-control">
            <span>Date</span>
            <input
              type="date"
              value={transitDate || ''}
              onChange={(e) => onTransitDateChange?.(e.target.value)}
            />
          </label>
        </div>
        <div className="bio-today-grid">
          <div><strong>Soleil du jour</strong><span className="mono">{safeTransit}° absolu</span></div>
          <div><strong>Ange du Biorythm</strong><span className="font-serif">{computed.todayRow.cosmicIdx + 1}. {computed.todayRow.cosmicAngel}</span></div>
          <div>
            <strong>Ange émotif</strong>
            <span className="font-serif">
              {computed.natalEmotifIdx + 1}. {computed.natalEmotifAngel}
            </span>
          </div>
          <div><strong>Ronde</strong><span>{computed.todayRow.ronde}</span></div>
          <div><strong>Signe actuel</strong><span>{computed.todayRow.sign.glyph} {computed.todayRow.sign.name} {computed.todayRow.degInSign}°</span></div>
          <div><strong>Aspect en cours</strong><span className="bio-aspect">{computed.phase.symbol} {computed.phase.label}</span></div>
        </div>
      </div>

      <div ref={tableWrapRef} className="bio-table-wrap">
        <table className="bio-table" aria-label="Tableau des 365 jours du biorythme kabalistique">
          <thead>
            <tr>
              <th>Date</th>
              <th>Ronde</th>
              <th>Ange Biorythm</th>
              <th>Signe</th>
              <th>Degré</th>
              <th>Sephirah</th>
              <th>Aspect</th>
            </tr>
          </thead>
          <tbody>
            {computed.rows.map((row) => {
              const isToday = row.idx === computed.colToday;
              const isNatal = row.idx === 0;
              const classNames = [
                'bio-row',
                `bio-ronde-${row.rondeIdx}`,
                isToday ? 'bio-row-today' : '',
                isNatal ? 'bio-row-natal' : '',
              ].join(' ').trim();
              const rowProps = (isToday || isNatal) ? { role: 'row' } : {};
              return (
                <tr
                  key={`${row.idx}-${row.rowDateLabel}`}
                  className={classNames}
                  {...rowProps}
                  ref={isToday ? todayRowRef : null}
                >
                  <td className="mono">{row.rowDateLabel}</td>
                  <td>{row.ronde}</td>
                  <td className="font-serif">{row.cosmicIdx + 1}. {row.cosmicAngel}</td>
                  <td>{row.sign.glyph} {row.sign.name}</td>
                  <td className="mono">{row.degInSign}</td>
                  <td>{row.sephirah || '—'}</td>
                  <td className={row.aspectSymbol ? 'bio-aspect' : ''}>
                    {row.aspectSymbol ? `${row.aspectSymbol} ${row.aspectLabel}` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
