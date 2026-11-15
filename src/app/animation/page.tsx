import AnimationPage from "./animation-browser";
import { fetchRanking, RANKING_IDS } from "@/lib/plexhd";

export default async function AnimationRoute() {
  const movies = await fetchRanking(RANKING_IDS.animation, 60);
  return <AnimationPage movies={movies} />;
}
