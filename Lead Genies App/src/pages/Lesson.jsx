import React, { useState } from "react";
import { base44 } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, CheckCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Helfer-Funktion, um YouTube/Vimeo-Links in einbettbare URLs umzuwandeln
function getEmbedUrl(url) {
    if (!url) return null;

    let videoId = null;

    // YouTube
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch && youtubeMatch[1]) {
        videoId = youtubeMatch[1];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
    }

    // Vimeo
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch && vimeoMatch[1]) {
        videoId = vimeoMatch[1];
        return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }

    // Direkte .mp4-URL
    if(url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov')) {
        return url;
    }

    return null;
}

export default function LessonPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const lessonId = urlParams.get('id');

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => base44.entities.Lesson.list().then(l => l.find(l => l.id === lessonId)),
    enabled: !!lessonId,
  });

  const { data: module, isLoading: moduleLoading } = useQuery({
      queryKey: ['module-for-lesson', lesson?.module_id],
      queryFn: () => base44.entities.Module.list().then(m => m.find(m => m.id === lesson.module_id)),
      enabled: !!lesson
  });

  const { data: quiz } = useQuery({
    queryKey: ['quiz', lessonId],
    queryFn: () => base44.entities.Quiz.filter({ lesson_id: lessonId }).then(q => q[0]),
    enabled: !!lessonId,
  });

  const { data: userProgress } = useQuery({
    queryKey: ['progress', lessonId],
    queryFn: async () => {
      const user = await base44.auth.me();
      const progress = await base44.entities.UserProgress.filter({ lesson_id: lessonId, created_by: user.email });
      return progress[0];
    },
    enabled: !!lessonId,
  });

  const completeLessonMutation = useMutation({
    mutationFn: async (score) => {
      const data = { completed: true, watched_percentage: 100, quiz_score: score };
      if (userProgress) {
        return base44.entities.UserProgress.update(userProgress.id, data);
      } else {
        return base44.entities.UserProgress.create({ ...data, lesson_id: lessonId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['progress', lessonId]});
      queryClient.invalidateQueries({queryKey:['my-progress']});
      toast.success("Lektion erfolgreich abgeschlossen!");
    },
  });

  const handleQuizSubmit = () => {
    if (!quiz) return;
    
    let correct = 0;
    quiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct_answer) {
        correct++;
      }
    });
    
    const score = Math.round((correct / quiz.questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    completeLessonMutation.mutate(score);
  };

  if (lessonLoading || moduleLoading) {
    return <div className="clay-card p-12 text-center animate-pulse">Lade Lektion...</div>;
  }

  const embedUrl = getEmbedUrl(lesson?.video_url);
  const hasQuiz = quiz && quiz.questions && quiz.questions.length > 0;

  return (
    <div>
      <Button
        onClick={() => navigate(createPageUrl(`CourseDetail?id=${module?.course_id}`))}
        className="clay-button px-6 py-3 mb-6 flex items-center gap-2 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Zurück zum Kurs
      </Button>

      <div className="clay-card overflow-hidden mb-6">
        <div className="relative bg-black aspect-video">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={lesson.title}
            ></iframe>
          ) : (
             <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
                <h3 className="text-lg font-bold text-red-600">Video konnte nicht geladen werden</h3>
                <p className="text-gray-700 mt-2">
                    Bitte überprüfen Sie, ob der Link von Vimeo oder YouTube korrekt ist.
                </p>
             </div>
          )}
        </div>

        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{lesson.title}</h1>
        </div>
      </div>

      {/* Quiz Section */}
      {hasQuiz && (
        <div className="clay-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">{quiz.title}</h2>
          </div>

          {!quizSubmitted ? (
            <div className="space-y-6">
              {quiz.questions.map((q, qIndex) => (
                <div key={qIndex} className="clay-card p-6">
                  <h3 className="font-bold text-gray-800 mb-4">
                    {qIndex + 1}. {q.question}
                  </h3>
                  <div className="space-y-3">
                    {q.options.map((option, oIndex) => (
                      <label
                        key={oIndex}
                        className={`clay-button p-4 flex items-center gap-3 cursor-pointer transition-all ${
                          selectedAnswers[qIndex] === oIndex ? 'ring-2 ring-purple-500' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          checked={selectedAnswers[qIndex] === oIndex}
                          onChange={() => setSelectedAnswers({ ...selectedAnswers, [qIndex]: oIndex })}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <Button
                onClick={handleQuizSubmit}
                disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
                className="w-full py-4 text-lg font-bold"
                style={{ background: "linear-gradient(145deg, #B39DDB, #9575CD)", color: "white" }}
              >
                Quiz abschließen
              </Button>
            </div>
          ) : (
            <div className="clay-card p-8 text-center" style={{ 
              background: quizScore >= 70 
                ? "linear-gradient(145deg, #C8E6C9, #A5D6A7)" 
                : "linear-gradient(145deg, #FFCCBC, #FFAB91)" 
            }}>
              <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: quizScore >= 70 ? '#2E7D32' : '#D84315' }} />
              <h3 className="text-2xl font-bold mb-2" style={{ color: quizScore >= 70 ? '#2E7D32' : '#D84315' }}>
                {quizScore >= 70 ? 'Hervorragend!' : 'Gut gemacht!'}
              </h3>
              <p className="text-xl font-bold mb-4">
                Ihre Punktzahl: {quizScore}%
              </p>
              <p className="text-gray-700">
                {quizScore >= 70 
                  ? 'Sie haben das Quiz erfolgreich bestanden.' 
                  : 'Sie können das Quiz jederzeit wiederholen.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Ohne Quiz: Direkter Abschluss-Button */}
      {!hasQuiz && !userProgress?.completed && (
        <div className="clay-card p-8">
          <Button
            onClick={() => completeLessonMutation.mutate(100)}
            disabled={completeLessonMutation.isPending}
            className="w-full py-4 font-bold text-lg"
            style={{ background: "linear-gradient(145deg, #B39DDB, #9575CD)", color: "white" }}
          >
            <CheckCircle className="mr-2" />
            Lektion als abgeschlossen markieren
          </Button>
        </div>
      )}

      {userProgress?.completed && (
        <div className="clay-card p-6 flex items-center gap-3" style={{ background: "linear-gradient(145deg, #C8E6C9, #A5D6A7)" }}>
          <CheckCircle className="w-6 h-6 text-green-800" />
          <div>
            <p className="font-bold text-green-800">Lektion abgeschlossen!</p>
            {userProgress.quiz_score && (
              <p className="text-sm text-green-700">Quiz-Ergebnis: {userProgress.quiz_score}%</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}