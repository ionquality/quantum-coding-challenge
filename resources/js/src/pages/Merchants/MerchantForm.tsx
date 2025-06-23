import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import api from '../../utils/axios';
import { showToast } from '../../utils/toast';
import Loading from '../Components/Loading';

interface Props {
  merchantId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

const MerchantForm: React.FC<Props> = ({ merchantId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [initialName, setInitialName] = useState('');

  const isEdit = Boolean(merchantId);

  useEffect(() => {
    if (isEdit) {
      api.get(`/api/merchants/${merchantId}`)
        .then(res => {
          const data = res.data?.merchant || res.data;
          setInitialName(data.name || '');
          formik.setFieldValue('name', data.name);
        })
        .catch(() => {
          showToast('Failed to load merchant details', 'error');
        });
    }
  }, [merchantId]);

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit) {
          await api.put(`/api/merchants/${merchantId}`, values);
          showToast('Merchant updated successfully', 'success');
        } else {
          await api.post('/api/merchants', values);
          showToast('Merchant created successfully', 'success');
        }
        onSuccess();
        onClose();
      } catch {
        showToast(`Failed to ${isEdit ? 'update' : 'create'} merchant`, 'error');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      {loading ? (
        <Loading />
      ) : (
        <>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Merchant Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input w-full"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default MerchantForm;
