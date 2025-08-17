"use client";

import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


const LoginSlider = () => {
    const slides = [
        {
          image: "/images/beach.svg",
          title: "Discover Your Dream Getaway with a Tap!",
          description:
            "Unearth your perfect escape in just a few taps, a world of options awaits!",
        },
        {
          image: "/images/smart-lock.svg",
          title: "Seamless, Keyless Entry Awaits!",
          description:
            "Step into a keyless future—seamless, secure entry at your fingertips!",
        },
        {
          image: "/images/launch.svg",
          title: "Paperless Check-In and Check-Out!",
          description:
            "Your mobile check-in and checkout ignite your vacation from the moment you step in!",
        },
      ];
    
      const [isMounted, setIsMounted] = useState(false);
      useEffect(() => {
        setIsMounted(true);
      }, []);
    
      const settings = {
        dots: true,
        arrows: false,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        dotsClass: "slick-dots custom-dots", // Custom class
      };
    
  return (

   <div className="w-1/2 bg-custom text-white relative flex  max-[1000px]:w-full max-[1000px]:h-full flex-col items-center justify-center">
   {/* Absolute icons */}
   <div>
     <img
       src="/images/home.svg"
       className="w-5 h-5 absolute top-8 left-7"
       alt=""
     />
     <img
       src="/images/home.svg"
       className="w-5 h-5 absolute top-3 right-11"
       alt=""
     />
     <img
       src="/images/card.svg"
       className="w-5 h-5 absolute bottom-11 left-20 max-[600px]:left-10"
       alt=""
     />
     <img
       src="/images/home.svg"
       className="w-5 h-5 absolute bottom-14 right-20 max-[600px]:right-10"
       alt=""
     />
     <img
       src="/images/key.svg"
       className="w-5 h-5 absolute top-[35%] right-11"
       alt=""
     />
     <img
       src="/images/card.svg"
       className="w-5 h-5 absolute top-[38%] left-8"
       alt=""
     />
   </div>

   {/* Slick Slider */}
   {isMounted && (
     <Slider {...settings} className="w-full">
       {slides.map((slide, idx) => (
         <div
           key={idx}
           className="text-center" 
         >
           <img
             src={slide.image}
             alt="slide"
             className="w-44 h-44 mb-11 mx-auto" 
           />
           <h2 className="text-xl font-bold mb-3 ">{slide.title}</h2>
           <p className="text-md max-w-xs mx-auto">
             {slide.description}
           </p>
         </div>
       ))}
     </Slider>
   )}
 </div>

  )
}

export default LoginSlider