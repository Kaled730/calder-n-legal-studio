import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBackground from "@/assets/hero-background.jpg";

const Hero = () => {
  const scrollToContact = () => {
    const element = document.querySelector("#contacto");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openWhatsApp = () => {
    const phone = "59170544995";
    const message = encodeURIComponent(
      "Hola, me gustaría agendar una consulta legal con la Abg. Susy Marysol Calderón Marín."
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBackground}
          alt="Oficina legal profesional"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/50" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-20 md:py-32">
        <div className="max-w-3xl animate-fade-up">
          <span className="inline-block px-4 py-2 mb-6 text-sm font-medium text-primary-foreground bg-primary/90 rounded-full backdrop-blur-sm">
            Asesoría Legal Profesional
          </span>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Tu derecho,{" "}
            <span className="text-primary-foreground/90 italic">nuestra prioridad</span>
          </h1>

          <p className="font-body text-lg md:text-xl text-white/80 mb-8 max-w-2xl leading-relaxed">
            Asesoría legal personalizada y profesional en todas las áreas del
            derecho. Protegemos tus intereses con compromiso, experiencia y
            dedicación.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="hero"
              size="xl"
              onClick={scrollToContact}
              className="group"
            >
              Agendar Consultoría
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="whatsapp"
              size="xl"
              onClick={openWhatsApp}
              className="group"
            >
              <MessageCircle className="mr-2" />
              Contactar por WhatsApp
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/20">
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-white">15+</p>
              <p className="text-sm text-white/70">Años de experiencia</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-white">500+</p>
              <p className="text-sm text-white/70">Clientes satisfechos</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-white">100%</p>
              <p className="text-sm text-white/70">Compromiso</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce hidden md:block">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-white/70 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
