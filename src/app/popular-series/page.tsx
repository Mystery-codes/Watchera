import PopularSeriesBrowser from "./popular-series-browser";
import { fetchRanking, RANKING_IDS } from "@/lib/plexhd";

export default async function PopularSeriesPage() {
  const series = await fetchRanking(RANKING_IDS.popularSeries, 60);
  return <PopularSeriesBrowser initialSeries={series} />;
}
