import React, { useState } from "react";
import { base44 } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, CheckCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function QuizPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const moduleId = urlParams.get('moduleId');

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const { data: module, isLoading: moduleLoading } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => base44.entities.Module.list().then(m => m.find(m => m.id === moduleId)),
    enabled: !!moduleId,
  });

  const { data: quiz, isLoading: quizLoading } = useQuery({
    queryKey: ['quiz', moduleId],
    queryFn: () => base44.entities.Quiz.filter({ module_id: moduleId }).then(q => q[0]),
    enabled: !!moduleId,
  });

  const { data: quizResult } = useQuery({
    queryKey: ['quiz-result', moduleId],
    queryFn: async () => {
      const user = await base44.auth.me();
      const results = await base44.entities.QuizResult.filter({ module_id: moduleId, created_by: user.email });
      return results[0];
    },
    enabled: !!moduleId,
  });

  const saveQuizResultMutation = useMutation({
    mutationFn: async (score) => {
      const data = { module_id: moduleId, quiz_score: score, completed: true };
      if (quizResult) {
        return base44.entities.QuizResult.update(quizResult.id, data);
      } else {
        return base44.entities.QuizResult.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['quiz-result', moduleId]});
      queryClient.invalidateQueries({queryKey:['my-quiz-results']});
      toast.success("Quiz erfolgreich abgeschlossen!");
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
    saveQuizResultMutation.mutate(score);
  };

  if (moduleLoading || quizLoading) {
    return <div className="clay-card p-12 text-center animate-pulse">Lade Quiz...</div>;
  }

  if (!quiz) {
    return (
      <div className="clay-card p-12 text-center">
        <p className="text-gray-600">Kein Quiz für diesen Abschnitt gefunden.</p>
        <Button onClick={() => navigate(-1)} className="clay-button mt-4">
          <ArrowLeft className="mr-2" /> Zurück
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button
        onClick={() => navigate(createPageUrl(`CourseDetail?id=${module?.course_id}`))}
        className="clay-button px-6 py-3 mb-6 flex items-center gap-2 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Zurück zum Kurs
      </Button>

      <div className="clay-card p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{quiz.title}</h1>
            <p className="text-gray-600">Abschnitt: {module?.title}</p>
          </div>
        </div>
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
            className="w-full py-4 text-lg font-bold clay-card"
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
          <p className="text-gray-700 mb-6">
            {quizScore >= 70 
              ? 'Sie haben das Quiz erfolgreich bestanden.' 
              : 'Sie können das Quiz jederzeit wiederholen.'}
          </p>
          <Button
            onClick={() => navigate(createPageUrl(`CourseDetail?id=${module?.course_id}`))}
            className="clay-button"
          >
            Zurück zum Kurs
          </Button>
        </div>
      )}
    </div>
  );
}