import { Key, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, ChevronDown, ArrowLeft } from "lucide-react";
// import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "react-router-dom";

// Redux
import {
  toggleMobileMenu,
  setMobileMenuOpen,
  selectIsMobileMenuOpen,
} from "@/redux-store/slices/uiSlice";
import { selectComparisonBikes } from "@/redux-store/slices/comparisonSlice";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { branches } from "@/mainComponents/NavMenu/Branches/TwoBranch";

export function Header() {
  const dispatch = useAppDispatch();
  const isMobileMenuOpen = useAppSelector(selectIsMobileMenuOpen);
  const comparisonBikes = useAppSelector(selectComparisonBikes);

  // Close mobile menu when clicking outside or on route change
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        dispatch(setMobileMenuOpen(false));
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  const handleMobileMenuToggle = () => {
    dispatch(toggleMobileMenu());
  };

  const closeMobileMenu = () => {
    dispatch(setMobileMenuOpen(false));
  };

  return (
    <motion.header
      className='fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b'
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='container flex items-center justify-between h-16 px-4 md:px-6'>
        <Link to='/' className='flex items-center' onClick={closeMobileMenu}>
          <ArrowLeft />
        </Link>

        <div className='hidden md:flex md:items-center md:gap-4'>
          <nav className='flex items-center gap-6'>
            <Link
              to='/'
              className='text-sm font-medium hover:text-primary transition-colors'
            >
              Home
            </Link>
            <Link
              to='/view-all'
              className='text-sm font-medium hover:text-primary transition-colors'
            >
              Models
            </Link>

            {/* Branches Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <button className='flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors'>
                  Branches <ChevronDown className='h-4 w-4' />
                </button>
              </PopoverTrigger>
              <PopoverContent className='w-48 p-0'>
                <div className='rounded-md border bg-popover text-popover-foreground shadow-md'>
                  <div className='flex flex-col'>
                    <Link
                      to='/branches'
                      className='px-4 py-2 text-sm hover:bg-muted transition-colors font-medium'
                    >
                      All Branches
                    </Link>
                    <div className='border-t my-1'></div>
                    {branches.map(
                      (branch: {
                        id: Key | null | undefined;
                        name: string;
                      }) => (
                        <Link
                          key={branch.id}
                          to={`/branches/${branch.id}`}
                          className='px-4 py-2 text-sm hover:bg-muted transition-colors'
                        >
                          {branch.name.split(" ").pop()}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Link
              to='/finance'
              className='text-sm font-medium hover:text-primary transition-colors'
            >
              Finance
            </Link>
            <Link
              to='/contact'
              className='text-sm font-medium hover:text-primary transition-colors'
            >
              Contact
            </Link>
          </nav>
        </div>

        <button className='md:hidden' onClick={handleMobileMenuToggle}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <motion.div
          className='md:hidden'
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <nav className='flex flex-col p-4 space-y-4 border-t bg-background'>
            <Link
              to='/'
              className='text-sm font-medium hover:text-primary transition-colors'
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link
              to='/view-all'
              className='text-sm font-medium hover:text-primary transition-colors'
              onClick={closeMobileMenu}
            >
              Models
            </Link>

            {/* Mobile Branches (expanded instead of dropdown) */}
            <div className='space-y-2'>
              <div className='text-sm font-medium'>Branches</div>
              <div className='pl-4 space-y-2'>
                <Link
                  to='/branches'
                  className='block text-sm text-muted-foreground hover:text-primary transition-colors font-medium'
                  onClick={closeMobileMenu}
                >
                  All Branches
                </Link>
                {branches.map(
                  (branch: { id: Key | null | undefined; name: string }) => (
                    <Link
                      key={branch.id}
                      to={`/branches/${branch.id}`}
                      className='block text-sm text-muted-foreground hover:text-primary transition-colors'
                      onClick={closeMobileMenu}
                    >
                      {branch.name.split(" ").pop()}
                    </Link>
                  )
                )}
              </div>
            </div>

            <Link
              to='/finance'
              className='text-sm font-medium hover:text-primary transition-colors'
              onClick={closeMobileMenu}
            >
              Finance
            </Link>
            <Link
              to='/contact'
              className='text-sm font-medium hover:text-primary transition-colors'
              onClick={closeMobileMenu}
            >
              Contact
            </Link>

            {/* Mobile Comparison indicator */}
            {comparisonBikes.length > 0 && (
              <Link
                to='/compare'
                className='text-sm font-medium hover:text-primary transition-colors flex items-center gap-2'
                onClick={closeMobileMenu}
              >
                Compare Bikes
                <span className='bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                  {comparisonBikes.length}
                </span>
              </Link>
            )}
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
