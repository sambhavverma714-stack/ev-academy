'use client';
import { Suspense } from "react";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Zap, ArrowLeft, CheckCircle, Lock, BookOpen, ClipboardList, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { coursesApi } from '@/lib/api';

function LearnPageContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [currentModule, setCurrentModule] = useState<number>(0);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    async function loadCourse() {
      setLoading(true);
      try {
        const data = await coursesApi.getCourse(params.courseId as string);
        setCourse(data.course);
        setProgress(data.progress);
      } catch (err: any) {
        if (err.status === 402) {
          router.push(`/courses/${params.courseId}`);
        } else {
          console.error('Failed to load course:', err);
        }
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [user, params.courseId, router]);

  const handleCompleteModule = async (moduleId: string) => {
    if (!progress.completedModuleIds.includes(moduleId)) {
      setCompleting(true);
      try {
        const result = await coursesApi.completeModule(params.courseId as string, moduleId);
        setProgress(result.progress);
      } catch (err) {
        console.error('Failed to complete module:', err);
      } finally {
        setCompleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course not found or access denied.</p>
          <Link href="/student/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const module = course.modules[currentModule];
  const isLastModule = currentModule === course.modules.length - 1;
  const isCompleted = progress.completedModuleIds.includes(module.id);

  return (
    <div className="min-h-screen bg-white">
{/* Course Content */}
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Module List */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="bg-soft-white p-4 rounded-lg border border-gray-200 sticky top-24">
                <h3 className="font-semibold text-charcoal mb-4">Course Modules</h3>
                <div className="space-y-2">
                  {course.modules.map((m: any, index: number) => (
                    <button
                      key={m.id}
                      onClick={() => setCurrentModule(index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        currentModule === index
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          progress.completedModuleIds.includes(m.id)
                            ? 'bg-green-600 text-white'
                            : currentModule === index
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {progress.completedModuleIds.includes(m.id) ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-bold">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-charcoal truncate">{m.title}</p>
                          {m.preview && (
                            <span className="text-xs text-green-600">Free Preview</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {progress.assessmentUnlocked && (
                  <Link
                    href={`/student/learn/${params.courseId}/assessment`}
                    className="mt-4 block w-full text-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <ClipboardList className="h-5 w-5 inline mr-2" />
                    Take Assessment
                  </Link>
                )}

                {progress.passed && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                    <Award className="h-5 w-5 text-green-600 inline mr-2" />
                    <span className="text-green-800 font-medium">Certificate Earned!</span>
                  </div>
                )}
              </div>
            </aside>

            {/* Module Content */}
            <div className="flex-1">
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <div className="mb-6">
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    Module {currentModule + 1} of {course.modules.length}
                  </span>
                  <h1 className="text-3xl font-bold text-charcoal mt-4 mb-2">{module.title}</h1>
                </div>

                <div className="prose prose-lg max-w-none mb-8">
                  {module.content?.map((paragraph: string, index: number) => (
                    <p key={index} className="text-gray-700 mb-4">{paragraph}</p>
                  ))}
                </div>

                {module.figures && module.figures.length > 0 && (
                  <div className="space-y-6 mb-8">
                    {module.figures.map((figure: any, index: number) => (
                      <div key={index} className="bg-soft-white p-6 rounded-lg">
                        {figure.video ? (
                          <div className="aspect-video bg-black rounded-lg overflow-hidden">
                            <iframe
                              src={figure.video}
                              className="w-full h-full"
                              allowFullScreen
                              title={figure.alt}
                            />
                          </div>
                        ) : (
                          <img
                            src={`/img/${figure.src}`}
                            alt={figure.alt}
                            className="w-full rounded-lg"
                          />
                        )}
                        {figure.caption && (
                          <p className="text-sm text-gray-600 mt-2 italic">{figure.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentModule(Math.max(0, currentModule - 1))}
                    disabled={currentModule === 0}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <button
                    onClick={() => handleCompleteModule(module.id)}
                    disabled={completing}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {completing ? (
                      <>Marking as complete...</>
                    ) : isCompleted ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <span>Mark as Complete</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setCurrentModule(Math.min(course.modules.length - 1, currentModule + 1))}
                    disabled={isLastModule}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <LearnPageContent />
    </Suspense>
  );
}
