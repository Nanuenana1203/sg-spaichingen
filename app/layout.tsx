import "./globals.css";

export const metadata = { title: "SGS" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-[#f3f4f6] min-h-screen">
        {children}
      </body>
    </html>
  );
}