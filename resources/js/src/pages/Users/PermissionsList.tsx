import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { DataTable } from 'mantine-datatable';
import { FaTrash, FaArrowRight, FaArrowLeft, FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';

interface Role {
  id: number;
  name: string;
}

interface Permission {
  id: number;
  name: string;
  roles?: Role[];
}

interface PermissionsListProps {
  userId?: string;
  refreshKey?: number;
}

const PermissionsList: React.FC<PermissionsListProps> = ({ userId, refreshKey }) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [assignedPermissions, setAssignedPermissions] = useState<Permission[]>([]);
  const [userRoles, setUserRoles] = useState<Role[]>([]);

  // Fetch user's roles
  const fetchUserRoles = async () => {
    if (!userId) {
      setUserRoles([]);
      return;
    }
    const response = await fetch(`/api/users/${userId}/roles`);
    const data = await response.json();
    setUserRoles(data.roles || []);
  };

  // Fetch all permissions
  const fetchPermissions = async () => {
    const res = await fetch('/api/permissions');
    const data = await res.json();
    setPermissions(data || []);
    setAllPermissions(data || []);
  };

  // Fetch permissions assigned to the userId prop
  const fetchUserPermissions = async () => {
    if (!userId) {
      setUserPermissions([]);
      setAssignedPermissions([]);
      return;
    }
    const response = await fetch(`/api/users/${userId}/permissions`);
    const data = await response.json();
    let permsArr: Permission[] = [];
    if (data.permissions) {
      permsArr = data.permissions as Permission[];
    }
    setUserPermissions(permsArr);
    setAssignedPermissions(permsArr);
  };

  useEffect(() => {
    fetchPermissions();
    fetchUserPermissions();
    fetchUserRoles();
    // eslint-disable-next-line
  }, [userId, refreshKey]);

  // Get roles that the user has for a specific permission
  const getUserRolesForPermission = (permission: Permission) => {
    if (!permission.roles) return [];
    return permission.roles.filter(role => 
      userRoles.some(userRole => userRole.name === role.name)
    );
  };

  // Modal logic for assigning/removing permissions to user
  const getUnassignedPermissions = () =>
    allPermissions.filter(p => !assignedPermissions.some(ap => ap.name === p.name));

  const handleAssignPermission = async (perm: any) => {
    if (!userId) return;
    await fetch(`/api/users/${userId}/assign-permission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permission: perm.name }),
    });
    setAssignedPermissions([...assignedPermissions, perm]);
    fetchUserPermissions();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Permission assigned to user',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  };

  const handleRemovePermission = async (perm: any) => {
    if (!userId) return;
    await fetch(`/api/users/${userId}/remove-permission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permission: perm.name }),
    });
    setAssignedPermissions(assignedPermissions.filter(p => p.name !== perm.name));
    fetchUserPermissions();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Permission removed from user',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-semibold text-lg dark:text-white-light">User's Assigned Permissions</h5>
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setShowPermissionsModal(true)}
        >
          <FaPlus /> Add Permission
        </button>
      </div>
      <DataTable
        records={userPermissions}
        columns={[
          { 
            accessor: 'name', 
            title: 'Permission Name',
            render: (perm) => {
              const userRolesForPermission = getUserRolesForPermission(perm);
              return (
                <div>
                  <div>{perm.name}</div>
                  {userRolesForPermission.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Associated with: {userRolesForPermission.map(role => role.name).join(', ')}
                    </div>
                  )}
                </div>
              );
            }
          },
          {
            accessor: 'actions',
            title: 'Delete',
            render: (perm) => {
              const userRolesForPermission = getUserRolesForPermission(perm);
              return (
              perm.roles && perm.roles.length > 0 && userRolesForPermission.length > 0  ? (
                <span className="text-gray-400 p-2 " title="Cannot delete - permission is associated with roles">
                  <FaTrash className='mr-2' />
                </span>
              ) : (
                <button
                  className="text-red-600 hover:text-red-800 "
                  title="Delete Permission"
                  onClick={() => handleRemovePermission(perm)}
                >
                  <FaTrash />
                </button>
              )
            )},
          },
        ]}
        minHeight={100}
        highlightOnHover
      />

      {/* Assign Permissions Modal (copied logic from Add Roles modal) */}
      <Transition appear show={showPermissionsModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowPermissionsModal(false)}>
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
                    Manage Permissions for User: <span className="text-primary">{userId}</span>
                  </Dialog.Title>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => setShowPermissionsModal(false)}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  {/* Unassigned Permissions */}
                  <div className="bg-gray-50 px-6 py-4 border-r border-gray-200 min-h-[400px] max-h-[60vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold">Available Permissions</h4>
                      <span className="bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
                        {getUnassignedPermissions().length}
                      </span>
                    </div>
                    {getUnassignedPermissions().length === 0 && (
                      <div className="text-gray-400 italic">All permissions assigned</div>
                    )}
                    {getUnassignedPermissions().map((perm) => (
                      <div
                        key={perm.id}
                        className="flex items-center mb-2 group"
                      >
                        <span className="inline-block bg-cyan-400 text-white px-3 py-1 rounded mr-2 transition group-hover:bg-cyan-600">
                          {perm.name}
                        </span>
                        <button
                          className="btn btn-xs btn-info"
                          title="Assign"
                          onClick={() => handleAssignPermission(perm)}
                        >
                          <FaArrowRight />
                        </button>
                      </div>
                    ))}
                  </div>
                  {/* Assigned Permissions */}
                  <div className="bg-gray-50 px-6 py-4 min-h-[400px] max-h-[60vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold">Assigned Permissions</h4>
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {assignedPermissions.length}
                      </span>
                    </div>
                    {assignedPermissions.length === 0 && (
                      <div className="text-gray-400 italic">No permissions assigned</div>
                    )}
                    {assignedPermissions.map((perm) => (
                      <div
                        key={perm.id}
                        className="flex items-center mb-2 group"
                      >
                        <button
                          className="btn btn-xs btn-danger mr-2"
                          title="Remove"
                          onClick={() => handleRemovePermission(perm)}
                        >
                          <FaArrowLeft />
                        </button>
                        <span className="inline-block bg-red-400 text-white px-3 py-1 rounded transition group-hover:bg-red-600">
                          {perm.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end px-6 py-4 border-t bg-white">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowPermissionsModal(false)}
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

export default PermissionsList;