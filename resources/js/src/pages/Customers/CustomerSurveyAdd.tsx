import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import Select from 'react-select';
import Loading from '../Components/Loading';

interface Option {
  value: number;
  label: string;
}

interface CustomerSurveyAddProps {
  customer_id?: number;
  onSuccess?: () => void;
}

interface FormValues {
  customer_survey_template_id: Option | null;
  customer_id: Option | null;
  contact_id: Option | null;
}

const CustomerSurveyAdd: React.FC<CustomerSurveyAddProps> = ({ customer_id: propCustomerId, onSuccess }) => {
  const [templates, setTemplates] = useState<Option[]>([]);
  const [customers, setCustomers] = useState<Option[]>([]);
  const [contacts, setContacts] = useState<Option[]>([]);

  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Load survey templates
  useEffect(() => {
    setLoadingTemplates(true);
    fetch('/api/customer-survey-templates')
      .then(res => res.json())
      .then((data: any[]) => setTemplates(data.map(t => ({ value: t.id, label: t.name }))))
      .catch(console.error)
      .finally(() => setLoadingTemplates(false));
  }, []);

  // Load customers only if propCustomerId is not provided
  useEffect(() => {
    if (propCustomerId) return;
    setLoadingCustomers(true);
    fetch('/api/customers')
      .then(res => res.json())
      .then((data: any[]) => setCustomers(data.map(c => ({ value: c.id, label: c.name }))))
      .catch(console.error)
      .finally(() => setLoadingCustomers(false));
  }, [propCustomerId]);

  // Load contacts when customer changes or when propCustomerId exists
  useEffect(() => {
    const id = propCustomerId || null;
    if (!id) return;
    setLoadingContacts(true);
    fetch(`/api/contacts?type=customer&typeId=${id}`)
      .then(res => res.json())
      .then((data: any[]) => setContacts(
        data.map(c => ({ value: c.id, label: `${c.first_name} ${c.last_name}` }))
      ))
      .catch(console.error)
      .finally(() => setLoadingContacts(false));
  }, [propCustomerId]);

  // Formik initial values
  const initialValues: FormValues = {
    customer_survey_template_id: null,
    customer_id: propCustomerId ? { value: propCustomerId, label: '' } : null,
    contact_id: null,
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    if (!values.customer_survey_template_id || !values.contact_id) {
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        customer_survey_template_id: values.customer_survey_template_id.value,
        customer_id: propCustomerId
          ? propCustomerId
          : values.customer_id?.value,
        contact_id: values.contact_id.value,
      };
      const res = await fetch('/api/customer-surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to submit');
      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue, isSubmitting }) => (
        <Form className="space-y-6">
          <div>
            <label htmlFor="customerSurveyTemplate" className="block text-sm font-medium">
              Customer Survey
            </label>
            <Select
              inputId="customerSurveyTemplate"
              name="customer_survey_template_id"
              options={templates}
              isLoading={loadingTemplates}
              isSearchable
              isClearable
              value={values.customer_survey_template_id}
              onChange={opt => setFieldValue('customer_survey_template_id', opt)}
              placeholder="Select a survey template..."
            />
          </div>

          {!propCustomerId && (
            <div>
              <label htmlFor="customer" className="block text-sm font-medium">
                Customer
              </label>
              <Select
                inputId="customer"
                name="customer_id"
                options={customers}
                isLoading={loadingCustomers}
                isSearchable
                isClearable
                value={values.customer_id}
                onChange={opt => {
                  setFieldValue('customer_id', opt);
                  setFieldValue('contact_id', null);
                  if (opt) {
                    setLoadingContacts(true);
                    fetch(`/api/contacts?type=customer&typeId=${opt.value}`)
                      .then(res => res.json())
                      .then((data: any[]) => setContacts(
                        data.map(c => ({ value: c.id, label: `${c.first_name} ${c.last_name}` }))
                      ))
                      .catch(console.error)
                      .finally(() => setLoadingContacts(false));
                  } else {
                    setContacts([]);
                  }
                }}
                placeholder="Select a customer..."
              />
            </div>
          )}

          <div>
            <label htmlFor="contact" className="block text-sm font-medium">
              Contact
            </label>
            <Select
              inputId="contact"
              name="contact_id"
              options={contacts}
              isLoading={loadingContacts}
              isSearchable
              isClearable
              isDisabled={!(propCustomerId || values.customer_id)}
              value={values.contact_id}
              onChange={opt => setFieldValue('contact_id', opt)}
              placeholder={
                propCustomerId || values.customer_id
                  ? 'Select a contact...'
                  : 'Select a customer first'
              }
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Submitting...' : 'Create Survey'}
            </button>
            {(isSubmitting || loadingTemplates || loadingCustomers || loadingContacts) && <Loading />}
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CustomerSurveyAdd;
