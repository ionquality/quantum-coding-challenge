import React, { useEffect, useState, Fragment } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import { Dialog, Transition } from '@headlessui/react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import ContactAdd from './ContactAdd';

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
}

interface ContactsProps {
  type: string;
  typeId: number;
}

const Contacts: React.FC<ContactsProps> = ({ type, typeId }) => {
  // Modal state for add/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<number | null>(null);

  // Table state
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [originalRecords, setOriginalRecords] = useState<Contact[]>([]);
  const [initialRecords, setInitialRecords] = useState<Contact[]>([]);
  const [recordsData, setRecordsData] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'firstName',
    direction: 'asc',
  });

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch and map data
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/contacts?type=${type}&typeId=${typeId}`);
      const raw: any[] = await res.json();
      const mapped: Contact[] = raw.map(item => ({
        id: item.id,
        firstName: item.first_name,
        lastName: item.last_name,
        phone: item.phone,
        email: item.email,
      }));
      const sorted = sortBy(mapped, sortStatus.columnAccessor as keyof Contact);
      setOriginalRecords(sorted);
      setInitialRecords(sorted);
      setRecordsData(sorted.slice(0, pageSize));
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, typeId]);

  // Pagination
  useEffect(() => {
    const from = (page - 1) * pageSize;
    setRecordsData(initialRecords.slice(from, from + pageSize));
  }, [page, pageSize, initialRecords]);

  useEffect(() => setPage(1), [pageSize]);

  // Search
  useEffect(() => {
    const lower = search.toLowerCase();
    const filtered = originalRecords.filter(c =>
      c.firstName.toLowerCase().includes(lower) ||
      c.lastName.toLowerCase().includes(lower) ||
      (c.email?.toLowerCase().includes(lower) ?? false)
    );
    setInitialRecords(filtered);
    setPage(1);
  }, [search, originalRecords]);

  // Sorting
  useEffect(() => {
    const sorted = sortBy(initialRecords, sortStatus.columnAccessor as keyof Contact);
    setInitialRecords(
      sortStatus.direction === 'desc' ? sorted.reverse() : sorted
    );
    setPage(1);
  }, [sortStatus]);

  // Handlers
  const openAddModal = () => {
    setEditingContactId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingContactId(contact.id);
    setIsModalOpen(true);
  };

  const openDeleteModal = (contact: Contact) => {
    setDeletingContact(contact);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingContact) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/contacts/${deletingContact.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeletingContact(null);
    }
  };

  // Title
  const titleType = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div>
      {/* Header with title, search and add button */}
      <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
        <h5 className="font-semibold text-lg dark:text-white-light">{`${titleType} Contacts`}</h5>
        <div className="ltr:ml-auto rtl:mr-auto flex gap-2">
          <input
            type="text"
            className="form-input w-auto"
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button onClick={openAddModal} className="btn btn-primary">
            Add Contact
          </button>
        </div>
      </div>

      <DataTable
        highlightOnHover
        records={recordsData}
        columns={[
          { accessor: 'firstName', title: 'First Name', sortable: true },
          { accessor: 'lastName', title: 'Last Name', sortable: true },
          { accessor: 'phone', title: 'Phone' },
          { accessor: 'email', title: 'Email' },
          {
            accessor: 'actions',
            title: 'Actions',
            render: (record: Contact) => (
              <div className="flex gap-2">
                <button onClick={() => openEditModal(record)} className="btn btn-icon btn-primary">
                  <FiEdit />
                </button>
                <button onClick={() => openDeleteModal(record)} className="btn btn-icon btn-danger">
                  <FiTrash2 />
                </button>
              </div>
            ),
          },
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
      />

      {/* Add/Edit Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
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
                <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
                  <Dialog.Title as="h3" className="text-lg font-medium mb-4">
                    {editingContactId ? `Edit ${titleType} Contact` : `Add ${titleType} Contact`}
                  </Dialog.Title>
                  <ContactAdd
                    type={type}
                    typeId={typeId}
                    contactId={editingContactId ?? undefined}
                    onSuccess={() => {
                      setIsModalOpen(false);
                      setEditingContactId(null);
                      fetchData();
                    }}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation */}
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
                <Dialog.Title as="h3" className="text-lg font-medium">
                  Delete Contact
                </Dialog.Title>
                <p className="mt-2">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold">
                    {deletingContact?.firstName} {deletingContact?.lastName}
                  </span>?
                </p>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => setIsDeleteOpen(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded bg-red-600 text-white"
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

export default Contacts;
