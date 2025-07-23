# Tatuador Pro

Sistema completo de gestão para tatuadores profissionais.

## Funcionalidades

### ✅ Implementadas
- **Dashboard**: Visão geral completa com estatísticas, gráficos e métricas
- **Agenda**: Calendário interativo com agendamentos integrados
- **Receitas**: Controle completo de ganhos e receitas
- **Despesas**: Gestão de gastos e despesas
- **Integração Firestore**: Todos os dados salvos na nuvem em tempo real

### 🔄 Em Desenvolvimento
- **Clientes**: Cadastro e gestão de clientes
- **Relatórios**: Relatórios detalhados e exportação
- **Serviços**: Cadastro de serviços e preços
- **Configurações**: Configurações do sistema

## Características Técnicas

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Firebase Firestore (tempo real)
- **Gráficos**: Recharts para visualizações
- **Calendário**: React Calendar integrado
- **Responsivo**: Design adaptável para mobile e desktop

## Integração Completa

- ✅ Agendamentos concluídos geram receitas automaticamente
- ✅ Todas as transações aparecem no calendário da agenda
- ✅ Dashboard recebe dados em tempo real de todas as fontes
- ✅ Sincronização automática com Firestore
- ✅ Cálculos automáticos de estatísticas e métricas

## Como Usar

1. Configure suas credenciais do Firebase em `src/config/firebase.ts`
2. Execute `npm install` para instalar dependências
3. Execute `npm run dev` para iniciar o desenvolvimento
4. Acesse o sistema e comece a gerenciar seu negócio!

## Estrutura do Projeto

```
src/
├── components/          # Componentes React
├── hooks/              # Hooks personalizados
├── services/           # Serviços do Firestore
├── types/              # Tipos TypeScript
├── utils/              # Utilitários e cálculos
└── config/             # Configurações
```

## Próximos Passos

1. Implementar módulo de Clientes
2. Criar sistema de Relatórios avançados
3. Adicionar gestão de Serviços
4. Implementar notificações push
5. Adicionar backup e exportação de dados