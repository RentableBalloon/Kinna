import { Outlet } from 'react-router-dom';
import Navbar from '../navigation/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-midas-dark">
      <Navbar />
      <main className="container mx-auto px-8 py-8 max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}
