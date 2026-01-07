export const metadata = { title: "SGS" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="bg-[#f3f4f6] min-h-screen">{children}</div>;
}
