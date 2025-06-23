import {lazy} from 'react';

const LoginCover = lazy(() => import('../pages/Authentication/LoginCover'));
const MerchantList = lazy(() => import('../pages/Merchants/MerchantList'));
const MerchantView = lazy(() => import('../pages/Merchants/MerchantView'));
import ProtectedRoute from '../components/ProtectedRoute';



const routes = [
  // dashboard
  {
    path: '/',

    element: <ProtectedRoute>
      <MerchantList/>
    </ProtectedRoute>,
  },


  {
    path: '/auth/cover-login',
    element: <LoginCover/>,
    layout: 'blank',
  },

  {
    path: '/merchant-list',
    element: <ProtectedRoute><MerchantList/></ProtectedRoute>,
  },
  {
    path: '/merchant-view/:merchantId',
    element: <ProtectedRoute><MerchantView/></ProtectedRoute>,
  },


];

export {routes};
