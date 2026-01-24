import { Scale } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Scale size={20} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold">Abg. Susy Marysol Calderón Marín</p>
              <p className="font-body text-sm text-background/60">Asesoría Legal Profesional</p>
            </div>
          </div>

          {/* Links */}
          <nav className="flex gap-6">
            <a href="#inicio" className="font-body text-sm text-background/70 hover:text-primary transition-colors">
              Inicio
            </a>
            <a href="#sobre-mi" className="font-body text-sm text-background/70 hover:text-primary transition-colors">
              Sobre Mí
            </a>
            <a href="#contacto" className="font-body text-sm text-background/70 hover:text-primary transition-colors">
              Contacto
            </a>
          </nav>

          {/* Copyright */}
          <p className="font-body text-sm text-background/60">© {currentYear} Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
