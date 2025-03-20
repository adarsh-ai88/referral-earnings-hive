
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scrolling to add background to header when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background dark:from-background dark:to-mlm-black flex flex-col">
      {/* Header */}
      <header className={cn(
        "fixed w-full z-50 transition-all duration-300 backdrop-blur-md",
        scrolled ? "bg-background/80 dark:bg-background/80 border-b shadow-sm" : "bg-transparent"
      )}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-mlm-primary">
            CodexAlgo.ai
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-mlm-primary transition-colors">
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="hover:text-mlm-primary transition-colors">
                  Dashboard
                </Link>
                <Link to="/referrals" className="hover:text-mlm-primary transition-colors">
                  Referrals
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="hover:text-mlm-primary transition-colors">
                    Admin
                  </Link>
                )}
              </>
            )}
            {!isAuthenticated ? (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="bg-transparent hover:bg-mlm-primary/10"
                >
                  Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin-login')}
                  className="bg-transparent hover:bg-mlm-primary/10"
                >
                  Admin
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-mlm-primary hover:bg-mlm-accent text-white"
                >
                  Register
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="text-sm flex items-center space-x-2">
                  <UserCircle className="h-5 w-5" />
                  <span>{user?.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              className="text-foreground"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 px-4 bg-background/95 dark:bg-background/95 backdrop-blur-lg border-b animate-slideUp">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="py-2 px-4 hover:bg-mlm-primary/10 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className="py-2 px-4 hover:bg-mlm-primary/10 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/referrals"
                    className="py-2 px-4 hover:bg-mlm-primary/10 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Referrals
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="py-2 px-4 hover:bg-mlm-primary/10 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
              {!isAuthenticated ? (
                <div className="flex flex-col space-y-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate('/admin-login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Admin Login
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/register');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-mlm-primary hover:bg-mlm-accent"
                  >
                    Register
                  </Button>
                </div>
              ) : (
                <div className="border-t pt-4 mt-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <UserCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">{user?.name}</span>
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t backdrop-blur-md bg-background/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                © 2023 CodexAlgo.ai. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
