import '../styles/landing.css';
import { Link } from 'react-router-dom';
import { BookOpen, Users, CheckCircle, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';
import { useEffect } from 'react';

export default function Landing() {
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      if (window.scrollY > 50) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing">
      <nav className="navbar">
        <div className="navbar__container">
          <div className="navbar__brand">
            <div className="navbar__brand-icon">
              <GraduationCap size={24} />
            </div>
            <span>AulaVirtual</span>
          </div>
          <div className="navbar__links">
            <a href="#features" className="navbar__link">Características</a>
            <a href="#stats" className="navbar__link">Estadísticas</a>
            <a href="#cta" className="navbar__link">Contacto</a>
          </div>
          <Link to="/login" className="navbar__cta">Ingresar</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero__content">
          <div className="hero__badge">
            <Sparkles size={16} />
            <span>Sistema de gestión académica</span>
          </div>
          <h1>Gestión académica simple y eficiente</h1>
          <p>Administra docentes, materias, grupos y asistencia en una plataforma moderna y minimalista diseñada para instituciones educativas.</p>
          <div className="hero__cta">
            <Link to="/login" className="btn btn--primary">
              Ingresar
              <ArrowRight size={20} />
            </Link>
            <a href="#features" className="btn btn--ghost">
              Ver características
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="feature">
          <div className="feature__icon">
            <BookOpen size={28} />
          </div>
          <h3>Materias y grupos</h3>
          <p>Organiza la oferta académica con claridad. Crea y gestiona materias, asigna grupos y define horarios de manera intuitiva.</p>
        </div>
        <div className="feature">
          <div className="feature__icon">
            <Users size={28} />
          </div>
          <h3>Gestión de docentes</h3>
          <p>Asigna docentes a grupos y gestiones de forma rápida. Mantén un registro completo y actualizado de tu equipo académico.</p>
        </div>
        <div className="feature">
          <div className="feature__icon">
            <CheckCircle size={28} />
          </div>
          <h3>Control de asistencia</h3>
          <p>Registra y consulta asistencia en tiempo real. Genera reportes detallados y toma decisiones basadas en datos.</p>
        </div>
      </section>

      <section id="stats" className="stats">
        <div className="stats__container">
          <div className="stat">
            <div className="stat__number">500+</div>
            <div className="stat__label">Docentes activos</div>
          </div>
          <div className="stat">
            <div className="stat__number">120+</div>
            <div className="stat__label">Materias registradas</div>
          </div>
          <div className="stat">
            <div className="stat__number">3000+</div>
            <div className="stat__label">Estudiantes</div>
          </div>
          <div className="stat">
            <div className="stat__number">98%</div>
            <div className="stat__label">Satisfacción</div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer__bottom">
          <p>&copy; 2025 AulaVirtual. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
