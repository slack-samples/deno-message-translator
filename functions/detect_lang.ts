import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { isDebugMode } from "./internals/debug_mode.ts";

export const def = DefineFunction({
  callback_id: "detect-lang",
  title: "Detects the language to translate text into",
  source_file: "functions/detect_lang.ts",
  input_parameters: {
    properties: { reaction: { type: Schema.types.string } },
    required: ["reaction"],
  },
  output_parameters: {
    properties: { lang: { type: Schema.types.string } },
    required: [],
  },
});

export default SlackFunction(def, ({
  inputs,
  env,
}) => {
  const debugMode = isDebugMode(env);
  if (debugMode) {
    console.log(`detect-lang inputs: ${JSON.stringify(inputs)}`);
  }
  const reactionName = inputs.reaction;
  let lang: string | undefined = undefined;
  if (reactionName.match(/flag-/)) {
    // flag-***
    const matched = reactionName.match(/(?!flag-\b)\b\w+/);
    if (matched != null) {
      const country = matched[0];
      lang = allReactionToLang[country];
    }
  } else {
    // jp, fr, etc.
    lang = allReactionToLang[reactionName];
  }
  return { outputs: { lang } };
});

// data mapping between reaction names and language codes
export const allReactionToLang: Record<string, string> = {
  ac: "en",
  ag: "en",
  ai: "en",
  ao: "pt",
  ar: "es",
  as: "en",
  at: "de",
  au: "en",
  aw: "nl",
  bb: "en",
  be: "nl",
  bf: "fr",
  bi: "fr",
  bj: "fr",
  bl: "fr",
  bn: "en",
  bo: "es",
  bq: "nl",
  br: "pt",
  bs: "en",
  bw: "en",
  bz: "en",
  ca: "en",
  cd: "fr",
  cf: "fr",
  cg: "fr",
  ch: "de",
  ci: "fr",
  ck: "en",
  cl: "es",
  cm: "fr",
  cn: "zh",
  co: "es",
  cp: "fr",
  cr: "es",
  cu: "es",
  cv: "pt",
  cw: "nl",
  cx: "en",
  de: "de",
  dj: "fr",
  dm: "en",
  do: "es",
  ea: "es",
  ec: "es",
  es: "es",
  fj: "en",
  fk: "en",
  fm: "en",
  fr: "fr",
  ga: "fr",
  gb: "en",
  gd: "en",
  gf: "fr",
  gg: "en",
  gh: "en",
  gi: "en",
  gm: "en",
  gn: "fr",
  gp: "fr",
  gq: "es",
  gs: "en",
  gt: "es",
  gu: "en",
  gw: "pt",
  gy: "en",
  hn: "es",
  ic: "es",
  im: "en",
  io: "en",
  it: "it",
  je: "en",
  jm: "en",
  jp: "ja",
  ke: "en",
  ki: "en",
  kr: "ko",
  kn: "en",
  ky: "en",
  lc: "en",
  li: "de",
  lr: "en",
  mc: "fr",
  ml: "fr",
  mp: "en",
  mq: "fr",
  ms: "en",
  mu: "en",
  mw: "en",
  mx: "es",
  mz: "pt",
  na: "en",
  nc: "fr",
  ne: "fr",
  nf: "en",
  ng: "en",
  ni: "es",
  nl: "nl",
  nz: "en",
  pa: "es",
  pe: "es",
  pf: "fr",
  pl: "pl",
  pm: "fr",
  pn: "en",
  pr: "es",
  pt: "pt",
  pw: "en",
  py: "es",
  re: "fr",
  ru: "ru",
  sb: "en",
  sc: "en",
  sg: "en",
  sh: "en",
  sl: "en",
  sm: "it",
  sn: "fr",
  sr: "nl",
  ss: "en",
  st: "pt",
  sv: "es",
  sx: "nl",
  ta: "en",
  tc: "en",
  td: "fr",
  tf: "fr",
  tg: "fr",
  tt: "en",
  ug: "en",
  um: "en",
  us: "en",
  uy: "es",
  va: "it",
  vc: "en",
  ve: "es",
  vg: "en",
  vi: "en",
  wf: "fr",
  yt: "fr",
  zm: "en",
  zw: "en",
  bg: "bg",
  cz: "cs",
  dk: "da",
  gr: "el",
  ee: "et",
  fi: "fi",
  hu: "hu",
  id: "id",
  lt: "lt",
  ro: "ro",
  sk: "sk",
  si: "sl",
  se: "sv",
  tr: "tr",
  ua: "uk",
};

// TODO: add more emojis to this list
export const upTo100ReactionToLang: Record<string, string> = {
  cn: "zh",
  de: "de",
  es: "es",
  fr: "fr",
  gb: "en",
  it: "it",
  jp: "ja",
  kr: "ko",
  pl: "pl",
  pt: "pt",
  ru: "ru",
  us: "en",
  bg: "bg",
  fi: "fi",
  hu: "hu",
  id: "id",
  lt: "lt",
  ro: "ro",
  sk: "sk",
  tr: "tr",
};
