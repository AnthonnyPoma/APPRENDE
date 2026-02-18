// client/app/player/[courseId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

// --- Tipos ---
interface Lesson {
  id: string;
  title: string;
  video_resource_id: string;
  lesson_type: "video" | "pdf" | "image" | "quiz";
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseData {
  id: string;
  title: string;
  sections: Section[];
}

export default function PlayerPage() {
  const params = useParams();
  const router = useRouter();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [resourceUrl, setResourceUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // ✨ Nuevo Estado: Controla qué secciones están abiertas
  // Usamos un Set para guardar los IDs de las secciones abiertas
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // ✨ Nuevo Estado: Progreso
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [progressPercentage, setProgressPercentage] = useState(0);

  // 1. Cargar curso
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await axios.get(`http://localhost:8000/courses/${params.courseId}`);
        setCourse(response.data);

        // Abrir la primera sección por defecto
        if (response.data.sections.length > 0) {
          const firstSectionId = response.data.sections[0].id;
          setExpandedSections(new Set([firstSectionId]));

          // Seleccionar primera lección
          if (response.data.sections[0].lessons.length > 0) {
            setCurrentLesson(response.data.sections[0].lessons[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.courseId) fetchCourse();
  }, [params.courseId, router]);

  // 2. Obtener recurso
  useEffect(() => {
    const fetchResource = async () => {
      if (!currentLesson || !params.courseId) return;

      try {
        const token = localStorage.getItem("token");
        setResourceUrl("");

        const response = await axios.get(
          `http://localhost:8000/courses/${params.courseId}/lessons/${currentLesson.id}/play`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setResourceUrl(response.data.video_url);
      } catch (err) {
        console.error("Error cargando recurso", err);
      }
    };

    fetchResource();
  }, [currentLesson, params.courseId]);

  // 3. Cargar Progreso
  useEffect(() => {
    const fetchProgress = async () => {
      if (!course || !params.courseId) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:8000/progress/${params.courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // res.data es un array de UUIDs
        const completedSet = new Set<string>(res.data);
        setCompletedLessons(completedSet);
        updateProgressPercentage(completedSet, course);
      } catch (err) {
        console.error("Error cargando progreso", err);
      }
    };
    if (course) fetchProgress();
  }, [course, params.courseId]);

  const updateProgressPercentage = (completed: Set<string>, currentCourse: CourseData) => {
      const totalLessons = currentCourse.sections.reduce((acc, section) => acc + section.lessons.length, 0);
      if (totalLessons === 0) {
          setProgressPercentage(0);
          return;
      }
      const progress = Math.round((completed.size / totalLessons) * 100);
      setProgressPercentage(progress);
  };

  const toggleLessonCompletion = async () => {
      if (!currentLesson || !params.courseId) return;
      try {
          const token = localStorage.getItem("token");
          // Optimistic update
          const isCompleted = completedLessons.has(currentLesson.id);
          const newCompleted = new Set(completedLessons);
          if (isCompleted) newCompleted.delete(currentLesson.id);
          else newCompleted.add(currentLesson.id);
          
          setCompletedLessons(newCompleted);
          if (course) updateProgressPercentage(newCompleted, course);

          await axios.post(
              `http://localhost:8000/progress/toggle`,
              { lesson_id: currentLesson.id, course_id: params.courseId },
              { headers: { Authorization: `Bearer ${token}` } }
          );
      } catch (err) {
          console.error("Error actualizando progreso", err);
          // Rollback on error could be implemented here
      }
  };

  // ✨ Función para abrir/cerrar acordeón
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId); // Si está abierto, lo cierra
    } else {
      newExpanded.add(sectionId); // Si está cerrado, lo abre
    }
    setExpandedSections(newExpanded);
  };

  // ✨ Renderizado con protección contra descargas
  const renderContent = () => {
    if (!resourceUrl) {
      return <div className="text-white text-center mt-20">🔒 Cargando contenido...</div>;
    }

    if (currentLesson?.lesson_type === "video" || !currentLesson?.lesson_type) {
      return (
        <video
          src={resourceUrl}
          controls
          autoPlay
          // 🔒 SEGURIDAD VIDEO:
          controlsList="nodownload" // Oculta botón descargar nativo
          onContextMenu={(e) => e.preventDefault()} // Bloquea click derecho
          className="w-full h-full max-h-[80vh]"
        >
          Tu navegador no soporta videos.
        </video>
      );
    }

    if (currentLesson?.lesson_type === "pdf") {
      return (
        <div className="w-full h-full bg-white flex flex-col items-center justify-center p-4">
          {/* Nota: Los iframe de PDF son difíciles de bloquear al 100% sin librerías externas */}
          <iframe
            src={`${resourceUrl}#toolbar=0`} // Intento de ocultar toolbar (funciona en algunos navegadores)
            className="w-full h-full border-none"
            title="Visor PDF"
          />
        </div>
      );
    }

    if (currentLesson?.lesson_type === "image") {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <img
            src={resourceUrl}
            alt="Clase"
            // 🔒 SEGURIDAD IMAGEN:
            onContextMenu={(e) => e.preventDefault()} // Bloquea click derecho
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }

    return <div className="text-white">Formato no soportado</div>;
  };

  if (loading)
    return (
      <div className="text-center p-10 bg-gray-900 min-h-screen text-white">
        Cargando aula... 🚀
      </div>
    );
  if (!course) return <div className="text-center p-10">Curso no encontrado</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white overflow-hidden">
      {/* --- IZQUIERDA: VISOR --- */}
      <div className="flex-1 flex flex-col relative">
        <div className="h-14 border-b border-gray-800 flex items-center px-4 justify-between bg-gray-900 shrink-0">
          <button
            onClick={() => router.push("/my-courses")}
            className="text-gray-400 hover:text-white flex items-center gap-2 text-sm"
          >
            ← Volver
          </button>
          <span className="font-bold text-sm truncate px-4">{course.title}</span>
        </div>

        <div className="flex-1 bg-black relative overflow-hidden flex justify-center items-center">
          {renderContent()}
        </div>

        <div className="p-4 bg-gray-900 border-t border-gray-800 shrink-0 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 truncate">
            {currentLesson?.lesson_type === "pdf" && "📄"}
            {currentLesson?.lesson_type === "video" && "🎥"}
            {currentLesson?.lesson_type === "image" && "🖼️"}
            {currentLesson?.title}
          </h2>

          <div className="flex items-center gap-4">
             <button
                onClick={toggleLessonCompletion}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${
                    completedLessons.has(currentLesson?.id || "")
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
             >
                {completedLessons.has(currentLesson?.id || "") ? "✅ Completada" : "⭕ Marcar como vista"}
             </button>

          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm disabled:opacity-50"
              disabled={
                !course ||
                !currentLesson ||
                course.sections
                  .flatMap((s) => s.lessons)
                  .findIndex((l) => l.id === currentLesson.id) <= 0
              }
              onClick={() => {
                if (!course || !currentLesson) return;
                const allLessons = course.sections.flatMap((s) => s.lessons);
                const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
                if (currentIndex > 0) setCurrentLesson(allLessons[currentIndex - 1]);
              }}
            >
              ⬅ Anterior
            </button>
            <button
              className="px-4 py-2 bg-[#c1121f] hover:bg-[#a00f1a] text-white rounded text-sm disabled:opacity-50"
              disabled={
                !course ||
                !currentLesson ||
                course.sections
                  .flatMap((s) => s.lessons)
                  .findIndex((l) => l.id === currentLesson.id) >=
                  course.sections.flatMap((s) => s.lessons).length - 1
              }
              onClick={() => {
                if (!course || !currentLesson) return;
                const allLessons = course.sections.flatMap((s) => s.lessons);
                const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
                if (currentIndex < allLessons.length - 1)
                  setCurrentLesson(allLessons[currentIndex + 1]);
              }}
            >
              Siguiente ➡
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* --- DERECHA: TEMARIO (ACORDEÓN) --- */}
      <div className="w-full md:w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto shrink-0 z-10">
        <div className="p-4 border-b border-gray-700 bg-gray-800 sticky top-0">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-300 uppercase text-xs tracking-wider">
                Tu Progreso
            </h3>
            <span className="text-xs font-bold text-green-400">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {progressPercentage === 100 && (
             <button
               onClick={() => {
                   const token = localStorage.getItem("token");
                   window.open(`http://localhost:8000/certificates/${params.courseId}/download?token=${token}`, "_blank");
               }}
               className="w-full mb-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 animate-pulse"
             >
                🏆 Descargar Certificado
             </button>
          )}

          <h3 className="font-bold text-gray-300 uppercase text-xs tracking-wider">
            Contenido del Curso
          </h3>
        </div>

        <div>
          {course.sections.map((section) => {
            const isExpanded = expandedSections.has(section.id);

            return (
              <div key={section.id} className="border-b border-gray-700">
                {/* CABECERA DE LA SECCIÓN (Clickeable) */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full bg-gray-700/50 px-4 py-3 text-xs font-bold text-gray-300 uppercase tracking-wide flex justify-between items-center hover:bg-gray-700 transition"
                >
                  <span>{section.title}</span>
                  <span>{isExpanded ? "▼" : "▶"}</span> {/* Ícono simple */}
                </button>

                {/* LISTA DE LECCIONES (Solo si está expandido) */}
                {isExpanded && (
                  <div className="bg-gray-800">
                    {section.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLesson(lesson)}
                        className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-700 transition border-l-4 ${
                          currentLesson?.id === lesson.id
                            ? "bg-gray-700 border-blue-500 text-white"
                            : "border-transparent text-gray-400"
                        }`}
                      >
                        <span className="mt-0.5 text-lg">
                          {lesson.lesson_type === "video" && "🎥"}
                          {lesson.lesson_type === "pdf" && "📄"}
                          {lesson.lesson_type === "image" && "🖼️"}
                          {!lesson.lesson_type && "🎥"}
                        </span>
                        <div className="flex-1 flex justify-between items-start gap-2">
                          <p
                            className={`text-sm ${currentLesson?.id === lesson.id ? "font-bold" : "font-normal"}`}
                          >
                            {lesson.title}
                          </p>
                          {completedLessons.has(lesson.id) && (
                              <span className="text-green-500 text-xs">✅</span>
                          )}
                        </div>
                      </button>
                    ))}
                    {section.lessons.length === 0 && (
                      <div className="p-4 text-xs text-gray-500 italic text-center">
                        Sin contenido aún
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
