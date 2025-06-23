import React, { Fragment, useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { ReactSortable } from 'react-sortablejs';
import MySwal from 'sweetalert2';

interface Question {
  id: number;
  question: string;
  sequence: number;
}

interface ApiResponse {
  questions?: Question[];
  [key: string]: any;
}

const CustomerSurveyTemplateView: React.FC = () => {
  const { customerSurveyTemplateId } = useParams<{ customerSurveyTemplateId: string }>();
  const templateId = Number(customerSurveyTemplateId);
  const initialRenderRef = useRef(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sortableQuestions, setSortableQuestions] = useState<Question[]>([]);

  const newListRef = useRef(sortableQuestions);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Form state
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  // Fetch questions
  const fetchQuestions = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(`/api/customer-survey-templates/${templateId}`);
      if (!res.ok) throw new Error('Error fetching questions');
      const json: ApiResponse = await res.json();
      const data: Question[] = Array.isArray(json)
        ? (json as unknown as Question[])
        : json.questions || [];
      setQuestions(data);
      setSortableQuestions(data);
    } catch (err: any) {
      MySwal.fire({
        title: err.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: { popup: 'color-error' }
      });
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(templateId)) fetchQuestions();
  }, [templateId]);

  // Handle full reorder
  const handleReorder = async (newOrder: Question[]) => {
    const payload = { inputs: newOrder.map((q, idx) => ({ id: q.id, sequence: idx + 1 })) };
    try {
      const res = await fetch('/api/cs-template-questions/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error reordering questions');
      MySwal.fire({
        title: 'Questions reordered successfully',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: { popup: 'color-success' }
      });
      // Do not refetch immediately to avoid UI revert
    } catch (err: any) {
      MySwal.fire({
        title: err.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: { popup: 'color-error' }
      });
      // On error, optionally refetch to sync
      fetchQuestions(true);
    }
  };
  // Add/Edit question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) {
      MySwal.fire({
        title: 'Question cannot be empty.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: { popup: 'color-error' }
      });
      return;
    }
    setSubmitting(true);
    try {
      const url = selectedQuestion
        ? `/api/cs-template-questions/${selectedQuestion.id}`
        : '/api/cs-template-questions';
      const method = selectedQuestion ? 'PUT' : 'POST';
      const body = { question: newQuestion, customer_survey_template_id: templateId };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Error saving question');
      MySwal.fire({
        title: selectedQuestion ? 'Question updated successfully' : 'Question added successfully',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: { popup: 'color-success' }
      });
      setNewQuestion('');
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedQuestion(null);
      fetchQuestions(true);
    } catch (err: any) {
      MySwal.fire({
        title: err.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: { popup: 'color-error' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete question
  const handleDelete = async () => {
    if (!selectedQuestion) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/cs-template-questions/${selectedQuestion.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error deleting question');
      MySwal.fire({
        title: 'Question deleted successfully',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: { popup: 'color-success' }
      });
      setIsDeleteModalOpen(false);
      setSelectedQuestion(null);
      fetchQuestions(true);
    } catch (err: any) {
      MySwal.fire({
        title: err.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: { popup: 'color-error' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center">
      <span className="animate-spin border-8 border-r-warning border-l-primary border-t-danger border-b-success rounded-full w-14 h-14"></span>
    </div>
  );

  return (
    <>
      <ul className="flex space-x-2 rtl:space-x-reverse">
        <li><Link to="/customers" className="text-primary hover:underline">Customers</Link></li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>Customer Survey Templates</span></li>
      </ul>
      <div className="p-4">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Customer Survey Template</h2>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded">Add
            Question
          </button>
        </div>

        {refreshing ? (
          <div className="flex items-center justify-center">
            <span
              className="animate-spin border-8 border-r-warning border-l-primary border-t-danger border-b-success rounded-full w-14 h-14"></span>
          </div>
        ) : (
          <ul>
            <ReactSortable
              list={sortableQuestions}
              setList={(newState) => {
                // Map the new state to include sequence numbers
                const updated = newState.map((q, idx) => ({
                  ...q,
                  sequence: idx + 1
                }));

                // Just update state here
                setSortableQuestions(updated);
              }}
              onEnd={(evt) => {
                // Only call API when actual drag-and-drop happens
                if (initialRenderRef.current) {
                  initialRenderRef.current = false;
                  return;
                }

                // Get the current state after drag completed
                const updated = sortableQuestions.map((q, idx) => ({
                  ...q,
                  sequence: idx + 1
                }));

                // Now call API with updated order
                handleReorder(updated);
              }}
              animation={200}
            >
              {sortableQuestions.map((q) => (
                <li key={q.id} className="mb-2 cursor-grab bg-white rounded border px-4 py-2 flex justify-between items-center">
                  <span>{q.sequence}. {q.question}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedQuestion(q); setNewQuestion(q.question); setIsEditModalOpen(true); }} className="btn btn-secondary btn-sm">Edit</button>
                    <button onClick={() => { setSelectedQuestion(q); setIsDeleteModalOpen(true); }} className="btn btn-danger btn-sm">Delete</button>
                  </div>
                </li>
              ))}
            </ReactSortable>
          </ul>
        )}

        {/* Add/Edit Modal */}
        <Transition appear show={isAddModalOpen || isEditModalOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" open={isAddModalOpen || isEditModalOpen}
                  onClose={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setSelectedQuestion(null);
                  }}>
            <div className="min-h-screen px-4 text-center">
              <Transition.Child as={Fragment} enter="ease-in-out duration-500" enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100" leave="ease-in-out duration-500"
                                leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel
                  className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <div className="p-5">
                    <Dialog.Title
                      className="text-lg font-bold mb-4">{selectedQuestion ? 'Edit Question' : 'Add Question'}</Dialog.Title>
                    <form onSubmit={handleSaveQuestion}>
                      <div className="mb-4">
                        <label htmlFor="question" className="block text-sm font-medium mb-1">Question</label>
                        <textarea id="question" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)}
                                  className="w-full border border-gray-300 rounded p-2" rows={4} />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => {
                          setIsAddModalOpen(false);
                          setIsEditModalOpen(false);
                          setSelectedQuestion(null);
                        }} className="btn btn-secondary">Cancel
                        </button>
                        <button type="submit" disabled={submitting}
                                className="btn btn-primary flex items-center">{submitting ? <> <span
                          className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4 mr-2"></span>Saving...</> : 'Save'}</button>
                      </div>
                    </form>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>

        {/* Delete Confirmation Modal */}
        <Transition appear show={isDeleteModalOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" open={isDeleteModalOpen} onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedQuestion(null);
          }}>
            <div className="min-h-screen px-4 text-center">
              <Transition.Child as={Fragment} enter="ease-in-out duration-200" enterFrom="opacity-0"
                                enterTo="opacity-100" leave="ease-in-out duration-200" leaveFrom="opacity-100"
                                leaveTo="opacity-0">
                <Dialog.Panel
                  className="inline-block w-full max-w-sm my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <div className="p-5">
                    <Dialog.Title className="text-lg font-bold mb-4">Delete Question</Dialog.Title>
                    <p>Are you sure you want to delete <strong>{selectedQuestion?.question}</strong>?</p>
                    <div className="flex justify-end gap-2 mt-4">
                      <button onClick={() => {
                        setIsDeleteModalOpen(false);
                        setSelectedQuestion(null);
                      }} className="btn btn-secondary">Cancel
                      </button>
                      <button onClick={handleDelete} disabled={submitting}
                              className="btn btn-danger flex items-center">{submitting ? <> <span
                        className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4 mr-2"></span>Deleting...</> : 'Delete'}</button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </div>
    </>
  );
};

export default CustomerSurveyTemplateView;
