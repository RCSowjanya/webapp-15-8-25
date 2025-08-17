import ClientLayout from "../../components/layout/ClientLayout";
import React from "react";
import { auth } from "./auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
export default async function Layout({ children }) {
  const session = await auth();
  //console.log("session at layout is", session?.token)
  if(!session?.token){   
    redirect("/login");
  }
  return <SessionProvider><ClientLayout>{children}</ClientLayout></SessionProvider>;
}
