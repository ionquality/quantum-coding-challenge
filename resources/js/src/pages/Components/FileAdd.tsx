import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { showToast } from '../../utils/toast';

// Form value interface
interface UploadFormValues {
  file: File | null;
  name: string;
  document_number: string;
}

// Props for the FileAdd component
type FileAddProps = {
  module: string;
  modelType: string;
  modelId: number | string;
  onSuccess: () => void;
};

// Validation schema
const uploadValidationSchema = Yup.object({
  file: Yup.mixed().required('A file is required'),
  name: Yup.string().required('Document name is required'),
  document_number: Yup.string().required('Document number is required'),
});

const FileAdd: React.FC<FileAddProps> = ({ module, modelType, modelId, onSuccess }) => (
  <Formik<UploadFormValues>
    initialValues={{ file: null, name: '', document_number: '' }}
    validationSchema={uploadValidationSchema}
    onSubmit={async (values, { setSubmitting, resetForm }) => {
      const formData = new FormData();
      if (values.file) formData.append('file', values.file);
      formData.append('name', values.name);
      formData.append('document_number', values.document_number);
      formData.append('module', module);
      formData.append('modelType', modelType);
      formData.append('modelId', String(modelId));

      try {
        const response = await fetch('/api/document-model-upload', {
          method: 'POST',
          headers: {
            Accept: 'application/json'
          },
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) {
          await showToast(data.message || 'Upload failed', 'error');
          return;
        }
        resetForm();
        onSuccess();
        await showToast(data.message || 'File uploaded successfully', 'success');
      } catch (error: any) {
        console.error('Error uploading file:', error);
        await showToast(error.message || 'An unexpected error occurred', 'error');
      } finally {
        setSubmitting(false);
      }
    }}
  >
    {({ isSubmitting, setFieldValue }) => (
      <Form className="space-y-4">
        <div>
          <label htmlFor="file" className="block text-sm font-medium">
            Select File
          </label>
          <input
            id="file"
            name="file"
            type="file"
            onChange={(e) => e.currentTarget.files && setFieldValue('file', e.currentTarget.files[0])}
            className="mt-1 block w-full form-input"
          />
          <ErrorMessage name="file" component="div" className="text-red-600 text-sm mt-1" />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Document Name
          </label>
          <Field
            id="name"
            name="name"
            className="mt-1 block w-full form-input"
            placeholder="Enter document name"
          />
          <ErrorMessage name="name" component="div" className="text-red-600 text-sm mt-1" />
        </div>

        <div>
          <label htmlFor="document_number" className="block text-sm font-medium">
            Document Number
          </label>
          <Field
            id="document_number"
            name="document_number"
            className="mt-1 block w-full form-input"
            placeholder="Enter document number"
          />
          <ErrorMessage name="document_number" component="div" className="text-red-600 text-sm mt-1" />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className={`btn btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </Form>
    )}
  </Formik>
);

export default FileAdd;
