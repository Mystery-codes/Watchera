export type Movie = {
  id: number;
  title: string;
  year: number;
  rating: string;
  duration: string;
  genres: string[];
  description: string;
  poster: string;
  banner: string;
  trending?: boolean;
  detailPath?: string;
  // 1 = movie, 2 = series (from the PlexHD API)
  subjectType?: number;
};

const poster = (seed: string) => `https://picsum.photos/seed/${seed}/400/600`;
const banner = (seed: string) => `https://picsum.photos/seed/${seed}/1600/900`;

export const movies: Movie[] = [
  {
    id: 1,
    title: "Crimson Horizon",
    year: 2024,
    rating: "TV-MA",
    duration: "2h 14m",
    genres: ["Sci-Fi", "Thriller"],
    description:
      "A lone pilot crash-lands on a dying colony world and must outwit a corporate war machine to reach the last rescue beacon.",
    poster: poster("crimson"),
    banner: banner("crimson"),
    trending: true,
  },
  {
    id: 2,
    title: "Neon Shadows",
    year: 2023,
    rating: "TV-14",
    duration: "1h 48m",
    genres: ["Cyberpunk", "Action"],
    description:
      "In a rain-soaked megacity, a memory thief discovers a conspiracy that could unravel the entire synthetic economy.",
    poster: poster("neon"),
    banner: banner("neon"),
    trending: true,
  },
  {
    id: 3,
    title: "The Last Harvest",
    year: 2022,
    rating: "PG-13",
    duration: "2h 02m",
    genres: ["Drama", "Romance"],
    description:
      "Two estranged siblings return to their family farm to confront the secrets that tore them apart a decade ago.",
    poster: poster("harvest"),
    banner: banner("harvest"),
    trending: true,
  },
  {
    id: 4,
    title: "Iron Vanguard",
    year: 2024,
    rating: "TV-MA",
    duration: "2h 31m",
    genres: ["Action", "War"],
    description:
      "An elite unit of mechanized soldiers races to stop a rogue AI from seizing control of the global defense grid.",
    poster: poster("iron"),
    banner: banner("iron"),
    trending: true,
  },
  {
    id: 5,
    title: "Whispering Pines",
    year: 2021,
    rating: "TV-14",
    duration: "1h 56m",
    genres: ["Horror", "Mystery"],
    description:
      "A true-crime podcaster vanishes while investigating disappearances in a remote mountain town with no cell signal.",
    poster: poster("pines"),
    banner: banner("pines"),
  },
  {
    id: 6,
    title: "Solar Drift",
    year: 2023,
    rating: "PG",
    duration: "1h 39m",
    genres: ["Adventure", "Family"],
    description:
      "A young astronomer and her robot companion build a solar sail to sail across the rings of Saturn.",
    poster: poster("solar"),
    banner: banner("solar"),
  },
  {
    id: 7,
    title: "Midnight Cartel",
    year: 2022,
    rating: "TV-MA",
    duration: "2h 09m",
    genres: ["Crime", "Drama"],
    description:
      "A rookie detective goes undercover in a smuggling ring and learns the boss is closer to home than she thought.",
    poster: poster("cartel"),
    banner: banner("cartel"),
  },
  {
    id: 8,
    title: "Echoes of Tomorrow",
    year: 2024,
    rating: "TV-14",
    duration: "2h 18m",
    genres: ["Sci-Fi", "Drama"],
    description:
      "After inventing a device that records future memories, a scientist must decide whether to change a tragic fate.",
    poster: poster("echoes"),
    banner: banner("echoes"),
    trending: true,
  },
  {
    id: 9,
    title: "Wildfire Hearts",
    year: 2021,
    rating: "PG-13",
    duration: "1h 51m",
    genres: ["Romance", "Drama"],
    description:
      "Two smokejumpers meet during the worst fire season on record and fall for each other between deployments.",
    poster: poster("wildfire"),
    banner: banner("wildfire"),
  },
  {
    id: 10,
    title: "The Glass Maze",
    year: 2023,
    rating: "TV-MA",
    duration: "1h 44m",
    genres: ["Thriller", "Mystery"],
    description:
      "A puzzle designer is trapped inside her own escape room by someone who knows every secret she ever buried.",
    poster: poster("glass"),
    banner: banner("glass"),
  },
  {
    id: 11,
    title: "Starlight Brigade",
    year: 2024,
    rating: "PG",
    duration: "2h 05m",
    genres: ["Animation", "Adventure"],
    description:
      "A ragtag crew of cadets steals a decommissioned starship to save their academy from a budget-cutting alien.",
    poster: poster("starlight"),
    banner: banner("starlight"),
  },
  {
    id: 12,
    title: "Frostbite Protocol",
    year: 2022,
    rating: "TV-MA",
    duration: "2h 22m",
    genres: ["Action", "Thriller"],
    description:
      "A polar research team uncovers a frozen organism that should have stayed buried beneath the ice.",
    poster: poster("frostbite"),
    banner: banner("frostbite"),
  },
  {
    id: 13,
    title: "Midnight in Harlem",
    year: 2024,
    rating: "TV-MA",
    duration: "1h 58m",
    genres: ["Drama", "Black Excellence", "Romance"],
    description:
      "A gifted musician returns home and confronts the town that once tried to make her disappear.",
    poster: poster("harlem"),
    banner: banner("harlem"),
  },
  {
    id: 14,
    title: "Velvet Heat",
    year: 2023,
    rating: "TV-MA",
    duration: "2h 07m",
    genres: ["Crime", "Gangster", "Drama"],
    description:
      "A rising organizer steps into a dangerous underworld where loyalty is worth more than money.",
    poster: poster("velvet"),
    banner: banner("velvet"),
  },
  {
    id: 15,
    title: "Moonlight Reels",
    year: 2022,
    rating: "PG",
    duration: "1h 29m",
    genres: ["Animation", "Family", "Adventure"],
    description:
      "A tiny studio animator discovers the secret that keeps the night sky alive for the whole city.",
    poster: poster("moonlight"),
    banner: banner("moonlight"),
  },
  {
    id: 16,
    title: "The Hollow House",
    year: 2021,
    rating: "TV-MA",
    duration: "1h 42m",
    genres: ["Horror", "Mystery"],
    description:
      "A group of friends enters a condemned mansion and learns the house remembers every guest.",
    poster: poster("hollow"),
    banner: banner("hollow"),
  },
  {
    id: 17,
    title: "Cherry Blossom Promise",
    year: 2024,
    rating: "TV-14",
    duration: "1h 47m",
    genres: ["C-Drama", "Romance", "Drama"],
    description:
      "Two former classmates reunite after a decade apart and discover their futures still intersect.",
    poster: poster("blossom"),
    banner: banner("blossom"),
  },
  {
    id: 18,
    title: "After the Bell",
    year: 2023,
    rating: "TV-14",
    duration: "1h 36m",
    genres: ["Teen Romance", "Drama", "Comedy"],
    description:
      "A shy student and the school’s most talked-about athlete form an unlikely bond over the summer.",
    poster: poster("bell"),
    banner: banner("bell"),
  },
  {
    id: 19,
    title: "City of Kings",
    year: 2022,
    rating: "TV-MA",
    duration: "2h 11m",
    genres: ["Gangster", "Crime", "Drama"],
    description:
      "Two rival crews fight for control of a port city as a detective closes in from the shadows.",
    poster: poster("kingcity"),
    banner: banner("kingcity"),
  },
  {
    id: 20,
    title: "The Underboss",
    year: 2021,
    rating: "TV-MA",
    duration: "1h 59m",
    genres: ["Gangster", "Crime", "Thriller"],
    description:
      "A loyal lieutenant must decide where his loyalty truly lies when the family business turns on itself.",
    poster: poster("underboss"),
    banner: banner("underboss"),
  },
  {
    id: 21,
    title: "Soul of the South",
    year: 2023,
    rating: "PG-13",
    duration: "2h 04m",
    genres: ["Black Excellence", "Drama", "Music"],
    description:
      "A young singer rises from a small-town choir to the biggest stage in the country against all odds.",
    poster: poster("soul"),
    banner: banner("soul"),
  },
  {
    id: 22,
    title: "Champions of the Court",
    year: 2024,
    rating: "PG",
    duration: "1h 52m",
    genres: ["Black Excellence", "Sports", "Drama"],
    description:
      "A overlooked high-school team defies expectations to reach the national basketball finals.",
    poster: poster("champions"),
    banner: banner("champions"),
  },
  {
    id: 23,
    title: "Jade Dynasty",
    year: 2022,
    rating: "TV-14",
    duration: "2h 16m",
    genres: ["C-Drama", "Fantasy", "Romance"],
    description:
      "A humble disciple uncovers a forbidden power that could reshape the fate of the cultivation world.",
    poster: poster("jade"),
    banner: banner("jade"),
  },
  {
    id: 24,
    title: "Lantern Festival",
    year: 2023,
    rating: "TV-14",
    duration: "1h 49m",
    genres: ["C-Drama", "Romance", "Drama"],
    description:
      "Two strangers keep meeting under the lantern lights of a city that never quite lets them go.",
    poster: poster("lantern"),
    banner: banner("lantern"),
  },
  {
    id: 25,
    title: "Prom Night Lights",
    year: 2021,
    rating: "PG-13",
    duration: "1h 41m",
    genres: ["Teen Romance", "Romance", "Comedy"],
    description:
      "A group of friends navigate the chaos of prom night and the confessions that come with it.",
    poster: poster("prom"),
    banner: banner("prom"),
  },
  {
    id: 26,
    title: "Summer of Us",
    year: 2024,
    rating: "TV-14",
    duration: "1h 38m",
    genres: ["Teen Romance", "Drama", "Romance"],
    description:
      "Two childhood friends realize their feelings have changed over one unforgettable summer.",
    poster: poster("summer"),
    banner: banner("summer"),
  },
];

export const rows: { title: string; movies: Movie[] }[] = [
  { title: "Trending Now", movies: movies.filter((m) => m.trending) },
  { title: "Top Picks for You", movies: movies.slice(0, 8) },
  { title: "Critically Acclaimed", movies: movies.slice(2, 10) },
  { title: "Award-Winning Films", movies: [...movies].reverse().slice(0, 8) },
  { title: "Because You Watched Sci-Fi", movies: movies.filter((m) => m.genres.includes("Sci-Fi")) },
];
