import { contrastRatio } from './contrast';

// The single source of truth for team colors.
//
// brand1 / brand2  — the team's true brand colors. Use for badges, swatches,
//                    logo lockups: anything that must be *correct*.
// accent1 / accent2 — UI-safe derivatives for text, borders and fills on the
//                    dark base (#14151a page, #0d0e12 header). Several NFL
//                    primaries are near-black navies that are unreadable there,
//                    so those are lightened. Where the brand color already
//                    passes, accent === brand.
//
// Contrast bars these must clear, on the dark base:
//   accent1 >= 4.5 against the page   (#14151a) - large Bebas headings AND
//                                                  regular-weight body text
//                                                  (article body links are
//                                                  18px regular, which falls
//                                                  short of the WCAG large-
//                                                  text cutoff, so the old
//                                                  3.0 bar wasn't enough)
//   accent2 >= 4.5 against the panel  (#1e2027) - small 10-11px bold chips
//
// TeamColorProvider writes accent1/accent2 to --accent-1 / --accent-2.
// Nothing else in the app should import this file to read a color.

export type Conference = 'AFC' | 'NFC';
export type Division = 'East' | 'North' | 'South' | 'West';

export type Team = {
  slug: string;
  name: string;
  shortName: string;
  conference: Conference;
  division: Division;
  brand1: string;
  brand2: string;
  accent1: string;
  accent2: string;
  logoUrl: string;
};

export const TEAMS: Team[] = [
  // ---- AFC East ----
  { slug: 'buf', name: 'Buffalo Bills',        shortName: 'Bills',      conference: 'AFC', division: 'East',  brand1: '#00338D', brand2: '#C60C30', accent1: '#4C8FE0', accent2: '#E8546B', logoUrl: '/logos/buf.svg' },
  { slug: 'mia', name: 'Miami Dolphins',       shortName: 'Dolphins',   conference: 'AFC', division: 'East',  brand1: '#008E97', brand2: '#FC4C02', accent1: '#00C3CE', accent2: '#FC6B2D', logoUrl: '/logos/mia.svg' },
  { slug: 'ne',  name: 'New England Patriots', shortName: 'Patriots',   conference: 'AFC', division: 'East',  brand1: '#002244', brand2: '#C60C30', accent1: '#E93F54', accent2: '#B0B7BC', logoUrl: '/logos/ne.svg' },
  { slug: 'nyj', name: 'New York Jets',        shortName: 'Jets',       conference: 'AFC', division: 'East',  brand1: '#125740', brand2: '#FFFFFF', accent1: '#2EA96F', accent2: '#E8EAE6', logoUrl: '/logos/nyj.svg' },

  // ---- AFC North ----
  { slug: 'bal', name: 'Baltimore Ravens',     shortName: 'Ravens',     conference: 'AFC', division: 'North', brand1: '#241773', brand2: '#9E7C0C', accent1: '#8A6EDB', accent2: '#D4A62A', logoUrl: '/logos/bal.svg' },
  { slug: 'cin', name: 'Cincinnati Bengals',   shortName: 'Bengals',    conference: 'AFC', division: 'North', brand1: '#FB4F14', brand2: '#101820', accent1: '#FB4F14', accent2: '#B0B7BC', logoUrl: '/logos/cin.svg' },
  { slug: 'cle', name: 'Cleveland Browns',     shortName: 'Browns',     conference: 'AFC', division: 'North', brand1: '#311D00', brand2: '#FF3C00', accent1: '#FF5A22', accent2: '#C8A882', logoUrl: '/logos/cle.svg' },
  { slug: 'pit', name: 'Pittsburgh Steelers',  shortName: 'Steelers',   conference: 'AFC', division: 'North', brand1: '#FFB612', brand2: '#101820', accent1: '#FFB612', accent2: '#A5ACAF', logoUrl: '/logos/pit.svg' },

  // ---- AFC South ----
  { slug: 'hou', name: 'Houston Texans',       shortName: 'Texans',     conference: 'AFC', division: 'South', brand1: '#03202F', brand2: '#A71930', accent1: '#E2485E', accent2: '#5A9BC4', logoUrl: '/logos/hou.svg' },
  { slug: 'ind', name: 'Indianapolis Colts',   shortName: 'Colts',      conference: 'AFC', division: 'South', brand1: '#002C5F', brand2: '#A2AAAD', accent1: '#4C8FD8', accent2: '#A2AAAD', logoUrl: '/logos/ind.svg' },
  { slug: 'jax', name: 'Jacksonville Jaguars', shortName: 'Jaguars',    conference: 'AFC', division: 'South', brand1: '#006778', brand2: '#D7A22A', accent1: '#00A0B8', accent2: '#D7A22A', logoUrl: '/logos/jax.svg' },
  { slug: 'ten', name: 'Tennessee Titans',     shortName: 'Titans',     conference: 'AFC', division: 'South', brand1: '#0C2340', brand2: '#4B92DB', accent1: '#4B92DB', accent2: '#E65667', logoUrl: '/logos/ten.svg' },

  // ---- AFC West ----
  { slug: 'den', name: 'Denver Broncos',       shortName: 'Broncos',    conference: 'AFC', division: 'West',  brand1: '#FB4F14', brand2: '#002244', accent1: '#FB4F14', accent2: '#5A8FD0', logoUrl: '/logos/den.svg' },
  { slug: 'kc',  name: 'Kansas City Chiefs',   shortName: 'Chiefs',     conference: 'AFC', division: 'West',  brand1: '#E31837', brand2: '#FFB81C', accent1: '#E8405A', accent2: '#FFB81C', logoUrl: '/logos/kc.svg' },
  { slug: 'lv',  name: 'Las Vegas Raiders',    shortName: 'Raiders',    conference: 'AFC', division: 'West',  brand1: '#101820', brand2: '#A5ACAF', accent1: '#C8CFD2', accent2: '#8A9194', logoUrl: '/logos/lv.svg' },
  { slug: 'lac', name: 'Los Angeles Chargers', shortName: 'Chargers',   conference: 'AFC', division: 'West',  brand1: '#0080C6', brand2: '#FFC20E', accent1: '#2AA3E8', accent2: '#FFC20E', logoUrl: '/logos/lac.svg' },

  // ---- NFC East ----
  { slug: 'dal', name: 'Dallas Cowboys',       shortName: 'Cowboys',    conference: 'NFC', division: 'East',  brand1: '#041E42', brand2: '#869397', accent1: '#8FA3B8', accent2: '#C8D2DA', logoUrl: '/logos/dal.svg' },
  { slug: 'nyg', name: 'New York Giants',      shortName: 'Giants',     conference: 'NFC', division: 'East',  brand1: '#0B2265', brand2: '#A71930', accent1: '#507CE1', accent2: '#E4566A', logoUrl: '/logos/nyg.svg' },
  { slug: 'phi', name: 'Philadelphia Eagles',  shortName: 'Eagles',     conference: 'NFC', division: 'East',  brand1: '#004C54', brand2: '#A5ACAF', accent1: '#1E9BA8', accent2: '#A5ACAF', logoUrl: '/logos/phi.svg' },
  { slug: 'was', name: 'Washington Commanders',shortName: 'Commanders', conference: 'NFC', division: 'East',  brand1: '#5A1414', brand2: '#FFB612', accent1: '#FFB612', accent2: '#CD6C6B', logoUrl: '/logos/was.svg' },

  // ---- NFC North ----
  { slug: 'chi', name: 'Chicago Bears',        shortName: 'Bears',      conference: 'NFC', division: 'North', brand1: '#0B162A', brand2: '#C83803', accent1: '#E85A22', accent2: '#6B8FC4', logoUrl: '/logos/chi.svg' },
  { slug: 'det', name: 'Detroit Lions',        shortName: 'Lions',      conference: 'NFC', division: 'North', brand1: '#0076B6', brand2: '#B0B7BC', accent1: '#2A9EE0', accent2: '#B0B7BC', logoUrl: '/logos/det.svg' },
  { slug: 'gb',  name: 'Green Bay Packers',    shortName: 'Packers',    conference: 'NFC', division: 'North', brand1: '#203731', brand2: '#FFB612', accent1: '#FFB612', accent2: '#55967A', logoUrl: '/logos/gb.svg' },
  { slug: 'min', name: 'Minnesota Vikings',    shortName: 'Vikings',    conference: 'NFC', division: 'North', brand1: '#4F2683', brand2: '#FFC62F', accent1: '#956AD9', accent2: '#FFC62F', logoUrl: '/logos/min.svg' },

  // ---- NFC South ----
  { slug: 'atl', name: 'Atlanta Falcons',      shortName: 'Falcons',    conference: 'NFC', division: 'South', brand1: '#A71930', brand2: '#101820', accent1: '#E2485E', accent2: '#A5ACAF', logoUrl: '/logos/atl.svg' },
  { slug: 'car', name: 'Carolina Panthers',    shortName: 'Panthers',   conference: 'NFC', division: 'South', brand1: '#0085CA', brand2: '#101820', accent1: '#2AA3E8', accent2: '#A5ACAF', logoUrl: '/logos/car.svg' },
  { slug: 'no',  name: 'New Orleans Saints',   shortName: 'Saints',     conference: 'NFC', division: 'South', brand1: '#D3BC8D', brand2: '#101820', accent1: '#D3BC8D', accent2: '#A5ACAF', logoUrl: '/logos/no.svg' },
  { slug: 'tb',  name: 'Tampa Bay Buccaneers', shortName: 'Buccaneers', conference: 'NFC', division: 'South', brand1: '#D50A0A', brand2: '#FF7900', accent1: '#EA4048', accent2: '#FF7900', logoUrl: '/logos/tb.svg' },

  // ---- NFC West ----
  { slug: 'ari', name: 'Arizona Cardinals',    shortName: 'Cardinals',  conference: 'NFC', division: 'West',  brand1: '#97233F', brand2: '#FFB612', accent1: '#D9506B', accent2: '#FFB612', logoUrl: '/logos/ari.svg' },
  { slug: 'lar', name: 'Los Angeles Rams',     shortName: 'Rams',       conference: 'NFC', division: 'West',  brand1: '#003594', brand2: '#FFA300', accent1: '#4C7FE0', accent2: '#FFA300', logoUrl: '/logos/lar.svg' },
  { slug: 'sf',  name: 'San Francisco 49ers',  shortName: '49ers',      conference: 'NFC', division: 'West',  brand1: '#AA0000', brand2: '#B3995D', accent1: '#DD4F4F', accent2: '#C9AE72', logoUrl: '/logos/sf.svg' },
  { slug: 'sea', name: 'Seattle Seahawks',     shortName: 'Seahawks',   conference: 'NFC', division: 'West',  brand1: '#002244', brand2: '#69BE28', accent1: '#69BE28', accent2: '#7A93AD', logoUrl: '/logos/sea.svg' },
];

export const TEAMS_BY_SLUG: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.slug, t])
);

export const DEFAULT_TEAM = 'kc';

export function getTeam(slug: string): Team {
  return TEAMS_BY_SLUG[slug] ?? TEAMS_BY_SLUG[DEFAULT_TEAM];
}

/** Display order for the /echipe index — AFC then NFC, East/North/South/West within. */
export const CONFERENCES: Conference[] = ['AFC', 'NFC'];
export const DIVISIONS: Division[] = ['East', 'North', 'South', 'West'];

export function getTeamsByDivision(conference: Conference, division: Division): Team[] {
  return TEAMS.filter((team) => team.conference === conference && team.division === division);
}

/**
 * The neighbouring teams either side of `currentSlug` in TEAMS's own order
 * (conference then division, matching the /echipe index) — for the
 * detail page's prev/next foot nav. `undefined` at either end of the
 * 32-team list, same absent-not-disabled contract as
 * utils/articles.ts's selectAdjacentArticles.
 */
export function getAdjacentTeams(currentSlug: string): { previous?: Team; next?: Team } {
  const index = TEAMS.findIndex((team) => team.slug === currentSlug);

  if (index === -1) {
    return {};
  }

  return { previous: TEAMS[index - 1], next: TEAMS[index + 1] };
}

// $c-text / $c-page from styles/_variables.scss, duplicated here — Sass
// variables aren't importable into TS. Matches the PAGE_BACKGROUND literal
// already duplicated in teams.test.ts for the same reason.
const C_TEXT = '#f5f4f2';
const C_PAGE = '#14151a';

/**
 * Contrast-safe foreground for text on a `brand1` background (the
 * identity band on /echipe/[team]). brand1 has no contrast guarantee
 * against either surface (AGENTS.md — some primaries are near-black, some
 * near-white), so this picks whichever of $c-text / $c-page wins rather
 * than assuming one always does.
 */
export function onBrandColor(team: Team): string {
  return contrastRatio(team.brand1, C_TEXT) >= contrastRatio(team.brand1, C_PAGE) ? C_TEXT : C_PAGE;
}

/** Six teams shown in the header picker. */
/** TODO: think about how to make accessible the rest */
/** TODO: think about how to make this dynamic */
export const PICKER_TEAMS = ['kc', 'phi', 'dal', 'gb', 'pit', 'ne'] as const;
