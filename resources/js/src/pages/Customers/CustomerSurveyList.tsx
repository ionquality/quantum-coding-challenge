import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import React, { useEffect, useState, Fragment } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { FiEye, FiSend, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import CustomerSurveyAdd from './CustomerSurveyAdd';
import { Badge } from '@mantine/core';
import api from '../../utils/axios';
import { FaCog } from 'react-icons/fa';
import CustomerSurveyReview from './CustomerSurveyReview';
interface CustomerSurvey {
  id: number;
  customer_name: string;
  primary_contact: string;
  created_at: string;
  status: 'Pending' | 'Ready For Review' | 'Completed';
}

interface CustomerSurveyListProps {
  customer_id?: number;
  type?: string;
}

const CustomerSurveyList: React.FC<CustomerSurveyListProps> = ({ customer_id, type }) => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [originalRecords, setOriginalRecords] = useState<CustomerSurvey[]>([]);
  const [initialRecords, setInitialRecords] = useState<CustomerSurvey[]>([]);
  const [recordsData, setRecordsData] = useState<CustomerSurvey[]>([]);
  const [search, setSearch] = useState('');
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'customer_name',
    direction: 'asc'
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<CustomerSurvey | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle('Customer Surveys'));
  }, [dispatch]);

  // Fetch surveys
  const fetchData = async () => {
    try {
      let url = '/api/customer-surveys';
      const params = new URLSearchParams();
      if (customer_id) params.append('customer_id', String(customer_id));
      if (type) params.append('type', type);
      const query = params.toString();
      if (query) url += `?${query}`;

      const response = await api.get(url);
      const data: CustomerSurvey[] = response.data;
      const sortedData = sortBy(data, sortStatus.columnAccessor);
      setOriginalRecords(sortedData);
      setInitialRecords(sortedData);
      setRecordsData(sortedData.slice(0, pageSize));
    } catch (error) {
      console.error('Error fetching customer surveys:', error);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer_id, type, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, search]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData(initialRecords.slice(from, to));
  }, [page, pageSize, initialRecords]);

  // Searching
  useEffect(() => {
    const filtered = originalRecords.filter(item =>
      item.customer_name.toLowerCase().includes(search.toLowerCase())
    );
    setInitialRecords(filtered);
  }, [search, originalRecords]);

  // Sorting
  useEffect(() => {
    const sorted = sortBy(initialRecords, sortStatus.columnAccessor);
    setInitialRecords(sortStatus.direction === 'desc' ? sorted.reverse() : sorted);
  }, [sortStatus, initialRecords]);

  // Open delete confirmation
  const openDeleteModal = (record: CustomerSurvey) => {
    setSurveyToDelete(record);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!surveyToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.post(`/api/customer-surveys/${surveyToDelete.id}`, { method: 'DELETE' });
      if ( res.status != 200 ) throw new Error('Failed to delete');
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setSurveyToDelete(null);
    }
  };

  // Resend handler
  const handleResend = async (record: CustomerSurvey) => {
    setIsResending(true);
    try {
      const res = await api.post(`/api/customer-surveys/${record.id}/resend`, { method: 'POST' });
      if (res.status != 200 ) throw new Error('Failed to resend');
    } catch (err) {
      console.error(err);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div>
      <div className="panel mt-6">
        <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
          <h5 className="font-semibold text-lg dark:text-white-light">Customer Surveys</h5>
          <div className="ltr:ml-auto rtl:mr-auto flex gap-2">
            <input
              type="text"
              className="form-input w-auto"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary"
            >
              Create Survey
            </button>
          </div>
        </div>

        <div className="datatables">
          <DataTable
            highlightOnHover
            records={recordsData}
            columns={[
              { accessor: 'customer_name', title: 'Customer Name', sortable: true },
              { accessor: 'primary_contact', title: 'Contact', sortable: true },
              {
                accessor: 'created_at',
                title: 'Date Sent',
                sortable: true,
                render: (record: CustomerSurvey) => new Date(record.created_at).toLocaleDateString()
              },
              {
                accessor: 'status',
                title: 'Status',
                sortable: true,
                render: (record: CustomerSurvey) => {
                  let color: 'yellow' | 'blue' | 'green' = 'yellow';
                  if (record.status === 'Ready For Review') color = 'blue';
                  if (record.status === 'Completed')       color = 'green';
                  return (
                    <Badge color={color} variant="light">
                      {record.status}
                    </Badge>
                  );
                },
              },
              {
                accessor: 'actions',
                title: 'Actions',
                render: (record: CustomerSurvey) => (
                  <div className="flex gap-2">
                    <Link
                      to={`/customer-survey-view/${record.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button className="btn btn-icon btn-primary" title="View">
                        <FiEye />
                      </button>
                    </Link>
                    <button
                      onClick={() =>handleResend(record)}
                      disabled={isResending}
                      className="btn btn-icon btn-secondary"
                      title="Resend"
                    >
                      <FiSend />
                    </button>
                    <button
                      onClick={() => openDeleteModal(record)}
                      disabled={isDeleting}
                      className="btn btn-icon btn-danger"
                      title="Delete"
                    >
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
            paginationText={({ from, to, totalRecords }) =>
              `Showing ${from} to ${to} of ${totalRecords} entries`
            }
          />
        </div>
      </div>

      {/* Add Modal */}
      <Transition appear show={isAddModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsAddModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium mb-4">Create Customer Survey</Dialog.Title>
                  <CustomerSurveyAdd
                    customer_id={customer_id}
                    onSuccess={() => {
                      setIsAddModalOpen(false);
                      fetchData();
                    }}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => !isDeleting && setIsDeleteModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
                <Dialog.Title className="text-lg font-medium text-gray-900">Delete Survey</Dialog.Title>
                <div className="mt-4">Are you sure you want to delete{' '}
                  <span className="font-semibold">{surveyToDelete?.customer_name}</span> customer survey?
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded bg-gray-200 text-gray-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50"
                  >
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

export default CustomerSurveyList;
