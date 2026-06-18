export type StarterCategory = 'tv' | 'movies' | 'sports' | 'games';

export const CATEGORY_LABELS: Record<StarterCategory, string> = {
  tv: 'TV Shows',
  movies: 'Movies',
  sports: 'Sports',
  games: 'Games',
};

export type StarterTopic = {
  category: StarterCategory;
  name: string;
  expansions: string[];
};

export const STARTER_TOPICS: StarterTopic[] = [
  // ─── TV ───
  {
    category: 'tv',
    name: 'Succession',
    expansions: [
      'Logan Roy', 'Kendall Roy', 'Shiv Roy', 'Roman Roy', 'Connor Roy',
      'Tom Wambsgans', 'Wambsgans', 'Greg Hirsch', 'Cousin Greg',
      'Gerri Kellman', 'Karl Muller', 'Frank Vernon', 'Stewy Hosseini',
      'Waystar Royco', 'Waystar', 'ATN News', 'Pierce Global Media',
      'Brian Cox', 'Jeremy Strong', 'Sarah Snook', 'Kieran Culkin', 'Matthew Macfadyen',
    ],
  },
  {
    category: 'tv',
    name: 'Severance',
    expansions: [
      'Mark Scout', 'Helly R', 'Helly Riggs', 'Irving Bailiff', 'Dylan George',
      'Harmony Cobel', 'Cobel', 'Seth Milchick', 'Milchick',
      'Burt Goodman', 'Reghabi', 'Devon Scout', 'Ricken Hale',
      'Ms. Casey', 'Ms. Huang', 'Petey Kilmer',
      'Lumon Industries', 'Lumon', 'Macrodata Refinement', 'MDR',
      'Kier Eagan', 'Eagan family',
      'Adam Scott', 'Britt Lower', 'John Turturro', 'Patricia Arquette', 'Tramell Tillman',
    ],
  },
  {
    category: 'tv',
    name: 'The Last of Us',
    expansions: [
      'Joel Miller', 'Ellie Williams', 'Tess Servopoulos',
      'Tommy Miller', 'Sarah Miller', 'Marlene', 'Riley Abel',
      'Abby Anderson', 'Lev', 'Dina',
      'Bill', 'Frank', 'Kathleen', 'David',
      'Cordyceps', 'infected', 'clickers', 'bloaters', 'fireflies',
      'Pedro Pascal', 'Bella Ramsey',
    ],
  },
  {
    category: 'tv',
    name: 'House of the Dragon',
    expansions: [
      'Rhaenyra Targaryen', 'Daemon Targaryen', 'Alicent Hightower',
      'Viserys Targaryen', 'Aegon Targaryen', 'Aegon II',
      'Aemond Targaryen', 'Aemond', 'Helaena Targaryen',
      'Otto Hightower', 'Criston Cole', 'Larys Strong',
      'Corlys Velaryon', 'Rhaenys Targaryen', 'Laenor Velaryon',
      'Dance of the Dragons', 'Targaryens', 'Hightowers', 'Velaryons',
      'Iron Throne', 'Dragonstone', "King's Landing", 'Westeros',
      'Caraxes', 'Vhagar', 'Syrax', 'Meleys',
    ],
  },
  {
    category: 'tv',
    name: 'The Bear',
    expansions: [
      'Carmen Berzatto', 'Carmy', 'Sydney Adamu', 'Sidney',
      'Richie Jerimovich', 'Tina Marrero', 'Marcus Brooks',
      'Mikey Berzatto', 'Natalie Berzatto', 'Sugar',
      'Pete', 'Fak', 'Neil Fak',
      'The Beef', 'The Original Beef of Chicagoland',
      'Jeremy Allen White', 'Ayo Edebiri', 'Ebon Moss-Bachrach',
    ],
  },
  {
    category: 'tv',
    name: 'Stranger Things',
    expansions: [
      'Eleven', 'Mike Wheeler', 'Will Byers', 'Dustin Henderson',
      'Lucas Sinclair', 'Max Mayfield', 'Nancy Wheeler', 'Steve Harrington',
      'Jonathan Byers', 'Robin Buckley', 'Jim Hopper', 'Joyce Byers',
      'Eddie Munson',
      'Vecna', 'Demogorgon', 'Mind Flayer',
      'Hawkins', 'Upside Down', 'Hawkins Lab',
      'Millie Bobby Brown', 'David Harbour', 'Winona Ryder',
    ],
  },
  {
    category: 'tv',
    name: 'The Mandalorian',
    expansions: [
      'Mando', 'Din Djarin', 'Grogu', 'Baby Yoda',
      'Bo-Katan Kryze', 'Moff Gideon', 'Boba Fett',
      'Cara Dune', 'Greef Karga', 'Ahsoka Tano',
      'Mandalorians', 'Mandalore', 'darksaber',
      'Pedro Pascal',
    ],
  },
  {
    category: 'tv',
    name: 'Wednesday',
    expansions: [
      'Wednesday Addams', 'Pugsley Addams', 'Gomez Addams', 'Morticia Addams',
      'Tyler Galpin', 'Xavier Thorpe', 'Enid Sinclair',
      'Bianca Barclay', 'Eugene Otinger', 'Ajax Petropolus',
      'Nevermore Academy', 'Nevermore', 'Jericho',
      'Hyde', 'Larissa Weems',
      'Jenna Ortega',
    ],
  },
  {
    category: 'tv',
    name: 'Andor',
    expansions: [
      'Cassian Andor', 'Luthen Rael', 'Vel Sartha',
      'Mon Mothma', 'Bix Caleen', 'Brasso',
      'Dedra Meero', 'Syril Karn', 'Saw Gerrera',
      'Maarva Andor', 'Kino Loy',
      'Aldhani', 'Ferrix', 'Narkina 5',
      'Imperial Security Bureau', 'ISB', 'Rebel Alliance',
      'Diego Luna', 'Stellan Skarsgård', 'Genevieve O\'Reilly',
    ],
  },
  {
    category: 'tv',
    name: 'The White Lotus',
    expansions: [
      'Tanya McQuoid', 'Quentin', 'Portia',
      'Daphne Sullivan', 'Cameron Sullivan',
      'Harper Spiller', 'Ethan Spiller',
      'Albie Di Grasso', 'Dominic Di Grasso', 'Bert Di Grasso',
      'Lucia Greco', 'Mia', 'Valentina',
      'Rachel Patton', 'Shane Patton', 'Armond',
      'White Lotus Resort',
      'Jennifer Coolidge', 'Mike White',
    ],
  },

  // ─── Movies ───
  {
    category: 'movies',
    name: 'Marvel',
    expansions: [
      'MCU', 'Avengers',
      'Tony Stark', 'Iron Man',
      'Steve Rogers', 'Captain America',
      'Thor Odinson', 'Bruce Banner', 'Hulk',
      'Natasha Romanoff', 'Black Widow', 'Clint Barton', 'Hawkeye',
      'Thanos', 'Loki', 'Doctor Strange', 'Wanda Maximoff', 'Scarlet Witch',
      "T'Challa", 'Black Panther', 'Carol Danvers', 'Captain Marvel',
      'Peter Parker', 'Spider-Man', 'Kang', 'Multiverse',
      'Wakanda', 'Asgard',
    ],
  },
  {
    category: 'movies',
    name: 'Star Wars',
    expansions: [
      'Skywalker', 'Luke Skywalker', 'Anakin Skywalker',
      'Leia Organa', 'Han Solo', 'Chewbacca',
      'Darth Vader', 'Emperor Palpatine', 'Darth Sidious',
      'Kylo Ren', 'Ben Solo', 'Rey Skywalker',
      'Obi-Wan Kenobi', 'Yoda', 'Mace Windu',
      'Jedi', 'Sith', 'lightsaber', 'the Force',
      'Death Star', 'Tatooine', 'Coruscant', 'Naboo',
      'Galactic Empire', 'Rebel Alliance', 'First Order',
    ],
  },
  {
    category: 'movies',
    name: 'Dune',
    expansions: [
      'Paul Atreides', "Paul Muad'Dib", 'Chani',
      'Lady Jessica', 'Duncan Idaho', 'Leto Atreides', 'Gurney Halleck',
      'Baron Harkonnen', 'Feyd-Rautha', 'Glossu Rabban',
      'Stilgar', 'Liet-Kynes', 'Princess Irulan',
      'Arrakis', 'Caladan', 'Giedi Prime',
      'Fremen', 'Bene Gesserit', 'Sardaukar',
      'sandworm', 'Shai-Hulud', 'spice', 'melange',
      'Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson',
    ],
  },
  {
    category: 'movies',
    name: 'Spider-Verse',
    expansions: [
      'Miles Morales', 'Gwen Stacy', 'Spider-Gwen',
      'Peter B Parker', 'Peni Parker', 'Spider-Ham',
      "Miguel O'Hara", 'Spider-Man 2099',
      'Hobie Brown', 'Spider-Punk', 'Pavitr Prabhakar',
      'Jefferson Davis', 'Rio Morales',
      'Spider-Society', 'multiverse',
      'Across the Spider-Verse', 'Beyond the Spider-Verse',
    ],
  },

  // ─── Sports ───
  {
    category: 'sports',
    name: 'NFL',
    expansions: [
      'Super Bowl', 'AFC Championship', 'NFC Championship',
      'Patrick Mahomes', 'Travis Kelce', 'Andy Reid',
      'Kansas City Chiefs', 'Chiefs',
      'Philadelphia Eagles', 'Eagles',
      'Buffalo Bills', 'Bills',
      'Detroit Lions', 'San Francisco 49ers', '49ers',
      'Dallas Cowboys', 'Cowboys',
      'Lamar Jackson', 'Josh Allen', 'Joe Burrow', 'Jalen Hurts',
    ],
  },
  {
    category: 'sports',
    name: 'NBA',
    expansions: [
      'NBA Finals', 'Eastern Conference Finals', 'Western Conference Finals',
      'Boston Celtics', 'Celtics',
      'Denver Nuggets', 'Nuggets', 'Nikola Jokic',
      'Los Angeles Lakers', 'Lakers', 'LeBron James',
      'Golden State Warriors', 'Warriors', 'Stephen Curry', 'Steph Curry',
      'Luka Doncic', 'Jayson Tatum', 'Giannis Antetokounmpo',
      'Shai Gilgeous-Alexander', 'Anthony Edwards',
    ],
  },
  {
    category: 'sports',
    name: 'Premier League',
    expansions: [
      'Premier League', 'EPL',
      'Manchester City', 'Man City', 'Pep Guardiola',
      'Arsenal', 'Mikel Arteta',
      'Liverpool', 'Manchester United', 'Man United', 'Man Utd',
      'Chelsea', 'Tottenham', 'Spurs',
      'Erling Haaland', 'Mohamed Salah', 'Bukayo Saka', 'Bruno Fernandes',
    ],
  },
  {
    category: 'sports',
    name: 'Formula 1',
    expansions: [
      'Formula 1', 'F1', 'Grand Prix',
      'Max Verstappen', 'Verstappen', 'Lewis Hamilton',
      'Charles Leclerc', 'Leclerc', 'Lando Norris',
      'Carlos Sainz', 'George Russell', 'Oscar Piastri',
      'Red Bull Racing', 'Red Bull', 'Mercedes', 'Ferrari', 'McLaren', 'Aston Martin',
      'Monaco GP', 'British GP', 'Italian GP', 'Belgian GP', 'Singapore GP',
    ],
  },
  {
    category: 'sports',
    name: 'Champions League',
    expansions: [
      'Champions League', 'UCL', 'UEFA',
      'Real Madrid', 'Barcelona', 'Bayern Munich',
      'Manchester City', 'PSG', 'Paris Saint-Germain',
      'Inter Milan', 'Borussia Dortmund', 'Arsenal',
      'Vinicius Jr', 'Kylian Mbappe', 'Jude Bellingham',
    ],
  },

  // ─── Games ───
  {
    category: 'games',
    name: 'GTA 6',
    expansions: [
      'Grand Theft Auto VI', 'Grand Theft Auto 6', 'GTA VI',
      'Vice City', 'Leonida',
      'Jason', 'Lucia',
      'Rockstar Games', 'Take-Two Interactive',
    ],
  },
  {
    category: 'games',
    name: 'Elder Scrolls 6',
    expansions: [
      'Elder Scrolls VI', 'TES6', 'TES VI',
      'Bethesda Game Studios', 'Bethesda',
      'Tamriel', 'Hammerfell', 'High Rock',
    ],
  },
  {
    category: 'games',
    name: 'Silksong',
    expansions: [
      'Hollow Knight Silksong', 'Hollow Knight',
      'Hornet', 'Pharloom',
      'Team Cherry',
    ],
  },
  {
    category: 'games',
    name: 'Death Stranding 2',
    expansions: [
      'Death Stranding', 'Death Stranding 2',
      'Sam Porter Bridges', 'Sam Bridges',
      'Norman Reedus', 'Hideo Kojima', 'Kojima Productions',
    ],
  },
];