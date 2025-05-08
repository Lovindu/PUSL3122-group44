import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './user/Login';
import Home from './user/Home';
import Setup from './user/Setup';
import DesignEditor from './user/DesignEditor';
import AdminLogin from "./admin/Login";
import AdminUsers from './admin/Users';
import AdminFurniture from './admin/Furniture';
import AdminDesigns from './admin/Designs';
import SignUp from './user/SignUp';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected route component for admin routes
function AdminRoute({ children }) {
  const { currentUser, isAdmin } = useAuth();
  
  if (!currentUser || !isAdmin) {
    return <Navigate to="/adminlogin" />;
  }
  
  return children;
}

// Protected route component for user routes
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* User Routes */}
          <Route path='/' element={
            <ProtectedRoute>
              <Home/>
            </ProtectedRoute>
          }/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/roomsetup' element={
            <ProtectedRoute>
              <Setup/>
            </ProtectedRoute>
          }/>
          <Route path='/designeditor' element={
            <ProtectedRoute>
              <DesignEditor/>
            </ProtectedRoute>
          }/>
          <Route path='/signup' element={<SignUp/>}/>

          {/* Admin Routes */}
          <Route path='/adminlogin' element={<AdminLogin/>}/>
          <Route path='/adminusers' element={
            <AdminRoute>
              <AdminUsers/>
            </AdminRoute>
          }/>
          <Route path='/adminfurniture' element={
            <AdminRoute>
              <AdminFurniture/>
            </AdminRoute>
          }/>
          <Route path='/admindesigns' element={
            <AdminRoute>
              <AdminDesigns/>
            </AdminRoute>
          }/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;
