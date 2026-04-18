/**
 * Maps short codes and full country/region names to canonical entries.
 * Multiple keys can point to the same canonical entry (e.g. 'DE' and 'Germany').
 *
 * Used by categoryParser to assign categories to the "countries" section.
 */

const c = (id, name, flag) => ({id, name, flag});

// Canonical country definitions
const US  = c('us',  'USA',                   '🇺🇸');
const CA  = c('ca',  'Canada',                '🇨🇦');
const GB  = c('gb',  'United Kingdom',         '🇬🇧');
const MX  = c('mx',  'Mexico',                '🇲🇽');
const AR  = c('ar',  'Arabic',                '🇸🇦'); // NOT Argentina!
const DE  = c('de',  'Deutschland',            '🇩🇪');
const IL  = c('il',  'Israel',                '🇮🇱');
const NL  = c('nl',  'Netherlands',            '🇳🇱');
const NO  = c('no',  'Norway',                '🇳🇴');
const FI  = c('fi',  'Finland',               '🇫🇮');
const PL  = c('pl',  'Poland',                '🇵🇱');
const FR  = c('fr',  'France',                '🇫🇷');
const CH  = c('ch',  'Switzerland',            '🇨🇭');
const AT  = c('at',  'Austria',               '🇦🇹');
const ES  = c('es',  'Spain',                 '🇪🇸');
const SG  = c('sg',  'Singapore',             '🇸🇬');
const HK  = c('hk',  'Hong Kong',             '🇭🇰');
const MY  = c('my',  'Malaysia',              '🇲🇾');
const TR  = c('tr',  'Turkey',                '🇹🇷');
const CZ  = c('cz',  'Czechia',               '🇨🇿');
const BG  = c('bg',  'Bulgaria',              '🇧🇬');
const NZ  = c('nz',  'New Zealand',            '🇳🇿');
const SE  = c('se',  'Sweden',                '🇸🇪');
const EN  = c('en',  'English',               '🌍');

const IE  = c('ie',  'Ireland',               '🇮🇪');
const AU  = c('au',  'Australia',             '🇦🇺');
const DK  = c('dk',  'Denmark',               '🇩🇰');
const BE  = c('be',  'Belgium',               '🇧🇪');
const PT  = c('pt',  'Portugal',              '🇵🇹');
const RO  = c('ro',  'Romania',               '🇷🇴');
const HU  = c('hu',  'Hungary',               '🇭🇺');
const GR  = c('gr',  'Greece',                '🇬🇷');
const CY  = c('cy',  'Cyprus',                '🇨🇾');
const IT  = c('it',  'Italy',                 '🇮🇹');
const AL  = c('al',  'Albania',               '🇦🇱');
const BA  = c('ba',  'Bosnia and Herzegovina', '🇧🇦');
const MK  = c('mk',  'Macedonia',             '🇲🇰');
const MT  = c('mt',  'Malta',                 '🇲🇹');
const UA  = c('ua',  'Ukraine',               '🇺🇦');
const RU  = c('ru',  'Russia',                '🇷🇺');
const EXYU = c('exyu','Ex-Yugoslavia',         '🇷🇸');

// Latin America
const ARG = c('arg', 'Argentina',             '🇦🇷');
const BO  = c('bo',  'Bolivia',               '🇧🇴');
const BR  = c('br',  'Brazil',                '🇧🇷');
const CL  = c('cl',  'Chile',                 '🇨🇱');
const CR  = c('cr',  'Costa Rica',            '🇨🇷');
const CO  = c('co',  'Colombia',              '🇨🇴');
const CU  = c('cu',  'Cuba',                  '🇨🇺');
const EC  = c('ec',  'Ecuador',               '🇪🇨');
const SV  = c('sv',  'El Salvador',           '🇸🇻');
const GT  = c('gt',  'Guatemala',             '🇬🇹');
const HN  = c('hn',  'Honduras',              '🇭🇳');
const NI  = c('ni',  'Nicaragua',             '🇳🇮');
const PA  = c('pa',  'Panama',                '🇵🇦');
const PY  = c('py',  'Paraguay',              '🇵🇾');
const PE  = c('pe',  'Peru',                  '🇵🇪');
const PR  = c('pr',  'Puerto Rico',           '🇵🇷');
const DO  = c('do',  'Dominican Republic',    '🇩🇴');
const UY  = c('uy',  'Uruguay',               '🇺🇾');

// Regions
const AFRICA    = c('africa',    'Africa',         '🌍');
const CARIBBEAN = c('caribbean', 'Caribbean',      '🌴');
const INDPAK    = c('indpak',    'India/Pakistan',  '🇮🇳');

// Asia
const AZ  = c('az',  'Azerbaijan',            '🇦🇿');
const AF  = c('af',  'Afghanistan',           '🇦🇫');
const BD  = c('bd',  'Bangladesh',            '🇧🇩');
const CN  = c('cn',  'China',                 '🇨🇳');
const IR  = c('ir',  'Iran',                  '🇮🇷');
const IN  = c('in',  'India',                 '🇮🇳');
const ID  = c('id',  'Indonesia',             '🇮🇩');
const JP  = c('jp',  'Japan',                 '🇯🇵');
const KU  = c('ku',  'Kurdish',               '🏳');
const KR  = c('kr',  'Korea',                 '🇰🇷');
const PK  = c('pk',  'Pakistan',              '🇵🇰');
const PH  = c('ph',  'Philippines',           '🇵🇭');
const TH  = c('th',  'Thailand',              '🇹🇭');
const TJ  = c('tj',  'Tajikistan',            '🇹🇯');
const VN  = c('vn',  'Vietnam',               '🇻🇳');

/**
 * The lookup map. Keys are matched case-sensitively against:
 * - Short codes (rule 5, left of pipe): 'USA', 'CA', 'UK', 'AR', ...
 * - Full names (rule 5, left of pipe): 'España', 'France', 'Australia', ...
 * - Verbatim standalone names (rule 6): 'Germany - Deutschland', ...
 * - Base names after suffix-stripping (rule 6): 'Belgium', 'Norway', ...
 */
const COUNTRY_MAP = new Map([
  // Short codes
  ['USA', US], ['CA', CA], ['UK', GB], ['MX', MX], ['AR', AR],
  ['DE', DE], ['IL', IL], ['NL', NL], ['NO', NO], ['FI', FI],
  ['PL', PL], ['FR', FR], ['CH', CH], ['AT', AT], ['ES', ES],
  ['SG', SG], ['HK', HK], ['MY', MY], ['TR', TR], ['CZ', CZ],
  ['BG', BG], ['NZ', NZ], ['SE', SE], ['EN', EN],

  // Full names (used by rule 5 pipe-split AND rule 6 standalone)
  ['España', ES],
  ['France', FR],
  ['Australia', AU],
  ['Africa', AFRICA],
  ['Caribbean', CARIBBEAN],
  ['India/Pakistan', INDPAK],
  ['Belgium', BE],
  ['Denmark', DK],
  ['Netherlands', NL],
  ['Norway', NO],
  ['Sweden', SE],
  ['Poland', PL],
  ['Germany', DE],
  ['Greece', GR],
  ['Cyprus', CY],
  ['Italy', IT],
  ['Israel', IL],
  ['Albania', AL],
  ['Bosnia and Herzegovina', BA],
  ['Bulgaria', BG],
  ['Czechia', CZ],
  ['Finland', FI],
  ['Hungary', HU],
  ['Macedonia', MK],
  ['Malta', MT],
  ['Portugal', PT],
  ['România', RO],
  ['Switzerland', CH],
  ['Turkey', TR],
  ['Ukraine', UA],
  ['Russia', RU],
  ['Ex-Yu', EXYU],
  ['Ireland', IE],
  ['New Zealand', NZ],
  ['Austria', AT],

  // Latin America
  ['Argentina', ARG],
  ['Bolivia', BO],
  ['Brazil', BR],
  ['Chile', CL],
  ['Costa Rica', CR],
  ['Colombia', CO],
  ['Cuba', CU],
  ['Ecuador', EC],
  ['El Salvador', SV],
  ['Guatemala', GT],
  ['Honduras', HN],
  ['Mexico', MX],
  ['Panamá', PA],
  ['Paraguay', PY],
  ['Peru', PE],
  ['Nicaragua', NI],
  ['Puerto Rico', PR],
  ['República Dominicana', DO],
  ['Uruguay', UY],

  // Regions
  ['India/Pakistan', INDPAK],

  // Asia
  ['Azerbaijan', AZ],
  ['Afghanistan', AF],
  ['Bangladesh', BD],
  ['China', CN],
  ['Iran', IR],
  ['India', IN],
  ['Indonesia', ID],
  ['Japan', JP],
  ['Kurdish', KU],
  ['Korea', KR],
  ['Pakistan', PK],
  ['Philippine', PH],
  ['Singapore', SG],
  ['Thailand', TH],
  ['Tajikistan', TJ],
  ['Vietnam', VN],

  // Verbatim entries (matched before suffix-stripping in rule 6)
  ['Germany - Deutschland', DE],
  ['Greece - Ελλάδα', GR],
  ['Cyprus - Κύπρος', CY],
  ['Italy - Italia', IT],
  ['Israel - יִשְׂרָאֵל', IL],
  ['Finland - Suomi', FI],
  ['Ukraine - Україна', UA],
  ['Russia - Россия', RU],
  ['Norway - Norge', NO],
  ['Sweden - Sverige', SE],
  ['Poland - Polska', PL],
  ['Belgium - Belgique', BE],
  ['Albania - Shqipëria', AL],
  ['Azerbaijan - Azərbaycan', AZ],
  ['Afghanistan - افغانستان', AF],
  ['Bangladesh - বাংলাদেশ', BD],
  ['China - 中国', CN],
  ['Iran - ايران', IR],
  ['India - भारत', IN],
  ['Japan - 日本', JP],
  ['Kurdish - کوردی', KU],
  ['Korea - 한국', KR],
  ['Pakistan - پاکستان', PK],
  ['Thailand - ประเทศไทย', TH],
  ['Tajikistan - Точикистон', TJ],
  ['Vietnam - Việt Nam', VN],
]);

export default COUNTRY_MAP;
export {COUNTRY_MAP};
