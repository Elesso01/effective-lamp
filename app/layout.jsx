export const metadata = { title: "Crypto & AI News — local dev" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#0f172a", color: "#f8fafc", margin: 0 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: 24 }}>{children}</div>
      </body>
    </html>
  );
}
