import { ImageResponse } from "next/og";

export const alt = "Watchera | Movies and TV Shows";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "linear-gradient(135deg, #09090b 0%, #18181b 52%, #7f1d1d 150%)",
          color: "white",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
        }}
      >
        <div style={{ color: "#ef4444", fontSize: 34, fontWeight: 700, letterSpacing: 6 }}>WATCHERA</div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, marginTop: 24 }}>Movies and TV Shows</div>
        <div style={{ display: "flex", color: "#d4d4d8", fontSize: 30, marginTop: 28 }}>
          Discover your next favorite story.
        </div>
      </div>
    ),
    size
  );
}
