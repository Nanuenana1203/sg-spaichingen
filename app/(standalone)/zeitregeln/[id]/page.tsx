export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const EditClient = (await import("./EditClient")).default;
  return <EditClient id={Number(id)} />;
}
