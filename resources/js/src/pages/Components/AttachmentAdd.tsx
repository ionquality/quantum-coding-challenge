import React from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { showToast } from '../../utils/toast';

interface UploadFormValues {
  file: File | null;
}

type AttachmentAddProps = {
  attachable_type: string;
  attachable_id: number | string;
  onSuccess: () => void;
};

const uploadValidationSchema = Yup.object({
  file: Yup.mixed().required('A file is required'),
});

const AttachmentAdd: React.FC<AttachmentAddProps> = ({
                                                       attachable_type,
                                                       attachable_id,
                                                       onSuccess,
                                                     }) => (
  <Formik<UploadFormValues>
    initialValues={{ file: null }}
    validationSchema={uploadValidationSchema}
    onSubmit={async (values, { setSubmitting, resetForm }) => {
      const formData = new FormData();
      if (values.file) {
        formData.append('file', values.file);
        formData.append('attachable_type', attachable_type);
        formData.append('attachable_id', String(attachable_id));
      }

      try {
        const res = await fetch('/api/attachments', {
          method: 'POST',
          body: formData,
          headers: {Accept: 'application/json'},
        });
        const data = await res.json();
        if (!res.ok) {
          await showToast(data.message || 'Upload failed', 'error');
        } else {
          resetForm();
          onSuccess();
          await showToast(data.message || 'Attachment uploaded', 'success');
        }
      } catch (err: any) {
        console.error(err);
        await showToast(err.message || 'Unexpected error', 'error');
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
            onChange={e =>
              e.currentTarget.files
                ? setFieldValue('file', e.currentTarget.files[0])
                : null
            }
            className="mt-1 block w-full form-input"
          />
          <ErrorMessage
            name="file"
            component="div"
            className="text-red-600 text-sm mt-1"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn btn-primary ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </Form>
    )}
  </Formik>
);

export default AttachmentAdd;
