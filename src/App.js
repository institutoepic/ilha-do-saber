import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Aluno from './pages/Aluno';
import Professor from './pages/Professor';
import Huawei from './pages/Huawei';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Aluno />} />
        <Route path="/professor" element={<Professor />} />
        <Route path="/huawei" element={<Huawei />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;