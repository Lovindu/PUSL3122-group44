import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './user/Login';
import Home from './user/Home';
import Setup from './user/Setup';
import DesignEditor from './user/DesignEditor';
import AdminLogin from "./admin/Login";
import AdminUsers from './admin/Users';
import AdminFurniture from './admin/Furniture';
import AdminDesigns from './admin/Designs';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* User Routes */}
          <Route path='/' element={<Home/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/roomsetup' element={<Setup/>}/>
          <Route path='/designeditor' element={<DesignEditor/>}/>

          {/* Admin Routes */}
          <Route path='/adminlogin' element={<AdminLogin/>}/>
          <Route path='/adminusers' element={<AdminUsers/>}/>
          <Route path='/adminfurniture' element={<AdminFurniture/>}/>
          <Route path='/admindesigns' element={<AdminDesigns/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
