import UserLayout from "./UserLayout";

/* Admin shell reuses the operations layout with elevated nav context.
   Role gating is enforced server-side; this keeps one aligned shell. */
export default function AdminLayout() {
  return <UserLayout />;
}
