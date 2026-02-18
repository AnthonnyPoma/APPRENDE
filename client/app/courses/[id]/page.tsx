"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface Course {
  id: string;
  user_id: string; // Added user_id
  title: string;
  description: string;
  price: number;
  level: string;
  sections?: { id: string; title: string; lessons: { id: string; title: string }[] }[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  user_name: string;
  instructor_reply?: string;
  created_at: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Fetch User
    if (token) {
      fetch("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then(setUser)
        .catch(() => setUser(null));
    }

    Promise.all([
      fetch(`http://localhost:8000/courses/${params.id}`).then((r) => r.json()),
      fetch(`http://localhost:8000/reviews/course/${params.id}`).then((r) =>
        r.ok ? r.json() : []
      ),
      token
        ? fetch("http://localhost:8000/enrollments/me", {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => (r.ok ? r.json() : []))
        : Promise.resolve([]),
    ])
      .then(([c, r, enrollments]) => {
        setCourse(c);
        setReviews(r);
        if (enrollments && Array.isArray(enrollments)) {
             // La respuesta del backend es: { id: "...", course: { id: "...", title: "..." } }
             // Por lo tanto, debemos verificar enrollment.course.id
             setIsEnrolled(enrollments.some((e: any) => e.course?.id === params.id));
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleEnroll = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      await axios.post(
        "http://localhost:8000/enrollments/",
        { course_id: params.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEnrolled(true);
      alert("¡Inscripción exitosa!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      if (error.response?.data?.detail?.includes("Ya estás inscrito")) {
        setIsEnrolled(true);
        alert("Ya estabas inscrito. ¡Ahora puedes ver el curso!");
      } else {
        alert(error.response?.data?.detail || "Error");
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.post(
        "http://localhost:8000/reviews/",
        { course_id: params.id, ...reviewForm },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews([res.data, ...reviews]);
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      alert(error.response?.data?.detail || "Error");
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
      : "0";

  // Ownership Check
  const isOwner = user && course && user.id === course.user_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <p className="text-gray-900 font-bold text-xl">Curso no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      {/* Header / Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-12">
            
          <div className="lg:col-span-2 space-y-4">
             <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {course.level || "General"}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
              {course.title}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              {course.description}
            </p>
            
             <div className="flex items-center gap-4 text-gray-700 mt-4">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500 text-xl">★</span>
                <span className="font-bold">{avgRating}</span>
                <span className="text-gray-500">({reviews.length} reseñas)</span>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-24 h-fit">
             <div className="bg-gray-100 h-48 flex items-center justify-center border-b border-gray-200">
                 <span className="text-6xl">📚</span>
             </div>
             <div className="p-6 space-y-6">
                 <div className="text-4xl font-bold text-gray-900">
                    ${course.price}
                 </div>

                 {isOwner ? (
                      <button
                        onClick={() => router.push(`/instructor/manage/${course.id}`)}
                        className="w-full bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-900 transition flex items-center justify-center gap-2"
                      >
                        ⚙️ Gestionar mi Curso
                      </button>
                 ) : isEnrolled ? (
                      <button
                        onClick={() => router.push(`/player/${course.id}`)}
                        className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
                      >
                        ▶️ Ir al Aula
                      </button>
                 ) : (
                      <button
                        onClick={handleEnroll}
                        className="w-full btn-primary py-3 rounded-lg font-bold text-lg"
                      >
                        Comprar Curso
                      </button>
                 )}

                 {isEnrolled && !isOwner && (
                     <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="w-full border border-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-50 transition"
                     >
                        {showReviewForm ? "Cancelar Reseña" : "⭐ Escribir Reseña"}
                     </button>
                 )}
                 
                 <p className="text-center text-sm text-gray-500">
                    Acceso de por vida • Certificado incluido
                 </p>
             </div>
          </div>

        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-12">
         <div className="lg:col-span-2 space-y-12">
            
            {/* Syllabus */}
            <div>
               <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2 border-gray-200">
                   Contenido del Curso
               </h2>
               {course.sections && course.sections.length > 0 ? (
                 <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    {course.sections.map((section, idx) => (
                        <div key={section.id} className="border-b border-gray-200 last:border-0">
                            <div className="bg-gray-50 px-6 py-4 font-semibold text-gray-800 flex justify-between">
                               <span>{section.title}</span>
                               <span className="text-sm text-gray-500">{section.lessons.length} lecciones</span>
                            </div>
                            <ul className="divide-y divide-gray-100">
                                {section.lessons.map((lesson) => (
                                    <li key={lesson.id} className="px-6 py-3 flex items-center gap-3 text-gray-600 hover:bg-gray-50 transition">
                                        <span className="text-blue-500">▶</span>
                                        {lesson.title}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                 </div>
               ) : (
                   <p className="text-gray-500 italic">El instructor aún no ha publicado contenido.</p>
               )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tu valoración</h3>
                  <div className="flex gap-2 mb-4">
                     {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                          className={`text-2xl ${n <= reviewForm.rating ? "text-yellow-400" : "text-gray-300"}`}
                        >
                          ★
                        </button>
                     ))}
                  </div>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
                    rows={4}
                    placeholder="Cuéntanos qué te pareció el curso..."
                    required
                  />
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">
                      Enviar
                  </button>
              </form>
            )}

            {/* Reviews List */}
            <div>
               <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2 border-gray-200">
                   Opiniones de Estudiantes
               </h2>
               <div className="space-y-6">
                  {reviews.length > 0 ? (
                      reviews.map((review) => (
                          <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                              <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                                      {review.user_name?.charAt(0) || "U"}
                                  </div>
                                  <div>
                                      <div className="font-bold text-gray-900">{review.user_name}</div>
                                      <div className="text-yellow-400 text-sm">
                                          {"★".repeat(review.rating)}
                                          {"☆".repeat(5 - review.rating)}
                                      </div>
                                  </div>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                              {review.instructor_reply && (
                                  <div className="mt-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                                      <p className="text-sm font-bold text-blue-900 mb-1">Respuesta del Instructor:</p>
                                      <p className="text-gray-800 italic">{review.instructor_reply}</p>
                                  </div>
                              )}
                          </div>
                      ))
                  ) : (
                      <p className="text-gray-500">Sé el primero en calificar este curso.</p>
                  )}
               </div>
            </div>

         </div>
      </div>
    </div>
  );
}
