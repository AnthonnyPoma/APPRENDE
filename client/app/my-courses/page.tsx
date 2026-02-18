// client/app/my-courses/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  title: string;
  thumbnail_url?: string;
}

interface Enrollment {
  id: string;
  amount_paid: number;
  course: Course; // <--- Aquí viene el curso anidado
}

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMyCourses = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Llamamos al endpoint "Mis Inscripciones"
        // Necesitamos enviar el token para que el backend sepa quiénes somos
        const response = await axios.get("http://localhost:8000/enrollments/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEnrollments(response.data);
      } catch (error) {
        console.error("Error cargando mis cursos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Cursos y Aprendizaje 📚</h1>

        {loading ? (
          <p>Cargando tus cursos...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden"
              >
                {/* Imagen */}
                <div className="h-40 bg-gray-800 flex items-center justify-center text-white">
                  {enrollment.course.thumbnail_url ? (
                    <img
                      src={`http://localhost:8000${enrollment.course.thumbnail_url}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">🚀</span>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <h2 className="font-bold text-lg mb-2">{enrollment.course.title}</h2>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "10%" }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">10% Completado</p>

                  {/* Botón para ir al reproductor (Player) */}
                  <Link
                    href={`/player/${enrollment.course.id}`} // <--- Esta será la última página que haremos
                    className="block w-full text-center py-2 bg-gray-900 text-white rounded hover:bg-black transition"
                  >
                    Continuar Viendo ▶
                  </Link>
                </div>
              </div>
            ))}

            {enrollments.length === 0 && (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-500 mb-4">No te has inscrito en ningún curso todavía.</p>
                <Link href="/courses" className="text-blue-600 font-bold hover:underline">
                  Explorar Catálogo
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
