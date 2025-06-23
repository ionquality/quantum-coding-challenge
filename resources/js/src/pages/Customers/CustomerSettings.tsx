import { Link, useMatch } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { FaBriefcase, FaFlask, FaCalendarAlt, FaCheckSquare, FaCogs } from 'react-icons/fa';
import FormInputs from '../Investigation/FormInputs';
import CustomCodes from '../Settings/CustomCodes';
import CustomerDashboardSettings from './CustomerDashboardSettings';
import CustomerSurveyTemplateList from './CustomerSurveyTemplateList';
const CustomerSettings = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle('Customer Settings'));
  }, [dispatch]);

  const tabs = [
    { name: 'Surveys', icon: FaBriefcase, content: <CustomerSurveyTemplateList /> },
    { name: 'Custom Codes', icon: FaFlask, content: <CustomCodes module="Customer" /> },
    { name: 'Dashboard Settings', icon: FaCogs, content: <CustomerDashboardSettings /> },
  ];

  return (
    <div>
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
          <div className="mb-5">
            <Tab.Group>
              <Tab.List className="mt-3 flex flex-wrap border-b border-white-light dark:border-[#191e3a] mb-4">
                {tabs.map(({ name, icon: Icon }) => (
                  <Tab as={Fragment} key={name}>
                    {({ selected }) => (
                      <button
                        className={`${selected ? 'text-secondary !outline-none before:!w-full' : ''} before:inline-block relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`}
                      >
                        <Icon className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                        {name}
                      </button>
                    )}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels>
                {tabs.map(({ name, content }) => (
                  <Tab.Panel key={name}>{content}</Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSettings;