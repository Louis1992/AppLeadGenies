import React from "react";
import { base44 } from "@/api/entities";
import { useQuery } from "@tanstack/react-query";
import { Trophy, CheckCircle, Clock, TrendingUp, HelpCircle } from "lucide-react";

export default function ProgressPage() {
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['modules'],
    queryFn: () => base44.entities.Module.list(),
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => base44.entities.Lesson.list(),
  });

  const { data: progress = [], isLoading } = useQuery({
    queryKey: ['my-progress'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProgress.filter({ created_by: user.email });
    },
  });

  const { data: quizResults = [] } = useQuery({
    queryKey: ['my-quiz-results'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.QuizResult.filter({ created_by: user.email });
    },
  });

  const completedCount = progress.filter(p => p.completed).length;
  const totalLessons = lessons.length;
  const completionPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  
  const averageQuizScore = quizResults.length > 0
    ? Math.round(quizResults.reduce((sum, r) => sum + r.quiz_score, 0) / quizResults.length)
    : 0;

  if (isLoading) {
    return (
      <div className="clay-card p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-300 border-t-purple-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="clay-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                 style={{
                   background: "linear-gradient(145deg, #B39DDB, #9575CD)",
                   boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.1)"
                 }}>
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">
            {completionPercentage}%
          </h3>
          <p className="text-gray-600">Gesamtfortschritt</p>
        </div>

        <div className="clay-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                 style={{
                   background: "linear-gradient(145deg, #81C784, #66BB6A)",
                   boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.1)"
                 }}>
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">
            {completedCount} / {totalLessons}
          </h3>
          <p className="text-gray-600">Abgeschlossene Lektionen</p>
        </div>

        <div className="clay-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                 style={{
                   background: "linear-gradient(145deg, #64B5F6, #42A5F5)",
                   boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.1)"
                 }}>
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">
            {averageQuizScore}%
          </h3>
          <p className="text-gray-600">Durchschn. Quiz-Ergebnis</p>
        </div>
      </div>

      {/* Course List */}
      <div className="clay-card p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Ihr Lernverlauf</h2>
        
        <div className="space-y-4">
          {courses.map((course) => {
            const courseModules = modules.filter(m => m.course_id === course.id);
            const courseLessons = lessons.filter(l => courseModules.some(m => m.id === l.module_id));
            const courseProgress = progress.filter(p => courseLessons.some(l => l.id === p.lesson_id));
            const completedLessons = courseProgress.filter(p => p.completed).length;
            const coursePercentage = courseLessons.length > 0 
              ? Math.round((completedLessons / courseLessons.length) * 100) 
              : 0;

            const courseQuizResults = quizResults.filter(r => courseModules.some(m => m.id === r.module_id));

            return (
              <div key={course.id} className="clay-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {coursePercentage === 100 ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-gray-400" />
                    )}
                    <div>
                      <h3 className="font-bold text-gray-800">{course.title}</h3>
                      <p className="text-sm text-gray-600">
                        {completedLessons} von {courseLessons.length} Lektionen abgeschlossen
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${coursePercentage === 100 ? 'text-green-600' : 'text-gray-600'}`}>
                    {coursePercentage}%
                  </span>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${coursePercentage}%`,
                      background: coursePercentage === 100
                        ? "linear-gradient(90deg, #81C784, #66BB6A)"
                        : "linear-gradient(90deg, #B39DDB, #9575CD)"
                    }}
                  />
                </div>

                {/* Quiz-Ergebnisse */}
                {courseQuizResults.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Quiz-Ergebnisse:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {courseQuizResults.map(result => {
                        const module = modules.find(m => m.id === result.module_id);
                        return (
                          <div key={result.id} className="clay-card p-2 text-xs">
                            <p className="font-medium text-gray-800 truncate">{module?.title}</p>
                            <p className={`font-bold ${result.quiz_score >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                              {result.quiz_score}%
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {courses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Noch keine Kurse verfügbar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}