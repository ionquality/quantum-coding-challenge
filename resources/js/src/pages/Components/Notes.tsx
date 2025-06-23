import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import NoteAdd from './NoteAdd';
import api from '../../utils/axios';
import { formatDistanceToNow } from 'date-fns';

interface Note {
  id: number;
  date: string;
  description: string;
  user: string;
  thumb?: string;
}

interface NotesProps {
  type: string;
  typeId: number;
}

const Notes: React.FC<NotesProps> = ({ type, typeId }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get(`/api/notes?type=${type}&typeId=${typeId}`);
      const raw: any[] = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const mapped: Note[] = raw.map(item => ({
        id: item.id,
        date: formatDistanceToNow(new Date(item.created_at), { addSuffix: true }),
        description: item.note,
        user: `${item.creator?.first_name || ''} ${item.creator?.last_name || ''}`.trim(),
        thumb: item.creator?.avatarUrl,
      }));
      setNotes(mapped);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type, typeId]);

  const filteredNotes = notes.filter(n => {
    const lower = search.toLowerCase();
    return (
      n.description.toLowerCase().includes(lower) ||
      n.user.toLowerCase().includes(lower)
    );
  });

  const openAddModal = () => {
    setEditingNoteId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (noteId: number) => {
    setEditingNoteId(noteId);
    setIsModalOpen(true);
  };

  const openDeleteModal = (note: Note) => {
    setDeletingNote(note);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingNote) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/notes/${deletingNote.id}`);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeletingNote(null);
    }
  };

  const titleType = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div>
      <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
        <h5 className="font-semibold text-lg dark:text-white-light">{`${titleType} Notes`}</h5>
        <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
          <input
            type="text"
            className="form-input w-auto"
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button onClick={openAddModal} className="btn btn-primary">
            Add Note
          </button>
        </div>
      </div>

      {filteredNotes.length ? (
        <div className="sm:min-h-[300px] min-h-[400px]">
          <div className="grid 2xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
            {filteredNotes.map(note => (
              <div className="panel p-5 relative border border-blue-500" key={note.id}>
                <div className="flex items-center mb-4">
                  {note.thumb ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      alt="avatar"
                      src={note.thumb}
                    />
                  ) : (
                    <div className="grid place-content-center h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 text-sm font-semibold">
                      {note.user
                        .split(' ')
                        .map(n => n.charAt(0))
                        .join('')}
                    </div>
                  )}
                  <div className="ltr:ml-3">
                    <div className="font-semibold">{note.user}</div>
                    <div className="text-xs text-gray-500">{note.date}</div>
                  </div>
                </div>
                <div
                  className="text-gray-700 dark:text-gray-300 mb-8 prose max-w-full"
                  dangerouslySetInnerHTML={{ __html: note.description }}
                />
                <div className="absolute bottom-4 left-4 flex gap-3">
                  <button
                    onClick={() => openEditModal(note.id)}
                    className="text-blue-600"
                    title="Edit Note"
                  >
                    <IconEdit size={18} stroke={1.5} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(note)}
                    className="text-red-600"
                    title="Delete Note"
                  >
                    <IconTrash size={18} stroke={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center sm:min-h-[300px] min-h-[400px] font-semibold text-lg">
          No data available
        </div>
      )}

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
                    {editingNoteId ? `Edit ${titleType} Note` : `Add ${titleType} Note`}
                  </Dialog.Title>
                  <NoteAdd
                    type={type}
                    typeId={typeId}
                    noteId={editingNoteId ?? undefined}
                    onSuccess={() => {
                      setIsModalOpen(false);
                      setEditingNoteId(null);
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
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
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
                <Dialog.Title as="h3" className="text-lg font-medium">Delete Note</Dialog.Title>
                <p className="mt-2">Are you sure you want to delete this note?</p>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => setIsDeleteOpen(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded bg-gray-200"
                  >Cancel</button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded bg-red-600 text-white"
                  >{isDeleting ? 'Deleting…' : 'Delete'}</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Notes;
