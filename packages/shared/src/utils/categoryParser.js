import COUNTRY_MAP from './countryMap';

/**
 * Section identifiers used in the parser output.
 */
export const SECTIONS = {
  COUNTRIES:   'countries',
  LIVE_SPORT:  'liveSport',
  REPLAYS:     'replays',
  CHANNELS_247:'channels247',
  STREAMING:   'streaming',
  SPECIAL:     'special',
};

/**
 * Strip emoji characters from a string for matching purposes.
 * Preserves all non-emoji text.
 */
const stripEmoji = (str) =>
  str.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').trim();

/**
 * Parse a single category and determine its section, country, and displayName.
 *
 * @param {Object} category - A Category model object with {id, name, parentId}
 * @returns {Object} { section, country?, displayName, original }
 */
export const parseCategory = (category) => {
  const name = category.name;
  const original = category;

  // Rule 1: Live Sport
  if (name.startsWith('Live | ')) {
    return {
      section: SECTIONS.LIVE_SPORT,
      displayName: name.slice(7).trim(),
      original,
    };
  }

  // Rule 2: Replays
  if (name.startsWith('Replay | ')) {
    return {
      section: SECTIONS.REPLAYS,
      displayName: name.slice(9).trim(),
      original,
    };
  }

  // Rule 3: 24/7 Channels
  if (name.startsWith('24/7 ')) {
    return {
      section: SECTIONS.CHANNELS_247,
      displayName: name.slice(4).trim(),
      original,
    };
  }

  // Rule 4: Streaming (EN✦ with or without space)
  if (name.startsWith('EN✦')) {
    return {
      section: SECTIONS.STREAMING,
      displayName: name.slice(3).trim(),
      original,
    };
  }

  // Rule 5: Pipe-separated — check left part against countryMap
  const pipeIdx = name.indexOf(' | ');
  if (pipeIdx > 0) {
    const left = name.substring(0, pipeIdx).trim();
    const country = COUNTRY_MAP.get(left);
    if (country) {
      return {
        section: SECTIONS.COUNTRIES,
        country,
        displayName: name.substring(pipeIdx + 3).trim(),
        original,
      };
    }
    // Left part not in countryMap — fall through to rule 6/7
  }

  // Rule 6: Standalone country name with suffix-stripping
  const stripped = stripEmoji(name);

  // 6a: Exact match (catches verbatim entries like "Germany - Deutschland")
  const exactMatch = COUNTRY_MAP.get(stripped);
  if (exactMatch) {
    return {
      section: SECTIONS.COUNTRIES,
      country: exactMatch,
      displayName: exactMatch.name,
      original,
    };
  }

  // 6b: Strip " - OriginalName" suffix and try base name
  const dashIdx = stripped.indexOf(' - ');
  if (dashIdx > 0) {
    const baseName = stripped.substring(0, dashIdx).trim();
    const baseMatch = COUNTRY_MAP.get(baseName);
    if (baseMatch) {
      return {
        section: SECTIONS.COUNTRIES,
        country: baseMatch,
        displayName: baseMatch.name,
        original,
      };
    }
  }

  // Rule 7: Special (fallthrough)
  return {
    section: SECTIONS.SPECIAL,
    displayName: name,
    original,
  };
};

/**
 * Parse all categories and group them by section.
 *
 * @param {Array} categories - Array of Category model objects
 * @returns {Object} Grouped result:
 *   {
 *     countries: { [countryId]: { name, flag, categories: [{displayName, original}] } },
 *     liveSport: [{displayName, original}],
 *     replays: [...],
 *     channels247: [...],
 *     streaming: [...],
 *     special: [...]
 *   }
 */
export const parseCategories = (categories) => {
  const result = {
    countries: {},
    liveSport: [],
    replays: [],
    channels247: [],
    streaming: [],
    special: [],
  };

  for (const cat of categories) {
    const parsed = parseCategory(cat);
    const entry = {displayName: parsed.displayName, original: parsed.original};

    if (parsed.section === SECTIONS.COUNTRIES) {
      const {id, name, flag} = parsed.country;
      if (!result.countries[id]) {
        result.countries[id] = {name, flag, categories: []};
      }
      result.countries[id].categories.push(entry);
    } else {
      result[parsed.section].push(entry);
    }
  }

  return result;
};

export default parseCategories;
