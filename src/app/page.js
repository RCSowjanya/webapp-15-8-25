import { redirect } from "next/navigation";
import { auth } from "../app/(dashboard-screens)/auth";

export default async function Home() {
  const session = await auth();
  
  if (session?.token) {
    redirect("/livefeed");
  } else {
    redirect("/login");
  }
}
