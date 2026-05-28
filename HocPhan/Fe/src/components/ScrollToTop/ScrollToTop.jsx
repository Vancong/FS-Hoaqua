import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSearch } from "../../redux/slices/ProductSlice";

const AUTH_PATHS = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (AUTH_PATHS.some((path) => pathname.startsWith(path))) {
      dispatch(setSearch(""));
    }
  }, [pathname, dispatch]);

  return null;
};

export default ScrollToTop;
