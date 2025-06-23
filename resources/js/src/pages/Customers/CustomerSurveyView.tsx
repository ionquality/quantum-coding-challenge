// src/views/CustomerSurveyView.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useParams } from 'react-router-dom';
import StarRating from '../Components/StarRating';
import Loading from '../Components/Loading';
import api from '../../utils/axios';
// Interfaces
interface Question {
  id: string;
  sequence: number;
  question: string;
  score_actual?: number;
  comment?: string;
}
interface Survey {
  id: number;
  name: string;
  description: string;
  customer_name: string;
  primary_contact: string;
  email: string;
  phone: string;
  complete: number | boolean;
  completed_at?: string;
  reviewed_at?:string;
  reviewed?:number | boolean
  questions: Question[];
  comment?: string;
}
interface Answer {
  score: number;
  comment: string;
}

const CustomerSurveyView: React.FC = () => {
  const dispatch = useDispatch();
  const { customerSurveyId } = useParams<{ customerSurveyId: string }>();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loggedUser, setLoggedUser] = useState<{} | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [finalComment, setFinalComment] = useState('');
  const [loading, setLoading] = useState(true);

  // Page title
  useEffect(() => {
    dispatch(setPageTitle('Customer Survey'));
  }, [dispatch]);

  // Load survey function
  const loadSurvey = useCallback(() => {
    setLoading(true);
    api.get(`/api/customer-surveys/${customerSurveyId}`)
      .then((result) => {
        let data: Survey = result.data.survey;
        
        const isComplete = data.complete === true || data.complete === 1;
        const normalized: Survey = { ...data, complete: isComplete };
        setSurvey(normalized);
        setLoggedUser(result.data.loggedUser);
        setAnswers(
          normalized.questions.map(q => ({ score: q.score_actual ?? 0, comment: q.comment ?? '' }))
        );
        setFinalComment(normalized.comment ?? '');
      })
      .finally(() => setLoading(false));
  }, [customerSurveyId]);

  // Initial load
  useEffect(() => {
    loadSurvey();
  }, [loadSurvey]);

  const isReadOnly = !!survey?.reviewed;
  const iscompleted = !!survey?.complete;

  // Handlers
  const handleScoreChange = (idx: number, newScore: number) => {
    if (isReadOnly) return;
    setAnswers(prev => {
      const a = [...prev];
      a[idx] = { ...a[idx], score: newScore };
      return a;
    });
  };

  const handleCommentChange = (idx: number, newComment: string) => {
    if (isReadOnly) return;
    setAnswers(prev => {
      const a = [...prev];
      a[idx] = { ...a[idx], comment: newComment };
      return a;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    
  
    let url = `/api/customer-surveys/review/${customerSurveyId}`;
    if (iscompleted){
      api.post(url, {'answers':answers,'finalComment':finalComment})
         .then(() => {
          // Refetch
          loadSurvey();
      });
    }else{
      url = `/api/customer-surveys/${customerSurveyId}`;
      api.put(url, {'answers':answers,'finalComment':finalComment})
        .then(() => {
          // Refetch
          loadSurvey();
      });
    }
   
  };

  if (loading) return <Loading />;
  if (!survey) return <p className="text-center text-red-500">Failed to load survey.</p>;

  return (
    <div>
      {/* Background layers */}
      <div className="absolute inset-0">
        <img
          src="/assets/images/auth/bg-gradient.png"
          alt="bg"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
        {/* Decorative images */}
        <img
          src="/assets/images/auth/coming-soon-object1.png"
          alt="decor"
          className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2"
        />
        <img
          src="/assets/images/auth/coming-soon-object2.png"
          alt="decor"
          className="absolute left-24 top-0 h-40 md:left-[30%]"
        />
        <img
          src="/assets/images/auth/coming-soon-object3.png"
          alt="decor"
          className="absolute right-0 top-0 h-[300px]"
        />
        <img
          src="/assets/images/auth/polygon-object.svg"
          alt="decor"
          className="absolute bottom-0 end-[28%]"
        />

        {/* Card container */}
        <div className="relative w-full max-w-[1024px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
          <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 py-20 lg:min-h-[758px]">
            <div className="mx-auto w-full max-w-[870px]">
              <form onSubmit={handleSubmit} className="p-6 space-y-8 bg-white shadow-md rounded">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">Customer Survey</h1>
                    <p className="mt-2 text-gray-600 whitespace-pre-line">
                      {survey.description}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-bold text-lg">{survey.customer_name}</div>
                    <div>{survey.primary_contact}</div>
                    <div>{survey.phone}</div>
                    <div className="underline text-blue-600">{survey.email}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {/* Completed alert */}
                  {iscompleted && survey.completed_at && (
                    <div className="p-4 text-green-800 bg-green-100 rounded-lg">
                      Survey completed on{' '}
                      {new Date(survey.completed_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  )}
                  
                  {isReadOnly && survey.reviewed_at && (
                    <div className="p-4 mb-4 text-blue-800 bg-blue-100 rounded-lg">
                      Survey reviewed on{' '}
                      {new Date(survey.reviewed_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}{' '}by{' '}{loggedUser.name}
                    </div>
                  )}
                </div>
                {/* Questions */}
                {survey.questions.map((q, idx) => (
                  <div key={q.id} className="space-y-2 border-b pb-4">
                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 font-semibold rounded-full text-sm">
                      Question {idx + 1}
                    </span>
                    <div className="mt-1 mb-2 text-gray-800">{q.question}</div>
                    <StarRating
                      value={answers[idx].score}
                      onChange={val => handleScoreChange(idx, val)}
                    />
                    <textarea
                      readOnly={isReadOnly}
                      className="w-full mt-2 p-2 border rounded focus:ring-indigo-300"
                      rows={2}
                      placeholder="Optional comment…"
                      value={answers[idx].comment}
                      onChange={e => handleCommentChange(idx, e.target.value)}
                    />
                  </div>
                ))}

                {/* Final comment */}
                <div className="space-y-1">
                  <span className="font-semibold">Additional Comments</span>
                  <textarea
                    readOnly={isReadOnly}
                    className="w-full p-2 border rounded focus:ring-indigo-300"
                    rows={3}
                    placeholder="Anything else you’d like to tell us…"
                    value={finalComment}
                    onChange={e => setFinalComment(e.target.value)}
                  />
                </div>

                {/* Submit button*/}
                {!isReadOnly && !survey.complete && (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                  >
                    Submit Survey
                  </button>
                )}
                {!isReadOnly && !survey.reviewed && survey.complete && loggedUser && (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                  >
                    Review
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSurveyView;
