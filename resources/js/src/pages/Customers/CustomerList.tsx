import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import React, { useEffect, useState, Fragment } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import { Dialog, Transition } from '@headlessui/react';
import { FiEdit, FiEye, FiTrash2 } from 'react-icons/fi';
import CustomerAdd from './CustomerAdd';
import { Link } from 'react-router-dom';

interface Customer {
  id: number;
  name: string;
  category: string;
  city: string;
  state: string;
  phone: string;
}

const CustomerList: React.FC = () => {
  const dispatch = useDispatch();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  useEffect(() => {
    dispatch(setPageTitle('Customers'));
  }, [dispatch]);

  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

  // Table state
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [originalRecords, setOriginalRecords] = useState<Customer[]>([]);
  const [initialRecords, setInitialRecords] = useState<Customer[]>([]);
  const [recordsData, setRecordsData] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'name',
    direction: 'asc',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<number|null>(null);

  // For now, we'll use simple button handlers.
  const handleEdit = (customer: Customer) => {
    // Implement edit logic here (open modal or redirect)
    console.log('Edit customer', customer);
  };
  const [isDeleting, setIsDeleting] = useState(false);
  const openDeleteModal = (cust: Customer) => {
    setCustomerToDelete(cust);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/customers/${customerToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchData();  // reload the list on success
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setCustomerToDelete(null);
    }
  };
  // Fetch customers from the API
  const fetchData = async () => {
    try {
      const response = await fetch('/api/customers');
      const data: Customer[] = await response.json();
      const sortedData = sortBy(data, 'name');
      setOriginalRecords(sortedData);
      setInitialRecords(sortedData);
      setRecordsData(sortedData.slice(0, pageSize));
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };


  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData(initialRecords.slice(from, to));
  }, [page, pageSize, initialRecords]);

  // Searching
  useEffect(() => {
    const filteredRecords = originalRecords.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    setInitialRecords(filteredRecords);
    setPage(1);
  }, [search, originalRecords]);

  // Sorting
  useEffect(() => {
    const sortedData = sortBy(initialRecords, sortStatus.columnAccessor);
    setInitialRecords(sortStatus.direction === 'desc' ? sortedData.reverse() : sortedData);
    setPage(1);
  }, [sortStatus, initialRecords]);

  return (
    <div>
      <div className="panel mt-6">
        <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
          <h5 className="font-semibold text-lg dark:text-white-light">Customers</h5>
          <div className="ltr:ml-auto rtl:mr-auto flex gap-2">
            <input
              type="text"
              className="form-input w-auto"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={() => {
                setEditingCustomerId(null);
                setIsModalOpen(true);
              }}
              className="btn btn-primary"
            >
              Create Customer
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="datatables">
          <DataTable
            highlightOnHover
            className={isRtl ? 'whitespace-nowrap table-hover' : 'whitespace-nowrap table-hover'}
            records={recordsData}
            columns={[
              { accessor: 'name', title: 'Customer Name', sortable: true },
              { accessor: 'category', title: 'Category', sortable: true },
              { accessor: 'city', title: 'City', sortable: true },
              { accessor: 'state', title: 'State', sortable: true },
              { accessor: 'phone', title: 'Phone', sortable: true },
              {
                accessor: 'actions',
                title: 'Actions',
                render: (record: Customer) => (
                  <div className="flex gap-2">
                    <Link to={`/customer-view/${record.id}`}>
                      <button className="btn btn-icon btn-primary" title="View">
                        <FiEye />
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        setEditingCustomerId(record.id);
                        setIsModalOpen(true);
                      }}
                      className="btn btn-icon btn-primary"
                      title="Edit"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => openDeleteModal(record)}
                      className="btn btn-icon btn-danger"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ),
              },
            ]}
            totalRecords={initialRecords.length}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={(p) => setPage(p)}
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

      {/* Add Customer Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsModalOpen(false)}
        >
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
                   className="
                     w-full                /* make it fill available horizontal space */
                     max-w-screen-lg       /* but cap it at a large breakpoint size */
                     transform overflow-hidden rounded-2xl
                     bg-white p-6 shadow-xl transition-all
                   "
                 >
                  <Dialog.Title as="h3" className="text-lg font-medium mb-4">
                    {editingCustomerId ? 'Edit Customer' : 'Add New Customer'}
                  </Dialog.Title>
                  <CustomerAdd
                    customerId={editingCustomerId ?? undefined}
                    onSuccess={() => {
                      setIsModalOpen(false);
                      fetchData();
                    }}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Customer Modal */}
      <Transition appear show={isDeleteOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => !isDeleting && setIsDeleteOpen(false)}>
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
                <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                  Delete Customer
                </Dialog.Title>
                <div className="mt-4">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold">{customerToDelete?.name}</span>?
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={() => setIsDeleteOpen(false)}
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

export default CustomerList;