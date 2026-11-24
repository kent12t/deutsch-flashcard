// Core curriculum: units grouped by CEFR level.
// Units with `quiz` pull their words from the original class deck (classDeck.json).
// Other units carry their own vocab in a compact pipe format:
//   n|article|Singular|Plural|english     (plural "-" = same as singular, "" = no plural)
//   v|infinitive|english|verbType          (1 regular, 2 stem change, 3 irregular/modal)
//   a|adjective|english
//   o|other|english

export const LEVELS = [
  { id: "A1", name: "A1 · Grundlagen", blurb: "Survive your first conversations." },
  { id: "A2", name: "A2 · Alltag", blurb: "Handle everyday life with confidence." },
  { id: "B1", name: "B1 · Unabhängig", blurb: "Talk about ideas, not just things." },
];

export const UNITS = [
  { id: "q1", level: "A1", quiz: "1", icon: "👋", de: "Erste Schritte", en: "First steps", grammar: "g1" },
  { id: "q2", level: "A1", quiz: "2", icon: "☕", de: "Essen & Leute", en: "Food & people", grammar: "g2" },
  { id: "q3", level: "A1", quiz: "3", icon: "🕒", de: "Zeit & Stadt", en: "Time & the city", grammar: "g3" },
  { id: "q4", level: "A1", quiz: "4", icon: "💼", de: "Im Büro", en: "At the office", grammar: "g4" },
  {
    id: "family", level: "A1", icon: "👨‍👩‍👧", de: "Familie", en: "Family", grammar: "g5",
    vocab: `
n|die|Familie|Familien|family
n|der|Vater|Väter|father
n|die|Mutter|Mütter|mother
n|die|Eltern||parents
n|der|Sohn|Söhne|son
n|die|Tochter|Töchter|daughter
n|der|Bruder|Brüder|brother
n|die|Schwester|Schwestern|sister
n|die|Geschwister||siblings
n|der|Großvater|Großväter|grandfather
n|die|Großmutter|Großmütter|grandmother
n|die|Oma|Omas|grandma
n|der|Opa|Opas|grandpa
n|der|Onkel|-|uncle
n|die|Tante|Tanten|aunt
n|das|Kind|Kinder|child
n|das|Baby|Babys|baby
n|der|Cousin|Cousins|cousin (male)
n|die|Cousine|Cousinen|cousin (female)
n|der|Ehemann|Ehemänner|husband
n|die|Ehefrau|Ehefrauen|wife
n|der|Geburtstag|Geburtstage|birthday
a|verheiratet|married
a|ledig|single (unmarried)
a|geschieden|divorced
a|jung|young
a|alt|old
v|heiraten|marry|1`,
  },
  {
    id: "home", level: "A1", icon: "🏠", de: "Zuhause", en: "Home", grammar: "g6",
    vocab: `
n|die|Wohnung|Wohnungen|flat / apartment
n|das|Haus|Häuser|house
n|das|Zimmer|-|room
n|das|Schlafzimmer|-|bedroom
n|das|Wohnzimmer|-|living room
n|das|Badezimmer|-|bathroom
n|der|Balkon|Balkone|balcony
n|das|Fenster|-|window
n|das|Sofa|Sofas|sofa
n|der|Schrank|Schränke|wardrobe / cupboard
n|das|Regal|Regale|shelf
n|der|Teppich|Teppiche|carpet / rug
n|der|Kühlschrank|Kühlschränke|fridge
n|der|Herd|Herde|stove
n|der|Spiegel|-|mirror
n|die|Miete|Mieten|rent
n|der|Nachbar|Nachbarn|neighbour
n|die|Treppe|Treppen|stairs
a|hell|bright
a|dunkel|dark
a|gemütlich|cosy
a|teuer|expensive
a|billig|cheap
a|ruhig|quiet / calm
v|putzen|clean|1
v|aufräumen|tidy up|1
v|mieten|rent|1
v|umziehen|move (house)|1`,
  },
  {
    id: "clothes", level: "A1", icon: "🧥", de: "Kleidung & Farben", en: "Clothes & colours", grammar: "g7",
    vocab: `
n|die|Kleidung||clothing
n|die|Hose|Hosen|trousers
n|das|Hemd|Hemden|shirt
n|der|Rock|Röcke|skirt
n|das|Kleid|Kleider|dress
n|die|Jacke|Jacken|jacket
n|der|Mantel|Mäntel|coat
n|der|Pullover|-|jumper / sweater
n|der|Schuh|Schuhe|shoe
n|der|Stiefel|-|boot
n|die|Mütze|Mützen|beanie / cap
n|der|Schal|Schals|scarf
n|das|T-Shirt|T-Shirts|T-shirt
n|die|Größe|Größen|size
a|rot|red
a|blau|blue
a|grün|green
a|gelb|yellow
a|weiß|white
a|grau|grey
a|braun|brown
a|bunt|colourful
v|tragen|wear / carry|2
v|anziehen|put on (clothes)|1
v|anprobieren|try on|1
v|gefallen|please / to like|2`,
  },
  {
    id: "health", level: "A1", icon: "🩺", de: "Körper & Gesundheit", en: "Body & health", grammar: "g8",
    vocab: `
n|der|Kopf|Köpfe|head
n|das|Auge|Augen|eye
n|das|Ohr|Ohren|ear
n|die|Nase|Nasen|nose
n|der|Mund|Münder|mouth
n|der|Zahn|Zähne|tooth
n|der|Hals|Hälse|neck / throat
n|der|Bauch|Bäuche|belly
n|der|Rücken|-|back
n|der|Arm|Arme|arm
n|das|Bein|Beine|leg
n|der|Fuß|Füße|foot
n|der|Arzt|Ärzte|doctor (male)
n|die|Ärztin|Ärztinnen|doctor (female)
n|die|Apotheke|Apotheken|pharmacy
n|das|Medikament|Medikamente|medicine
n|das|Fieber||fever
n|der|Schmerz|Schmerzen|pain
n|die|Erkältung|Erkältungen|a cold
a|krank|sick
a|gesund|healthy
a|müde|tired
v|wehtun|hurt|1
v|sich ausruhen|rest|1
v|husten|cough|1`,
  },
  {
    id: "weather", level: "A1", icon: "🌦️", de: "Wetter & Jahreszeiten", en: "Weather & seasons", grammar: "g9",
    vocab: `
n|das|Wetter||weather
n|die|Sonne|Sonnen|sun
n|der|Regen||rain
n|der|Schnee||snow
n|der|Wind|Winde|wind
n|die|Wolke|Wolken|cloud
n|das|Gewitter|-|thunderstorm
n|die|Temperatur|Temperaturen|temperature
n|der|Grad|-|degree
n|der|Frühling|Frühlinge|spring
n|der|Herbst|Herbste|autumn
n|der|Winter|-|winter
n|die|Jahreszeit|Jahreszeiten|season
a|warm|warm
a|kalt|cold
a|heiß|hot
a|sonnig|sunny
a|bewölkt|cloudy
a|windig|windy
a|nass|wet
v|regnen|rain|1
v|schneien|snow|1
v|scheinen|shine|1`,
  },
  {
    id: "travel", level: "A2", icon: "✈️", de: "Reisen", en: "Travel", grammar: "g10",
    vocab: `
n|die|Reise|Reisen|trip / journey
n|der|Urlaub|Urlaube|holiday / vacation
n|der|Flughafen|Flughäfen|airport
n|der|Flug|Flüge|flight
n|das|Flugzeug|Flugzeuge|aeroplane
n|der|Koffer|-|suitcase
n|der|Pass|Pässe|passport
n|das|Hotel|Hotels|hotel
n|die|Unterkunft|Unterkünfte|accommodation
n|das|Gepäck||luggage
n|die|Fahrkarte|Fahrkarten|ticket
n|der|Strand|Strände|beach
n|das|Meer|Meere|sea
n|der|Berg|Berge|mountain
n|die|Insel|Inseln|island
n|das|Ausland||abroad
n|die|Grenze|Grenzen|border
v|reisen|travel|1
v|buchen|book|1
v|packen|pack|1
v|fliegen|fly|1
v|übernachten|stay overnight|1
v|verpassen|miss (a train etc.)|1
v|besichtigen|visit / see (sights)|1
a|spannend|exciting`,
  },
  {
    id: "shopping", level: "A2", icon: "🛍️", de: "Einkaufen & Geld", en: "Shopping & money", grammar: "g11",
    vocab: `
n|das|Geld||money
n|der|Preis|Preise|price
n|die|Kasse|Kassen|checkout / till
n|die|Rechnung|Rechnungen|bill / invoice
n|die|Quittung|Quittungen|receipt
n|das|Angebot|Angebote|offer / deal
n|das|Geschäft|Geschäfte|shop / business
n|der|Markt|Märkte|market
n|der|Kunde|Kunden|customer
n|der|Verkäufer|-|sales assistant (male)
n|die|Verkäuferin|Verkäuferinnen|sales assistant (female)
n|die|Tüte|Tüten|bag (plastic/paper)
n|das|Bargeld||cash
n|der|Rabatt|Rabatte|discount
n|die|Flasche|Flaschen|bottle
n|das|Stück|Stücke|piece
a|günstig|affordable
a|kostenlos|free of charge
v|bezahlen|pay|1
v|ausgeben|spend (money)|2
v|sparen|save (money)|1
v|umtauschen|exchange (goods)|1
v|kosten|cost|1
v|wiegen|weigh|1`,
  },
  {
    id: "freetime", level: "A2", icon: "🎸", de: "Freizeit & Hobbys", en: "Free time & hobbies", grammar: "g12",
    vocab: `
n|die|Freizeit||free time
n|das|Hobby|Hobbys|hobby
n|das|Kino|Kinos|cinema
n|der|Film|Filme|film
n|das|Spiel|Spiele|game / match
n|der|Verein|Vereine|club
n|der|Ausflug|Ausflüge|outing / day trip
n|die|Party|Partys|party
n|das|Instrument|Instrumente|instrument
n|die|Gitarre|Gitarren|guitar
n|das|Klavier|Klaviere|piano
n|das|Lied|Lieder|song
n|das|Schwimmbad|Schwimmbäder|swimming pool
v|spielen|play|1
v|schwimmen|swim|1
v|tanzen|dance|1
v|singen|sing|1
v|malen|paint|1
v|wandern|hike|1
v|joggen|jog|1
v|sich verabreden|arrange to meet|1
a|langweilig|boring
a|lustig|funny
a|aktiv|active`,
  },
  {
    id: "feelings", level: "A2", icon: "💛", de: "Gefühle & Charakter", en: "Feelings & character", grammar: "g13",
    vocab: `
n|das|Gefühl|Gefühle|feeling
n|die|Angst|Ängste|fear
n|die|Freude|Freuden|joy
n|die|Liebe||love
n|die|Hoffnung|Hoffnungen|hope
n|die|Laune|Launen|mood
n|die|Sorge|Sorgen|worry
a|glücklich|happy
a|traurig|sad
a|wütend|angry
a|nervös|nervous
a|freundlich|friendly
a|nett|nice / kind
a|ehrlich|honest
a|fleißig|hard-working
a|faul|lazy
a|schüchtern|shy
a|geduldig|patient
a|stolz|proud
a|überrascht|surprised
a|enttäuscht|disappointed
v|sich ärgern|be annoyed|1
v|lachen|laugh|1
v|weinen|cry|1
v|hoffen|hope|1
v|vermissen|miss (someone)|1`,
  },
  {
    id: "career", level: "A2", icon: "📈", de: "Arbeit & Beruf", en: "Work & career", grammar: "g14",
    vocab: `
n|der|Beruf|Berufe|profession
n|der|Job|Jobs|job
n|die|Stelle|Stellen|position / post
n|die|Bewerbung|Bewerbungen|application
n|der|Lebenslauf|Lebensläufe|CV / résumé
n|das|Gehalt|Gehälter|salary
n|der|Chef|Chefs|boss (male)
n|die|Chefin|Chefinnen|boss (female)
n|die|Erfahrung|Erfahrungen|experience
n|die|Ausbildung|Ausbildungen|vocational training
n|das|Praktikum|Praktika|internship
n|das|Vorstellungsgespräch|Vorstellungsgespräche|job interview
n|die|Besprechung|Besprechungen|meeting
n|die|Überstunde|Überstunden|overtime hour
n|der|Vertrag|Verträge|contract
v|sich bewerben|apply|2
v|verdienen|earn|1
v|kündigen|quit / give notice|1
v|leiten|lead / manage|1
a|selbstständig|self-employed / independent
a|stressig|stressful
a|erfolgreich|successful
a|arbeitslos|unemployed`,
  },
  {
    id: "environment", level: "B1", icon: "🌍", de: "Umwelt & Natur", en: "Environment & nature", grammar: "g15",
    vocab: `
n|die|Umwelt||environment
n|das|Klima||climate
n|der|Klimawandel||climate change
n|der|Müll||rubbish / trash
n|die|Energie|Energien|energy
n|der|Strom||electricity
n|die|Luft||air
n|der|Wald|Wälder|forest
n|der|Fluss|Flüsse|river
n|der|See|Seen|lake
n|die|Verschmutzung|Verschmutzungen|pollution
n|der|Umweltschutz||environmental protection
n|die|Verpackung|Verpackungen|packaging
a|nachhaltig|sustainable
a|umweltfreundlich|eco-friendly
a|erneuerbar|renewable
a|schädlich|harmful
v|trennen|separate|1
v|recyceln|recycle|1
v|verschwenden|waste|1
v|schützen|protect|1
v|verbrauchen|consume|1
v|retten|rescue / save|1`,
  },
  {
    id: "media", level: "B1", icon: "📱", de: "Medien & Technik", en: "Media & tech", grammar: "g16",
    vocab: `
n|die|Medien||media
n|die|Nachricht|Nachrichten|news / message
n|die|Zeitung|Zeitungen|newspaper
n|die|Zeitschrift|Zeitschriften|magazine
n|die|Sendung|Sendungen|broadcast / show
n|die|Werbung||advertising
n|der|Bildschirm|Bildschirme|screen
n|das|Gerät|Geräte|device
n|die|Datei|Dateien|file
n|das|Passwort|Passwörter|password
n|der|Bericht|Berichte|report
n|die|Quelle|Quellen|source
a|digital|digital
a|aktuell|current / up to date
a|zuverlässig|reliable
v|herunterladen|download|2
v|speichern|save (a file)|1
v|löschen|delete|1
v|teilen|share|1
v|veröffentlichen|publish|1
v|sich informieren|inform oneself|1`,
  },
  {
    id: "society", level: "B1", icon: "🏛️", de: "Gesellschaft & Politik", en: "Society & politics", grammar: "g17",
    vocab: `
n|die|Gesellschaft|Gesellschaften|society
n|die|Regierung|Regierungen|government
n|die|Wahl|Wahlen|election / choice
n|der|Bürger|-|citizen
n|das|Gesetz|Gesetze|law
n|das|Recht|Rechte|right / law
n|die|Meinung|Meinungen|opinion
n|die|Mehrheit|Mehrheiten|majority
n|die|Gleichberechtigung||equal rights
n|der|Staat|Staaten|state
n|die|Demokratie|Demokratien|democracy
n|die|Steuer|Steuern|tax
a|politisch|political
a|öffentlich|public
a|gerecht|fair / just
v|wählen|vote / choose|1
v|diskutieren|discuss|1
v|fordern|demand|1
v|unterstützen|support|1
v|sich engagieren|get involved|1`,
  },
  {
    id: "relationships", level: "B1", icon: "🤝", de: "Beziehungen", en: "Relationships", grammar: "g18",
    vocab: `
n|die|Beziehung|Beziehungen|relationship
n|die|Freundschaft|Freundschaften|friendship
n|die|Hochzeit|Hochzeiten|wedding
n|der|Streit|Streitigkeiten|argument / quarrel
n|das|Vertrauen||trust
n|das|Verständnis||understanding
n|das|Paar|Paare|couple
n|die|Einladung|Einladungen|invitation
n|der|Kompromiss|Kompromisse|compromise
n|die|Geduld||patience
a|treu|loyal / faithful
a|eifersüchtig|jealous
a|verliebt|in love
v|sich verlieben|fall in love|1
v|sich trennen|break up / separate|1
v|sich streiten|argue|3
v|sich versöhnen|make up (after a fight)|1
v|vertrauen|trust|1
v|sich kümmern|take care (of)|1
v|verzeihen|forgive|3`,
  },
  {
    id: "education", level: "B1", icon: "🎓", de: "Bildung & Zukunft", en: "Education & future", grammar: "g19",
    vocab: `
n|die|Bildung||education
n|die|Schule|Schulen|school
n|das|Studium|Studien|university studies
n|das|Fach|Fächer|subject
n|die|Prüfung|Prüfungen|exam
n|die|Note|Noten|grade / mark
n|das|Zeugnis|Zeugnisse|certificate / report card
n|der|Abschluss|Abschlüsse|degree / qualification
n|das|Ziel|Ziele|goal
n|die|Zukunft||future
n|die|Fähigkeit|Fähigkeiten|ability / skill
n|das|Wissen||knowledge
n|das|Stipendium|Stipendien|scholarship
n|die|Vorlesung|Vorlesungen|lecture
n|die|Hausaufgabe|Hausaufgaben|homework
a|anspruchsvoll|demanding
a|motiviert|motivated
v|bestehen|pass (an exam)|3
v|durchfallen|fail (an exam)|2
v|sich verbessern|improve|1
v|erreichen|achieve / reach|1
v|üben|practise|1`,
  },
];
