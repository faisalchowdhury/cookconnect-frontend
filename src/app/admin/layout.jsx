import AdminShell from "../component/admin/AdminShell";

export const metadata = {
  title: "Administration — Nkhedmou.ma",
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
