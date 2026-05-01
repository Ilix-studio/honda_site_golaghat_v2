// src/hooks/useRoutePrefix.ts
// Derives "/admin" or "/manager" from the current path.
// Used by shared components (SelectVas, SelectStockForm, etc.)
// so their internal links match the role context they're rendered under.

import { useLocation } from "react-router-dom";

export const useRoutePrefix = (): "/admin" | "/manager" => {
  const { pathname } = useLocation();
  return pathname.startsWith("/manager") ? "/manager" : "/admin";
};
