
import React, { useState } from "react";
import { base44 } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Video, AlertTriangle, HelpCircle } from "lucide-react";

// --- FORMULAR-KOMPONENTEN ---

function CourseForm({ course: existingCourse, onFinished }) {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState(existingCourse?.title || '');
    const [description, setDescription] = useState(existingCourse?.description || '');
    const [thumbnailFile, setThumbnailFile] = useState(null);

    const mutation = useMutation({
        mutationFn: async (data) => {
            let thumbnail_url = existingCourse?.thumbnail_url;
            if (thumbnailFile) {
                const { file_url } = await base44.integrations.Core.UploadFile({ file: thumbnailFile });
                thumbnail_url = file_url;
            }
            const courseData = { ...data, thumbnail_url };
            return existingCourse ? base44.entities.Course.update(existingCourse.id, courseData) : base44.entities.Course.create(courseData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            toast.success(`Kurs ${existingCourse ? 'aktualisiert' : 'erstellt'}.`);
            onFinished();
        },
        onError: (e) => toast.error(`Fehler: ${e.message}`)
    });

    return (
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ title, description }); }} className="space-y-4">
            <Input placeholder="Kurstitel" value={title} onChange={e => setTitle(e.target.value)} required className="clay-button" />
            <Textarea placeholder="Kursbeschreibung" value={description} onChange={e => setDescription(e.target.value)} className="clay-button" />
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
                <Input type="file" accept="image/*" onChange={e => setThumbnailFile(e.target.files[0])} className="clay-button p-2" />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" className="clay-button">Abbrechen</Button></DialogClose>
                <Button type="submit" disabled={mutation.isPending} className="clay-button bg-purple-200">{mutation.isPending ? 'Speichern...' : 'Speichern'}</Button>
            </DialogFooter>
        </form>
    );
}

function ModuleForm({ courseId, module: existingModule, onFinished }) {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState(existingModule?.title || '');
    const [order, setOrder] = useState(existingModule?.order || 0);

    const mutation = useMutation({
        mutationFn: (data) => existingModule ? base44.entities.Module.update(existingModule.id, data) : base44.entities.Module.create({ ...data, course_id: courseId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
            toast.success(`Abschnitt ${existingModule ? 'aktualisiert' : 'erstellt'}.`);
            onFinished();
        },
        onError: () => toast.error("Fehler beim Speichern des Abschnitts.")
    });

    return (
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ title, order: Number(order) }); }} className="space-y-4">
            <Input placeholder="Titel des Abschnitts" value={title} onChange={e => setTitle(e.target.value)} required className="clay-button" />
            <Input type="number" placeholder="Reihenfolge" value={order} onChange={e => setOrder(e.target.value)} className="clay-button" />
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" className="clay-button">Abbrechen</Button></DialogClose>
                <Button type="submit" disabled={mutation.isPending} className="clay-button bg-purple-200">{mutation.isPending ? 'Speichern...' : 'Speichern'}</Button>
            </DialogFooter>
        </form>
    );
}

function LessonForm({ moduleId, lesson: existingLesson, onFinished }) {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState(existingLesson?.title || '');
    const [duration, setDuration] = useState(existingLesson?.duration || '');
    const [order, setOrder] = useState(existingLesson?.order || 0);
    const [videoUrl, setVideoUrl] = useState(existingLesson?.video_url || '');

    const mutation = useMutation({
        mutationFn: async (data) => {
            if (!data.video_url) {
                throw new Error("Eine Video-URL ist erforderlich.");
            }
            const lessonData = { ...data, module_id: moduleId };
            return existingLesson 
                ? base44.entities.Lesson.update(existingLesson.id, lessonData) 
                : base44.entities.Lesson.create(lessonData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-lessons'] });
            toast.success(`Video ${existingLesson ? 'aktualisiert' : 'hinzugefügt'}.`);
            onFinished();
        },
        onError: (e) => toast.error(`Fehler: ${e.message}`)
    });

    return (
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ title, duration: Number(duration), order: Number(order), video_url: videoUrl }); }} className="space-y-4">
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-lg mb-6" role="alert">
                <div className="flex">
                    <div className="py-1"><AlertTriangle className="h-6 w-6 text-blue-600 mr-4"/></div>
                    <div>
                        <p className="font-bold">Neuer Workflow: Videos extern hosten</p>
                        <p className="text-sm">
                            1. Laden Sie Ihr Video auf **Vimeo** oder **YouTube** hoch (privat/ungelistet).
                            <br/>2. Kopieren Sie den Video-Link (z.B. bei Vimeo "Teilen" → "Link kopieren").
                            <br/>3. Fügen Sie den Link unten in das Feld "Video-URL" ein.
                        </p>
                    </div>
                </div>
            </div>
            <Input placeholder="Titel des Videos" value={title} onChange={e => setTitle(e.target.value)} required className="clay-button"/>
            <div className="grid grid-cols-2 gap-4">
                <Input type="number" placeholder="Dauer (Min)" value={duration} onChange={e => setDuration(e.target.value)} className="clay-button" />
                <Input type="number" placeholder="Reihenfolge" value={order} onChange={e => setOrder(e.target.value)} className="clay-button" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video-URL *</label>
                <Input type="url" placeholder="https://vimeo.com/12345678" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required className="clay-button p-2" />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" className="clay-button">Abbrechen</Button></DialogClose>
                <Button type="submit" disabled={mutation.isPending} className="clay-button bg-purple-200">{mutation.isPending ? 'Speichern...' : 'Speichern'}</Button>
            </DialogFooter>
        </form>
    );
}

function QuizForm({ moduleId, quiz: existingQuiz, onFinished }) {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState(existingQuiz?.title || '');
    const [questions, setQuestions] = useState(existingQuiz?.questions || [
        { question: '', options: ['', '', '', ''], correct_answer: 0 }
    ]);

    const addQuestion = () => {
        setQuestions([...questions, { question: '', options: ['', '', '', ''], correct_answer: 0 }]);
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);
    };

    const updateOption = (qIndex, oIndex, value) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex] = value;
        setQuestions(updated);
    };

    const mutation = useMutation({
        mutationFn: (data) => existingQuiz 
            ? base44.entities.Quiz.update(existingQuiz.id, data) 
            : base44.entities.Quiz.create({ ...data, module_id: moduleId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
            toast.success(`Quiz ${existingQuiz ? 'aktualisiert' : 'erstellt'}.`);
            onFinished();
        },
        onError: (e) => toast.error(`Fehler: ${e.message}`)
    });

    return (
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ title, questions }); }} className="space-y-4 max-h-[70vh] overflow-y-auto">
            <Input placeholder="Quiz-Titel" value={title} onChange={e => setTitle(e.target.value)} required className="clay-button" />
            
            <div className="space-y-4">
                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="clay-card p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-gray-800">Frage {qIndex + 1}</h4>
                            {questions.length > 1 && (
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(qIndex)}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            )}
                        </div>
                        
                        <Input 
                            placeholder="Frage eingeben..." 
                            value={q.question} 
                            onChange={e => updateQuestion(qIndex, 'question', e.target.value)} 
                            required 
                            className="clay-button"
                        />
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Antwortmöglichkeiten:</label>
                            {q.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex gap-2 items-center">
                                    <input 
                                        type="radio" 
                                        name={`correct-${qIndex}`} 
                                        checked={q.correct_answer === oIndex}
                                        onChange={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                                        className="w-4 h-4"
                                    />
                                    <Input 
                                        placeholder={`Antwort ${oIndex + 1}`}
                                        value={option}
                                        onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                                        required
                                        className="clay-button flex-1"
                                    />
                                    <span className="text-xs text-gray-500">
                                        {q.correct_answer === oIndex && '✓ Richtig'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Button type="button" onClick={addQuestion} variant="outline" className="w-full clay-button">
                <Plus className="mr-2 w-4 h-4" /> Frage hinzufügen
            </Button>

            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" className="clay-button">Abbrechen</Button></DialogClose>
                <Button type="submit" disabled={mutation.isPending} className="clay-button bg-purple-200">
                    {mutation.isPending ? 'Speichern...' : 'Speichern'}
                </Button>
            </DialogFooter>
        </form>
    );
}

// --- ADMIN-HAUPTSEITE ---

export default function AdminPage() {
    const queryClient = useQueryClient();

    const { data: courses = [] } = useQuery({ queryKey: ['admin-courses'], queryFn: () => base44.entities.Course.list() });
    const { data: modules = [] } = useQuery({ queryKey: ['admin-modules'], queryFn: () => base44.entities.Module.list() });
    const { data: lessons = [] } = useQuery({ queryKey: ['admin-lessons'], queryFn: () => base44.entities.Lesson.list() });
    const { data: quizzes = [] } = useQuery({ queryKey: ['admin-quizzes'], queryFn: () => base44.entities.Quiz.list() });

    const deleteMutation = useMutation({
        mutationFn: ({ type, id }) => {
            if (type === 'course') return base44.entities.Course.delete(id);
            if (type === 'module') return base44.entities.Module.delete(id);
            if (type === 'lesson') return base44.entities.Lesson.delete(id);
            if (type === 'quiz') return base44.entities.Quiz.delete(id);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [`admin-${variables.type}${variables.type === 'quiz' ? 'zes' : 's'}`] });
            toast.success("Erfolgreich gelöscht.");
        },
        onError: (e) => toast.error(`Fehler beim Löschen: ${e.message}`)
    });

    return (
        <div className="space-y-6">
            <div className="clay-card p-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Kursverwaltung</h2>
                    <p className="text-gray-600 mt-1">Kurse, Videos und Quizzes verwalten.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="clay-button px-6 py-3" style={{background: "linear-gradient(145deg, #B39DDB, #9575CD)", color: "white"}}>
                            <Plus className="mr-2"/> Neuer Kurs
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Neuen Kurs erstellen</DialogTitle></DialogHeader>
                        <CourseForm onFinished={() => document.querySelector('[data-radix-dialog-close]')?.click()} />
                    </DialogContent>
                </Dialog>
            </div>

            <Accordion type="multiple" className="space-y-4">
                {courses.map(course => (
                    <AccordionItem key={course.id} value={course.id} className="clay-card border-none overflow-hidden">
                        <AccordionTrigger className="p-4 hover:no-underline font-bold text-lg flex justify-between w-full">
                            <span>{course.title}</span>
                            <div className="flex items-center gap-1 mr-2">
                                <Dialog onOpenChange={(open) => !open && event.stopPropagation()}>
                                    <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon"><Edit2 className="w-4 h-4"/></Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader><DialogTitle>Kurs bearbeiten</DialogTitle></DialogHeader>
                                        <CourseForm course={course} onFinished={() => document.querySelector('[data-radix-dialog-close]')?.click()} />
                                    </DialogContent>
                                </Dialog>
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); if(confirm('Kurs wirklich löschen?')) deleteMutation.mutate({ type: 'course', id: course.id });}}>
                                    <Trash2 className="w-4 h-4 text-red-500"/>
                                </Button>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                            <div className="space-y-3 pl-4 border-l-2 border-purple-200">
                                {modules.filter(m => m.course_id === course.id).sort((a,b)=>a.order-b.order).map(module => {
                                    const moduleQuiz = quizzes.find(q => q.module_id === module.id); // Find quiz for the module
                                    return (
                                        <div key={module.id} className="bg-white/70 p-3 rounded-lg">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-semibold text-gray-800">{module.title}</h4>
                                                <div className="flex items-center gap-1">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="sm"><Edit2 className="w-4"/></Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader><DialogTitle>Abschnitt bearbeiten</DialogTitle></DialogHeader>
                                                            <ModuleForm courseId={course.id} module={module} onFinished={() => document.querySelector('[data-radix-dialog-close]')?.click()} />
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ type: 'module', id: module.id })}>
                                                        <Trash2 className="w-4 text-red-500"/>
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                            {/* Videos */}
                                            <div className="pl-4 space-y-2">
                                                {lessons.filter(l => l.module_id === module.id).sort((a,b)=>a.order-b.order).map(lesson => (
                                                    <div key={lesson.id} className="flex justify-between items-center text-sm">
                                                        <span className="flex items-center gap-2">
                                                            <Video className="w-4 h-4 text-purple-600"/> {lesson.title}
                                                        </span>
                                                        <div className="flex items-center">
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                        <Edit2 className="w-3"/>
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader><DialogTitle>Video bearbeiten</DialogTitle></DialogHeader>
                                                                    <LessonForm moduleId={module.id} lesson={lesson} onFinished={() => document.querySelector('[data-radix-dialog-close]')?.click()} />
                                                                </DialogContent>
                                                            </Dialog>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate({ type: 'lesson', id: lesson.id })}>
                                                                <Trash2 className="w-3 text-red-500"/>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Quiz-Anzeige */}
                                            {moduleQuiz && (
                                                <div className="flex justify-between items-center text-xs text-gray-600 bg-green-50 p-2 rounded ml-4 mt-2">
                                                    <span className="flex items-center gap-1">
                                                        <HelpCircle className="w-3 h-3 text-green-600"/> Quiz: {moduleQuiz.title} ({moduleQuiz.questions?.length || 0} Fragen)
                                                    </span>
                                                    <div className="flex items-center">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                    <Edit2 className="w-3"/>
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-2xl">
                                                                <DialogHeader><DialogTitle>Quiz bearbeiten</DialogTitle></DialogHeader>
                                                                <QuizForm moduleId={module.id} quiz={moduleQuiz} onFinished={() => document.querySelector('[data-radix-dialog-close]')?.click()} />
                                                            </DialogContent>
                                                        </Dialog>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteMutation.mutate({ type: 'quiz', id: moduleQuiz.id })}>
                                                            <Trash2 className="w-3 text-red-500"/>
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Buttons zum Hinzufügen */}
                                            <div className="grid grid-cols-2 gap-2 mt-3">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="clay-button text-xs">
                                                            <Plus className="w-3 mr-1"/> Video
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader><DialogTitle>Neues Video für "{module.title}"</DialogTitle></DialogHeader>
                                                        <LessonForm moduleId={module.id} onFinished={() => document.querySelector('[data-radix-dialog-close]')?.click()} />
                                                    </DialogContent>
                                                </Dialog>

                                                {!moduleQuiz && ( // Only show "Quiz hinzufügen" if no quiz exists for this module
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm" className="clay-button text-xs">
                                                                <Plus className="w-3 mr-1"/> Quiz
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl">
                                                            <DialogHeader><DialogTitle>Neues Quiz für "{module.title}"</DialogTitle></DialogHeader>
                                                            <QuizForm moduleId={module.id} onFinished={() => document.querySelector('[data-radix-dialog-close]')?.click()} />
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full clay-button mt-4">
                                            <Plus className="mr-2"/> Abschnitt hinzufügen
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader><DialogTitle>Neuer Abschnitt für "{course.title}"</DialogTitle></DialogHeader>
                                        <ModuleForm courseId={course.id} onFinished={() => document.querySelector('[data-radix-dialog-close]')?.click()} />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
