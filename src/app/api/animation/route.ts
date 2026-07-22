import { NextResponse } from "next/server";
import { fetchRanking, RANKING_IDS } from "@/lib/plexhd";

export async function GET() {
  const movies = await fetchRanking(RANKING_IDS.animation, 60);
  return NextResponse.json(movies);
}
