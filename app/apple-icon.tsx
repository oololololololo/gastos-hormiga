import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
    width: 180,
    height: 180,
};
export const contentType = "image/png";

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 100,
                    background: "#1A1A1A", // Dark for Apple
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FAFAFA",
                    fontWeight: 600,
                }}
            >
                $
            </div>
        ),
        {
            ...size,
        }
    );
}
