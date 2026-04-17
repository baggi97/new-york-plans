import { TripData } from './trip.interfaces';

export const TRIP_DATA: TripData = {
  title: 'New York',
  subtitle: 'A curated guide for two',
  dates: '22.–27. april 2026',
  travelers: '2 personer',
  days: [
    {
      id: 1,
      title: 'Ankomst + Times Square',
      date: '22. april',
      theme: 'Rolig start',
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
      food: [
        { name: "Tony's Di Napoli", note: 'Klassisk italiensk familierestaurant' },
        { name: 'The Smith', note: 'Moderne amerikansk brasserie' },
      ],
      transport: ['Newark → Manhattan', 'Hotel som udgangspunkt'],
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
      theme: 'Ikonisk NYC dag',
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
      food: [
        { name: 'Golden Diner', note: 'Moderne diner i Lower Manhattan' },
      ],
      transport: [
        'Subway fra hotel til Brooklyn',
        'Gåtur gennem Lower Manhattan',
        'NYC Ferry',
        'Subway til Citi Field',
      ],
      bookings: [{ label: '9/11 Museum', note: 'Husk at booke billet på forhånd' }],
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
          url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80',
          alt: 'DUMBO og Manhattan Bridge',
          hero: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1534251369789-5067c8b8602a?w=800&q=80',
          alt: 'Brooklyn Bridge',
        },
        {
          url: 'https://images.unsplash.com/photo-1565711561500-49678a10a63f?w=800&q=80',
          alt: '9/11 Memorial',
        },
      ],
    },
    {
      id: 3,
      title: 'Central Park + Midtown + Top of the Rock',
      date: '24. april',
      theme: 'Natur + klassisk NYC',
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
      food: [
        { name: 'Quality Italian', note: 'Upscale italiensk i Midtown' },
        { name: 'Osteria La Baia', note: 'Elegant italiensk' },
      ],
      transport: ['Primært gåafstand'],
      bookings: [{ label: 'Top of the Rock', note: 'Book billet til solnedgang' }],
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
          url: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800&q=80',
          alt: 'Bethesda Fountain',
        },
        {
          url: 'https://images.unsplash.com/photo-1600716051809-e997e11a5d52?w=800&q=80',
          alt: 'Top of the Rock udsigt',
        },
      ],
    },
    {
      id: 4,
      title: 'Chinatown + SoHo + DUMBO + Village',
      date: '25. april',
      theme: 'Mad + kvarterer + Brooklyn + filmspots',
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
      food: [
        { name: 'Don Angie', note: 'Kreativ italiensk i West Village' },
        { name: 'Via Carota', note: 'Populær italiensk trattoria' },
      ],
      transport: ['Subway + gåafstand'],
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
          url: 'https://images.unsplash.com/photo-1555992828-ca4dbe41d294?w=800&q=80',
          alt: 'SoHo gade',
        },
        {
          url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80',
          alt: 'Washington Square Park',
        },
      ],
    },
    {
      id: 5,
      title: 'Midtown + Empire State',
      date: '26. april',
      theme: 'Klassisk NYC + aftenoplevelse',
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
      food: [],
      transport: ['Gåafstand + subway'],
      bookings: [
        { label: 'Empire State Building', note: 'Aftenbillet anbefales' },
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
          url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
          alt: 'Grand Central Terminal',
        },
        {
          url: 'https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=800&q=80',
          alt: 'High Line Park',
        },
      ],
    },
    {
      id: 6,
      title: 'Afslutning + hjemrejse',
      date: '27. april',
      theme: 'Rolig afslutning',
      intro:
        'Den sidste morgen i New York. Tid til en langsom brunch, et sidste blik på byen og en stille afslutning på en uforglemmelig uge.',
      highlights: [
        'Sunday Morning brunch',
        'Sidste tur i området',
        'Evt. Bryant Park',
        'Afgang mod Newark',
        'SAS SK910 kl. 17:15',
      ],
      food: [],
      transport: ['Penn Station → Newark', 'Hotel som udgangspunkt'],
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
          url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',
          alt: 'Brunch i New York',
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
      { code: 'SK909', route: 'København → Newark', time: 'Ankomst ca. 14:55' },
      { code: 'SK910', route: 'Newark → København', time: 'Afgang kl. 17:15' },
    ],
    hotel: {
      name: 'Millennium Hotel Times Square',
      note: 'Centralt beliggende ved Times Square — perfekt udgangspunkt for hele turen.',
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
  },
};
