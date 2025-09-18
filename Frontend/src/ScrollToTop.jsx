import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, key } = useLocation();

  useEffect(() => {
    // Scroll to top immediately
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use 'instant' to ensure immediate scroll
    });
    
    // Fallback: Also try document.documentElement.scrollTop for better browser compatibility
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0; // For older browsers
  }, [pathname, key]); // Adding 'key' ensures it triggers even for same-route navigation

  return null;
}
