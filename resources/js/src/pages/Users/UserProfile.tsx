import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import RolesAndPermissions from './RolesAndPermissions';
const MySwal = withReactContent(Swal);
const UserProfile = () => {

  const dispatch = useDispatch();
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle('User Profile'));
  }, [dispatch]);
  const [tabs, setTabs] = useState<string>('home');
  const toggleTabs = (name: string) => {
    setTabs(name);
  };

  // Fetch user data
  const fetchData = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [userId]);
  const validationSchema = Yup.object({
    first_name: Yup.string().required('First Name is required'),
    last_name: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required')
  });

  const submitForm = async (values) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/users/${userId}`,{
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.success) {
        MySwal.fire({
          title: data.message,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          showCloseButton: true,
          customClass: {
            popup: 'color-success',
          },
        });

        fetchData();

        //navigate('/');
      } else {
        MySwal.fire({
          title: data.message,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          showCloseButton: true,
          customClass: {
            popup: 'color-danger',
          },
        });
      }
    } catch (error) {
      MySwal.fire({
        title: 'Error!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: {
          popup: 'color-danger',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ul className="flex space-x-2 rtl:space-x-reverse">
        <li>
          <Link to="/users/user-management" className="text-primary hover:underline">
            Users
          </Link>
        </li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
          <span>User Profile</span>
        </li>
      </ul>
      <div className="pt-5">
        <div className="flex items-center justify-between mb-5">
          <h5 className="font-semibold text-lg dark:text-white-light">Settings</h5>
        </div>
        <div>
          <ul className="sm:flex font-semibold border-b border-[#ebedf2] dark:border-[#191e3a] mb-5 whitespace-nowrap overflow-y-auto">
            <li className="inline-block">
              <button
                onClick={() => toggleTabs('home')}
                className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'home' ? '!border-primary text-primary' : ''}`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                  <path
                    opacity="0.5"
                    d="M2 12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274C22 8.77128 22 9.91549 22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path d="M12 15L12 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Home
              </button>
            </li>
            <li className="inline-block">
              <button
                onClick={() => toggleTabs('roles-permissions')}
                className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'roles-permissions' ? '!border-primary text-primary' : ''}`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M12 2C13.1046 2 14 2.89543 14 4V5H10V4C10 2.89543 10.8954 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="4" y="7" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M9 11H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M9 15H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Roles & Permissions
              </button>
            </li>
            <li className="inline-block">
              <button
                onClick={() => toggleTabs('payment-details')}
                className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'payment-details' ? '!border-primary text-primary' : ''}`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                  <circle opacity="0.5" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 6V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path
                    d="M15 9.5C15 8.11929 13.6569 7 12 7C10.3431 7 9 8.11929 9 9.5C9 10.8807 10.3431 12 12 12C13.6569 12 15 13.1193 15 14.5C15 15.8807 13.6569 17 12 17C10.3431 17 9 15.8807 9 14.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Payment Details
              </button>
            </li>
            <li className="inline-block">
              <button
                onClick={() => toggleTabs('preferences')}
                className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'preferences' ? '!border-primary text-primary' : ''}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
                  <ellipse opacity="0.5" cx="12" cy="17" rx="7" ry="4" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                Preferences
              </button>
            </li>
            <li className="inline-block">
              <button
                onClick={() => toggleTabs('danger-zone')}
                className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'danger-zone' ? '!border-primary text-primary' : ''}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M5.00659 6.93309C5.04956 5.7996 5.70084 4.77423 6.53785 3.93723C7.9308 2.54428 10.1532 2.73144 11.0376 4.31617L11.6866 5.4791C12.2723 6.52858 12.0372 7.90533 11.1147 8.8278M17.067 18.9934C18.2004 18.9505 19.2258 18.2992 20.0628 17.4622C21.4558 16.0692 21.2686 13.8468 19.6839 12.9624L18.5209 12.3134C17.4715 11.7277 16.0947 11.9628 15.1722 12.8853"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    opacity="0.5"
                    d="M5.00655 6.93311C4.93421 8.84124 5.41713 12.0817 8.6677 15.3323C11.9183 18.5829 15.1588 19.0658 17.0669 18.9935M15.1722 12.8853C15.1722 12.8853 14.0532 14.0042 12.0245 11.9755C9.99578 9.94676 11.1147 8.82782 11.1147 8.82782"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                Danger Zone
              </button>
            </li>
          </ul>
        </div>
        {tabs === 'home' && userData ? (
          <div>
            <Formik
              initialValues={{
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                phone: userData.phone,
              }}
              validationSchema={validationSchema}
              onSubmit={submitForm}
            >
              {({ isSubmitting }) => (
                <Form className="border border-[#ebedf2] dark:border-[#191e3a] rounded-md p-4 mb-5 bg-white dark:bg-black">
                  <h6 className="text-lg font-bold mb-5">General Information</h6>
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="first_name">First Name</label>
                        <Field id="first_name" name="first_name" type="text" className="form-input placeholder:text-white-dark" />
                        <ErrorMessage name="first_name" component="div" className="text-red-500 text-sm" />
                      </div>
                      <div>
                        <label htmlFor="last_name">Last Name</label>
                        <Field id="last_name" name="last_name" type="text" className="form-input" />
                        <ErrorMessage name="last_name" component="div" className="text-red-500 text-sm" />
                      </div>
                      <div>
                        <label htmlFor="phone">Phone</label>
                        <Field id="phone" name="phone" type="text" className="form-input" />
                      </div>
                      <div>
                        <label htmlFor="email">Email</label>
                        <Field id="email" name="email" type="email" className="form-input" />
                        <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                      </div>
                      <div className="sm:col-span-2 mt-3">
                        <button
                          type="submit"
                          className={`btn btn-primary flex items-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span
                                className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4 mr-2"></span>
                              Loading
                            </>
                          ) : (
                            'Save'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>

          </div>
        ) : (
          ''
        )}
        {tabs === 'roles-permissions' && (
          <div>
            <RolesAndPermissions />
          </div>
        )}
        {tabs === 'payment-details' ? (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              <div className="panel">
              <div className="mb-5">
                  <h5 className="font-semibold text-lg mb-4">Billing Address</h5>
                  <p>
                    Changes to your <span className="text-primary">Billing</span> information will take effect starting with scheduled payment and will be refelected on your next
                    invoice.
                  </p>
                </div>
                <div className="mb-5">
                  <div className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                    <div className="flex items-start justify-between py-3">
                      <h6 className="text-[#515365] font-bold dark:text-white-dark text-[15px]">
                        Address #1
                        <span className="block text-white-dark dark:text-white-light font-normal text-xs mt-1">2249 Caynor Circle, New Brunswick, New Jersey</span>
                      </h6>
                      <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                        <button className="btn btn-dark">Edit</button>
                      </div>
                    </div>
                  </div>
                  <div className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                    <div className="flex items-start justify-between py-3">
                      <h6 className="text-[#515365] font-bold dark:text-white-dark text-[15px]">
                        Address #2
                        <span className="block text-white-dark dark:text-white-light font-normal text-xs mt-1">4262 Leverton Cove Road, Springfield, Massachusetts</span>
                      </h6>
                      <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                        <button className="btn btn-dark">Edit</button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start justify-between py-3">
                      <h6 className="text-[#515365] font-bold dark:text-white-dark text-[15px]">
                        Address #3
                        <span className="block text-white-dark dark:text-white-light font-normal text-xs mt-1">2692 Berkshire Circle, Knoxville, Tennessee</span>
                      </h6>
                      <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                        <button className="btn btn-dark">Edit</button>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary">Add Address</button>
              </div>
              <div className="panel">
                <div className="mb-5">
                  <h5 className="font-semibold text-lg mb-4">Payment History</h5>
                  <p>
                    Changes to your <span className="text-primary">Payment Method</span> information will take effect starting with scheduled payment and will be refelected on your
                    next invoice.
                  </p>
                </div>
                <div className="mb-5">
                  <div className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                    <div className="flex items-start justify-between py-3">
                      <div className="flex-none ltr:mr-4 rtl:ml-4">
                        <img src="/assets/images/card-americanexpress.svg" alt="img" />
                      </div>
                      <h6 className="text-[#515365] font-bold dark:text-white-dark text-[15px]">
                        Mastercard
                        <span className="block text-white-dark dark:text-white-light font-normal text-xs mt-1">XXXX XXXX XXXX 9704</span>
                      </h6>
                      <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                        <button className="btn btn-dark">Edit</button>
                      </div>
                    </div>
                  </div>
                  <div className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                    <div className="flex items-start justify-between py-3">
                      <div className="flex-none ltr:mr-4 rtl:ml-4">
                        <img src="/assets/images/card-mastercard.svg" alt="img" />
                      </div>
                      <h6 className="text-[#515365] font-bold dark:text-white-dark text-[15px]">
                        American Express
                        <span className="block text-white-dark dark:text-white-light font-normal text-xs mt-1">XXXX XXXX XXXX 310</span>
                      </h6>
                      <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                        <button className="btn btn-dark">Edit</button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start justify-between py-3">
                      <div className="flex-none ltr:mr-4 rtl:ml-4">
                        <img src="/assets/images/card-visa.svg" alt="img" />
                      </div>
                      <h6 className="text-[#515365] font-bold dark:text-white-dark text-[15px]">
                        Visa
                        <span className="block text-white-dark dark:text-white-light font-normal text-xs mt-1">XXXX XXXX XXXX 5264</span>
                      </h6>
                      <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                        <button className="btn btn-dark">Edit</button>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary">Add Payment Method</button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="panel">
                <div className="mb-5">
                  <h5 className="font-semibold text-lg mb-4">Add Billing Address</h5>
                  <p>
                    Changes your New <span className="text-primary">Billing</span> Information.
                  </p>
                </div>
                <div className="mb-5">
                  <form>
                    <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="billingName">Name</label>
                        <input id="billingName" type="text" placeholder="Enter Name" className="form-input" />
                      </div>
                      <div>
                        <label htmlFor="billingEmail">Email</label>
                        <input id="billingEmail" type="email" placeholder="Enter Email" className="form-input" />
                      </div>
                    </div>
                    <div className="mb-5">
                      <label htmlFor="billingAddress">Address</label>
                      <input id="billingAddress" type="text" placeholder="Enter Address" className="form-input" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-5">
                      <div className="md:col-span-2">
                        <label htmlFor="billingCity">City</label>
                        <input id="billingCity" type="text" placeholder="Enter City" className="form-input" />
                      </div>
                      <div>
                        <label htmlFor="billingState">State</label>
                        <select id="billingState" className="form-select text-white-dark">
                          <option>Choose...</option>
                          <option>...</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="billingZip">Zip</label>
                        <input id="billingZip" type="text" placeholder="Enter Zip" className="form-input" />
                      </div>
                    </div>
                    <button type="button" className="btn btn-primary">
                      Add
                    </button>
                  </form>
                </div>
              </div>
              <div className="panel">
                <div className="mb-5">
                  <h5 className="font-semibold text-lg mb-4">Add Payment Method</h5>
                  <p>
                    Changes your New <span className="text-primary">Payment Method </span>
                    Information.
                  </p>
                </div>
                <div className="mb-5">
                  <form>
                    <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="payBrand">Card Brand</label>
                        <select id="payBrand" className="form-select text-white-dark">
                          <option value="Mastercard">Mastercard</option>
                          <option value="American Express">American Express</option>
                          <option value="Visa">Visa</option>
                          <option value="Discover">Discover</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="payNumber">Card Number</label>
                        <input id="payNumber" type="text" placeholder="Card Number" className="form-input" />
                      </div>
                    </div>
                    <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="payHolder">Holder Name</label>
                        <input id="payHolder" type="text" placeholder="Holder Name" className="form-input" />
                      </div>
                      <div>
                        <label htmlFor="payCvv">CVV/CVV2</label>
                        <input id="payCvv" type="text" placeholder="CVV" className="form-input" />
                      </div>
                    </div>
                    <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="payExp">Card Expiry</label>
                        <input id="payExp" type="text" placeholder="Card Expiry" className="form-input" />
                      </div>
                    </div>
                    <button type="button" className="btn btn-primary">
                      Add
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
        {tabs === 'preferences' ? (
          <div className="switch">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              <div className="panel space-y-5">
                <h5 className="font-semibold text-lg mb-4">Choose Theme</h5>
                <div className="flex justify-around">
                  <div className="flex">
                    <label className="inline-flex cursor-pointer">
                      <input className="form-radio ltr:mr-4 rtl:ml-4 cursor-pointer" type="radio" name="flexRadioDefault" defaultChecked />
                      <span>
                                                <img className="ms-3" width="100" height="68" alt="settings-dark" src="/assets/images/settings-light.svg" />
                                            </span>
                    </label>
                  </div>

                  <label className="inline-flex cursor-pointer">
                    <input className="form-radio ltr:mr-4 rtl:ml-4 cursor-pointer" type="radio" name="flexRadioDefault" />
                    <span>
                                            <img className="ms-3" width="100" height="68" alt="settings-light" src="/assets/images/settings-dark.svg" />
                                        </span>
                  </label>
                </div>
              </div>
              <div className="panel space-y-5">
                <h5 className="font-semibold text-lg mb-4">Activity data</h5>
                <p>Download your Summary, Task and Payment History Data</p>
                <button type="button" className="btn btn-primary">
                  Download Data
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="panel space-y-5">
                <h5 className="font-semibold text-lg mb-4">Public Profile</h5>
                <p>
                  Your <span className="text-primary">Profile</span> will be visible to anyone on the network.
                </p>
                <label className="w-12 h-6 relative">
                  <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                  <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                </label>
              </div>
              <div className="panel space-y-5">
                <h5 className="font-semibold text-lg mb-4">Show my email</h5>
                <p>
                  Your <span className="text-primary">Email</span> will be visible to anyone on the network.
                </p>
                <label className="w-12 h-6 relative">
                  <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox2" />
                  <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white  dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                </label>
              </div>
              <div className="panel space-y-5">
                <h5 className="font-semibold text-lg mb-4">Enable keyboard shortcuts</h5>
                <p>
                  When enabled, press <span className="text-primary">ctrl</span> for help
                </p>
                <label className="w-12 h-6 relative">
                  <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox3" />
                  <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white  dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                </label>
              </div>
              <div className="panel space-y-5">
                <h5 className="font-semibold text-lg mb-4">Hide left navigation</h5>
                <p>
                  Sidebar will be <span className="text-primary">hidden</span> by default
                </p>
                <label className="w-12 h-6 relative">
                  <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox4" />
                  <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white  dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                </label>
              </div>
              <div className="panel space-y-5">
                <h5 className="font-semibold text-lg mb-4">Advertisements</h5>
                <p>
                  Display <span className="text-primary">Ads</span> on your dashboard
                </p>
                <label className="w-12 h-6 relative">
                  <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox5" />
                  <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white  dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                </label>
              </div>
              <div className="panel space-y-5">
                <h5 className="font-semibold text-lg mb-4">Social Profile</h5>
                <p>
                  Enable your <span className="text-primary">social</span> profiles on this network
                </p>
                <label className="w-12 h-6 relative">
                  <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox6" />
                  <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white  dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                </label>
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
        {tabs === 'danger-zone' ? (
          <div className="switch">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="panel space-y-5">
                <h5 className="font-semibold text-lg mb-4">Purge Cache</h5>
                <p>Remove the active resource from the cache without waiting for the predetermined cache expiry time.</p>
                <button className="btn btn-secondary">Clear</button>
              </div>
              <div className="panel space-y-5">
                <h5 className="font-semibold text-lg mb-4">Deactivate Account</h5>
                <p>You will not be able to receive messages, notifications for up to 24 hours.</p>
                <label className="w-12 h-6 relative">
                  <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox7" />
                  <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                </label>
              </div>
              <div className="panel space-y-5">
                <h5 className="font-semibold text-lg mb-4">Delete Account</h5>
                <p>Once you delete the account, there is no going back. Please be certain.</p>
                <button className="btn btn-danger btn-delete-account">Delete my account</button>
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  );
};

export default UserProfile;
