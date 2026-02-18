"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = "http://localhost:8000";

interface Course {
  id: string;
  title: string;
  price: number;
  level?: string;
  thumbnail_url?: string;
}

interface Category {
  id: number;
  name: string;
}

export default function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, categoriesRes] = await Promise.all([
          fetch(`${API}/courses`).then((r) => r.json()),
          fetch(`${API}/categories/all`).then((r) => r.ok ? r.json() : []),
        ]);
        setCourses(coursesRes.slice(0, 6)); // Show featured only
        setCategories(categoriesRes);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Aprende sin <span className="text-blue-600">Límites</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            La plataforma donde instructores expertos comparten conocimientos reales.
            Únete a nuestra comunidad de aprendizaje hoy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Explorar Cursos
            </Link>
            <Link
              href="/become-instructor"
              className="bg-white text-gray-700 border border-gray-300 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition"
            >
              Comenzar a Enseñar
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Categorías Populares</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
               {categories.length > 0 ? categories.map((cat) => (
                 <div key={cat.id} className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition cursor-pointer hover:border-blue-300">
                    <span className="font-semibold text-gray-700">{cat.name}</span>
                 </div>
               )) : !loading && (
                   <p className="text-gray-500 col-span-full">No hay categorías disponibles aún.</p>
               )}
            </div>
         </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 px-6 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
               <h2 className="text-3xl font-bold text-gray-900 mb-2">Cursos Destacados</h2>
               <p className="text-gray-600">Los temas más solicitados por nuestra comunidad</p>
            </div>
            <Link href="/courses" className="text-blue-600 font-semibold hover:underline hidden md:block">
               Ver todos →
            </Link>
          </div>

          {loading ? (
             <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`} className="group">
                  <div className="course-card h-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition duration-300 flex flex-col">
                    <div className="h-48 bg-gray-100 flex items-center justify-center border-b border-gray-100 group-hover:bg-blue-50 transition">
                      {course.thumbnail_url ? (
                      <img src={`${API}${course.thumbnail_url}`} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-4xl">📚</span>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                       <span className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">
                          {course.level || "Curso"}
                       </span>
                       <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                          {course.title}
                       </h3>
                       <div className="mt-auto pt-4 flex justify-between items-center border-t border-gray-100">
                          <span className="text-2xl font-bold text-gray-900">${course.price}</span>
                          <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition">Ver detalles →</span>
                       </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center md:hidden">
            <Link href="/courses" className="btn-secondary inline-block">
               Ver todos los cursos
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 py-20 px-6 text-center text-white">
          <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para compartir tu conocimiento?</h2>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                 Únete a miles de instructores que ya están transformando vidas a través de APPRENDE.
              </p>
              <Link href="/become-instructor" className="bg-white text-blue-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition inline-block">
                 Convertirme en Instructor
              </Link>
          </div>
      </section>
    </div>
  );
}
