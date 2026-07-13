import { TripData } from './trip.interfaces';

export const BARCELONA_DATA: TripData = {
  id: 'barcelona-2026',
  title: 'Barcelona',
  subtitle: 'Sol, tapas og Gaudí',
  dates: '27.–31. juli 2026',
  travelers: '6 personer',
  tripStart: '2026-07-27',
  tripEnd: '2026-07-31',
  destination: {
    city: 'Barcelona',
    country: 'Spanien',
    timezone: 'Europe/Madrid',
    lat: 41.3874,
    lng: 2.1686,
    currency: 'EUR',
    mapZoom: 13,
  },
  homeCurrency: 'DKK',
  homeTimezone: 'Europe/Copenhagen',
  heroImages: [
    'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=60', // Sagrada Família
    'https://images.unsplash.com/photo-1544366981-53db834f982a?w=800&q=60',    // Camp Nou
    'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=60', // Barri Gòtic
    'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=60', // Montjuïc
    'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=800&q=60',    // Barcelona
    'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=800&q=60', // Barceloneta
  ],
  days: [
    {
      id: 1,
      title: 'Ankomst & Montjuïc',
      date: '27. juli',
      isoDate: '2026-07-27',
      theme: 'Ankomst & Montjuïc',
      funFact: 'Montjuïc husede sommer-OL i 1992 — det olympiske stadion troner stadig øverst på bjerget med udsigt over hele byen og havnen.',
      intro:
        'Afgang hjemmefra kl. 04:30 — flyet (Norwegian D83656) letter fra CPH kl. 09:00 og lander i Barcelona kl. 11:55. Tag Rodalies R2 Nord fra T2 til Barcelona-Sants (~20 min) og tjek ind på Moxy. Efter en bid mad går turen til Montjuïc: kabelbanen op til Castell de Montjuïc og det gamle olympiske stadion på toppen.',
      highlights: [
        { label: 'Afgang hjemmefra kl. 04:30' },
        { label: 'Fly D83656: CPH kl. 09:00 → Barcelona kl. 11:55', duration: 'Norwegian' },
        { label: 'Rodalies R2 Nord: T2 → Barcelona-Sants', duration: '~20 min' },
        { label: 'Check-in på Moxy Barcelona' },
        { label: 'Frokost / en bid mad' },
        { label: 'Teleféric de Montjuïc (kabelbane op)', duration: '~10 min' },
        { label: 'Castell de Montjuïc', duration: '~1 time' },
        { label: 'Estadi Olímpic — det gamle OL-stadion (1992)', duration: '~30 min' },
      ],
      tips: [
        'Vær klar til afgang hjemmefra kl. 04:30 — flyet letter kl. 09:00 fra CPH',
        'Rodalies R2 Nord kører fra T2 direkte til Barcelona-Sants på ~20 min (~5,15 EUR)',
        'OBS: T-Casual-kortet gælder IKKE til/fra lufthavnen (zone 4) — køb en enkelt lufthavns-billet',
        'Til Montjuïc: Metro L2/L3 til Paral·lel → Funicular de Montjuïc (gratis med metrobillet) → Teleféric op til slottet',
        'Teleféric de Montjuïc kræver separat billet',
        'Pas på lommetyve i centrum og i metroen — bær tasken foran',
      ],
      food: [],
      transport: [
        'Rodalies R2 Nord: El Prat (T2) → Barcelona-Sants (~20 min)',
        'Gåtur til Moxy Barcelona',
        'Til Montjuïc: Metro L2/L3 → Paral·lel → Funicular de Montjuïc → Teleféric',
      ],
      bookings: [],
      fromList: [],
      markers: [
        { label: 'Moxy Barcelona', lat: 41.3792, lng: 2.1429, category: 'hotel' },
        { label: 'Teleféric de Montjuïc', lat: 41.3693, lng: 2.1653, category: 'highlight' },
        { label: 'Castell de Montjuïc', lat: 41.3634, lng: 2.1664, category: 'highlight' },
        { label: 'Estadi Olímpic', lat: 41.3648, lng: 2.1557, category: 'highlight' },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80', alt: 'Montjuïc', hero: true },
      ],
    },
    {
      id: 2,
      title: 'Camp Nou',
      date: '28. juli',
      isoDate: '2026-07-28',
      theme: 'FC Barcelona & Spotify Camp Nou',
      funFact: 'Spotify Camp Nou er Europas største fodboldstadion med plads til knap 100.000 tilskuere. Det gennemgår i disse år den store Espai Barça-renovering.',
      intro:
        'Dagens højdepunkt er jeres booking til Spotify Camp Nou kl. 10:00 — adgang til FC Barcelona-museet og til tribunerne med udsigt over selve stadionet (dele er allerede genåbnet efter renoveringen). Resten af dagen er fri.',
      highlights: [
        { label: 'Transport til Spotify Camp Nou', duration: '~30 min' },
        { label: 'FC Barcelona Museum + tribuner med udsigt over stadion (kl. 10:00)', duration: '~2 timer' },
        { label: 'Resten af dagen fri' },
      ],
      tips: [
        'Vær ved indgangen 15 min før jeres tidsrum kl. 10:00',
        'Billetten giver adgang til museet og til tribunerne med udsigt over stadionet — dele af stadion er genåbnet efter renoveringen (ikke immersive tour)',
        'Medbring booking-QR og ID',
      ],
      food: [],
      transport: [
        'Metro L5 → Collblanc eller Badal (~5 min gang til stadion)',
        'Metro L3 → Palau Reial eller Les Corts (~10 min gang)',
        'Palau Reial (L3) ligger tættest på indgang N°9',
      ],
      bookings: [
        { label: 'Spotify Camp Nou', note: 'Adgang til museet + tribunerne med udsigt over stadion. Billetter købt — tidsrum kl. 10:00. Vær der 15 min før med QR + ID.', url: 'https://www.fcbarcelona.com/en/tickets/camp-nou-experience', time: '2026-07-28T10:00' },
      ],
      fromList: [],
      markers: [
        { label: 'Spotify Camp Nou', lat: 41.3809, lng: 2.1228, category: 'highlight' },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80', alt: 'Barcelona', hero: true },
      ],
    },
    {
      id: 3,
      title: 'Fri dag',
      date: '29. juli',
      isoDate: '2026-07-29',
      theme: 'Ingen planer',
      funFact: 'Barcelona fik først rigtige strande efter OL i 1992, da hele kystlinjen blev forvandlet fra industrihavn til strandpromenade.',
      intro:
        'En helt fri dag uden planlagte aktiviteter — brug den som I har lyst til.',
      highlights: [
        { label: 'Fri dag – ingen planlagte aktiviteter' },
      ],
      tips: [],
      food: [],
      transport: [],
      bookings: [],
      fromList: [],
      markers: [
        { label: 'Moxy Barcelona', lat: 41.3792, lng: 2.1429, category: 'hotel' },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=1200&q=80', alt: 'Barcelona', hero: true },
      ],
    },
    {
      id: 4,
      title: 'Sagrada Família',
      date: '30. juli',
      isoDate: '2026-07-30',
      theme: 'Gaudís mesterværk',
      funFact: 'Sagrada Família har været under opbygning siden 1882 — over 140 år. Gaudí sagde om forsinkelsen: »Min klient har ingen travlt«, med henvisning til Gud.',
      intro:
        'Jeres booking til Sagrada Família er kl. 16:45. Dagen indtil da er fri — mød op i god tid til det tidsbestemte besøg.',
      highlights: [
        { label: 'Dagen fri indtil eftermiddag' },
        { label: 'Transport til Sagrada Família', duration: '~20 min' },
        { label: 'Sagrada Família (kl. 16:45)', duration: '~1.5 time' },
      ],
      tips: [
        'Vær ved indgangen 10–15 min før tidsrummet kl. 16:45 med QR klar',
        'Individuelle gæster går ind ad Fødselsfacaden (c/ de la Marina) — tjek døren på jeres billet',
        'Påklædning: skuldre og knæ skal være dækkede (det er en kirke)',
        'Kun små tasker — ingen selfiestænger eller spray',
      ],
      food: [],
      transport: [
        'Metro L2 (lilla) eller L5 (blå) → station »Sagrada Família« (lige ved basilikaen)',
      ],
      bookings: [
        { label: 'Sagrada Família', note: 'Billetter købt — tidsrum kl. 16:45. Vær der 10–15 min før med QR. Skuldre/knæ dækkede, kun små tasker.', url: 'https://sagradafamilia.org/en/tickets', time: '2026-07-30T16:45' },
      ],
      fromList: [],
      markers: [
        { label: 'Sagrada Família', lat: 41.4036, lng: 2.1744, category: 'highlight' },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=1200&q=80', alt: 'Sagrada Família', hero: true },
      ],
    },
    {
      id: 5,
      title: 'Hjemrejse',
      date: '31. juli',
      isoDate: '2026-07-31',
      theme: 'Afrejse',
      funFact: 'Barcelona er ifølge en legende opkaldt efter den karthagiske general Hamilcar Barca (far til Hannibal) — eller efter en fønikisk ekspedition der kaldte stedet »Barkeno«.',
      intro:
        'Sidste dag. Pak, tjek ud af Moxy Barcelona og tag Rodalies R2 Nord fra Barcelona-Sants til lufthavnen (T2). Flyet (D85512) letter kl. 16:15 — vær i El Prat T2 senest kl. 13:30.',
      highlights: [
        { label: 'Check-ud af Moxy Barcelona' },
        { label: 'Rodalies R2 Nord: Barcelona-Sants → El Prat (T2)', duration: '~20 min' },
        { label: 'Afgang kl. 16:15 → CPH 19:10 (D85512)', duration: '2t 55m' },
      ],
      tips: [
        'Pak aftenen før så morgenen er stressfri',
        'Rodalies R2 Nord fra Barcelona-Sants til lufthavnen (T2) tager ~20 min',
        'Vær i El Prat T2 senest kl. 13:30',
      ],
      food: [],
      transport: ['Rodalies R2 Nord: Barcelona-Sants → El Prat (T2) (~20 min)'],
      bookings: [],
      fromList: [],
      markers: [
        { label: 'Moxy Barcelona', lat: 41.3792, lng: 2.1429, category: 'hotel' },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=80', alt: 'Barcelona', hero: true },
      ],
    },
  ],
  practicalInfo: {
    flights: [
      { code: 'D83656', route: 'København (CPH T2) → Barcelona (BCN T2)', time: '27. juli kl. 09:00 → 11:55 (2t 55m)' },
      { code: 'D85512', route: 'Barcelona (BCN T2) → København (CPH T3)', time: '31. juli kl. 16:15 → 19:10 (2t 55m)' },
    ],
    hotel: {
      name: 'Moxy Barcelona',
      note: 'Booket for 6 personer. Norwegian LOWFARE+ — sæde 11A (ud) / 12A (hjem). 1 indchecket bagage + håndbagage + kabinekuffert inkl.',
    },
    transportNotes: [
      'Til/fra lufthavnen: Rodalies R2 Nord fra T2 til Barcelona-Sants (~20 min, ~5,15 EUR) — Moxy ligger tæt på Sants',
      'T-Casual Metro-kort (10 ture) er billigst i byen — men gælder IKKE til/fra lufthavnen (zone 4)',
      'Camp Nou: Metro L5 (Collblanc) eller L3 (Palau Reial)',
      'Sagrada Família: Metro L2/L5 til station »Sagrada Família«',
    ],
    generalNotes: [
      'Juli er højsæson — book billetter og restauranter i forvejen',
      'Bring solcreme, solhat og vandflasker (30°+ i juli)',
      'Siesta-tid: mange butikker lukker 14–17',
      'Spanierne spiser sent — middag serveres typisk fra kl. 21',
    ],
    emergencyContacts: [
      { label: 'Nødopkald (politi/brand/ambulance)', number: '112' },
      { label: 'Lokal politi (Mossos)', number: '088' },
      { label: 'Dansk ambassade i Madrid', number: '+34-91-431-8445', note: 'Hverdage 9-16' },
    ],
    tipping: [
      { category: 'Restauranter', tip: '5-10% (ikke forventet men værdsat)' },
      { category: 'Bar / drinks', tip: 'Oprund eller 0.50-1 EUR' },
      { category: 'Taxi', tip: 'Oprund til nærmeste euro' },
      { category: 'Hotel (rengøring)', tip: '1-2 EUR per nat' },
    ],
    checklist: [
      { id: 'pas', label: 'Pas eller EU-ID-kort', category: 'Dokumenter' },
      { id: 'forsikring', label: 'Rejseforsikring / blåt EU-sygesikringskort', category: 'Dokumenter' },
      { id: 'boardingpass', label: 'Norwegian boardingpass D83656 + D85512', category: 'Dokumenter' },
      { id: 'hotelbekraeft', label: 'Moxy Barcelona bekræftelse', category: 'Dokumenter' },
      { id: 'campnou', label: 'Spotify Camp Nou-billet', category: 'Billetter' },
      { id: 'sagrada', label: 'Sagrada Família-billet', category: 'Billetter' },
      { id: 'googlemaps', label: 'Google Maps offline-kort Barcelona', category: 'Apps & digitalt' },
      { id: 'powerbank', label: 'Powerbank (opladt)', category: 'Elektronik' },
      { id: 'ladekabel', label: 'Ladekabel til telefon', category: 'Elektronik' },
      { id: 'hoeretelefoner', label: 'Høretelefoner', category: 'Elektronik' },
      { id: 'solcreme', label: 'Solcreme (faktor 30+)', category: 'Personligt' },
      { id: 'solhat', label: 'Solhat / kasket', category: 'Personligt' },
      { id: 'vandflasker', label: 'Vandflasker (genopfyldelige)', category: 'Personligt' },
      { id: 'badetoj', label: 'Badetøj & håndklæde', category: 'Personligt' },
      { id: 'comfyshoes', label: 'Gode gåsko', category: 'Personligt' },
      { id: 'kreditkort', label: 'Kreditkort (Visa/Mastercard)', category: 'Økonomi' },
      { id: 'kontanter', label: 'Lidt EUR kontanter', category: 'Økonomi' },
    ],
  },
};
