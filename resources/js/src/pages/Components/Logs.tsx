import React, { useEffect, useState } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';

// Nested user shape from API
interface LogUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  name: string;
  email: string;
  avatar: string | null;
  theme: string;
  locale: string;
  phone: string;
  active: boolean;
  overwatch: boolean;
  apex: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Log entry shape from API
interface LogEntry {
  id: number;
  model: string;
  model_id: number;
  module: string;
  title: string;
  description?: string;
  viewable: boolean;
  location: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: LogUser;
}

interface LogsProps {
  /**
   * Fully-qualified backend class name, e.g. "App\\Models\\Customers\\Customer"
   */
  type: string;
  typeId: number;
}

const Logs: React.FC<LogsProps> = ({ type, typeId }) => {
  // Derive a clean title from class path
  const rawName = type.split('\\').pop() || type;
  // Insert spaces before capital letters and trim (e.g. "CustomerOrder" -> "Customer Order")
  const displayName = rawName.replace(/([A-Z])/g, ' $1').trim();

  // Pagination & table state
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  const [originalRecords, setOriginalRecords] = useState<LogEntry[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<LogEntry[]>([]);
  const [records, setRecords] = useState<LogEntry[]>([]);

  const [search, setSearch] = useState('');
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'created_at',
    direction: 'desc',
  });

  // Fetch and map data
  const fetchData = async () => {
    try {
      const encodedType = encodeURIComponent(type);
      const res = await fetch(`/api/general-logs?type=${encodedType}&typeId=${typeId}`);
      const raw: any[] = await res.json();
      const mapped: LogEntry[] = raw.map(item => ({
        id: item.id,
        model: item.model,
        model_id: item.model_id,
        module: item.module,
        title: item.title,
        description: item.description,
        viewable: item.viewable,
        location: item.location,
        user_id: item.user_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        deleted_at: item.deleted_at,
        user: item.user,
      }));
      // initial sort
      const sorted = sortBy(mapped, 'created_at').reverse();
      setOriginalRecords(sorted);
      setFilteredRecords(sorted);
      setRecords(sorted.slice(0, pageSize));
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, typeId]);

  // Handle pagination
  useEffect(() => {
    const from = (page - 1) * pageSize;
    setRecords(filteredRecords.slice(from, from + pageSize));
  }, [page, pageSize, filteredRecords]);

  useEffect(() => setPage(1), [pageSize]);

  // Search filtering
  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = originalRecords.filter(r =>
      r.module.toLowerCase().includes(term) ||
      r.title.toLowerCase().includes(term) ||
      (r.description?.toLowerCase().includes(term) ?? false) ||
      r.user.name.toLowerCase().includes(term)
    );
    setFilteredRecords(filtered);
    setPage(1);
  }, [search, originalRecords]);

  // Sorting
  useEffect(() => {
    const { columnAccessor, direction } = sortStatus;
    let sorted = [...filteredRecords];
    if (columnAccessor === 'created_at') {
      sorted = sortBy(sorted, 'created_at');
    } else if (columnAccessor === 'module') {
      sorted = sortBy(sorted, 'module');
    } else if (columnAccessor === 'title') {
      sorted = sortBy(sorted, 'title');
    }
    if (direction === 'desc') sorted.reverse();
    setFilteredRecords(sorted);
    setPage(1);
  }, [sortStatus]);

  return (
    <div>
      <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
        <h5 className="font-semibold text-lg dark:text-white-light">
          {`${displayName} System Logs`}
        </h5>
        <div className="ltr:ml-auto rtl:mr-auto flex gap-2">
          <input
            type="text"
            className="form-input w-auto"
            placeholder="Search logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable<LogEntry>
        highlightOnHover
        records={records}
        columns={[
          {
            accessor: 'created_at',
            title: 'Date',
            sortable: true,
            render: row => new Date(row.created_at).toLocaleString(),
          },
          { accessor: 'module', title: 'Module', sortable: true },
          { accessor: 'title', title: 'Title', sortable: true },
          { accessor: 'description', title: 'Description' },
          {
            accessor: 'user',
            title: 'User',
            render: row => row.user.name,
          },
        ]}
        totalRecords={filteredRecords.length}
        recordsPerPage={pageSize}
        page={page}
        onPageChange={setPage}
        recordsPerPageOptions={PAGE_SIZES}
        onRecordsPerPageChange={setPageSize}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        minHeight={200}
      />
    </div>
  );
};

export default Logs;
