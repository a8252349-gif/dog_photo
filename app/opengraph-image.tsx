import { ImageResponse } from "next/og";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "70px 82px", background: "#f7f1e7", color: "#203642" }}>
      <div style={{ display: "flex", flexDirection: "column", width: 700 }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 3, marginBottom: 34 }}>PET ID PORTRAIT</div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 72, fontWeight: 900, lineHeight: 1.1, letterSpacing: -3 }}><span>Your pet,</span><span>exactly as they are.</span></div>
        <div style={{ fontSize: 25, color: "#657177", marginTop: 30 }}>1–3 reference photos · 7 backgrounds</div>
      </div>
      <div style={{ width: 320, height: 430, background: "#f4d86a", borderRadius: 160, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 130, fontWeight: 900 }}>P</div>
    </div>, size,
  );
}
