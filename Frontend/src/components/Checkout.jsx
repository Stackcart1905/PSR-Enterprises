import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import api from "../lib/axios";
import useAuthStore from "../store/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  MapPin,
  Phone,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart, isCartLoading } = useCart();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markerRef = useRef(null);
  const deliveryCircleRef = useRef(null);
  const autocompleteRef = useRef(null);

  // ─── State ─────────────────────────────────────
  const [formData, setFormData] = useState({
    addressText: "",
    contactNumber: "",
    coordinates: null,
  });
  const [phoneError, setPhoneError] = useState("");
  const [pincode, setPincode] = useState(""); // Separate optional pincode field

  const [locationStatus, setLocationStatus] = useState("idle"); // idle | loading | success | error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] =
    useState("prompt"); // prompt | granted | denied | unsupported
  const [error, setError] = useState("");
  const [distance, setDistance] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null); // null | { orderNumber, totalAmount }

  // ─── Phone Number Validation ─────────────────────────────────────
  const handlePhoneChange = (e) => {
    let value = e.target.value;

    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, "");

    // Limit to 10 digits
    const limitedDigits = digitsOnly.slice(0, 10);

    // Update form data with just the digits
    setFormData({
      ...formData,
      contactNumber: limitedDigits,
    });

    // Validate phone number
    if (limitedDigits.length === 0) {
      setPhoneError("Phone number is required");
    } else if (limitedDigits.length < 10) {
      setPhoneError("Please enter a valid 10-digit phone number");
    } else if (!/^[6-9]/.test(limitedDigits)) {
      setPhoneError("Phone number must start with 6, 7, 8, or 9");
    } else {
      setPhoneError("");
    }
  };

  const formatPhoneNumberForDisplay = (phone) => {
    if (!phone) return "+91 ";
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 0) return "+91 ";
    if (digits.length <= 5) return `+91 ${digits}`;
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
  };

  // ─── Effects ─────────────────────────────────────
  const isSubmitLocked = useRef(false);

  // ─── JS-API / Map init ───────────────────────
  const loadGoogleMapsScript = (callback) => {
    if (window.google && window.google.maps) {
      callback();
      return;
    }

    const scriptId = "google-maps-script";
    if (document.getElementById(scriptId)) {
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError(
        "Google Maps API key is not configured. Please contact support.",
      );
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => callback();
    script.onerror = () => {
      setError("Unable to load Google Maps. Please try again later.");
    };
    document.head.appendChild(script);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLocationPermissionStatus("unsupported");
      return;
    }

    setLocationPermissionStatus("prompt");
    setLocationStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationPermissionStatus("granted");
        const { latitude, longitude } = position.coords;
        console.log("📍 Current location obtained:", latitude, longitude);

        // Update map center and add marker
        if (googleMapRef.current && markerRef.current) {
          googleMapRef.current.setCenter({ lat: latitude, lng: longitude });
          markerRef.current.setPosition({ lat: latitude, lng: longitude });

          // Update form with coordinates
          setFormData((prev) => ({
            ...prev,
            coordinates: { lat: latitude, lng: longitude },
          }));

          // Reverse geocode to get address
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              if (status === "OK" && results[0]) {
                const address = results[0].formatted_address;
                setFormData((prev) => ({
                  ...prev,
                  addressText: address,
                  coordinates: { lat: latitude, lng: longitude },
                }));
                console.log("📍 Address from current location:", address);

                // Automatically verify location after getting current location
                setTimeout(() => {
                  handleVerifyLocation();
                }, 1000);
              }
            },
          );
        }
      },
      (error) => {
        console.error("❌ Geolocation error:", error);
        let errorMessage = "Unable to get your location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable location access in your browser settings.";
            setLocationPermissionStatus("denied");
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        setError(errorMessage);
        setLocationStatus("error");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    );
  };

  const initGoogleMap = () => {
    if (!window.google || !mapRef.current) return;

    if (googleMapRef.current) return; // already initialized

    const defaultCenter = { lat: 28.7041, lng: 77.1025 }; // New Delhi fallback
    const shopLocation = { lat: 26.1209, lng: 85.3647 }; // Shop coordinates from env

    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: false,
      scaleControl: true,
      gestureHandling: "greedy",
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
    });

    // Add delivery radius circle
    deliveryCircleRef.current = new window.google.maps.Circle({
      map: googleMapRef.current,
      center: shopLocation,
      radius: 5000, // 5km in meters
      strokeColor: "#10b981",
      strokeOpacity: 0.3,
      strokeWeight: 2,
      fillColor: "#10b981",
      fillOpacity: 0.1,
      clickable: false,
    });

    markerRef.current = new window.google.maps.Marker({
      map: googleMapRef.current,
      position: defaultCenter,
      draggable: true,
      title: "Drag to select location",
      animation: window.google.maps.Animation.DROP,
    });
    markerRef.current.setMap(googleMapRef.current);

    markerRef.current.addListener("dragend", async (ev) => {
      const coords = {
        lat: ev.latLng.lat(),
        lng: ev.latLng.lng(),
      };
      setFormData((prev) => ({ ...prev, coordinates: coords }));
      await handleReverseGeocode(coords);
      updateDistanceDisplay(coords);
      setLocationStatus("success");
      setError("");
    });

    googleMapRef.current.addListener("click", async (ev) => {
      const coords = {
        lat: ev.latLng.lat(),
        lng: ev.latLng.lng(),
      };
      markerRef.current.setPosition(coords);
      googleMapRef.current.panTo(coords);
      setFormData((prev) => ({ ...prev, coordinates: coords }));
      await handleReverseGeocode(coords);
      updateDistanceDisplay(coords);
      setLocationStatus("success");
      setError("");
    });

    const input = document.getElementById("addressText");
    if (input) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        input,
        {
          fields: ["geometry", "formatted_address", "address_components"],
        },
      );
      autocompleteRef.current.addListener("place_changed", async () => {
        const place = autocompleteRef.current.getPlace();
        if (!place.geometry) {
          setError("Please choose a valid address from suggestions.");
          return;
        }

        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        markerRef.current.setPosition(coords);
        googleMapRef.current.panTo(coords);

        const addressPostalComponent = place.address_components?.find((comp) =>
          comp.types.includes("postal_code"),
        );

        setFormData((prev) => ({
          ...prev,
          addressText: place.formatted_address || prev.addressText,
          coordinates: coords,
        }));
        // Extract pincode if available, but don't require it
        setPincode(
          addressPostalComponent ? addressPostalComponent.long_name : "",
        );
        updateDistanceDisplay(coords);
        setLocationStatus("success");
        setError("");
      });
    }
  };

  const handleReverseGeocode = async (coords) => {
    if (!window.google || !coords) return;
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat: coords.lat, lng: coords.lng };

    try {
      const results = await geocoder.geocode({ location: latlng });
      if (results.status === "OK" && results.results[0]) {
        const place = results.results[0];
        const geocodePostalComponent = place.address_components?.find((comp) =>
          comp.types.includes("postal_code"),
        );

        setFormData((prev) => ({
          ...prev,
          addressText: place.formatted_address || prev.addressText,
        }));
        // Extract pincode if available, but don't require it
        setPincode(
          geocodePostalComponent ? geocodePostalComponent.long_name : "",
        );
      }
    } catch (err) {
      console.warn("Reverse geocode failed", err);
    }
  };

  // Update distance display and map visual indicators
  const updateDistanceDisplay = (coords) => {
    if (!coords) return;

    const shopLocation = { lat: 26.1209, lng: 85.3647 };
    const distance = calculateDistance(
      coords.lat,
      coords.lng,
      shopLocation.lat,
      shopLocation.lng,
    );
    setDistance(distance);

    // Update circle to show distance from shop
    if (deliveryCircleRef.current) {
      deliveryCircleRef.current.setCenter(coords);
      deliveryCircleRef.current.setRadius(Math.max(distance * 1000, 1000)); // Show at least 1km radius
    }
  };

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    loadGoogleMapsScript(initGoogleMap);
  }, []);

  // ─── Geocoding / Delivery verification handler ───────────────────────
  const handleVerifyLocation = async () => {
    const address = formData.addressText?.trim();
    const coords = formData.coordinates;

    // Address is now required
    if (!address) {
      setError("Please enter your delivery address.");
      return;
    }

    setLocationStatus("loading");
    setError("");

    try {
      console.log(
        `📡 Verifying location: "${address}" coords: ${coords ? `${coords.lat}, ${coords.lng}` : "none"}`,
      );
      const response = await api.post("/api/orders/validate-delivery", {
        address,
        pincode: pincode || "", // Send pincode if available
        coordinates: coords,
      });

      if (response.data.success) {
        const maxDeliveryDistance = 5; // 5km delivery radius
        const deliveredDistance = parseFloat(response.data.distance);

        setFormData((prev) => ({
          ...prev,
          coordinates: response.data.coordinates || prev.coordinates,
        }));
        setDistance(deliveredDistance);

        if (
          typeof deliveredDistance === "number" &&
          deliveredDistance <= maxDeliveryDistance
        ) {
          setLocationStatus("success");
          setError("");
        } else {
          setLocationStatus("error");
          setError(
            `Delivery address is ${deliveredDistance.toFixed(1)} km away. We only deliver within ${maxDeliveryDistance} km.`,
          );
        }
      }
    } catch (err) {
      setLocationStatus("error");
      const serverMessage = err.response?.data?.message;
      setError(
        serverMessage ||
          "Could not verify this address. Please try being more specific.",
      );
    }
  };

  // ─── Validation ───────────────────────────────
  const validateBeforeSubmit = () => {
    if (!cartItems || cartItems.length === 0) {
      setError("Your cart is empty. Please add items before placing an order.");
      return false;
    }
    if (
      phoneError ||
      !formData.contactNumber ||
      formData.contactNumber.length !== 10
    ) {
      setError(
        "Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9.",
      );
      return false;
    }

    // Address is now required
    if (!formData.addressText || formData.addressText.trim().length < 10) {
      setError("Please enter your complete delivery address.");
      return false;
    }

    // Pincode is now optional - only validate if provided
    if (pincode && !/^\d{6}$/.test(pincode.trim())) {
      setError("Please enter a valid 6-digit pincode.");
      return false;
    }

    // Require location verification (address-based)
    if (locationStatus !== "success") {
      setError("Please verify your delivery address before placing an order.");
      return false;
    }
    return true;
  };

  // ─── Controlled Submit Handler ────────────────
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Prevent double-submit
    if (isSubmitLocked.current || isSubmitting) return;

    // Run all validations
    if (!validateBeforeSubmit()) return;

    // Lock submission
    isSubmitLocked.current = true;
    setIsSubmitting(true);
    setError("");

    try {
      // Build cart payload — only IDs and quantities (backend validates prices)
      const cartItemsForOrder = cartItems.map((item) => ({
        productId: item.id || item._id,
        quantity: item.quantity,
      }));

      console.log(
        "📦 Placing order with",
        cartItemsForOrder.length,
        "items:",
        cartItemsForOrder,
      );

      const response = await api.post("/api/orders", {
        deliveryInfo: {
          addressText: formData.addressText.trim(),
          pincode: pincode.trim() || "", // Send pincode if available
          contactNumber: `+91${formData.contactNumber.trim()}`,
          coordinates: formData.coordinates, // Already resolved via handleVerifyLocation
        },
        cartItems: cartItemsForOrder,
      });

      if (response.data.success) {
        // ✅ ORDER SUCCESSFUL — Show success state FIRST, then navigate
        const order = response.data.order;
        setOrderSuccess({
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
        });

        // Clear cart (local + DB) AFTER setting success state
        clearCart();

        console.log("✅ Order placed successfully:", order.orderNumber);
      } else {
        // Unexpected non-success response
        setError(
          response.data.message || "Something went wrong. Please try again.",
        );
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      const serverMessage = err.response?.data?.message;
      if (serverMessage) {
        setError(serverMessage);
      } else if (err.code === "ERR_NETWORK") {
        setError(
          "Connection failed. Please check if the server is running and try again.",
        );
      } else {
        setError(
          "Failed to place order. Please check your internet connection and try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
      isSubmitLocked.current = false;
    }
  };

  // ─── Loading State ────────────────────────────
  if (isCartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Loading your secure checkout...
          </p>
        </div>
      </div>
    );
  }

  // ─── Authentication Check ───────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full text-center border-none shadow-xl">
          <CardContent className="py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Please Login First
            </h2>
            <p className="text-gray-500 mb-8">
              You need to be logged in to place an order. Please sign in to
              continue with checkout.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate("/login")}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 px-6"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                variant="outline"
                className="flex-1 border-green-300 text-green-700 hover:bg-green-50 font-bold h-12 px-6"
              >
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Empty Cart Guard (only when NOT after a successful order) ─────
  if (!orderSuccess && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full text-center border-none shadow-xl">
          <CardContent className="py-12">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-gray-500 mb-8">
              Add some products before proceeding to checkout.
            </p>
            <Button
              onClick={() => navigate("/products")}
              className="bg-green-600 hover:bg-green-700 text-white font-bold h-12 px-8"
            >
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Success Screen ───────────────────────────
  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
        <Card className="max-w-lg w-full text-center border-none shadow-2xl overflow-hidden">
          {/* Green accent bar */}
          <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />

          <CardContent className="py-12 px-8">
            {/* Animated checkmark */}
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20" />
              <div className="relative flex items-center justify-center w-24 h-24 bg-green-100 rounded-full">
                <PackageCheck className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Order Placed Successfully!
            </h2>
            <p className="text-gray-500 mb-6">
              Thank you for shopping with Swaadbhog Mewa Traders
            </p>

            {/* Order details card */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-8 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">
                  Order Number
                </span>
                <span className="font-bold text-green-800 text-lg">
                  {orderSuccess.orderNumber}
                </span>
              </div>
              <div className="border-t border-green-200" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">
                  Total Amount
                </span>
                <span className="font-bold text-green-800 text-lg">
                  ₹{Number(orderSuccess.totalAmount).toLocaleString()}
                </span>
              </div>
              <div className="border-t border-green-200" />
              <div className="flex items-center justify-center space-x-2 text-sm text-green-700">
                <ShieldCheck className="w-4 h-4" />
                <span>Payment on Delivery (Cash)</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              We'll notify you once your order is approved and out for delivery.
            </p>

            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() =>
                  navigate("/orders", { state: { orderSuccess: true } })
                }
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 shadow-lg shadow-green-200"
              >
                View My Orders
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/products")}
                className="flex-1 border-green-300 text-green-700 hover:bg-green-50 font-bold h-12"
              >
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Checkout Form ────────────────────────────
  const subtotal = getCartTotal();

  // Calculate GST for each product based on individual GST percentages
  const calculateTotalGST = () => {
    return cartItems.reduce((totalGST, item) => {
      const price =
        typeof item.price === "string"
          ? parseFloat(item.price.replace("₹", "").replace(/,/g, ""))
          : item.price;
      const itemGST = (price * item.quantity * (item.gstPercent || 18)) / 100;
      return totalGST + itemGST;
    }, 0);
  };

  const totalGST = calculateTotalGST();

  const getProductImage = (item) => {
    // Try different image field structures
    if (item.image) return item.image;
    if (item.images && Array.isArray(item.images)) {
      if (item.images.length > 0) {
        // If images is array of objects with url property
        if (item.images[0].url) return item.images[0].url;
        // If images is array of URLs
        return item.images[0];
      }
    }
    return "";
  };

  // Calculate delivery fee based on distance and special conditions
  const calculateDeliveryFee = (distance, subtotal) => {
    let deliveryFee = 0;

    // Check for free delivery conditions
    if (subtotal >= 500) {
      // Free delivery for orders above ₹500
      return 0;
    }

    // Base delivery fee calculation (0-5 km)
    if (distance >= 0 && distance <= 1) {
      deliveryFee = 20; // ₹20 for 0-1 km
    } else if (distance > 1 && distance <= 3) {
      deliveryFee = 40; // ₹40 for 1-3 km
    } else if (distance > 3 && distance <= 5) {
      deliveryFee = 60; // ₹60 for 3-5 km
    } else if (distance > 5) {
      deliveryFee = 60; // ₹60 for >5 km
    }

    return deliveryFee;
  };

  const deliveryFee = calculateDeliveryFee(distance, subtotal);
  // Total now includes GST calculated per product
  const total = Number((subtotal + totalGST + deliveryFee).toFixed(2));

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:py-8 sm:px-6 lg:py-12 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-2 mb-6 sm:mb-8">
          <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Checkout
          </h1>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* ── Order Summary (Top) ────────────────── */}
          <div className="order-first lg:order-none">
            <Card className="border-none shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[250px] sm:max-h-[300px] overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img
                            src={getProductImage(item)}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23fef3c7"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="%236b7280" text-anchor="middle" dy="0.3em">🥜</text></svg>';
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                            {item.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Qty: {item.quantity} × ₹
                            {(() => {
                              let price = item.price;
                              if (typeof price === "string") {
                                price = parseFloat(
                                  price.replace("₹", "").replace(/,/g, ""),
                                );
                              }
                              return price.toLocaleString();
                            })()}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-green-600 text-base sm:text-lg ml-2 sm:ml-4 flex-shrink-0">
                        ₹
                        {(() => {
                          let price = item.price;
                          if (typeof price === "string") {
                            price = parseFloat(
                              price.replace("₹", "").replace(/,/g, ""),
                            );
                          }
                          return (price * item.quantity).toLocaleString();
                        })()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* GST Breakdown */}
                <div className="p-4 sm:p-6 bg-blue-50 border-t">
                  <h4 className="font-semibold text-blue-800 mb-3 text-sm">
                    GST Breakdown
                  </h4>
                  <div className="space-y-2 text-xs">
                    {cartItems.map((item) => {
                      const price =
                        typeof item.price === "string"
                          ? parseFloat(
                              item.price.replace("₹", "").replace(/,/g, ""),
                            )
                          : item.price;
                      const itemGST =
                        (price * item.quantity * (item.gstPercent || 18)) / 100;
                      return (
                        <div
                          key={item.id}
                          className="flex justify-between text-blue-700"
                        >
                          <span className="truncate max-w-[200px]">
                            {item.name} ({item.gstPercent || 18}% ×{" "}
                            {item.quantity})
                          </span>
                          <span className="font-medium">
                            ₹{itemGST.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between text-blue-800 font-bold pt-2 border-t border-blue-200">
                      <span>Total GST</span>
                      <span>₹{totalGST.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 bg-green-50 space-y-3 border-t">
                  <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                    <span>GST</span>
                    <span>₹{totalGST.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                    <div className="flex flex-col">
                      <span>Delivery Charge</span>
                      {/* Show delivery offers */}
                      {deliveryFee === 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          {subtotal >= 500
                            ? "🎉 FREE for orders above ₹500!"
                            : "🎉 Special offer applied!"}
                        </div>
                      )}
                      {deliveryFee > 0 && subtotal < 500 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Add ₹{(500 - subtotal).toLocaleString()} more for FREE
                          delivery
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-medium text-xs sm:text-sm px-2 py-0.5 rounded-full ${
                          deliveryFee === 0
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                      </span>
                      {distance && deliveryFee > 0 && (
                        <span className="text-xs text-gray-500 ml-2 block">
                          ({distance.toFixed(1)} km)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-green-200 uppercase tracking-wider">
                    <span className="text-lg sm:text-xl font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-green-700">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Delivery Offers Banner (Top) ────────────────── */}
          <Card className="border-none shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <CardContent className="p-4">
              <h3 className="font-bold text-green-800 mb-3 flex items-center">
                <span className="text-xl mr-2">🎉</span> Delivery Offers
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-green-700">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  <span className="font-medium">First Order:</span>
                  <span className="ml-2 text-green-600 font-bold">
                    FREE Delivery
                  </span>
                </div>
                <div className="flex items-center text-green-700">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  <span className="font-medium">Orders above ₹500:</span>
                  <span className="ml-2 text-green-600 font-bold">
                    FREE Delivery
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  <span className="font-medium">1-3 km:</span>
                  <span className="ml-2 text-gray-600">₹40</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  <span className="font-medium">3-5 km:</span>
                  <span className="ml-2 text-gray-600">₹60</span>
                </div>
                {subtotal < 500 && (
                  <div className="mt-2 p-2 bg-white rounded border border-green-200">
                    <p className="text-xs text-green-700">
                      Add just ₹{(500 - subtotal).toLocaleString()} more to get
                      FREE delivery! 🚀
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Delivery Form ────────────────── */}
          <div className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
                <CardDescription>
                  Please provide your delivery details and location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  {/* Contact Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Phone className="w-4 h-4 mr-2" /> Contact Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        value={formData.contactNumber}
                        onChange={handlePhoneChange}
                        onInput={(e) => {
                          // Prevent non-numeric input
                          e.target.value = e.target.value.replace(/\D/g, "");
                        }}
                        className={`w-full pl-12 pr-4 py-2 border rounded-md focus:ring-2 focus:border-transparent outline-none transition-all ${
                          phoneError
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-green-500"
                        }`}
                        placeholder="98765 43210"
                        maxLength={10}
                        disabled={isSubmitting}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {phoneError}
                      </p>
                    )}
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" /> Delivery Address
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.addressText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          addressText: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                      placeholder="House No, Building, Landmark, Area, City, State (Required)"
                      disabled={isSubmitting}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) =>
                          setPincode(e.target.value.replace(/[^0-9]/g, ""))
                        }
                        className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        placeholder="Pincode (Optional)"
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-gray-500">
                        e.g., 560038 (Optional)
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Example: 12A, Green Tower, MG Road, Indiranagar,
                      Bengaluru, Karnataka
                    </p>
                    <p className="text-xs text-orange-600 font-medium">
                      <strong>Required:</strong> Complete delivery address is
                      mandatory
                    </p>
                    <p className="text-xs text-green-600 font-medium">
                      <strong>Tip:</strong> You can click on the map to
                      auto-fill the address!
                    </p>
                  </div>

                  {/* Map Picker */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Select Location on map
                    </p>

                    {/* Current Location Button */}
                    <div className="flex gap-2 mb-2">
                      <Button
                        type="button"
                        onClick={getCurrentLocation}
                        className={`flex-1 ${
                          locationPermissionStatus === "granted"
                            ? "bg-green-600 hover:bg-green-700"
                            : locationPermissionStatus === "denied"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-blue-600 hover:bg-blue-700"
                        } text-white`}
                        disabled={locationStatus === "loading"}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        {locationStatus === "loading"
                          ? "Getting Location..."
                          : locationPermissionStatus === "granted"
                            ? "✓ Location Access Granted"
                            : locationPermissionStatus === "denied"
                              ? "✗ Location Access Denied"
                              : "Use My Current Location"}
                      </Button>
                      {locationPermissionStatus === "denied" && (
                        <p className="text-xs text-red-600 mt-1">
                          Please enable location access in your browser settings
                          and try again.
                        </p>
                      )}
                    </div>

                    <div
                      ref={mapRef}
                      id="map"
                      className="w-full h-64 rounded-md border border-gray-300"
                    />
                    <p className="text-xs text-gray-500">
                      <strong>Options:</strong> Click on map, search address, or
                      use your current location. You can adjust the marker after
                      selection.
                    </p>
                  </div>

                  {/* Location Verification */}
                  <div className="pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Delivery Range Check (Max 5km)
                    </p>
                    <Button
                      type="button"
                      variant={
                        locationStatus === "success" ? "outline" : "default"
                      }
                      onClick={handleVerifyLocation}
                      disabled={locationStatus === "loading" || isSubmitting}
                      className={`w-full h-12 flex items-center justify-center space-x-2 ${
                        locationStatus === "success"
                          ? "border-green-500 text-green-600"
                          : ""
                      }`}
                    >
                      {locationStatus === "loading" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : locationStatus === "success" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <MapPin className="w-5 h-5" />
                      )}
                      <span>
                        {locationStatus === "loading"
                          ? "Verifying Location..."
                          : locationStatus === "success"
                            ? `Verified (${distance ? `${distance.toFixed(1)} km` : "Calculating..."})`
                            : "Verify Delivery Location"}
                      </span>
                    </Button>
                    <p className="text-xs text-gray-500 mt-2 italic">
                      * We check if your location is within our 5km delivery
                      radius.
                      {distance && locationStatus === "success" && (
                        <span className="text-green-600 font-normal">
                          {" "}
                          Current distance: {distance.toFixed(1)} km
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-in fade-in duration-300">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      locationStatus !== "success" ||
                      (distance && distance > 5)
                    }
                    className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 transition-all font-bold mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Placing Order...</span>
                      </div>
                    ) : (
                      "Confirm & Place Order"
                    )}
                  </Button>

                  {/* Distance validation message */}
                  {distance && distance > 5 && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Delivery not available - Location is{" "}
                          {distance.toFixed(1)}km away (max 5km)
                        </span>
                      </div>
                    </div>
                  )}

                  {locationStatus !== "success" && !distance && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-amber-700">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">
                          Please verify your delivery location before placing
                          order
                        </span>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* ── Payment Info ────────────────── */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-bold">Payment on Delivery</p>
              <p>
                We currently only support Cash on Delivery. Pay safely at your
                doorstep once the order is approved and delivered.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
