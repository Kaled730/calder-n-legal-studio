import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#inicio", label: "Inicio" },
    { href: "#sobre-mi", label: "Sobre Mí" },
    { href: "#contacto", label: "Contacto" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-soft`}
    >
      <div className="container mx-auto px-4">

        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#inicio");
            }}
            className="font-display text-lg md:text-xl font-semibold text-[#2E2E2E]"
          >
            <span className="text-primary">Abg.</span> Susy Marysol Calderón Marín
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="font-body text-sm font-medium text-[#2E2E2E]/80 hover:text-primary transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
            <Button
              variant="hero"
              size="default"
              onClick={() => scrollToSection("#contacto")}
            >
              Agendar Consulta
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-[#2E2E2E]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">

              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className="font-body text-base font-medium text-[#2E2E2E]/80 hover:text-primary transition-colors duration-200 py-2"
                >
                  {link.label}
                </a>
              ))}
              <Button
                variant="hero"
                size="lg"
                className="mt-2"
                onClick={() => scrollToSection("#contacto")}
              >
                Agendar Consulta
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
