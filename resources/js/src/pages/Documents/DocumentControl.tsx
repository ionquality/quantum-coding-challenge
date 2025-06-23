import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState, Fragment, useMemo } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import { Dialog, Transition } from '@headlessui/react';
import { FiEdit, FiTrash, FiFileText, FiFolder } from 'react-icons/fi';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import 'react-quill/dist/quill.snow.css';

const MySwal = withReactContent(Swal);

// Basic interfaces
interface Creator {
  id: number;
  name: string;
}

// Extend DocumentFolder to include children and documents
interface DocumentFolder {
  id: number;
  parent_id: number | null;
  name: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  creator: Creator;
  children?: DocumentFolder[];
  documents?: Document[];
}

// Update Document interface to include creator data
interface Document {
  id: number;
  folder_id: number;
  current_revision_id: number;
  name: string;
  document_number?: string | null;
  document_type?: string | null;
  model_type?: string | null;
  model_id?: number | null;
  archived: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  revisions?: Revision[];
  creator?: Creator; // added so files include created by data
}

interface Revision {
  id: number;
  document_id: number;
  file_path: string;
  revision_number: string;
  approval_status: string;
  change_request_type?: string | null;
  change_description?: string | null;
  training_required: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  full_file_path: string;
}

// Union type: an item is either a folder or a file.
type Item =
  | (DocumentFolder & { type: 'folder' })
  | (Document & { type: 'file' });

// For folder add/edit
interface FormValues {
  name: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Folder name is required'),
});

// For file uploads
interface UploadFormValues {
  file: File | null;
  name: string;
  document_number: string;
}

const uploadValidationSchema = Yup.object({
  file: Yup.mixed().required('A file is required'),
  name: Yup.string().required('Document name is required'),
  document_number: Yup.string().required('Document number is required'),
});

const DocumentControl = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle('Document Control'));
  }, [dispatch]);

  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

  // Table state
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [originalItems, setOriginalItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'name',
    direction: 'asc',
  });

  // Folder stack for breadcrumb navigation
  const [folderStack, setFolderStack] = useState<DocumentFolder[]>([]);
  const currentParent = folderStack.length ? folderStack[folderStack.length - 1] : null;

  // Modal states and selected record (for folder actions)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteFileModalOpen, setIsDeleteFileModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DocumentFolder | null>(null);
  const [selectedRecordFile, setSelectedRecordFile] = useState<Document | null>(null);

  // Fetch data: if at root, fetch all root folders; if inside a folder, fetch its children and documents.
  const fetchData = async () => {
    try {
      if (currentParent) {
        const response = await fetch(`/api/document-folders/${currentParent.id}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
        const children: (DocumentFolder & { type: 'folder' })[] =
          (result.children || []).map((child: DocumentFolder) => ({
            ...child,
            type: 'folder',
          }));
        const files: (Document & { type: 'file' })[] =
          (result.documents || []).map((doc: Document) => ({
            ...doc,
            type: 'file',
          }));
        const combined = [...children, ...files];
        const sortedData = sortBy(combined, 'name');
        setOriginalItems(sortedData);
      } else {
        const response = await fetch(`/api/document-folders?parent_id=`);
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
        const data: (DocumentFolder & { type: 'folder' })[] = (result.data || result).map(
          (folder: DocumentFolder) => ({
            ...folder,
            type: 'folder',
          })
        );
        const sortedData = sortBy(data, 'name');
        setOriginalItems(sortedData);
      }
    } catch (error) {
      console.error('Error fetching document folders:', error);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchData();
  }, [currentParent, pageSize]);

  const filteredItems = useMemo(() => {
    const searchLower = search.toLowerCase();
    return originalItems.filter((item) => {
      if (item.type === 'folder') {
        return (
          (item.name || '').toLowerCase().includes(searchLower) ||
          (item.creator?.name || '').toLowerCase().includes(searchLower)
        );
      }
      return (item.name || '').toLowerCase().includes(searchLower);
    });
  }, [originalItems, search]);

  const sortedItems = useMemo(() => {
    const sorted = sortBy(filteredItems, sortStatus.columnAccessor);
    return sortStatus.direction === 'desc' ? sorted.reverse() : sorted;
  }, [filteredItems, sortStatus]);

  const paginatedItems = useMemo(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    return sortedItems.slice(from, to);
  }, [sortedItems, page, pageSize]);

  // Modal handlers for folders.
  const handleAdd = () => setIsAddModalOpen(true);
  const handleEdit = (record: DocumentFolder) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };
  const handleDelete = (record: DocumentFolder) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteFile = (record: Document) => {
    setSelectedRecordFile(record);
    setIsDeleteFileModalOpen(true);
  };

  // Clicking a folder drills down.
  const handleFolderClick = (record: DocumentFolder) => {
    setFolderStack((prev) => [...prev, record]);
    setPage(1);
  };

  // "Go Back": pop one level from the folder stack.
  const handleBack = () => {
    setFolderStack((prev) => prev.slice(0, -1));
    setPage(1);
  };

  // Open Upload File modal.
  const handleUpload = () => setIsUploadModalOpen(true);

  const deleteRecord = async () => {
    if (!selectedRecord) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/document-folders/${selectedRecord.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        setIsDeleteModalOpen(false);
        await fetchData();
        MySwal.fire({
          title: 'Folder deleted successfully',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          showCloseButton: true,
          customClass: { popup: 'color-success' },
        });
      } else {
        MySwal.fire({
          title: 'Error deleting folder',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          showCloseButton: true,
          customClass: { popup: 'color-danger' },
        });
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    } finally {
      setIsDeleting(false);
    }
  };


  const deleteRecordFile = async () => {
    if (!selectedRecordFile) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/documents/${selectedRecordFile.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        setIsDeleteFileModalOpen(false);
        await fetchData();
        MySwal.fire({
          title: 'Document deleted successfully',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          showCloseButton: true,
          customClass: { popup: 'color-success' },
        });
      } else {
        MySwal.fire({
          title: 'Error deleting folder',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          showCloseButton: true,
          customClass: { popup: 'color-danger' },
        });
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Submit handler for Add/Edit Folder modal.
  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const url =
        selectedRecord && selectedRecord.id
          ? `/api/document-folders/${selectedRecord.id}`
          : '/api/document-folders';
      const method = selectedRecord && selectedRecord.id ? 'PUT' : 'POST';
      let payload: any = { name: values.name };
      if (!selectedRecord) {
        payload.parent_id = currentParent ? currentParent.id : null;
      }
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        await fetchData();
        MySwal.fire({
          title: data.message,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          showCloseButton: true,
          customClass: { popup: 'color-success' },
        });
      } else {
        MySwal.fire({
          title: data.message,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          showCloseButton: true,
          customClass: { popup: 'color-danger' },
        });
      }
    } catch (error) {
      console.error('Error submitting folder:', error);
      MySwal.fire({
        title: 'Error!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: { popup: 'color-danger' },
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit handler for file upload.
  const handleUploadSubmit = async (
    values: UploadFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const formData = new FormData();
      if (values.file) {
        formData.append('file', values.file);
      }
      formData.append('name', values.name);
      formData.append('document_number', values.document_number);
      // Include the folder_id from the current folder.
      formData.append('folder_id', currentParent ? String(currentParent.id) : '');
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setIsUploadModalOpen(false);
        await fetchData();
        MySwal.fire({
          title: data.message,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          showCloseButton: true,
          customClass: { popup: 'color-success' },
        });
      } else {
        MySwal.fire({
          title: data.message,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          showCloseButton: true,
          customClass: { popup: 'color-danger' },
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      MySwal.fire({
        title: 'Error uploading file!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: { popup: 'color-danger' },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="panel mt-6">
        <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
          <h5 className="font-semibold text-lg dark:text-white-light">Document Control</h5>
          <div className="ltr:ml-auto rtl:mr-auto flex gap-3 items-center">
            <input
              type="text"
              className="form-input w-auto"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {folderStack.length > 0 && (
              <button onClick={handleBack} className="btn btn-secondary">
                Back
              </button>
            )}
            {currentParent && (
              <button onClick={handleUpload} className="btn btn-info bg-gradient-to-r from-blue-500 to-green-500">
                Upload File
              </button>
            )}
          </div>
          <button onClick={handleAdd} className="btn btn-primary">
            Add Folder
          </button>
        </div>

        {currentParent && (
          <div className="mb-3">
            <span className="font-bold">Subfolders &amp; Files of: {currentParent.name}</span>
          </div>
        )}

        {/* Data Table */}
        <div className="datatables">
          <DataTable
            highlightOnHover
            className={isRtl ? 'whitespace-nowrap table-hover' : 'whitespace-nowrap table-hover'}
            records={paginatedItems}
            columns={[
              {
                accessor: 'type',
                title: 'Type',
                sortable: false,
                render: (item: Item) =>
                  item.type === 'folder' ? <FiFolder /> : <FiFileText />,
              },
              {
                accessor: 'name',
                title: 'Name',
                sortable: true,
                render: (item: Item) =>
                  item.type === 'folder' ? (
                    <button
                      type="button"
                      onClick={() => handleFolderClick(item as DocumentFolder)}
                      className="text-blue-600 hover:underline"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <a
                      href={(item as Document & { type: 'file' }).revisions?.[0]?.full_file_path || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 hover:underline"
                      style={{ pointerEvents: 'auto' }}
                    >
                      {item.name}
                    </a>
                  ),
              },
              {
                accessor: 'created_at',
                title: 'Creation Date',
                sortable: true,
                render: (item: Item) => {
                  const dateStr = item.created_at;
                  if (!dateStr) return '';
                  const dateObj = new Date(dateStr);
                  return dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                },
              },
              {
                accessor: 'creator',
                title: 'Created By',
                sortable: true,
                render: (item: Item) => {
                  if (item.type === 'folder') {
                    return item.creator?.name || '';
                  }
                  if (item.type === 'file') {
                    return (item as Document & { type: 'file' }).creator?.name || '';
                  }
                  return '';
                },
              },
              {
                accessor: 'actions',
                title: 'Actions',
                render: (item: Item) => (
                  <div className="flex gap-2">
                    {item.type === 'folder' ? (
                      <>
                        <button
                          onClick={() => handleEdit(item as DocumentFolder)}
                          className="btn btn-icon btn-primary"
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(item as DocumentFolder)}
                          className="btn btn-icon btn-danger"
                          title="Delete"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4" />
                          ) : (
                            <FiTrash />
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDeleteFile(item as Document)}
                          className="btn btn-icon btn-danger"
                          title="Delete"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4" />
                          ) : (
                            <FiTrash />
                          )}
                        </button>
                      </>
                    )}
                    {/* File items can have their own actions if needed */}
                  </div>
                ),
              },
            ]}
            totalRecords={sortedItems.length}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={(p) => setPage(p)}
            recordsPerPageOptions={PAGE_SIZES}
            onRecordsPerPageChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            minHeight={200}
            paginationText={({ from, to, totalRecords }) =>
              `Showing ${from} to ${to} of ${totalRecords} entries`
            }
          />
        </div>
      </div>

      {/* Add Folder Modal */}
      <Transition appear show={isAddModalOpen} as={Fragment}>
        <Dialog as="div" open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0 bg-black/60 z-[999] overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4">
                <Dialog.Panel className="panel my-8 w-full max-w-xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                  <div className="p-5">
                    <h5 className="font-semibold text-lg mb-5">Add Folder</h5>
                    <Formik<FormValues>
                      initialValues={{ name: '' }}
                      validationSchema={validationSchema}
                      onSubmit={handleSubmit}
                    >
                      {({ isSubmitting }) => (
                        <Form>
                          <div className="mb-4">
                            <label htmlFor="name" className="block font-medium mb-2">
                              Folder Name
                            </label>
                            <Field
                              type="text"
                              id="name"
                              name="name"
                              className="form-input w-full"
                              placeholder="Enter folder name"
                            />
                            <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                          <div className="flex justify-end gap-4">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className={`btn btn-primary flex items-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4 mr-2" />
                                  Loading
                                </>
                              ) : (
                                'Save'
                              )}
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>

      {/* Edit Folder Modal */}
      <Transition appear show={isEditModalOpen} as={Fragment}>
        <Dialog as="div" open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0 bg-black/60 z-[999] overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4">
                <Dialog.Panel className="panel my-8 w-full max-w-xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                  <div className="p-5">
                    <h5 className="font-semibold text-lg mb-5">Edit Folder</h5>
                    <Formik<FormValues>
                      initialValues={{ name: selectedRecord?.name || '' }}
                      validationSchema={validationSchema}
                      onSubmit={handleSubmit}
                      enableReinitialize
                    >
                      {({ isSubmitting }) => (
                        <Form>
                          <div className="mb-4">
                            <label htmlFor="name" className="block font-medium mb-2">
                              Folder Name
                            </label>
                            <Field
                              type="text"
                              id="name"
                              name="name"
                              className="form-input w-full"
                              placeholder="Enter folder name"
                            />
                            <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                          <div className="flex justify-end gap-4">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className={`btn btn-primary flex items-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4 mr-2" />
                                  Loading
                                </>
                              ) : (
                                'Save'
                              )}
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>

      {/* Delete Folder Modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0 bg-black/60 z-[999] overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4">
                <Dialog.Panel className="panel my-8 w-full max-w-xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                  <div className="p-5">
                    <h5 className="font-semibold text-lg mb-5">Delete Folder</h5>
                    <p>Are you sure you want to delete this folder?</p>
                    <p>Name: {selectedRecord?.name}</p>
                    <div className="flex justify-end gap-4">
                      <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="btn btn-secondary">
                        Cancel
                      </button>
                      <button type="button" onClick={deleteRecord} className="btn btn-danger" disabled={isDeleting}>
                        {isDeleting ? (
                          <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4" />
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>

      {/* Delete File Modal */}
      <Transition appear show={isDeleteFileModalOpen} as={Fragment}>
        <Dialog as="div" open={isDeleteFileModalOpen} onClose={() => setIsDeleteFileModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0 bg-black/60 z-[999] overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4">
                <Dialog.Panel className="panel my-8 w-full max-w-xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                  <div className="p-5">
                    <h5 className="font-semibold text-lg mb-5">Delete File</h5>
                    <p>Are you sure you want to delete this file?</p>
                    <p>Name: {selectedRecord?.name}</p>
                    <div className="flex justify-end gap-4">
                      <button type="button" onClick={() => setIsDeleteFileModalOpen(false)} className="btn btn-secondary">
                        Cancel
                      </button>
                      <button type="button" onClick={deleteRecordFile} className="btn btn-danger" disabled={isDeleting}>
                        {isDeleting ? (
                          <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4" />
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>

      {/* Upload File Modal */}
      <Transition appear show={isUploadModalOpen} as={Fragment}>
        <Dialog as="div" open={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0 bg-black/60 z-[999] overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4">
                <Dialog.Panel className="panel my-8 w-full max-w-xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                  <div className="p-5">
                    <h5 className="font-semibold text-lg mb-5">Upload File</h5>
                    <Formik<UploadFormValues>
                      initialValues={{ file: null, name: '', document_number: '' }}
                      validationSchema={uploadValidationSchema}
                      onSubmit={handleUploadSubmit}
                    >
                      {({ isSubmitting, setFieldValue }) => (
                        <Form>
                          <div className="mb-4">
                            <label htmlFor="file" className="block font-medium mb-2">
                              Select File
                            </label>
                            <input
                              id="file"
                              name="file"
                              type="file"
                              onChange={(e) => {
                                if (e.currentTarget.files) {
                                  setFieldValue('file', e.currentTarget.files[0]);
                                }
                              }}
                              className="form-input w-full"
                            />
                            <ErrorMessage name="file" component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                          <div className="mb-4">
                            <label htmlFor="name" className="block font-medium mb-2">
                              Document Name
                            </label>
                            <Field
                              type="text"
                              id="name"
                              name="name"
                              className="form-input w-full"
                              placeholder="Enter document name"
                            />
                            <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                          <div className="mb-4">
                            <label htmlFor="document_number" className="block font-medium mb-2">
                              Document Number
                            </label>
                            <Field
                              type="text"
                              id="document_number"
                              name="document_number"
                              className="form-input w-full"
                              placeholder="Enter document number"
                            />
                            <ErrorMessage name="document_number" component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                          <div className="flex justify-end gap-4">
                            <button
                              type="button"
                              onClick={() => setIsUploadModalOpen(false)}
                              className="btn btn-secondary"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className={`btn btn-primary flex items-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4 mr-2" />
                                  Loading
                                </>
                              ) : (
                                'Upload'
                              )}
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
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

export default DocumentControl;
