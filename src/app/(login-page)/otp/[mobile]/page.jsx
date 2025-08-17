
import React from 'react'
import OTPScreen from "../../../../components/Login/OTPScreen";
const OTP = async ({params}) => {
 const param= await params
 //console.log(param)
 
  return (
    <div>
        <OTPScreen mobileparam={param.mobile||""}/>
    </div>
  )
}

export default OTP