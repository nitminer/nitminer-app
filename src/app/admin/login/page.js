import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminLoginComponent from '@/components/AdminLoginComponent';

export const metadata = {
  title: 'Admin Login - NitMiner',
  description: 'Admin access to NitMiner platform',
};

export default function AdminLoginPage() {
  return (
    <>
      <Header />
      <AdminLoginComponent />
    </>
  );
}
