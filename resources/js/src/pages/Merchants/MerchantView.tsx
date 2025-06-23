import { Tab } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { IconInfoCircle, IconSticker} from '@tabler/icons-react';
import { Link, useParams } from 'react-router-dom';
import Notes from '../Components/Notes';
import MerchantForm from './MerchantForm';
import api from '../../utils/axios';
import { showToast } from '../../utils/toast';

const MerchantView = () => {
  const { merchantId } = useParams<{ merchantId: string }>();
  const merchantIdNum = Number(merchantId);
  const dispatch = useDispatch();
  const [merchant, setMerchant] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle('Merchant Details'));
    fetchMerchant();
  }, [dispatch]);

  const fetchMerchant = async () => {
    try {
      const res = await api.get(`/api/merchants/${merchantIdNum}`);
      setMerchant(res.data?.merchant || res.data?.data || res.data);
    } catch {
      showToast('Failed to load merchant', 'error');
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

  const tabs = [
    {
      name: 'Information',
      icon: IconInfoCircle,
      content: (
        <div className="space-y-4">
          {!editing ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">Name:</p>
                  <p className="text-gray-700">{merchant?.name}</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </button>
              </div>
              <div>
                <p className="text-lg font-semibold">Created At:</p>
                <p className="text-gray-700">{merchant?.created_at ? formatDate(merchant.created_at) : '—'}</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Created By:</p>
                <p className="text-gray-700">{merchant?.creator?.name || '—'}</p>
              </div>
            </div>
          ) : (
            <MerchantForm
              merchantId={merchantIdNum}
              onClose={() => setEditing(false)}
              onSuccess={fetchMerchant}
            />
          )}
        </div>
      ),
    },
    {
      name: 'Notes',
      icon: IconSticker,
      content: <Notes type="merchant" typeId={merchantIdNum} />,
    },
  ];

  return (
    <>
      <ul className="flex space-x-2 rtl:space-x-reverse">
        <li><Link to="/merchant-list" className="text-primary hover:underline">Merchant List</Link></li>
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
                        <Icon className="mr-2" size={18} stroke={1.5} />
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

export default MerchantView;
