import MySwal, { SweetAlertOptions, SweetAlertIcon } from 'sweetalert2';

type ToastStatus = 'success' | 'error';

const BASE_OPTS = {
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  showCloseButton: true,
};

export function showToast(
  title: string,
  status: ToastStatus = 'success',
  overrides: Partial<SweetAlertOptions> = {}
) {
  const statusClass = status === 'error' ? 'color-error' : 'color-success';

  // 1) Build a plain object
  const opts = {
    ...BASE_OPTS,
    title,
    icon: status as SweetAlertIcon,      // safe, TS knows 'success'/'error' are valid icons
    customClass: { popup: statusClass },
    ...overrides,                        // your extra options
  };


  return MySwal.fire(opts as SweetAlertOptions);
}
