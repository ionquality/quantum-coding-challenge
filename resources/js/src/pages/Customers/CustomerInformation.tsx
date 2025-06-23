import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loading from '../Components/Loading';

interface Customer {
  id: number;
  name: string;
  // …other fields…
  formatted_address: string;
}

const CustomerInformation: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const res = await fetch(`/api/customers/${customerId}`);
        if (!res.ok) throw new Error('Error fetching customer');
        const data: Customer = await res.json();
        setCustomer(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomer();
  }, [customerId]);

  if (loading) {
    return <Loading />;
  }

  if (!customer) {
    return <div className="text-center text-gray-500">Customer not found.</div>;
  }


  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">{customer.name}</h3>
        <p className="text-gray-700">{customer.formatted_address}</p>
      </div>
      <div>
        <iframe
          title="Customer Address Map"
          src={`https://www.google.com/maps?q=${encodeURIComponent(
            customer.formatted_address
          )}&output=embed`}
          className="w-full h-64 rounded shadow"
          frameBorder="0"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default CustomerInformation;
