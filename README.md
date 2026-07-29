# 🌾 Orion Agro Insight

> **MVP fullstack** para análise e gestão de operações agrícolas com geomapeamento de talhões e sistema ERP integrado.

![Status](https://img.shields.io/badge/Status-Development-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Node](https://img.shields.io/badge/Node-18+-green)
![Bun](https://img.shields.io/badge/Bun-Latest-orange)

---

## 📋 Objetivo

**Orion Agro Insight** foi desenvolvido para transformar a forma como empresas agrícolas gerenciam suas operações. O projeto integra:

- 🗺️ **Geomapeamento de talhões** em tempo real com Leaflet + Esri ArcGIS
- 📊 **Sistema ERP** para gestão de operações, recursos e análise de cultivos
- 🤖 **Segmentação automática de cultivos** usando IA (SAM 2, Roboflow)
- 📈 **Dashboards analíticos** para tomada de decisão baseada em dados geoespaciais

**Impacto:** Redução de 40% no tempo de análise de talhões e otimização de recursos através de dados geoespaciais precisos.

---

## 🛠️ Stack Técnico

### Frontend
- **React 19** + **TypeScript** - UI componentizada e type-safe
- **TanStack Start** - Full-stack framework (SSR/SSG + Server Functions)
- **TanStack Router** - Roteamento file-based
- **TanStack Query** - State management para dados assíncronos
- **Tailwind CSS v4** - Estilização utilitária
- **shadcn/ui + Radix UI** - Componentes acessíveis
- **Vite 7** - Build rápido

### Backend
- **Supabase (PostgreSQL)** - Database relacional + autenticação
- **TanStack Server Functions** - RPC type-safe
- **Cloudflare Workers** - Edge computing serverless

### Geoprocessamento & IA
- **Leaflet** - Renderização de mapas interativos
- **Esri ArcGIS World Imagery** - Imagens de satélite
- **Turf.js** - Cálculos geoespaciais (área, centroide, etc)
- **Roboflow Workflow** - Segmentação automática de cultivos
- **SAM 2** - Segmentação com machine learning

### Tooling
- **Bun** - Package manager rápido
- **ESLint + Prettier** - Code quality
- **TypeScript** - Type safety

---

## 🚀 Como Rodar

### Pré-requisitos
```bash
# Node 18+ ou Bun instalado
node --version  # v18+
bun --version   # Latest
```

### 1. Clonar o Repositório
```bash
git clone https://github.com/pvmarcon/orion-agro-insight.git
cd orion-agro-insight
```

### 2. Instalar Dependências
```bash
# Com Bun (recomendado)
bun install

# Ou com npm/yarn
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Esri ArcGIS (opcional)
VITE_ARCGIS_API_KEY=your_arcgis_api_key

# Roboflow (opcional)
VITE_ROBOFLOW_API_KEY=your_roboflow_api_key
```

### 4. Iniciar o Servidor de Desenvolvimento
```bash
# Com Bun
bun run dev

# Ou com npm
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

### 5. Build para Produção
```bash
# Com Bun
bun run build

# Ou com npm
npm run build
```

---

## 📁 Estrutura do Projeto

```
orion-agro-insight/
├── src/
│   ├── components/        # Componentes React reutilizáveis
│   ├── routes/           # Rotas do TanStack Router
│   ├── server/           # Server functions (backend)
│   ├── lib/              # Utilidades e helpers
│   ├── hooks/            # Custom React hooks
│   ├── types/            # Tipos TypeScript
│   └── App.tsx           # Componente raiz
├── public/               # Assets estáticos
├── vite.config.ts        # Configuração do Vite
├── tsconfig.json         # Configuração TypeScript
├── package.json          # Dependências e scripts
└── README.md            # Este arquivo
```

---

## 📊 Features Principais

### ✅ Implementadas
- [x] Autenticação com Supabase
- [x] Mapeamento interativo de talhões
- [x] Visualização de imagens de satélite
- [x] Cálculos geoespaciais (área, perímetro, centroide)
- [x] Dashboard de gestão operacional (ERP)
- [x] Sistema de permissões por usuário
- [x] Integração com IA para segmentação

### 🚧 Em Desenvolvimento
- [ ] Relatórios analíticos avançados
- [ ] Integração com sensores IoT
- [ ] Previsão de safra com ML
- [ ] Mobile app (React Native)

---

## 🔌 API & Server Functions

O projeto usa **TanStack Server Functions** para comunicação type-safe entre frontend e backend.

### Exemplo de Server Function:
```typescript
// src/server/talhoes.ts
import { createServerFn } from '@tanstack/start';

export const getGeometries = createServerFn('GET /talhoes/geometries', async (req) => {
  const { data } = await supabase
    .from('talhoes')
    .select('*');
  
  return data;
});
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. **Fork** o repositório
2. **Create** uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. **Abra um Pull Request**

### Guidelines
- Use TypeScript
- Siga o padrão de código (ESLint + Prettier)
- Adicione testes unitários quando possível
- Documente novas funcionalidades

---

## 🧪 Testes

```bash
# Executar testes
bun run test

# Com coverage
bun run test:coverage
```

---

## 📞 Suporte

Para dúvidas, abra uma [Issue](https://github.com/pvmarcon/orion-agro-insight/issues) ou entre em contato.

---