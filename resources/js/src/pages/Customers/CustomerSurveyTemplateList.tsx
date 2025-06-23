import React, { useEffect, useState, Fragment } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { Dialog, Transition } from '@headlessui/react';
import { FiEye, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Loading from '../Components/Loading';

interface SurveyTemplate {
  id: number;
  name: string;
  description: string;
  message: string;
}

const CustomerSurveyTemplateList: React.FC = () => {
  const dispatch = useDispatch();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<SurveyTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Table state
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [originalRecords, setOriginalRecords] = useState<SurveyTemplate[]>([]);
  const [initialRecords, setInitialRecords] = useState<SurveyTemplate[]>([]);
  const [recordsData, setRecordsData] = useState<SurveyTemplate[]>([]);
  const [search, setSearch] = useState('');
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'name', direction: 'asc' });

  // Form state for add
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle('Customer Survey Templates'));
  }, [dispatch]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/customer-survey-templates');
      const data: SurveyTemplate[] = await response.json();
      const sorted = sortBy(data, 'name');
      setOriginalRecords(sorted);
      setInitialRecords(sorted);
      setRecordsData(sorted.slice(0, pageSize));
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [pageSize]);
  useEffect(() => { setPage(1); }, [pageSize]);
  useEffect(() => {
    const from = (page - 1) * pageSize;
    setRecordsData(initialRecords.slice(from, from + pageSize));
  }, [page, pageSize, initialRecords]);
  useEffect(() => {
    setPage(1);
    const filtered = originalRecords.filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase())
    );
    setInitialRecords(filtered);
  }, [search, originalRecords]);
  useEffect(() => {
    const sorted = sortBy(initialRecords, sortStatus.columnAccessor);
    setInitialRecords(sortStatus.direction === 'desc' ? sorted.reverse() : sorted);
    setPage(1);
  }, [sortStatus]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/customer-survey-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name: formName, description: formDescription, message: formMessage }),
      });
      if (!res.ok) throw new Error('Failed to add');
      setFormName(''); setFormDescription(''); setFormMessage('');
      setIsAddModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = (t: SurveyTemplate) => {
    setTemplateToDelete(t);
    setIsDeleteOpen(true);
  };
  const confirmDelete = async () => {
    if (!templateToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/customer-survey-templates/${templateToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setTemplateToDelete(null);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="panel mt-6">
        <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
          <h5 className="font-semibold text-lg dark:text-white-light">Customer Survey Templates</h5>
          <div className="ltr:ml-auto rtl:mr-auto flex gap-2">
            <input
              type="text"
              className="form-input w-auto"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
              Add Template
            </button>
          </div>
        </div>
        <div className="datatables">
          <DataTable
            highlightOnHover
            records={recordsData}
            columns={[
              { accessor: 'name', title: 'Name', sortable: true },
              { accessor: 'description', title: 'Description' },
              {
                accessor: 'actions', title: 'Actions', render: (record: SurveyTemplate) => (
                  <div className="flex gap-2">
                    <Link to={`/customer-survey-template/${record.id}`}>
                      <button className="btn btn-icon btn-primary" title="View">
                        <FiEye />
                      </button>
                    </Link>
                    <button onClick={() => openDeleteModal(record)} className="btn btn-icon btn-danger" title="Delete">
                      <FiTrash2 />
                    </button>
                  </div>
                )
              }
            ]}
            totalRecords={initialRecords.length}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={setPage}
            recordsPerPageOptions={PAGE_SIZES}
            onRecordsPerPageChange={setPageSize}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            minHeight={200}
            paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
          />
        </div>
      </div>

      {/* Add Template Modal */}
      <Transition appear show={isAddModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => !isSaving && setIsAddModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" />
          </Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-xl">
                <Dialog.Title as="h3" className="text-lg font-medium mb-4">Add New Template</Dialog.Title>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input
                      type="text" required value={formName}
                      onChange={e => setFormName(e.target.value)}
                      className="form-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea
                      required value={formDescription}
                      onChange={e => setFormDescription(e.target.value)}
                      className="form-textarea w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Message</label>
                    <textarea
                      required value={formMessage}
                      onChange={e => setFormMessage(e.target.value)}
                      className="form-textarea w-full"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsAddModalOpen(false)} disabled={isSaving}
                            className="px-4 py-2 rounded bg-gray-200 text-gray-800 disabled:opacity-50">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSaving}
                            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
                      {isSaving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Template Modal */}
      <Transition appear show={isDeleteOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => !isDeleting && setIsDeleteOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" />
          </Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
                <Dialog.Title as="h3" className="text-lg font-medium">Delete Template</Dialog.Title>
                <p className="mt-4">Are you sure you want to delete <span className="font-semibold">{templateToDelete?.name}</span>?</p>
                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}
                          className="px-4 py-2 rounded bg-gray-200 text-gray-800 disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={confirmDelete} disabled={isDeleting}
                          className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50">
                    {isDeleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default CustomerSurveyTemplateList;
