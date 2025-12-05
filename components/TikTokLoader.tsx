"use client";

interface TikTokLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function TikTokLoader({ size = "md", className = "" }: TikTokLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const dotSizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2.5 h-2.5",
    lg: "w-3.5 h-3.5",
  };

  const containerPadding = {
    sm: "p-2",
    md: "p-3",
    lg: "p-4",
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Outer rotating circle with gradient */}
      <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full"></div>
      <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 rounded-full animate-spin-tiktok"></div>
      
      {/* Dots rotating around the circle */}
      <div className={`absolute inset-0 ${containerPadding[size]} animate-spin-tiktok-reverse`}>
        <div 
          className={`absolute top-0 left-1/2 -translate-x-1/2 ${dotSizeClasses[size]} bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse-tiktok`} 
          style={{ animationDelay: '0s' }}
        ></div>
        <div 
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 ${dotSizeClasses[size]} bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse-tiktok`} 
          style={{ animationDelay: '0.15s' }}
        ></div>
        <div 
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 ${dotSizeClasses[size]} bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse-tiktok`} 
          style={{ animationDelay: '0.3s' }}
        ></div>
        <div 
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 ${dotSizeClasses[size]} bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse-tiktok`} 
          style={{ animationDelay: '0.45s' }}
        ></div>
      </div>
      
      {/* Center pulsing dot */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${dotSizeClasses[size]} bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse`}></div>
    </div>
  );
}

