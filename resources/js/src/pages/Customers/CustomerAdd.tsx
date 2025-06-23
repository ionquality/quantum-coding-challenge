import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import Select, { SingleValue } from 'react-select';
import GooglePlacesAutocomplete, { geocodeByPlaceId } from 'react-google-places-autocomplete';

interface FormValues {
  category: string;
  name: string;
  contact: string;
  location: string;
  phone: string;
  email: string;
}

interface CustomerAddProps {
  customerId?: number;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Required'),
  location: Yup.string().required('Required'),
});

const CustomerAdd: React.FC<CustomerAddProps> = ({ customerId, onSuccess }) => {
  const [categories, setCategories] = useState<{ name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [initialValues, setInitialValues] = useState<FormValues>({
    category: '',
    name: '',
    contact: '',
    location: '',
    phone: '',
    email: '',
  });
  const [loadingCustomer, setLoadingCustomer] = useState<boolean>(!!customerId);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      setLoadingCategories(true);
      try {
        const res = await fetch(
          '/api/custom-codes?module=customer&type=Customer Category'
        );
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // If editing, fetch existing customer
  useEffect(() => {
    if (!customerId) return;
    async function fetchCustomer() {
      setLoadingCustomer(true);
      try {
        const res = await fetch(`/api/customers/${customerId}`);
        if (!res.ok) throw new Error('Failed to fetch customer');
        const cust = await res.json();
        setInitialValues({
          category: cust.category || '',
          name: cust.name || '',
          contact: cust.contact || '',
          location: cust.address
            ? `${cust.address}, ${cust.city}, ${cust.state}, ${cust.country}, ${cust.zipcode}`
            : '',
          phone: cust.phone || '',
          email: cust.email || '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCustomer(false);
      }
    }
    fetchCustomer();
  }, [customerId]);

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: { setSubmitting: (b: boolean) => void }
  ) => {
    const url = customerId ? `/api/customers/${customerId}` : '/api/customers';
    const method = customerId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to save customer');
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCustomer) return <div>Loading…</div>;

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, setFieldValue }) => (
        <Form className="space-y-6">
          {/* Category */}
          <div>
            <label htmlFor="category" className="block font-medium">
              Category
            </label>
            <Field name="category">
              {({ field, form }: FieldProps) => {
                const options = categories.map((c) => ({ value: c.name, label: c.name }));
                const selected = options.find((o) => o.value === field.value) || null;
                return (
                  <Select
                    inputId="category"
                    options={options}
                    value={selected}
                    onChange={(opt: SingleValue<{ value: string; label: string }>) =>
                      form.setFieldValue(field.name, opt?.value || '')
                    }
                    onBlur={() => form.setFieldTouched(field.name, true)}
                    isSearchable
                    isLoading={loadingCategories}
                    className="mt-1"
                  />
                );
              }}
            </Field>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block font-medium">
              Name
            </label>
            <Field
              id="name"
              name="name"
              placeholder="Required"
              className="mt-1 block w-full border rounded-md p-2"
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="location" className="block font-medium">
              Address
            </label>
            <Field name="location">
              {({ field, form }: FieldProps) => (
                <GooglePlacesAutocomplete
                  apiKey={import.meta.env.VITE_GOOGLE_API_KEY}
                  autocompletionRequest={{ types: ['address'] }}
                  debounce={300}
                  // <-- no `initialValue` here!
                  selectProps={{
                    // 1) one-time default text when the component first mounts:
                    defaultInputValue: field.value,

                    // 2) what happens when the user picks a new place:
                    onChange: async (val: any) => {
                      let address = val.label;
                      try {
                        const results = await geocodeByPlaceId(val.value.place_id);
                        const postal = results[0].address_components
                          .find(c => c.types.includes('postal_code'));
                        if (postal) address += `, ${postal.long_name}`;
                      } catch (e) {
                        console.error(e);
                      }
                      form.setFieldValue('location', address);
                    },

                    placeholder: 'Search address…',
                  }}
                />
              )}
            </Field>

          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block font-medium">
              Phone
            </label>
            <Field
              id="phone"
              name="phone"
              placeholder="Optional"
              className="mt-1 block w-full border rounded-md p-2"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block font-medium">
              Email
            </label>
            <Field
              id="email"
              name="email"
              type="email"
              placeholder="Optional"
              className="mt-1 block w-full border rounded-md p-2"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button
              type="button"
              onClick={onSuccess}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-success text-white font-bold px-4 py-2 rounded"
            >
              {isSubmitting ? 'Saving…' : (customerId ? 'Update' : 'Save')}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CustomerAdd;
