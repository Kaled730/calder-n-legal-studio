import { Scale, Shield, Users, Award } from "lucide-react";
import lawyerPortrait from "@/assets/lawyer-portrait.jpg";

const About = () => {
  const features = [
    {
      icon: Scale,
      title: "Justicia",
      description: "Defensa de tus derechos con ética profesional",
    },
    {
      icon: Shield,
      title: "Confianza",
      description: "Confidencialidad y transparencia en cada caso",
    },
    {
      icon: Users,
      title: "Cercanía",
      description: "Atención personalizada y humana",
    },
    {
      icon: Award,
      title: "Experiencia",
      description: "Amplia trayectoria en diversas áreas del derecho",
    },
  ];

  return (
    <section id="sobre-mi" className="py-20 md:py-32 bg-muted/50">
      <div className="container px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative animate-fade-up">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-elevated">
              <img src={lawyerPortrait} alt="Abg. Susy Marysol Calderón Marín" className="w-full h-full object-cover" />
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 md:bottom-8 md:-right-8 bg-primary text-primary-foreground px-6 py-4 rounded-xl shadow-elevated">
              <p className="font-display text-2xl font-bold">15+</p>
              <p className="text-sm opacity-90">Años de experiencia</p>
            </div>
          </div>

          {/* Content */}
          <div className="animate-slide-in-right">
            <span className="inline-block px-4 py-2 mb-4 text-sm font-medium text-primary bg-primary/10 rounded-full">
              Sobre Mí
            </span>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Abg. <span className="text-gradient">Calderón Marín</span>
            </h2>

            <p className="font-body text-lg text-muted-foreground mb-6 leading-relaxed">
              Con más de 15 años de experiencia en el ejercicio del derecho, me dedico a brindar asesoría legal integral
              y personalizada a personas y empresas. Mi enfoque se centra en entender las necesidades únicas de cada
              cliente para ofrecer soluciones efectivas y estratégicas.
            </p>

            <p className="font-body text-lg text-muted-foreground mb-8 leading-relaxed">
              Especializada en diversas áreas del derecho, incluyendo derecho civil, familiar, laboral y comercial. Mi
              compromiso es defender tus derechos con profesionalismo, ética y dedicación.
            </p>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 p-4 rounded-xl bg-background shadow-soft hover:shadow-elevated transition-shadow duration-300"
                >
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="font-body text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
