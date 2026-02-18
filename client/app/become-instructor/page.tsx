// client/app/become-instructor/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function BecomeInstructorPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:8000/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setUser)
      .catch(() => {});
  }, []);

  const handleConvert = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        "http://localhost:8000/users/me/become-instructor",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push("/instructor/dashboard");
    } catch {
      alert("Error al convertir en instructor");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: "💰", title: "Genera ingresos", desc: "Monetiza tu conocimiento y experiencia" },
    { icon: "🌍", title: "Alcance global", desc: "Llega a miles de estudiantes" },
    { icon: "📊", title: "Estadísticas", desc: "Analiza el rendimiento de tus cursos" },
    { icon: "🎬", title: "Herramientas pro", desc: "Editor de videos y contenido" },
  ];

  return (
    <div className="min-h-screen bg-[#fdf0d5] pt-20">
      {/* Hero */}
      <section className="bg-[#003049] py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c1121f] rounded-full blur-[150px] opacity-20" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block bg-[#c1121f] text-[#fdf0d5] px-4 py-2 rounded-full text-sm font-medium mb-6">
            👨‍🏫 Únete a nuestro equipo
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#fdf0d5] mb-6">
            Comparte tu conocimiento
            <br />
            <span className="text-[#669bbc]">con el mundo</span>
          </h1>
          <p className="text-xl text-[#669bbc] mb-10 max-w-2xl mx-auto">
            Conviértete en instructor y crea cursos que impacten la vida de miles de estudiantes.
          </p>

          {user?.role === "INSTRUCTOR" ? (
            <Link
              href="/instructor/dashboard"
              className="inline-block bg-[#669bbc] hover:bg-[#5a8aa8] text-[#fdf0d5] px-8 py-4 rounded-xl font-bold text-lg transition"
            >
              Ir a mi Dashboard →
            </Link>
          ) : user ? (
            <button
              onClick={handleConvert}
              disabled={loading}
              className="btn-primary px-10 py-5 rounded-xl font-bold text-xl disabled:opacity-50"
            >
              {loading ? "Procesando..." : "Convertirme en Instructor"}
            </button>
          ) : (
            <Link
              href="/register"
              className="btn-primary inline-block px-10 py-5 rounded-xl font-bold text-xl"
            >
              Registrarme para Enseñar
            </Link>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#003049] text-center mb-16">
            ¿Por qué enseñar en APPRENDE?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl border border-[#669bbc]/20 hover:border-[#c1121f] hover:shadow-xl transition"
              >
                <span className="text-5xl block mb-4">{b.icon}</span>
                <h3 className="text-xl font-bold text-[#003049] mb-2">{b.title}</h3>
                <p className="text-[#669bbc]">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#003049] text-center mb-16">
            Comienza en 3 pasos
          </h2>
          <div className="space-y-8">
            {[
              {
                num: "01",
                title: "Crea tu perfil",
                desc: "Regístrate y activa tu cuenta de instructor",
              },
              {
                num: "02",
                title: "Diseña tu curso",
                desc: "Estructura tu contenido y sube tus videos",
              },
              {
                num: "03",
                title: "Publica y gana",
                desc: "Lanza tu curso y empieza a generar ingresos",
              },
            ].map((step, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="w-16 h-16 bg-[#c1121f] rounded-2xl flex items-center justify-center text-2xl font-bold text-[#fdf0d5] flex-shrink-0">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#003049]">{step.title}</h3>
                  <p className="text-[#669bbc] mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#003049]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#fdf0d5] mb-6">¿Listo para empezar?</h2>
          {!user ? (
            <Link
              href="/register"
              className="btn-primary inline-block px-10 py-5 rounded-xl font-bold text-xl"
            >
              Crear cuenta gratis
            </Link>
          ) : user.role !== "INSTRUCTOR" ? (
            <button
              onClick={handleConvert}
              disabled={loading}
              className="btn-primary px-10 py-5 rounded-xl font-bold text-xl disabled:opacity-50"
            >
              {loading ? "Procesando..." : "Activar perfil de instructor"}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
