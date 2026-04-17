import { TripData } from './trip.interfaces';

export const TRIP_DATA: TripData = {
  title: 'New York',
  subtitle: 'A curated guide for two',
  dates: '22.–27. april 2026',
  travelers: '2 personer',
  tripStart: '2026-04-22',
  tripEnd: '2026-04-27',
  days: [
    {
      id: 1,
      title: 'Ankomst + Times Square',
      date: '22. april',
      isoDate: '2026-04-22',
      theme: 'Rolig start',
      walkingDistance: '~4 km',
      intro:
        'Ankomst til New York med SAS SK909 til Newark ca. kl. 14:55. Efter en lang flytur venter en rolig aften med check-in og de første skridt gennem Midtowns neonlys.',
      highlights: [
        'Ankomst med SAS SK909 til Newark ca. 14:55',
        'Transport fra Newark til Manhattan',
        'Check-in på Millennium Hotel Times Square',
        'Gåtur i nærområdet',
        'Times Square',
        'Bryant Park',
        'New York Public Library',
        "M&M's Store",
        "Hershey's Chocolate World",
      ],
      tips: [
        'Tag AirTrain + NJ Transit fra Newark — billigere end taxi',
        'Times Square er mest magisk efter mørkets frembrud',
        'Køb en OMNY-kompatibel MetroCard med det samme',
      ],
      food: [
        { name: "Tony's Di Napoli", note: 'Klassisk italiensk familierestaurant', url: 'https://www.tonysnyc.com/' },
        { name: 'The Smith', note: 'Moderne amerikansk brasserie', url: 'https://thesmithrestaurant.com/' },
      ],
      transport: ['Newark → Manhattan (AirTrain + NJ Transit)', 'Hotel som udgangspunkt'],
      bookings: [],
      fromList: [
        {
          label: 'Brooklyn Diner',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Brooklyn+Diner+New+York',
        },
        {
          label: '7th Street Burger Bryant Park',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=7th+Street+Burger+Bryant+Park+New+York',
        },
        {
          label: "John's Pizzeria of Times Square",
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Johns+Pizzeria+Times+Square+New+York',
        },
        {
          label: 'Gordon Ramsay Fish & Chips',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Gordon+Ramsay+Fish+and+Chips+Times+Square+New+York',
        },
        {
          label: 'S&P Lunch',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=S%26P+Lunch+New+York',
        },
      ],
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.183792036255!2d-73.9871078!3d40.7579747!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1710000000000',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1539209826553-6d9178ca9089?w=1200&q=80',
          alt: 'Times Square neonlys om aftenen',
          hero: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?w=800&q=80',
          alt: 'Yellow cabs ved Times Square',
        },
        {
          url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
          alt: 'New York Public Library',
        },
      ],
    },
    {
      id: 2,
      title: 'DUMBO → Brooklyn Bridge → 9/11 → Færge → Mets',
      date: '23. april',
      isoDate: '2026-04-23',
      theme: 'Ikonisk NYC dag',
      walkingDistance: '~14 km',
      intro:
        'En dag der starter med Brooklyns bedste udsigt, fortsætter over den ikoniske bro, dykker ned i historien ved Ground Zero og slutter med baseball under lysene på Citi Field.',
      highlights: [
        'Start fra Millennium Hotel Times Square',
        'Subway til DUMBO',
        'DUMBO Manhattan Bridge View',
        'Gå over Brooklyn Bridge mod Manhattan',
        'Golden Diner',
        'Ground Zero',
        '9/11 Museum',
        'Oculus',
        'One World Trade Center',
        'New York Stock Exchange',
        '504 Battery Pl (Men in Black)',
        'NYC Ferry: Battery Park → St. George → Pier 11',
        'Tilbage mod hotel',
        'Mets kamp på Citi Field',
      ],
      tips: [
        'Start Brooklyn Bridge-turen tidligt om morgenen for færre turister',
        'Gå broen fra Brooklyn → Manhattan for skyline-udsigten foran dig',
        '9/11 Museum er emotionelt — beregn mindst 2 timer',
        'Citi Field: Tag 7-toget direkte fra Times Sq–42 St',
      ],
      food: [
        { name: 'Golden Diner', note: 'Moderne diner i Lower Manhattan', url: 'https://www.goldendinerny.com/' },
      ],
      transport: [
        'Subway: N/R fra Times Sq → Court St (DUMBO)',
        'Gåtur over Brooklyn Bridge',
        'Gåtur gennem Lower Manhattan',
        'NYC Ferry: Battery Park → St. George → Pier 11',
        'Subway: 7 fra Times Sq–42 St → Mets-Willets Point',
      ],
      bookings: [{ label: '9/11 Museum', note: 'Husk at booke billet på forhånd', url: 'intent://scan/#Intent;scheme=gocity;package=com.gocitypass;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.gocitypass;end' }],
      fromList: [
        {
          label: 'Golden Diner',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Golden+Diner+New+York',
        },
        {
          label: "Katz's Delicatessen",
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Katzs+Delicatessen+New+York',
        },
        {
          label: 'LOS TACOS No.1',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=LOS+TACOS+No.1+New+York',
        },
        {
          label: 'Pier 17',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Pier+17+New+York',
        },
      ],
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.518079498!2d-73.9893421!3d40.7063095!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a197c06b7cb%3A0x40a06c78f79e5de6!2sBrooklyn%20Bridge!5e0!3m2!1sen!2sus!4v1710000000000',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1702146504040-80b20af1181c?w=1200&q=80',
          alt: 'DUMBO og Manhattan Bridge',
          hero: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1512472102579-8a647ea3559f?w=800&q=80',
          alt: 'Gående på Brooklyn Bridge',
        },
        {
          url: 'https://images.unsplash.com/photo-1623169734436-513e344a62b3?w=800&q=80',
          alt: 'Baseball stadion i New York',
        },
      ],
    },
    {
      id: 3,
      title: 'Central Park + Midtown + Top of the Rock',
      date: '24. april',
      isoDate: '2026-04-24',
      theme: 'Natur + klassisk NYC',
      walkingDistance: '~10 km',
      intro:
        'En dag i forårets Central Park med ikoniske broer og fontæner, efterfulgt af Midtowns glans og en uforglemmelig solnedgang fra Top of the Rock.',
      highlights: [
        'Start fra hotel',
        'Ess-a-Bagel eller H&H Bagels',
        'Central Park: Gapstow Bridge',
        'Central Park: Bow Bridge',
        'Central Park: Bethesda Fountain',
        'Central Park: Bethesda Terrace',
        'Central Park: Dipway Arch',
        'Plaza Hotel',
        'Nintendo Store',
        'Rockefeller Center',
        'Radio City Music Hall',
        'Top of the Rock',
      ],
      tips: [
        'Book Top of the Rock til ca. 1 time før solnedgang',
        'Central Park er enorm — hold dig til den sydlige halvdel',
        'Nintendo Store har ofte kø — gå tidligt eller sent',
      ],
      food: [
        { name: 'Quality Italian', note: 'Upscale italiensk i Midtown', url: 'https://www.qualityitalian.com/' },
        { name: 'Osteria La Baia', note: 'Elegant italiensk', url: 'https://www.labaianyc.com/' },
      ],
      transport: ['Primært gåafstand fra hotel'],
      bookings: [{ label: 'Top of the Rock', note: 'Book billet til solnedgang', url: 'intent://scan/#Intent;scheme=gocity;package=com.gocitypass;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.gocitypass;end' }],
      fromList: [
        {
          label: 'H&H Bagels',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=H%26H+Bagels+New+York',
        },
        {
          label: "Leon's Bagels",
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Leons+Bagels+New+York',
        },
        {
          label: 'Brooklyn Diner',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Brooklyn+Diner+New+York',
        },
        {
          label: '230 Fifth',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=230+Fifth+Rooftop+Bar+New+York',
        },
      ],
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.3!2d-73.9654!3d40.7812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2589a018531e3%3A0xb9df1f7387a94119!2sCentral%20Park!5e0!3m2!1sen!2sus!4v1710000000000',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=1200&q=80',
          alt: 'Central Park om foråret',
          hero: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1765908310201-21b4f73b9ea7?w=800&q=80',
          alt: 'Bethesda Fountain i Central Park',
        },
        {
          url: 'https://images.unsplash.com/photo-1693196506405-4c5ef5cbca03?w=800&q=80',
          alt: 'Solnedgang fra Top of the Rock',
        },
      ],
    },
    {
      id: 4,
      title: 'Chinatown + SoHo + DUMBO + Village',
      date: '25. april',
      isoDate: '2026-04-25',
      theme: 'Mad + kvarterer + Brooklyn + filmspots',
      walkingDistance: '~12 km',
      intro:
        'En dag dedikeret til New Yorks mest karakterfulde kvarterer — fra Chinatowns dufte og SoHos boutiques til Brooklyns waterfront og Greenwichs filmlocations.',
      highlights: [
        'Start fra hotel',
        'Tompkins Square Bagels eller Apollo Bagels',
        'Chinatown',
        'Little Italy',
        'LOS TACOS No.1',
        "Katz's Delicatessen",
        'SoHo',
        'Prince Street Pizza',
        'Ceres',
        'Urban Outfitters',
        'Subway til Brooklyn',
        'DUMBO',
        'Squibb Park Bridge',
        'Time Out Market',
        'Tilbage til Manhattan',
        'Washington Square Park',
        "Monica's Apartment",
        '66 Perry St',
        'Ghostbusters HQ',
      ],
      tips: [
        'Chinatown er bedst til frokost — prøv dim sum',
        "Katz's: Bestil ved disken, mist IKKE din billet",
        'SoHo er bedst for shopping sidst på formiddagen',
        "Monica's Apartment (fra Friends) er på 90 Bedford St",
      ],
      food: [
        { name: 'Don Angie', note: 'Kreativ italiensk i West Village', url: 'https://www.donangie.com/' },
        { name: 'Via Carota', note: 'Populær italiensk trattoria', url: 'https://www.viacarota.com/' },
      ],
      transport: [
        'Subway: N/Q/R fra Times Sq → Canal St (Chinatown)',
        'Gåtur: Chinatown → SoHo → Little Italy',
        'Subway: F fra Broadway-Lafayette → York St (DUMBO)',
        'Subway: A/C fra High St → W 4 St (Village)',
      ],
      bookings: [],
      fromList: [
        {
          label: 'Time Out Market',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Time+Out+Market+New+York',
        },
        {
          label: 'Prince Street Pizza',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Prince+Street+Pizza+New+York',
        },
        {
          label: 'Ceres',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Ceres+New+York',
        },
        {
          label: "L'industrie Pizzeria",
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Lindustrie+Pizzeria+New+York',
        },
        {
          label: "Hani's Bakery + Café",
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Hanis+Bakery+Cafe+New+York',
        },
        {
          label: 'Pookie Bakery',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Pookie+Bakery+New+York',
        },
        {
          label: 'Glace NY',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Glace+NY+New+York',
        },
      ],
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.8!2d-73.9973!3d40.7158!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25987b5a8a305%3A0x1481f4d5b6aaf50!2sSoHo%2C%20New%20York!5e0!3m2!1sen!2sus!4v1710000000000',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1567529692333-de9fd6772897?w=1200&q=80',
          alt: 'Chinatown New York',
          hero: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1746407757880-1d848208ca00?w=800&q=80',
          alt: 'Chinatown i Manhattan',
        },
        {
          url: 'https://images.unsplash.com/photo-1759810743306-8727f3beab97?w=800&q=80',
          alt: 'Washington Square Arch',
        },
      ],
    },
    {
      id: 5,
      title: 'Midtown + Empire State',
      date: '26. april',
      isoDate: '2026-04-26',
      theme: 'Klassisk NYC + aftenoplevelse',
      walkingDistance: '~11 km',
      intro:
        'Den klassiske New York-dag — fra Grand Centrals majestætiske hal over Fifth Avenues shopping til High Lines grønne oase. Dagen afsluttes med et besøg på Empire State Building.',
      highlights: [
        'Start fra hotel',
        'Chelsea Square Diner eller Clinton St. Baking Company',
        'Grand Central Terminal',
        'Chrysler Building',
        'One Vanderbilt',
        'Fifth Avenue',
        'Apple Store',
        'FAO Schwarz',
        'Salswee',
        'High Line',
        'Vessel',
        'High Line View Point',
        'Aftensmad',
        'Empire State Building',
      ],
      tips: [
        'Grand Central: Se op i loftet — stjernehimlen er malet omvendt',
        'High Line: Gå fra syd mod nord for den bedste oplevelse',
        'Empire State Building: Aftenbillet giver færre køer og magisk udsigt',
        'FAO Schwarz har den ikoniske gulvklaviatur fra "Big"',
      ],
      food: [],
      transport: [
        'Subway: S fra Times Sq → Grand Central',
        'Gåtur langs Fifth Avenue',
        'Subway: 7 fra Hudson Yards → Times Sq',
        'Gåtur til Empire State Building',
      ],
      bookings: [
        { label: 'Empire State Building', note: 'Aftenbillet anbefales', url: 'intent://scan/#Intent;scheme=gocity;package=com.gocitypass;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.gocitypass;end' },
      ],
      fromList: [
        {
          label: 'Salswee',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Salswee+New+York',
        },
        {
          label: 'Chelsea Square Diner',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Chelsea+Square+Diner+New+York',
        },
        {
          label: 'Clinton St. Baking Company',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Clinton+St+Baking+Company+New+York',
        },
        {
          label: 'Gotham Burger Social Club',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Gotham+Burger+Social+Club+New+York',
        },
        {
          label: "Danny & Coop's Cheesesteaks",
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Danny+and+Coops+Cheesesteaks+New+York',
        },
        {
          label: 'Seven Sins Bar',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Seven+Sins+Bar+New+York',
        },
      ],
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.5!2d-73.9857!3d40.7484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9aeb1c6b5%3A0x35b1cfbc89a6097f!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1710000000000',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1555109307-f7d9da25c244?w=1200&q=80',
          alt: 'Empire State Building',
          hero: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1750077806370-806ba3ff2479?w=800&q=80',
          alt: 'Grand Central Terminal',
        },
        {
          url: 'https://images.unsplash.com/photo-1624553348093-ed95c718f37b?w=800&q=80',
          alt: 'The High Line, New York',
        },
      ],
    },
    {
      id: 6,
      title: 'Afslutning + hjemrejse',
      date: '27. april',
      isoDate: '2026-04-27',
      theme: 'Rolig afslutning',
      walkingDistance: '~3 km',
      intro:
        'Den sidste morgen i New York. Tid til en langsom brunch, et sidste blik på byen og en stille afslutning på en uforglemmelig uge.',
      highlights: [
        'Sunday Morning brunch',
        'Sidste tur i området',
        'Evt. Bryant Park',
        'Afgang mod Newark',
        'SAS SK910 kl. 17:15',
      ],
      tips: [
        'Pak aftenen før så morgenen er stressfri',
        'Penn Station → Newark Airport: Tag NJ Transit + AirTrain',
        'Vær i lufthavnen senest 3 timer før afgang',
      ],
      food: [],
      transport: ['Penn Station → Newark (NJ Transit + AirTrain)', 'Hotel som udgangspunkt'],
      bookings: [],
      fromList: [
        {
          label: 'Sunday Morning',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Sunday+Morning+New+York',
        },
        {
          label: 'Brooklyn Diner',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Brooklyn+Diner+New+York',
        },
        {
          label: 'Green Kitchen',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=Green+Kitchen+New+York',
        },
      ],
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.183792036255!2d-73.9871078!3d40.7579747!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1710000000000',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1655301885279-2a83e9504154?w=1200&q=80',
          alt: 'Morgen ved Brooklyn Bridge',
          hero: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800&q=80',
          alt: 'Morgen i Manhattan',
        },
        {
          url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80',
          alt: 'Farvel til New York skyline',
        },
      ],
    },
  ],
  practicalInfo: {
    flights: [
      { code: 'SK909', route: 'København → Newark', time: 'Ankomst ca. 14:55', url: 'https://www.flightera.net/en/flight/SAS+Scandinavian+Airlines/SK909' },
      { code: 'SK910', route: 'Newark → København', time: 'Afgang kl. 17:15', url: 'https://www.flightera.net/en/flight/SAS+Scandinavian+Airlines/SK910' },
    ],
    hotel: {
      name: 'Millennium Hotel Times Square',
      note: 'Centralt beliggende ved Times Square — perfekt udgangspunkt for hele turen.',
      url: 'https://www.millenniumhotels.com/en/new-york/millennium-hotel-broadway-times-square/',
    },
    transportNotes: [
      'MetroCard eller OMNY til subway og bus',
      'NYC Ferry til ture langs vandet',
      'Gåafstand til mange attraktioner fra hotellet',
      'Subway er hurtigst til Brooklyn og Citi Field',
    ],
    generalNotes: [
      'Dobbelttjek åbningstider inden besøg',
      'Færgetider kan variere — tjek NYC Ferry-appen',
      'Book restauranter i forvejen hvor muligt',
      'Hav altid en powerbank med',
    ],
    emergencyContacts: [
      { label: 'Nødopkald (politi/brand/ambulance)', number: '911' },
      { label: 'Dansk ambassade i New York', number: '+1-212-223-4545', note: 'Hverdage 9-16' },
      { label: 'Millennium Hotel Times Square', number: '+1-212-768-4400' },
      { label: 'SAS kundeservice', number: '+45-70-10-20-00', note: 'Dansk support' },
      { label: 'Europæiske Rejseforsikring (SOS)', number: '+45-70-10-50-50', note: '24/7 nødhjælp' },
    ],
    checklist: [
      { id: 'pas', label: 'Pas (gyldigt mindst 6 mdr.)', category: 'Dokumenter' },
      { id: 'esta', label: 'ESTA-godkendelse', category: 'Dokumenter' },
      { id: 'forsikring', label: 'Rejseforsikring', category: 'Dokumenter' },
      { id: 'boardingpass', label: 'Boardingpass (digitalt/print)', category: 'Dokumenter' },
      { id: 'hotelbekraeft', label: 'Hotelbekræftelse', category: 'Dokumenter' },
      { id: 'gocity', label: 'GoCity-app installeret', category: 'Apps & digitalt' },
      { id: 'nycferry', label: 'NYC Ferry-app', category: 'Apps & digitalt' },
      { id: 'googlemaps', label: 'Google Maps offline-kort NYC', category: 'Apps & digitalt' },
      { id: 'powerbank', label: 'Powerbank (opladt)', category: 'Elektronik' },
      { id: 'adapter', label: 'Strømadapter (US)', category: 'Elektronik' },
      { id: 'ladekabel', label: 'Ladekabel til telefon', category: 'Elektronik' },
      { id: 'hoeretelefoner', label: 'Høretelefoner', category: 'Elektronik' },
      { id: 'comfyshoes', label: 'Gode gåsko', category: 'Tøj & personligt' },
      { id: 'jakke', label: 'Let jakke (april-vejr)', category: 'Tøj & personligt' },
      { id: 'medicin', label: 'Evt. medicin', category: 'Tøj & personligt' },
      { id: 'kreditkort', label: 'Kreditkort (Visa/Mastercard)', category: 'Økonomi' },
      { id: 'kontanter', label: 'Lidt USD kontanter til tips', category: 'Økonomi' },
    ],
  },
};
