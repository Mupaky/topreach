import { getSession } from "@/utils/lib";
import MyOrders from "@/pages/MyOrders";
import Navbar from "@/components/navbars/Navbar";

export default async function MyOrdersPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const user = session.user;

  return (
    <>
      <Navbar />
      <MyOrders userId={user.id} />
    </>
  );
}