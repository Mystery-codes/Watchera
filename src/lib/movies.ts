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
];

export const rows: { title: string; movies: Movie[] }[] = [
  { title: "Trending Now", movies: movies.filter((m) => m.trending) },
  { title: "Top Picks for You", movies: movies.slice(0, 8) },
  { title: "Critically Acclaimed", movies: movies.slice(2, 10) },
  { title: "Award-Winning Films", movies: [...movies].reverse().slice(0, 8) },
  { title: "Because You Watched Sci-Fi", movies: movies.filter((m) => m.genres.includes("Sci-Fi")) },
];
