import { Tab } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import {
  FaUsers,
  FaPoll,
  FaChartBar,
  FaCog,
} from 'react-icons/fa';
import CustomerDashboard from './CustomerDashboard';
import CustomerList from './CustomerList';
import CustomerSurveyList from './CustomerSurveyList';
import CustomerSettings from './CustomerSettings';
import { MdDashboard } from 'react-icons/md';

interface SidebarMetrics {
  pendingSurveys: number;
  reviewSurveys: number;
}

const tabs = [
  { key: 'dashboard',        name: 'Dashboard',        Icon: MdDashboard,    content: <CustomerDashboard /> },
  { key: 'customers',        name: 'Customers',        Icon: FaUsers,        content: <CustomerList /> },
  { key: 'surveys',          name: 'Surveys',          Icon: FaPoll,         content: <CustomerSurveyList /> },
  { key: 'pending-surveys',  name: 'Pending Surveys',  Icon: FaPoll,         content: <CustomerSurveyList type="pending" /> },
  { key: 'review-surveys',   name: 'Reviewable Surveys',Icon: FaPoll,        content: <CustomerSurveyList type="review" /> },
  { key: 'reports',          name: 'Reports',          Icon: FaChartBar,     content: <div>Reports panel…</div> },
  { key: 'settings',         name: 'Settings',         Icon: FaCog,          content: <CustomerSettings /> },
];

const CustomerModule: React.FC = () => {
  const dispatch = useDispatch();
  const [metrics, setMetrics] = useState<SidebarMetrics>({ pendingSurveys: 0, reviewSurveys: 0 });

  // page title
  useEffect(() => {
    dispatch(setPageTitle('Customer Dashboard'));
  }, [dispatch]);

  // fetch sidebar metrics once on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/customer-sidebar-metrics');
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json() as SidebarMetrics;
        setMetrics({
          pendingSurveys: data.pendingSurveys ?? 0,
          reviewSurveys: data.reviewSurveys ?? 0,
        });
      } catch (err) {
        console.error('Error fetching sidebar metrics', err);
      }
    })();
  }, []);

  const buttonBase = 'font-bold duration-300 block rounded-md px-3.5 py-2 transition-all flex items-center w-full text-left';

  return (
    <div className="space-y-8 pt-5">
      <Tab.Group>
        <div className="grid grid-cols-12 gap-6">
          {/* Panels */}
          <div className="col-span-9 panel">
            <Tab.Panels>
              {tabs.map(({ key, content }) => (
                <Tab.Panel key={key}>{content}</Tab.Panel>
              ))}
            </Tab.Panels>
          </div>

          {/* Pills */}
          <div className="col-span-3 panel">
            <Tab.List className="space-y-2">
              {tabs.map(({ key, name, Icon }) => {
                // decide badge count
                let badgeCount = 0;
                if (key === 'pending-surveys')  badgeCount = metrics.pendingSurveys;
                if (key === 'review-surveys')   badgeCount = metrics.reviewSurveys;

                return (
                  <Tab
                    key={key}
                    className={({ selected }) =>
                      [
                        buttonBase,
                        selected
                          ? 'bg-success text-white outline-none'
                          : 'bg-info text-white hover:bg-success hover:text-white',
                      ].join(' ')
                    }
                  >
                    <Icon className="mr-2" />
                    {name}
                    {badgeCount > 0 && (
                      <span className="ml-auto inline-block px-2 py-0.5 text-xs font-semibold bg-red-600 text-white rounded-full">
                        {badgeCount}
                      </span>
                    )}
                  </Tab>
                );
              })}
            </Tab.List>
          </div>
        </div>
      </Tab.Group>
    </div>
  );
};

export default CustomerModule;
