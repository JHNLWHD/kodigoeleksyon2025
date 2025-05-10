import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X, ChevronDown } from 'lucide-react';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const locations = [
    { name: "ZAMBOANGA CITY", path: "/" },
    { name: "CEBU CITY", path: "/cebu-city" },
    { name: "MAKATI CITY", path: "/makati-city" },
    { name: "PASIG CITY", path: "/pasig-city" },
    { name: "TAGUIG CITY", path: "/taguig-city" },
    { name: "CAINTA, RIZAL", path: "/cainta-rizal" },
    { name: "TAYTAY, RIZAL", path: "/taytay-rizal" },
    { name: "SAMAL, BATAAN", path: "/samal-bataan" },
    { name: "NATIONAL", path: "/national" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-3 print:hidden",
        scrolled 
          ? "bg-white/95 backdrop-blur-md shadow-sm" 
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-80 group"
          aria-label="Kodigo Eleksyon 2025 Home"
        >
          <div className="w-8 h-6 overflow-hidden rounded-sm shadow-md group-hover:shadow-lg transition-shadow duration-300">
            {/* Philippines flag using Tailwind colors */}
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-ph-blue" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}></div>
              <div className="absolute inset-0 bg-ph-red" style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }}></div>
              <div className="absolute left-0 top-0 w-1/3 h-full flex items-center justify-center">
                <div className="w-4 h-4 transform rotate-45 bg-ph-yellow flex items-center justify-center">
                  <div className="absolute w-1 h-1 bg-ph-yellow rounded-full" style={{ top: '0.5px', left: '0.5px' }}></div>
                  <div className="absolute w-1 h-1 bg-ph-yellow rounded-full" style={{ top: '0.5px', right: '0.5px' }}></div>
                  <div className="absolute w-1 h-1 bg-ph-yellow rounded-full" style={{ bottom: '0.5px', left: '0.5px' }}></div>
                </div>
              </div>
            </div>
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-800">
            KODIGO
            <span className="text-primary"> ELEKSYON</span>
            <span className="bg-blue-100 text-blue-800 text-sm px-1.5 py-0.5 rounded ml-1.5">
              2025
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList className="space-x-0.5">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn(
                    "px-3 text-sm font-medium rounded-md transition-colors",
                    isActive("/") || isActive("/cebu-city") || isActive("/makati-city") || 
                    isActive("/pasig-city") || isActive("/taguig-city")
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}>
                    Major Cities
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid grid-cols-1 w-[200px] gap-1 p-2">
                      {locations.slice(0, 5).map((loc) => (
                        <li key={loc.path}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={loc.path}
                              className={cn(
                                "block px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                isActive(loc.path)
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              )}
                              aria-current={isActive(loc.path) ? "page" : undefined}
                            >
                              {loc.name}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn(
                    "px-3 text-sm font-medium rounded-md transition-colors",
                    isActive("/cainta-rizal") || isActive("/taytay-rizal") 
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}>
                    Rizal Province
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid grid-cols-1 w-[200px] gap-1 p-2">
                      {locations.slice(5, 7).map((loc) => (
                        <li key={loc.path}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={loc.path}
                              className={cn(
                                "block px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                isActive(loc.path)
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              )}
                              aria-current={isActive(loc.path) ? "page" : undefined}
                            >
                              {loc.name}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn(
                    "px-3 text-sm font-medium rounded-md transition-colors",
                    isActive("/samal-bataan") || isActive("/coming-bataan") 
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}>
                    Bataan
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid grid-cols-1 w-[200px] gap-1 p-2">
                      {locations.slice(7, 8).map((loc) => (
                        <li key={loc.path}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={loc.path}
                              className={cn(
                                "block px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                isActive(loc.path)
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              )}
                              aria-current={isActive(loc.path) ? "page" : undefined}
                            >
                              {loc.name}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link
                    to="/national"
                    className={cn(
                      "inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive("/national")
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                    aria-current={isActive("/national") ? "page" : undefined}
                  >
                    NATIONAL
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <div className="h-6 border-l border-gray-300 mx-3"></div>
            <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
              Sample Ballot Builder
            </span>
          </nav>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-sm md:hidden">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b">
              <Link
                to="/"
                className="flex items-center gap-2.5"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-8 h-6 overflow-hidden rounded-sm shadow-md">
                  {/* Philippines flag (same as above) */}
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-ph-blue" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}></div>
                    <div className="absolute inset-0 bg-ph-red" style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }}></div>
                    <div className="absolute left-0 top-0 w-1/3 h-full flex items-center justify-center">
                      <div className="w-4 h-4 transform rotate-45 bg-ph-yellow flex items-center justify-center">
                        <div className="absolute w-1 h-1 bg-ph-yellow rounded-full" style={{ top: '0.5px', left: '0.5px' }}></div>
                        <div className="absolute w-1 h-1 bg-ph-yellow rounded-full" style={{ top: '0.5px', right: '0.5px' }}></div>
                        <div className="absolute w-1 h-1 bg-ph-yellow rounded-full" style={{ bottom: '0.5px', left: '0.5px' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="font-bold text-lg tracking-tight">
                  KODIGO
                  <span className="text-primary"> ELEKSYON</span>
                  <span className="bg-blue-100 text-blue-800 text-sm px-1.5 py-0.5 rounded ml-1.5">
                    2025
                  </span>
                </span>
              </Link>
              <button
                className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close Menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="flex flex-col p-4 space-y-1 overflow-y-auto">
              <div className="px-3 py-2 text-sm font-medium text-gray-500 uppercase">Major Cities</div>
              {locations.slice(0, 5).map((loc) => (
                <Link
                  key={loc.path}
                  to={loc.path}
                  className={cn(
                    "px-4 py-3 text-base font-medium rounded-md transition-colors",
                    isActive(loc.path)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={isActive(loc.path) ? "page" : undefined}
                >
                  {loc.name}
                </Link>
              ))}
              
              <div className="h-px bg-gray-200 my-2"></div>
              
              <div className="px-3 py-2 text-sm font-medium text-gray-500 uppercase">Rizal Province</div>
              {locations.slice(5, 7).map((loc) => (
                <Link
                  key={loc.path}
                  to={loc.path}
                  className={cn(
                    "px-4 py-3 text-base font-medium rounded-md transition-colors",
                    isActive(loc.path)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={isActive(loc.path) ? "page" : undefined}
                >
                  {loc.name}
                </Link>
              ))}
              
              <div className="h-px bg-gray-200 my-2"></div>
              
              <Link
                to="/national"
                className={cn(
                  "px-4 py-3 text-base font-medium rounded-md transition-colors",
                  isActive("/national")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive("/national") ? "page" : undefined}
              >
                NATIONAL
              </Link>
              
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="px-4 py-3 text-base font-medium text-gray-500">
                Sample Ballot Builder
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
