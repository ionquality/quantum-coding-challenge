import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Formik, Form, ErrorMessage, FormikHelpers } from 'formik';
import api from '../../utils/axios';

interface NoteAddProps {
  type: string;
  typeId: number;
  onSuccess: () => void;
  noteId?: number;
}

interface FormValues {
  note: string;
}

const NoteAdd: React.FC<NoteAddProps> = ({ type, typeId, onSuccess, noteId }) => {
  const [initialValues, setInitialValues] = useState<FormValues>({ note: '' });
  const [loading, setLoading] = useState<boolean>(!!noteId);

  useEffect(() => {
    if (!noteId) return;
    const fetchNote = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/notes/${noteId}`);
        setInitialValues({ note: res.data.note || '' }); // note is directly on res.data
      } catch (err) {
        console.error('Failed to load note:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [noteId]);
  const validate = (values: FormValues) => {
    const errors: Partial<FormValues> = {};
    const trimmed = values.note?.trim();
    if (!trimmed || trimmed === '<p><br></p>') {
      errors.note = 'Note content is required';
    }
    return errors;
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, setStatus }: FormikHelpers<FormValues>
  ) => {
    setStatus(null);
    try {
      const payload = { type, type_id: typeId, note: values.note };
      if (noteId) {
        await api.put(`/api/notes/${noteId}`, payload);
      } else {
        await api.post('/api/notes', payload);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      setStatus('There was an error saving the note.');
    } finally {
      setSubmitting(false);
    }
  };

  if (noteId && loading) {
    return <div>Loading...</div>;
  }

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      validate={validate}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, isSubmitting, status }) => (
        <Form className="space-y-4">
          <div>
            <label htmlFor="note" className="block text-sm font-medium">
              Note
            </label>
            <ReactQuill
              value={values.note}
              onChange={value => setFieldValue('note', value)}
            />
            <ErrorMessage name="note" component="div" className="text-red-600 text-sm mt-1" />
          </div>

          {status && (
            <div className="text-red-600 text-sm">{status}</div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Saving…' : noteId ? 'Update' : 'Save'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default NoteAdd;
