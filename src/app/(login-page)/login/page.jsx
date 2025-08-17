
import LoginScreen from "../../../components/Login/LoginScreen"
import React from 'react'
import { auth } from "../../../app/(dashboard-screens)/auth";
import { redirect } from "next/navigation";
const login =async () => {
  const session = await auth();
  //console.log("session is at login",session?.token);
  // if(session?.accesstoken !== "undefined" || session!==null){
  //   return redirect('/dashboard')
  // }
  if (session?.token) {
    return redirect('/livefeed')
  }
  return (
    <div>
        <LoginScreen/>
    </div>
  )
}

export default login