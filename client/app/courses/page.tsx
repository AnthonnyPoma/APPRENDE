"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:8000";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  price: number;
  level: string;
  thumbnail_url?: string;
  category_id?: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("Todos");

  useEffect(() => {
    fetch(`${API}/courses`)
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = selectedLevel === "Todos" || c.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Catálogo de Cursos</h1>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-10 flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Buscar cursos..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[200px]"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="Todos">Todos los niveles</option>
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`} className="group">
                <div className="course-card h-full flex flex-col">
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
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg">No se encontraron cursos que coincidan con tu búsqueda.</p>
            <button 
              onClick={() => {setSearch(""); setSelectedLevel("Todos")}}
              className="mt-4 text-blue-600 font-bold hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
