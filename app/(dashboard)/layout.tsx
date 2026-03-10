import ProtectedLayout from '@/components/ProtectedLayout'

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
