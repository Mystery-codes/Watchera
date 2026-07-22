import { NextResponse } from "next/server";
import { fetchRanking, RANKING_IDS } from "@/lib/plexhd";

export async function GET() {
  const series = await fetchRanking(RANKING_IDS.popularSeries, 60);
  return NextResponse.json(series);
}
