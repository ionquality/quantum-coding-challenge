import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';

interface ContactAddProps {
  type: string;
  typeId: number;
  onSuccess: () => void;
  contactId?: number;
}

interface FormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

const ContactAdd: React.FC<ContactAddProps> = ({ type, typeId, onSuccess, contactId }) => {
  const [initialValues, setInitialValues] = useState<FormValues>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  const [loading, setLoading] = useState<boolean>(!!contactId);

  // If editing, fetch existing contact data
  useEffect(() => {
    if (!contactId) return;
    const fetchContact = async () => {
      try {
        const res = await fetch(`/api/contacts/${contactId}`);
        if (!res.ok) throw new Error('Failed to load contact');
        const item = await res.json();
        setInitialValues({
          firstName: item.first_name || '',
          lastName: item.last_name || '',
          phone: item.phone || '',
          email: item.email || '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, [contactId]);

  const validate = (values: FormValues) => {
    const errors: Partial<FormValues> = {};
    if (!values.firstName) {
      errors.firstName = 'First name is required';
    }
    if (!values.lastName) {
      errors.lastName = 'Last name is required';
    }
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = 'Invalid email address';
    }
    return errors;
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, setStatus }: FormikHelpers<FormValues>
  ) => {
    setStatus(null);
    try {
      const payload = {
        type,
        type_id: typeId,
        first_name: values.firstName,
        last_name: values.lastName,
        phone: values.phone,
        email: values.email,
      };
      const url = contactId ? `/api/contacts/${contactId}` : '/api/contacts';
      const method = contactId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Failed to save contact');
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      setStatus('There was an error saving the contact.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      validate={validate}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, status }) => (
        <Form className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium">
              First Name
            </label>
            <Field
              id="firstName"
              name="firstName"
              type="text"
              className="form-input w-full"
            />
            <ErrorMessage
              name="firstName"
              component="div"
              className="text-red-600 text-sm mt-1"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium">
              Last Name
            </label>
            <Field
              id="lastName"
              name="lastName"
              type="text"
              className="form-input w-full"
            />
            <ErrorMessage
              name="lastName"
              component="div"
              className="text-red-600 text-sm mt-1"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium">
              Phone
            </label>
            <Field
              id="phone"
              name="phone"
              type="tel"
              className="form-input w-full"
            />
            <ErrorMessage
              name="phone"
              component="div"
              className="text-red-600 text-sm mt-1"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Field
              id="email"
              name="email"
              type="email"
              className="form-input w-full"
            />
            <ErrorMessage
              name="email"
              component="div"
              className="text-red-600 text-sm mt-1"
            />
          </div>

          {status && (
            <div className="text-red-600 text-sm">
              {status}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Saving…' : contactId ? 'Update' : 'Save'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ContactAdd;
