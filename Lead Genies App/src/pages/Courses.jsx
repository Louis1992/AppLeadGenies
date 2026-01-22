import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, CheckCircle, Lock } from "lucide-react";

export default function CoursesPage() {
  const navigate = useNavigate();
  
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  // Simplified for now, full progress logic is complex with the new structure.
  // We can enhance this later.
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="clay-card p-6 animate-pulse">
            <div className="w-full h-48 bg-gray-200 rounded-2xl mb-4" />
            <div className="h-6 bg-gray-200 rounded-full w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded-full w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="clay-card p-6 mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Willkommen zu Ihren Schulungen
        </h2>
        <p className="text-gray-600">
          {courses.length} Kurse verfügbar. Wählen Sie einen Kurs, um zu beginnen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => {
          return (
            <div
              key={course.id}
              className="clay-card overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={() => navigate(createPageUrl(`CourseDetail?id=${course.id}`))}
            >
              <div className="relative h-48 overflow-hidden">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover"/>
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${
                        index % 3 === 0 ? '#B39DDB, #9575CD' :
                        index % 3 === 1 ? '#81C784, #66BB6A' :
                        '#64B5F6, #42A5F5'
                      })`
                    }}
                  >
                    <BookOpen className="w-16 h-16 text-white opacity-70" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {course.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {course.description}
                </p>

                <button className="clay-button w-full mt-4 py-3 flex items-center justify-center gap-2 font-medium text-gray-700">
                  <BookOpen className="w-5 h-5" />
                  Kurs ansehen
                </button>
              </div>
            </div>
          );
        })}

        {courses.length === 0 && (
          <div className="col-span-full clay-card p-12 text-center">
            <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Noch keine Kurse verfügbar</h3>
            <p className="text-gray-600">Ihr Administrator wird bald Schulungen hinzufügen.</p>
          </div>
        )}
      </div>
    </div>
  );
}