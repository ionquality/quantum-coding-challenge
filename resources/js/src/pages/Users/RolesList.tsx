import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { DataTable } from 'mantine-datatable';
import { FaTrash, FaArrowRight, FaArrowLeft, FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';

interface RolesListProps {
  userId?: string;
  onRolesUpdated?: () => void;
}

const RolesList: React.FC<RolesListProps> = ({ userId, onRolesUpdated }) => {
  const [roles, setRoles] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [assignedRoles, setAssignedRoles] = useState<any[]>([]);

  // Fetch all roles
  const fetchRoles = async () => {
    const res = await fetch('/api/roles');
    const data = await res.json();
    setRoles(data || []);
    setAllRoles(data || []);
  };

  // Fetch roles assigned to the userId prop
  const fetchUserRoles = async () => {
    if (!userId) {
      setUserRoles([]);
      setAssignedRoles([]);
      return;
    }
    const response = await fetch(`/api/users/${userId}/roles`);
    const data = await response.json();
    let rolesArr = [];
    if (Array.isArray(data) && typeof data[0] === 'string') {
      rolesArr = data.map((name, idx) => ({ id: idx, name }));
    } else if (Array.isArray(data)) {
      rolesArr = data;
    } else if (Array.isArray(data.roles)) {
      rolesArr = data.roles;
    }
    setUserRoles(rolesArr);
    setAssignedRoles(rolesArr);
  };

  useEffect(() => {
    fetchRoles();
    fetchUserRoles();
    // eslint-disable-next-line
  }, [userId]);

  // Modal logic for assigning/removing roles to user
  const getUnassignedRoles = () =>
    allRoles.filter(r => !assignedRoles.some(ar => ar.name === r.name));

  const handleAssignRole = async (role: any) => {
    if (!userId) return;
    await fetch(`/api/users/${userId}/assign-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: role.name }),
    });
    setAssignedRoles([...assignedRoles, role]);
    fetchUserRoles();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Role assigned to user',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
    if (onRolesUpdated) onRolesUpdated();
  };

  const handleRemoveRole = async (role: any) => {
    if (!userId) return;
    await fetch(`/api/users/${userId}/remove-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: role.name }),
    });
    setAssignedRoles(assignedRoles.filter(r => r.name !== role.name));
    fetchUserRoles();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Role removed from user',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
    if (onRolesUpdated) onRolesUpdated();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-semibold text-lg dark:text-white-light">User's Assigned Roles</h5>
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setShowRolesModal(true)}
        >
          <FaPlus /> Add Role
        </button>
      </div>
      <DataTable
        records={userRoles}
        columns={[
          { accessor: 'name', title: 'Role Name' },
          {
            accessor: 'actions',
            title: 'Delete',
            render: (role) => (
              <button
                className="text-red-600 hover:text-red-800 p-2"
                title="Delete Role"
                onClick={() => handleRemoveRole(role)}
              >
                <FaTrash />
              </button>
            ),
          },
        ]}
        minHeight={100}
        highlightOnHover
      />

      {/* Assign Roles Modal (your suggested modal) */}
      <Transition appear show={showRolesModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowRolesModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-0 text-left align-middle shadow-xl transition-all">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
                  <Dialog.Title as="h3" className="text-xl font-semibold text-gray-800">
                    Manage Roles for User: <span className="text-primary">{userId}</span>
                  </Dialog.Title>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => setShowRolesModal(false)}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  {/* Unassigned Roles */}
                  <div className="bg-gray-50 px-6 py-4 border-r border-gray-200 min-h-[400px] max-h-[60vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold">Available Roles</h4>
                      <span className="bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
                        {getUnassignedRoles().length}
                      </span>
                    </div>
                    {getUnassignedRoles().length === 0 && (
                      <div className="text-gray-400 italic">All roles assigned</div>
                    )}
                    {getUnassignedRoles().map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center mb-2 group"
                      >
                        <span className="inline-block bg-cyan-400 text-white px-3 py-1 rounded mr-2 transition group-hover:bg-cyan-600">
                          {role.name}
                        </span>
                        <button
                          className="btn btn-xs btn-info"
                          title="Assign"
                          onClick={() => handleAssignRole(role)}
                        >
                          <FaArrowRight />
                        </button>
                      </div>
                    ))}
                  </div>
                  {/* Assigned Roles */}
                  <div className="bg-gray-50 px-6 py-4 min-h-[400px] max-h-[60vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold">Assigned Roles</h4>
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {assignedRoles.length}
                      </span>
                    </div>
                    {assignedRoles.length === 0 && (
                      <div className="text-gray-400 italic">No roles assigned</div>
                    )}
                    {assignedRoles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center mb-2 group"
                      >
                        <button
                          className="btn btn-xs btn-danger mr-2"
                          title="Remove"
                          onClick={() => handleRemoveRole(role)}
                        >
                          <FaArrowLeft />
                        </button>
                        <span className="inline-block bg-red-400 text-white px-3 py-1 rounded transition group-hover:bg-red-600">
                          {role.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end px-6 py-4 border-t bg-white">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowRolesModal(false)}
                  >
                    Close
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

export default RolesList;