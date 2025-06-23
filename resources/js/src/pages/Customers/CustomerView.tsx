import { Tab } from '@headlessui/react';
import React, { Fragment, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import {
  FaInfoCircle,
  FaAddressBook,
  FaStickyNote,
  FaPoll,
  FaHistory,
} from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import CustomerInformation from './CustomerInformation';
import Contacts from '../Components/Contacts';
import Notes from '../Components/Notes';
import Logs from '../Components/Logs';
import CustomerSurveyList from './CustomerSurveyList';
const CustomerView = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const customerIdNum = Number(customerId);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle('Customer'));
  }, [dispatch]);

  const tabs = [
    { name: 'Information', icon: FaInfoCircle, content: <CustomerInformation /> },
    { name: 'Contacts',    icon: FaAddressBook,  content:  <Contacts type="customer" typeId={customerIdNum} /> },
    { name: 'Notes',       icon: FaStickyNote,   content: <Notes type="customer" typeId={customerIdNum} /> },
    { name: 'Surveys',     icon: FaPoll,         content: <CustomerSurveyList customer_id={customerIdNum}/> },
    { name: 'Logs',        icon: FaHistory,      content: <Logs type="App\Models\Customers\Customer" typeId={customerIdNum} /> },
  ];

  return (

    <>
      <ul className="flex space-x-2 rtl:space-x-reverse">
        <li><Link to="/customers" className="text-primary hover:underline">Customer Dashboard</Link></li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>View</span></li>
      </ul>
      <div className="space-y-8 pt-5">
        <Tab.Group>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3 panel" id="vertical_pills">
              <Tab.List className="space-y-2">
                {tabs.map(({ name, icon: Icon }) => (
                  <Tab as={Fragment} key={name}>
                    {({ selected }) => (
                      <button
                        className={`${selected ? '!bg-success text-white !outline-none' : 'bg-info text-white'} font-bold duration-300 block rounded-md p-3.5 py-2 transition-all hover:bg-success hover:text-white flex items-center`}
                        style={{ width: '100%', textAlign: 'start' }}
                      >
                        <Icon className="mr-2" />
                        {name}
                      </button>
                    )}
                  </Tab>
                ))}
              </Tab.List>
            </div>
            <div className="col-span-9 panel" id="main-panel">
              <Tab.Panels>
                {tabs.map((tab) => (
                  <Tab.Panel key={tab.name}>{tab.content}</Tab.Panel>
                ))}
              </Tab.Panels>
            </div>
          </div>
        </Tab.Group>
      </div>
    </>
  );
};

export default CustomerView;
