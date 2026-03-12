import React from 'react';

const CTAButton = ({ children, variant = "primary", className = "", ...props }) => {
 const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out rounded-full shadow-sm";
 const variants = {
 primary: "bg-black text-white hover:bg-gray-800 :bg-gray-200 px-6 py-3 text-sm md:text-base",
 secondary: "bg-white text-black border border-gray-200 hover:bg-gray-50 :bg-gray-900 px-6 py-3 text-sm md:text-base",
 };

 return (
 <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
 {children}
 </button>
 );
};

export default CTAButton;
