import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Agenda from './components/Agenda';
import Receitas from './components/Receitas';
import Despesas from './components/Despesas';

// Componentes temporários para as páginas não implementadas
const Clientes = () => <div className="p-6"><h1 className="text-2xl font-bold">Clientes - Em desenvolvimento</h1></div>;
const Relatorios = () => <div className="p-6"><h1 className="text-2xl font-bold">Relatórios - Em desenvolvimento</h1></div>;
const Servicos = () => <div className="p-6"><h1 className="text-2xl font-bold">Serviços - Em desenvolvimento</h1></div>;
const Configuracoes = () => <div className="p-6"><h1 className="text-2xl font-bold">Configurações - Em desenvolvimento</h1></div>;

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'agenda':
        return <Agenda />;
      case 'clientes':
        return <Clientes />;
      case 'receitas':
        return <Receitas />;
      case 'despesas':
        return <Despesas />;
      case 'relatorios':
        return <Relatorios />;
      case 'servicos':
        return <Servicos />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;