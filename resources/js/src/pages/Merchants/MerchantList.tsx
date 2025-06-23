import React, { useEffect, useState } from 'react';
import api from '../../utils/axios';
import { Dialog } from '@headlessui/react';
import { useFormik } from 'formik';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { LoadingOverlay } from '@mantine/core';
import { IconEye, IconTrash, IconPlus } from '@tabler/icons-react';
import { showToast } from '../../utils/toast';
import { Link } from 'react-router-dom';
import MerchantForm from './MerchantForm';

interface Merchant {
  id: number;
  name: string;
  created_at: string;
  created_by: string;
}

const PAGE_SIZES = [5, 10, 20];

const MerchantList: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [visibleMerchants, setVisibleMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'name',
    direction: 'asc',
  });
  const [creating, setCreating] = useState(false);

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/merchants');
      const fetched = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setMerchants(fetched);
    } catch (e) {
      showToast('Failed to fetch merchants', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  useEffect(() => {
    const filtered = merchants.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
    setVisibleMerchants(filtered);
  }, [search, merchants]);

  useEffect(() => {
    const sorted = [...visibleMerchants].sort((a, b) => {
      const valA = a[sortStatus.columnAccessor as keyof Merchant];
      const valB = b[sortStatus.columnAccessor as keyof Merchant];
      return sortStatus.direction === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
    setVisibleMerchants(sorted);
  }, [sortStatus]);

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    onSubmit: async (values, { resetForm }) => {
      setCreating(true);
      try {
        await api.post('/api/merchants', values);
        showToast('Merchant created', 'success');
        fetchMerchants();
        resetForm();
        setIsCreateModalOpen(false);
      } catch (e) {
        showToast('Failed to create merchant', 'error');
      } finally {
        setCreating(false);
      }
    },
  });

  const deleteMerchant = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this merchant?')) return;
    setLoading(true);
    try {
      await api.delete(`/api/merchants/${id}`);
      showToast('Deleted successfully', 'success');
      fetchMerchants();
    } catch (e) {
      showToast('Delete failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { accessor: 'name', title: 'Name', sortable: true },
    {
      accessor: 'created_at',
      title: 'Creation Date',
      render: (m: Merchant) => new Date(m.created_at).toLocaleDateString(),
    },
    {
      accessor: 'creator_name',
      title: 'Created By',
      render: (r: any) => r.creator?.name || '—',
    },
    {
      accessor: 'actions',
      title: 'Actions',
      render: (m: Merchant) => (
        <div className="flex gap-2">
          <Link to={`/merchant-view/${m.id}`} className="btn btn-secondary btn-sm" title="View">
            <IconEye size={16} stroke={1.5} />
          </Link>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => deleteMerchant(m.id)}
            title="Delete"
          >
            <IconTrash size={16} stroke={1.5} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Merchants</h2>
        <div className="flex gap-2">
          <input
            type="text"
            className="form-input w-auto"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            className="btn btn-primary flex items-center gap-1"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <IconPlus size={16} />
            Add Merchant
          </button>
        </div>
      </div>

      <div className="relative">
        <LoadingOverlay visible={loading} />
        <DataTable
          highlightOnHover
          className="whitespace-nowrap"
          records={visibleMerchants.slice((page - 1) * pageSize, page * pageSize)}
          columns={columns}
          totalRecords={visibleMerchants.length}
          recordsPerPage={pageSize}
          page={page}
          onPageChange={setPage}
          recordsPerPageOptions={PAGE_SIZES}
          onRecordsPerPageChange={setPageSize}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
        />
      </div>

      <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
              <Dialog.Title className="text-lg font-bold mb-4">
                Create Merchant
              </Dialog.Title>
                <MerchantForm
                  onClose={() => {
                    setIsCreateModalOpen(false);
                  }}
                  onSuccess={fetchMerchants}
                />

            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default MerchantList;
