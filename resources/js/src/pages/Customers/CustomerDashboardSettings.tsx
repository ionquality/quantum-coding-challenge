import React, { useEffect, useState, Fragment } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldProps } from 'formik';
import * as Yup from 'yup';
import 'flatpickr/dist/themes/material_blue.css';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import 'react-quill/dist/quill.snow.css';
import Loading from '../Components/Loading';

// Define TS interface for module settings
interface ModuleSetting {
  setting_key: string;
  setting_value: string;
}

const MySwal = withReactContent(Swal);

const CustomerDashboardSettings: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userOptions, setUserOptions] = useState<{ id: string; name: string }[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<Record<string, string>>({
    process_owner: '',
    risk_objective: '',
    risk_high: '',
    question_number: '',
    min_threshold: '',
    max_threshold: '',
    survey_high_rsk: '',
    survey_low_risk: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch(`/api/module-settings?module=customer`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });
      const data: { users: { id: string; name: string }[]; moduleSettings: ModuleSetting[] } = await resp.json();
      setUserOptions(data.users);

      const mapped = data.moduleSettings.reduce<Record<string, string>>((acc, item) => {
        acc[item.setting_key] = item.setting_value;
        return acc;
      }, {});

      setInitialValues(prev => ({ ...prev, ...mapped }));
    } catch (err) {
      console.error('Error loading customer settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const setValue = (field: string, value: string) => {
    setInitialValues(prev => ({ ...prev, [field]: value }));
  };

  const validationSchema = Yup.object({
    process_owner: Yup.string().required('Required'),
    risk_objective: Yup.number().required('Required'),
    risk_high: Yup.number().required('Required'),
    question_number: Yup.number().required('Required'),
    min_threshold: Yup.number().required('Required'),
    max_threshold: Yup.number().required('Required'),
    survey_high_rsk: Yup.number().required('Required'),
    survey_low_risk: Yup.number().required('Required'),
  });

  const handleSubmit = async (values: Record<string, string>) => {
    try {
      const res = await fetch('/api/module-settings/update-module-value', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: values, module: 'customer' })
      });
      const result = await res.json();
      if (!res.ok) throw new Error('Failed to update');
      fetchData();
      MySwal.fire({
        title: result.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: { popup: 'color-success' }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/module-settings/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ module: 'customer' })
      });
      const result = await res.json();
      if (!res.ok) throw new Error('Reset failed');
      MySwal.fire({
        title: result.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: { popup: 'color-success' }
      });
      setIsResetting(false);
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="p-6 w-full mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Settings</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Risk Objective', name: 'risk_objective' },
                { label: 'Risk High', name: 'risk_high' },
                { label: 'Question Number', name: 'question_number' },
                { label: 'Min Threshold', name: 'min_threshold' },
                { label: 'Max Threshold', name: 'max_threshold' },
                { label: 'Survey High Risk', name: 'survey_high_rsk' },
                { label: 'Survey Low Risk', name: 'survey_low_risk' },
                { label: 'Process Owner', name: 'process_owner' }
              ].map(({ label, name }) => (
                <div key={name} className="mb-3">
                  <label className="block text-gray-700 font-medium mb-1">{label}</label>
                  {name === 'process_owner' ? (
                    <Field name={name}>{({ field }: FieldProps) => (
                      <select
                        {...field}
                        className="form-input w-full"
                        value={initialValues[name]}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setValue(name, e.target.value)}
                      >
                        {userOptions.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    )}</Field>
                  ) : (
                    <Field
                      type="number"
                      name={name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(name, e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-400"
                    />
                  )}
                  <ErrorMessage name={name} component="div" className="text-red-500 text-sm mt-1" />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Apply Defaults
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                {isSubmitting ? 'Updating...' : 'Update'}
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4">
                <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h5 className="font-semibold text-lg mb-4">Confirm Reset</h5>
                  <p>Reset customer settings to defaults?</p>
                  <div className="flex justify-end gap-4 mt-5">
                    <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                    <button
                      onClick={handleReset}
                      disabled={isResetting}
                      className="btn btn-danger"
                    >
                      {isResetting ? <Loading /> : 'Reset'}
                    </button>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  );
};

export default CustomerDashboardSettings;
