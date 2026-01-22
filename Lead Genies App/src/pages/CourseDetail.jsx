import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Play, CheckCircle, Clock, HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

export default function CourseDetailPage() {
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');

    const { data: course, isLoading: courseLoading } = useQuery({
        queryKey: ['course', courseId],
        queryFn: () => base44.entities.Course.list().then(c => c.find(c => c.id === courseId)),
        enabled: !!courseId,
    });

    const { data: modules, isLoading: modulesLoading } = useQuery({
        queryKey: ['modules', courseId],
        queryFn: () => base44.entities.Module.filter({ course_id: courseId }, 'order'),
        enabled: !!courseId,
    });

    const { data: lessons, isLoading: lessonsLoading } = useQuery({
        queryKey: ['lessons', courseId],
        queryFn: async () => {
            if (!modules || modules.length === 0) return [];
            const allLessons = await base44.entities.Lesson.list();
            return allLessons.filter(l => modules.some(m => m.id === l.module_id));
        },
        enabled: !!modules && !modulesLoading,
    });

    const { data: quizzes = [] } = useQuery({
        queryKey: ['quizzes', courseId],
        queryFn: async () => {
            if (!modules || modules.length === 0) return [];
            const allQuizzes = await base44.entities.Quiz.list();
            return allQuizzes.filter(q => modules.some(m => m.id === q.module_id));
        },
        enabled: !!modules && !modulesLoading,
    });

    const { data: progressData = [] } = useQuery({
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

    const isLessonCompleted = (lessonId) => {
        return progressData?.find(p => p.lesson_id === lessonId)?.completed;
    };

    const isQuizCompleted = (moduleId) => {
        return quizResults?.find(r => r.module_id === moduleId)?.completed;
    };
    
    const isLoading = courseLoading || modulesLoading || lessonsLoading;

    return (
        <div>
            <Button onClick={() => navigate(createPageUrl('Courses'))} className="clay-button mb-6">
                <ArrowLeft className="mr-2"/> Zurück zur Kursübersicht
            </Button>
            
            {isLoading ? (
                <div className="clay-card p-6 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded-full w-1/2 mb-4" />
                    <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                </div>
            ) : (
                <div className="clay-card p-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{course?.title}</h1>
                    <p className="text-gray-600">{course?.description}</p>
                </div>
            )}
            
            <Accordion type="single" collapsible defaultValue={`module-${modules?.[0]?.id}`} className="w-full space-y-4">
                {modules?.map(module => {
                    const moduleQuiz = quizzes.find(q => q.module_id === module.id);
                    return (
                        <AccordionItem key={module.id} value={`module-${module.id}`} className="clay-card overflow-hidden border-none">
                            <AccordionTrigger className="p-4 hover:no-underline font-bold text-lg">
                                {module.title}
                            </AccordionTrigger>
                            <AccordionContent className="p-4 pt-0">
                                <div className="space-y-2">
                                    {lessons?.filter(l => l.module_id === module.id).sort((a,b) => a.order-b.order).map(lesson => (
                                        <div
                                            key={lesson.id}
                                            onClick={() => navigate(createPageUrl(`Lesson?id=${lesson.id}`))}
                                            className="clay-button p-4 flex items-center justify-between cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                {isLessonCompleted(lesson.id) ? 
                                                    <CheckCircle className="w-5 h-5 text-green-600"/> :
                                                    <Play className="w-5 h-5 text-purple-600"/>
                                                }
                                                <span className="font-medium">{lesson.title}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Clock className="w-4 h-4"/>
                                                <span>{lesson.duration || '?'} min</span>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Quiz als klickbarer Eintrag */}
                                    {moduleQuiz && (
                                        <div
                                            onClick={() => navigate(createPageUrl(`Quiz?moduleId=${module.id}`))}
                                            className="clay-button p-4 flex items-center justify-between cursor-pointer bg-purple-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                {isQuizCompleted(module.id) ? 
                                                    <CheckCircle className="w-5 h-5 text-green-600"/> :
                                                    <HelpCircle className="w-5 h-5 text-purple-600"/>
                                                }
                                                <span className="font-medium">{moduleQuiz.title}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span>{moduleQuiz.questions?.length || 0} Fragen</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
}