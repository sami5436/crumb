import { ImageResponse } from "next/og";

export const alt = "Crumb — a sourdough starter log";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "#faf6ef",
          backgroundImage: "radial-gradient(#e7dcc9 2px, transparent 2px)",
          backgroundSize: "44px 44px",
          color: "#2b221a",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#c1662f",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 40, letterSpacing: -1 }}>Crumb</div>
        </div>
        <div style={{ fontSize: 84, marginTop: 34, lineHeight: 1.1, letterSpacing: -2 }}>
          A feeding log for your sourdough starter.
        </div>
        <div style={{ fontSize: 34, marginTop: 28, color: "#7d6c59" }}>
          Track every feed · learn its peak time · bake at the right hour
        </div>
      </div>
    ),
    size,
  );
}
