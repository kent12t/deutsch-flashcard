// Verb tables for the Verb Gym. Order of persons: ich, du, er/sie/es, wir, ihr, sie/Sie
// `pres` omitted → regular conjugation from the stem.
// `sep` = separable prefix; the base verb is conjugated and the prefix appended.

export const PERSONS = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"];

const V = (inf, en, perf, prat, pres, extra = {}) => ({ inf, en, perf, prat, pres: pres ? pres.split(" ") : null, ...extra });

export const VERBS = [
  V("sein", "to be", "ist gewesen", "war", "bin bist ist sind seid sind"),
  V("haben", "to have", "hat gehabt", "hatte", "habe hast hat haben habt haben"),
  V("werden", "to become", "ist geworden", "wurde", "werde wirst wird werden werdet werden"),
  V("machen", "to do / make", "hat gemacht", "machte"),
  V("wohnen", "to live (reside)", "hat gewohnt", "wohnte"),
  V("lernen", "to learn", "hat gelernt", "lernte"),
  V("spielen", "to play", "hat gespielt", "spielte"),
  V("kaufen", "to buy", "hat gekauft", "kaufte"),
  V("arbeiten", "to work", "hat gearbeitet", "arbeitete"),
  V("kochen", "to cook", "hat gekocht", "kochte"),
  V("hören", "to hear", "hat gehört", "hörte"),
  V("fragen", "to ask", "hat gefragt", "fragte"),
  V("sagen", "to say", "hat gesagt", "sagte"),
  V("brauchen", "to need", "hat gebraucht", "brauchte"),
  V("reisen", "to travel", "ist gereist", "reiste"),
  V("tanzen", "to dance", "hat getanzt", "tanzte"),
  V("warten", "to wait", "hat gewartet", "wartete"),
  V("studieren", "to study", "hat studiert", "studierte"),
  V("besuchen", "to visit", "hat besucht", "besuchte"),
  V("erklären", "to explain", "hat erklärt", "erklärte"),
  V("öffnen", "to open", "hat geöffnet", "öffnete"),
  V("fahren", "to drive / go", "ist gefahren", "fuhr", "fahre fährst fährt fahren fahrt fahren"),
  V("essen", "to eat", "hat gegessen", "aß", "esse isst isst essen esst essen"),
  V("sprechen", "to speak", "hat gesprochen", "sprach", "spreche sprichst spricht sprechen sprecht sprechen"),
  V("lesen", "to read", "hat gelesen", "las", "lese liest liest lesen lest lesen"),
  V("sehen", "to see", "hat gesehen", "sah", "sehe siehst sieht sehen seht sehen"),
  V("geben", "to give", "hat gegeben", "gab", "gebe gibst gibt geben gebt geben"),
  V("nehmen", "to take", "hat genommen", "nahm", "nehme nimmst nimmt nehmen nehmt nehmen"),
  V("helfen", "to help", "hat geholfen", "half", "helfe hilfst hilft helfen helft helfen"),
  V("schlafen", "to sleep", "hat geschlafen", "schlief", "schlafe schläfst schläft schlafen schlaft schlafen"),
  V("tragen", "to wear / carry", "hat getragen", "trug", "trage trägst trägt tragen tragt tragen"),
  V("laufen", "to run / walk", "ist gelaufen", "lief", "laufe läufst läuft laufen lauft laufen"),
  V("treffen", "to meet", "hat getroffen", "traf", "treffe triffst trifft treffen trefft treffen"),
  V("vergessen", "to forget", "hat vergessen", "vergaß", "vergesse vergisst vergisst vergessen vergesst vergessen"),
  V("gehen", "to go", "ist gegangen", "ging"),
  V("kommen", "to come", "ist gekommen", "kam"),
  V("bleiben", "to stay", "ist geblieben", "blieb"),
  V("schreiben", "to write", "hat geschrieben", "schrieb"),
  V("trinken", "to drink", "hat getrunken", "trank"),
  V("finden", "to find", "hat gefunden", "fand"),
  V("fliegen", "to fly", "ist geflogen", "flog"),
  V("schwimmen", "to swim", "ist geschwommen", "schwamm"),
  V("singen", "to sing", "hat gesungen", "sang"),
  V("denken", "to think", "hat gedacht", "dachte"),
  V("bringen", "to bring", "hat gebracht", "brachte"),
  V("kennen", "to know (be familiar)", "hat gekannt", "kannte"),
  V("stehen", "to stand", "hat gestanden", "stand"),
  V("liegen", "to lie (be lying)", "hat gelegen", "lag"),
  V("verstehen", "to understand", "hat verstanden", "verstand"),
  V("beginnen", "to begin", "hat begonnen", "begann"),
  V("heißen", "to be called", "hat geheißen", "hieß", "heiße heißt heißt heißen heißt heißen"),
  V("sitzen", "to sit", "hat gesessen", "saß", "sitze sitzt sitzt sitzen sitzt sitzen"),
  V("wissen", "to know (a fact)", "hat gewusst", "wusste", "weiß weißt weiß wissen wisst wissen"),
  V("können", "can / to be able to", "hat gekonnt", "konnte", "kann kannst kann können könnt können"),
  V("müssen", "must / to have to", "hat gemusst", "musste", "muss musst muss müssen müsst müssen"),
  V("wollen", "to want", "hat gewollt", "wollte", "will willst will wollen wollt wollen"),
  V("dürfen", "may / to be allowed to", "hat gedurft", "durfte", "darf darfst darf dürfen dürft dürfen"),
  V("sollen", "should / to be supposed to", "hat gesollt", "sollte", "soll sollst soll sollen sollt sollen"),
  V("mögen", "to like", "hat gemocht", "mochte", "mag magst mag mögen mögt mögen"),
  V("aufstehen", "to get up", "ist aufgestanden", null, null, { sep: "auf", base: "stehen" }),
  V("anrufen", "to call (phone)", "hat angerufen", null, null, { sep: "an", base: "rufen" }),
  V("einkaufen", "to go shopping", "hat eingekauft", null, null, { sep: "ein", base: "kaufen" }),
  V("fernsehen", "to watch TV", "hat ferngesehen", null, null, { sep: "fern", base: "sehen" }),
  V("anfangen", "to start", "hat angefangen", null, null, { sep: "an", base: "fangen", basePres: "fange fängst fängt fangen fangt fangen" }),
  V("einladen", "to invite", "hat eingeladen", null, null, { sep: "ein", base: "laden", basePres: "lade lädst lädt laden ladet laden" }),
];

function regularPresent(inf) {
  const stem = inf.endsWith("en") ? inf.slice(0, -2) : inf.slice(0, -1);
  // e-insertion: stems ending in d/t, or consonant + m/n (öffnen, rechnen)
  const needsE = /[dt]$/.test(stem) || /[^aeiouäöülrhmn][mn]$/.test(stem);
  const sibilant = /(s|ß|z|x)$/.test(stem);
  const e = needsE ? "e" : "";
  return [
    stem + "e",
    stem + (sibilant ? "t" : e + "st"),
    stem + e + "t",
    inf,
    stem + e + "t",
    inf,
  ];
}

export function present(verb) {
  if (verb.sep) {
    const baseVerb = VERBS.find((v) => v.inf === verb.base && v.pres);
    const forms = verb.basePres ? verb.basePres.split(" ") : baseVerb ? baseVerb.pres : regularPresent(verb.base);
    return forms.map((f) => `${f} ${verb.sep}`);
  }
  return verb.pres || regularPresent(verb.inf);
}

export function prateritum(verb, personIdx) {
  if (!verb.prat) return null;
  const p = verb.prat;
  if (personIdx === 0 || personIdx === 2) return p;
  if (personIdx === 3 || personIdx === 5) return p.endsWith("e") ? p + "n" : p + "en";
  if (personIdx === 1) return p.endsWith("e") ? p + "st" : p + (/(s|ß|z|d|t)$/.test(p) ? "est" : "st");
  return p.endsWith("e") ? p + "t" : p + (/[dt]$/.test(p) ? "et" : "t");
}

export function perfekt(verb, personIdx) {
  const [aux3, part] = verb.perf.split(" ");
  const auxForms = aux3 === "ist" ? VERBS[0].pres : VERBS[1].pres;
  return `${auxForms[personIdx]} ${part}`;
}
