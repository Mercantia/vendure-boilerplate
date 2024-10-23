import { useLocation } from "@remix-run/react";

const getVendorNameFromUrl = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  const vendorName = pathSegments[1]; // Vendor name from the URL
  return vendorName;
};
