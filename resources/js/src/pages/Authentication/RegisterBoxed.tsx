import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle, toggleRTL } from '../../store/themeConfigSlice';
import { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);


const RegisterBoxed = ({ onSuccess}) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle('Register Boxed'));
  });

    const navigate = useNavigate();
  const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const setLocale = (flag: string) => {
    setFlag(flag);
    if (flag.toLowerCase() === 'ae') {
      dispatch(toggleRTL('rtl'));
    } else {
      dispatch(toggleRTL('ltr'));
    }
  };
  const [flag, setFlag] = useState(themeConfig.locale);

  const validationSchema = Yup.object({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
    password: Yup.string().required('Password is required'),
    passwordConfirm: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Password confirmation is required')
  });

    const submitForm = async (values) => {
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
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
                onSuccess();
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
        }
    };

  return (
    <div>
      <div className="absolute inset-0">
        <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
      </div>

      <div
        className="relative flex min-h-screen items-start justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
        <img src="/assets/images/auth/coming-soon-object1.png" alt="image"
             className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
        <img src="/assets/images/auth/coming-soon-object2.png" alt="image"
             className="absolute left-24 top-0 h-40 md:left-[30%]" />
        <img src="/assets/images/auth/coming-soon-object3.png" alt="image"
             className="absolute right-0 top-0 h-[300px]" />
        <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />
        <div
          className="relative w-full rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
          <div
            className="relative flex flex-col p-4 rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 w-full">
            <div className="mx-auto w-full">
              <div className="w-full">
                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Sign Up</h1>
                <p className="text-base font-bold leading-normal text-white-dark">Enter the information below to
                  register the user.</p>
              </div>
              <Formik
                initialValues={{
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  password: '',
                  passwordConfirm: ''
                }}
                validationSchema={validationSchema}
                onSubmit={submitForm}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-5 dark:text-white">
                    <div>
                      <label htmlFor="firstName">First Name</label>
                      <div className="relative text-white-dark">
                        <Field id="firstName" name="firstName" type="text" placeholder="Enter First Name"
                               className="form-input ps-10 placeholder:text-white-dark" />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <circle cx="9" cy="4.5" r="3" fill="#888EA8" />
                            <path opacity="0.5"
                                  d="M15 13.125C15 14.989 15 16.5 9 16.5C3 16.5 3 14.989 3 13.125C3 11.261 5.68629 9.75 9 9.75C12.3137 9.75 15 11.261 15 13.125Z"
                                  fill="#888EA8" />
                        </svg>
                    </span>
                        <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName">Last Name</label>
                      <div className="relative text-white-dark">
                        <Field id="lastName" name="lastName" type="text" placeholder="Enter Last Name"
                               className="form-input ps-10 placeholder:text-white-dark" />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <circle cx="9" cy="4.5" r="3" fill="#888EA8" />
                            <path opacity="0.5"
                                  d="M15 13.125C15 14.989 15 16.5 9 16.5C3 16.5 3 14.989 3 13.125C3 11.261 5.68629 9.75 9 9.75C12.3137 9.75 15 11.261 15 13.125Z"
                                  fill="#888EA8" />
                        </svg>
                    </span>
                        <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email">Email</label>
                      <div className="relative text-white-dark">
                        <Field id="email" name="email" type="email" placeholder="Enter Email"
                               className="form-input ps-10 placeholder:text-white-dark" />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path opacity="0.5"
                                  d="M10.65 2.25H7.35C4.23873 2.25 2.6831 2.25 1.71655 3.23851C0.75 4.22703 0.75 5.81802 0.75 9C0.75 12.182 0.75 13.773 1.71655 14.7615C2.6831 15.75 4.23873 15.75 7.35 15.75H10.65C13.7613 15.75 15.3169 15.75 16.2835 14.7615C17.25 13.773 17.25 12.182 17.25 9C17.25 5.81802 17.25 4.22703 16.2835 3.23851C15.3169 2.25 13.7613 2.25 10.65 2.25Z"
                                  fill="currentColor" />
                            <path
                              d="M14.3465 6.02574C14.609 5.80698 14.6445 5.41681 14.4257 5.15429C14.207 4.89177 13.8168 4.8563 13.5543 5.07507L11.7732 6.55931C11.0035 7.20072 10.4691 7.6446 10.018 7.93476C9.58125 8.21564 9.28509 8.30993 9.00041 8.30993C8.71572 8.30993 8.41956 8.21564 7.98284 7.93476C7.53168 7.6446 6.9973 7.20072 6.22761 6.55931L4.44652 5.07507C4.184 4.8563 3.79384 4.89177 3.57507 5.15429C3.3563 5.41681 3.39177 5.80698 3.65429 6.02574L5.4664 7.53583C6.19764 8.14522 6.79033 8.63914 7.31343 8.97558C7.85834 9.32604 8.38902 9.54743 9.00041 9.54743C9.6118 9.54743 10.1425 9.32604 10.6874 8.97558C11.2105 8.63914 11.8032 8.14522 12.5344 7.53582L14.3465 6.02574Z"
                              fill="currentColor" />
                        </svg>
                    </span>
                        <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="phone">Phone</label>
                      <div className="relative text-white-dark">
                        <Field id="phone" name="phone" type="tel" placeholder="Enter Phone Number"
                               className="form-input ps-10 placeholder:text-white-dark" />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path opacity="0.5"
                                  d="M6.5 1.5C6.5 1.22386 6.72386 1 7 1H11C11.2761 1 11.5 1.22386 11.5 1.5V2.5C11.5 2.77614 11.2761 3 11 3H7C6.72386 3 6.5 2.77614 6.5 2.5V1.5Z"
                                  fill="currentColor" />
                            <path opacity="0.5"
                                  d="M4 3.5C4 3.22386 4.22386 3 4.5 3H13.5C13.7761 3 14 3.22386 14 3.5V4.5C14 4.77614 13.7761 5 13.5 5H4.5C4.22386 5 4 4.77614 4 4.5V3.5Z"
                                  fill="currentColor" />
                            <path
                              d="M3 6.5C3 6.22386 3.22386 6 3.5 6H14.5C14.7761 6 15 6.22386 15 6.5V7.5C15 7.77614 14.7761 8 14.5 8H3.5C3.22386 8 3 7.77614 3 7.5V6.5Z"
                              fill="currentColor" />
                            <path
                              d="M2 9.5C2 9.22386 2.22386 9 2.5 9H15.5C15.7761 9 16 9.22386 16 9.5V10.5C16 10.7761 15.7761 11 15.5 11H2.5C2.22386 11 2 10.7761 2 10.5V9.5Z"
                              fill="currentColor" />
                            <path
                              d="M1 12.5C1 12.2239 1.22386 12 1.5 12H16.5C16.7761 12 17 12.2239 17 12.5V13.5C17 13.7761 16.7761 14 16.5 14H1.5C1.22386 14 1 13.7761 1 13.5V12.5Z"
                              fill="currentColor" />
                        </svg>
                    </span>
                        <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="password">Password</label>
                      <div className="relative text-white-dark">
                        <Field id="password" name="password" type="password" placeholder="Enter Password"
                               className="form-input ps-10 placeholder:text-white-dark" />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path opacity="0.5"
                                  d="M1.5 12C1.5 9.87868 1.5 8.81802 2.15901 8.15901C2.81802 7.5 3.87868 7.5 6 7.5H12C14.1213 7.5 15.182 7.5 15.841 8.15901C16.5 8.81802 16.5 9.87868 16.5 12C16.5 14.1213 16.5 15.182 15.841 15.841C15.182 16.5 14.1213 16.5 12 16.5H6C3.87868 16.5 2.81802 16.5 2.15901 15.841C1.5 15.182 1.5 14.1213 1.5 12Z"
                                  fill="currentColor" />
                            <path
                              d="M6 12.75C6.41421 12.75 6.75 12.4142 6.75 12C6.75 11.5858 6.41421 11.25 6 11.25C5.58579 11.25 5.25 11.5858 5.25 12C5.25 12.4142 5.58579 12.75 6 12.75Z"
                              fill="currentColor" />
                            <path
                              d="M9 12.75C9.41421 12.75 9.75 12.4142 9.75 12C9.75 11.5858 9.41421 11.25 9 11.25C8.58579 11.25 8.25 11.5858 8.25 12C8.25 12.4142 8.58579 12.75 9 12.75Z"
                              fill="currentColor" />
                            <path
                              d="M12.75 12C12.75 12.4142 12.4142 12.75 12 12.75C11.5858 12.75 11.25 12.4142 11.25 12C11.25 11.5858 11.5858 11.25 12 11.25C12.4142 11.25 12.75 11.5858 12.75 12Z"
                              fill="currentColor" />
                            <path
                              d="M5.0625 6C5.0625 3.82538 6.82538 2.0625 9 2.0625C11.1746 2.0625 12.9375 3.82538 12.9375 6V7.50268C13.363 7.50665 13.7351 7.51651 14.0625 7.54096V6C14.0625 3.20406 11.7959 0.9375 9 0.9375C6.20406 0.9375 3.9375 3.20406 3.9375 6V7.54096C4.26488 7.51651 4.63698 7.50665 5.0625 7.50268V6Z"
                              fill="currentColor" />
                        </svg>
                    </span>
                        <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="passwordConfirm">Confirm Password</label>
                      <div className="relative text-white-dark">
                        <Field id="passwordConfirm" name="passwordConfirm" type="password"
                               placeholder="Confirm Password"
                               className="form-input ps-10 placeholder:text-white-dark" />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path opacity="0.5"
                                  d="M1.5 12C1.5 9.87868 1.5 8.81802 2.15901 8.15901C2.81802 7.5 3.87868 7.5 6 7.5H12C14.1213 7.5 15.182 7.5 15.841 8.15901C16.5 8.81802 16.5 9.87868 16.5 12C16.5 14.1213 16.5 15.182 15.841 15.841C15.182 16.5 14.1213 16.5 12 16.5H6C3.87868 16.5 2.81802 16.5 2.15901 15.841C1.5 15.182 1.5 14.1213 1.5 12Z"
                                  fill="currentColor" />
                            <path
                              d="M6 12.75C6.41421 12.75 6.75 12.4142 6.75 12C6.75 11.5858 6.41421 11.25 6 11.25C5.58579 11.25 5.25 11.5858 5.25 12C5.25 12.4142 5.58579 12.75 6 12.75Z"
                              fill="currentColor" />
                            <path
                              d="M9 12.75C9.41421 12.75 9.75 12.4142 9.75 12C9.75 11.5858 9.41421 11.25 9 11.25C8.58579 11.25 8.25 11.5858 8.25 12C8.25 12.4142 8.58579 12.75 9 12.75Z"
                              fill="currentColor" />
                            <path
                              d="M12.75 12C12.75 12.4142 12.4142 12.75 12 12.75C11.5858 12.75 11.25 12.4142 11.25 12C11.25 11.5858 11.5858 11.25 12 11.25C12.4142 11.25 12.75 11.5858 12.75 12Z"
                              fill="currentColor" />
                            <path
                              d="M5.0625 6C5.0625 3.82538 6.82538 2.0625 9 2.0625C11.1746 2.0625 12.9375 3.82538 12.9375 6V7.50268C13.363 7.50665 13.7351 7.51651 14.0625 7.54096V6C14.0625 3.20406 11.7959 0.9375 9 0.9375C6.20406 0.9375 3.9375 3.20406 3.9375 6V7.54096C4.26488 7.51651 4.63698 7.50665 5.0625 7.50268V6Z"
                              fill="currentColor" />
                        </svg>
                    </span>
                        <ErrorMessage name="passwordConfirm" component="div" className="text-red-500 text-sm" />
                      </div>
                    </div>
                    <button type="submit"
                            className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                      Register
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterBoxed;