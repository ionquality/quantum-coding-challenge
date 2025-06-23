import React, { useEffect, useState, useMemo, Fragment } from 'react'
import { DataTable, DataTableSortStatus } from 'mantine-datatable'
import sortBy from 'lodash/sortBy'
import { Dialog, Transition } from '@headlessui/react'
import { showToast } from '../../utils/toast'
import { FiPlus, FiEye, FiTrash2 } from 'react-icons/fi'
import AttachmentAdd from './AttachmentAdd'

interface Creator {
  id: number
  name: string
}

type Attachment = {
  full_file_path: string
  id: number
  name: string
  file_location: string
  created_at: string
  creator?: Creator
}

type AttachmentsProps = {
  attachable_type?: string
  attachable_id?: number | string
  viewOnly?: boolean  // when true, disable adding and deleting attachments
}

const PAGE_SIZES = [10, 20, 30, 50, 100]

const Attachments: React.FC<AttachmentsProps> = ({ attachable_type, attachable_id, viewOnly = false }) => {
  const [items, setItems] = useState<Attachment[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [search, setSearch] = useState('')
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'name',
    direction: 'asc',
  })

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selected, setSelected] = useState<Attachment | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAttachments = async () => {
    try {
      const params = new URLSearchParams()
      if (attachable_type) params.append('attachable_type', attachable_type)
      if (attachable_id) params.append('attachable_id', String(attachable_id))

      const url = `/api/attachments${params.toString() ? `?${params.toString()}` : ''}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Network error')
      const json = await res.json()
      setItems(sortBy(json.data || [], 'name'))
    } catch (err: any) {
      console.error(err)
      showToast(err.message, 'error')
    }
  }

  useEffect(() => {
    fetchAttachments()
    setPage(1)
  }, [attachable_type, attachable_id])

  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return items.filter(att =>
      att.name.toLowerCase().includes(term) ||
      (att.creator?.name.toLowerCase() || '').includes(term)
    )
  }, [items, search])

  const sorted = useMemo(() => {
    const list = sortBy(filtered, sortStatus.columnAccessor as string)
    return sortStatus.direction === 'desc' ? list.reverse() : list
  }, [filtered, sortStatus])

  const paginated = useMemo(() => {
    const from = (page - 1) * pageSize
    return sorted.slice(from, from + pageSize)
  }, [sorted, page, pageSize])

  const handleDelete = async () => {
    if (!selected) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/attachments/${selected.id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete')
      showToast('Attachment deleted', 'success')
      setIsDeleteModalOpen(false)
      fetchAttachments()
    } catch (err: any) {
      console.error(err)
      showToast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Attachments</h3>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search..."
            className="form-input"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
          {!viewOnly && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded flex items-center gap-1"
            >
              <FiPlus /> Add
            </button>
          )}
        </div>
      </div>

      <DataTable
        highlightOnHover
        records={paginated}
        columns={[
          { accessor: 'name', title: 'Filename', sortable: true },
          {
            accessor: 'creator', title: 'Created By', sortable: true,
            render: (att: Attachment) => att.creator?.name || ''
          },
          {
            accessor: 'actions', title: 'Actions', sortable: false,
            render: (att: Attachment) => (
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(att.full_file_path, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                  title="View"
                >
                  <FiEye />
                </button>
                {!viewOnly && (
                  <button
                    onClick={() => { setSelected(att); setIsDeleteModalOpen(true) }}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            )
          }
        ]}
        totalRecords={sorted.length}
        recordsPerPage={pageSize}
        page={page}
        onPageChange={setPage}
        recordsPerPageOptions={PAGE_SIZES}
        onRecordsPerPageChange={size => { setPageSize(size); setPage(1) }}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        minHeight={200}
        paginationText={({ from, to, totalRecords }) =>
          `Showing ${from} to ${to} of ${totalRecords} attachments`
        }
      />

      {/* Add Attachment Modal */}
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
            <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center">
              <Dialog.Panel className="bg-white rounded-lg p-6">
                <AttachmentAdd
                  attachable_type={attachable_type!}
                  attachable_id={attachable_id!}
                  onSuccess={() => { setIsAddModalOpen(false); fetchAttachments() }}
                />
              </Dialog.Panel>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog
          as="div"
          open={isDeleteModalOpen}
          onClose={() => !deleting && setIsDeleteModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 z-[999] flex items-center justify-center">
              <Dialog.Panel className="bg-white rounded-lg p-6">
                <Dialog.Title className="text-lg font-bold mb-4">Delete Attachment</Dialog.Title>
                <p>Are you sure you want to delete <strong>{selected?.name}</strong>?</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={deleting}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded flex items-center gap-1"
                  >Cancel</button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    {deleting ? (
                      <><span className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4 mr-2"/>Deleting...</>
                    ) : (
                      <><FiTrash2/> Delete</>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  )
}

export default Attachments
