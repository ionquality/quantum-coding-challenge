import React, { useEffect, useState, useMemo, Fragment } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import { FiFileText } from 'react-icons/fi';
import { Dialog, Transition } from '@headlessui/react';
import FileAdd from './FileAdd';

// Basic interface for document creator
interface Creator {
  id: number;
  name: string;
}

// Document interface returned from API
type Document = {
  id: number;
  name: string;
  created_at: string;
  creator?: Creator;
  revisions?: { full_file_path: string }[];
};

// Component props
type FilesProps = {
  module: string;
  modelType: string;
  modelId: number | string;
};

const Files: React.FC<FilesProps> = ({ module, modelType, modelId }) => {
  const [items, setItems] = useState<Document[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [search, setSearch] = useState('');
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'name',
    direction: 'asc',
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchFiles = async () => {
    try {
      const response = await fetch(
        `/api/${module}/${modelType}/${modelId}/documents`
      );
      if (!response.ok) throw new Error('Network error');
      const result = await response.json();
      setItems(sortBy(result.data || [], 'name'));
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
    setPage(1);
  }, [module, modelType, modelId]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return items.filter(doc =>
      doc.name.toLowerCase().includes(term) ||
      (doc.creator?.name.toLowerCase() || '').includes(term)
    );
  }, [items, search]);

  const sorted = useMemo(() => {
    const list = sortBy(filtered, sortStatus.columnAccessor as string);
    return sortStatus.direction === 'desc' ? list.reverse() : list;
  }, [filtered, sortStatus]);

  const paginated = useMemo(() => {
    const from = (page - 1) * pageSize;
    return sorted.slice(from, from + pageSize);
  }, [sorted, page, pageSize]);

  const handleAddSuccess = () => {
    fetchFiles();
    setIsAddModalOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Files</h3>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search..."
            className="form-input"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary whitespace-nowrap w-auto"
          >
            Add File
          </button>
        </div>
      </div>

      <DataTable
        highlightOnHover
        records={paginated}
        columns={[
          { accessor: 'type', title: 'Type', sortable: false, render: () => <FiFileText /> },
          {
            accessor: 'name', title: 'Name', sortable: true,
            render: (doc: Document) => {
              const url = doc.revisions?.[0]?.full_file_path || '#';
              return (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                  onClick={e => e.stopPropagation()}
                >
                  {doc.name}
                </a>
              );
            }
          },
          {
            accessor: 'created_at', title: 'Creation Date', sortable: true,
            render: (doc: Document) =>
              new Date(doc.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          },
          {
            accessor: 'creator', title: 'Created By', sortable: true,
            render: (doc: Document) => doc.creator?.name || ''
          },
        ]}
        totalRecords={sorted.length}
        recordsPerPage={pageSize}
        page={page}
        onPageChange={setPage}
        recordsPerPageOptions={PAGE_SIZES}
        onRecordsPerPageChange={size => { setPageSize(size); setPage(1); }}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        minHeight={200}
        paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} files`}
      />

      {/* Add File Modal (using working pattern) */}
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
                    <h5 className="font-semibold text-lg mb-5">Upload File</h5>
                    <FileAdd
                      module={module}
                      modelType={modelType}
                      modelId={modelId}
                      onSuccess={handleAddSuccess}
                    />
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

export default Files;
