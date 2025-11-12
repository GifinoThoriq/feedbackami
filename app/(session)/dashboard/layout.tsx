import HeaderNav from "@/components/dashboard/header-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <HeaderNav children={children} />
    </section>
  );
}
