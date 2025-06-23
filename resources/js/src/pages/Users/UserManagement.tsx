import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState, Fragment } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import RegisterBoxed from '../Authentication/RegisterBoxed';
import { Dialog, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(setPageTitle('User Management Table'));
  }, [dispatch]);
  type User = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [originalRecords, setOriginalRecords] = useState<User[]>([]); // Original data
  const [initialRecords, setInitialRecords] = useState<User[]>([]);  // Filtered data
  const [recordsData, setRecordsData] = useState<User[]>([]);        // Paginated data
  const [search, setSearch] = useState('');
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/users');
      const data: User[] = await response.json();
      const sortedData = sortBy(data, 'id');
      setOriginalRecords(sortedData); // Store original fetched data
      setInitialRecords(sortedData); // Initialize filtered records
      setRecordsData(sortedData.slice(0, pageSize)); // Initialize paginated data
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  useEffect(() => {
    fetchData();
  }, [pageSize]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData([...initialRecords.slice(from, to)]);
  }, [page, pageSize, initialRecords]);

  // Update initialRecords based on search
  useEffect(() => {
    const filteredRecords = originalRecords.filter((item) => {
      const searchLower = search.toLowerCase();
      return (
        item.id.toString().includes(searchLower) ||
        (item.first_name && item.first_name.toLowerCase().includes(searchLower)) ||
        (item.last_name && item.last_name.toLowerCase().includes(searchLower)) ||
        (item.email && item.email.toLowerCase().includes(searchLower)) ||
        (item.phone && item.phone.toLowerCase().includes(searchLower))
      );
    });

    setInitialRecords(filteredRecords);
    setPage(1); // Reset to first page on search update
  }, [search, originalRecords]);

// Paginate filtered records
  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData(initialRecords.slice(from, to));
  }, [page, pageSize, initialRecords]);

  const handleAddUser = () => {
    setIsModalOpen(true);
  };

  const handleViewProfile = (id) => {
    navigate(`/users/user-profile/${id}`);
  };

  const handleSuccess = () => {
    setIsModalOpen(false); // Close the modal
    fetchData(); // Reload the data
  };

  return (
    <div>
      <div className="panel mt-6">
        <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
          <h5 className="font-semibold text-lg dark:text-white-light">User Management</h5>
          <div className="ltr:ml-auto rtl:mr-auto">
            <input type="text" className="form-input w-auto" placeholder="Search..."
                   value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={handleAddUser} className="btn btn-primary">Add User</button>
        </div>
        <div className="datatables">
          <DataTable

            highlightOnHover
            className={`${isRtl ? 'whitespace-nowrap table-hover' : 'whitespace-nowrap table-hover'}`}
            records={recordsData}
            columns={[
              { accessor: 'id', title: 'ID', sortable: true },
              { accessor: 'first_name', title: 'First Name', sortable: true },
              { accessor: 'last_name', title: 'Last Name', sortable: true },
              { accessor: 'email', sortable: true },
              { accessor: 'phone', title: 'Phone No.', sortable: true },
              {
                accessor: 'actions',
                title: 'Actions',
                render: (record) => (
                  <button onClick={() => handleViewProfile(record.id)} className="btn btn-secondary btn-sm">
                    View
                  </button>
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
            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
          />
        </div>
      </div>
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 z-[999] overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="panel my-8 w-full max-w-xl overflow-hidden  rounded-lg border-0 p-0 text-black dark:text-white-dark">
                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                      <h5 className="text-lg font-semibold">Add User</h5>
                      <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Close</button>
                    </div>
                    <div className="p-5">
                      <RegisterBoxed onSuccess={handleSuccess}/>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  );
};

export default UserManagement;