# VectorFlow — Pipeline Builder (Frontend)

React + TypeScript visual pipeline editor built for the VectorShift frontend assessment. Drag nodes onto a canvas, connect handles, and submit the graph to a FastAPI backend for node/edge counts and DAG validation.

## Setup

### Frontend

```bash
cd frontend
npm install
npm start
```

App runs at [http://localhost:3000](http://localhost:3000).

Optional env:

```bash
# defaults to http://127.0.0.1:8000
REACT_APP_API_URL=http://127.0.0.1:8000
```

### Backend (required for Submit)

From the repo root:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API runs at [http://127.0.0.1:8000](http://127.0.0.1:8000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Dev server |
| `npm run build` | Production build |
| `npm test` | Jest (watch mode) |
| `npm run test:ci` | Jest (single run, CI) |

Tests live in `/test` with a custom `jest.config.js` because Create React App only discovers tests under `/src` by default.

---

## Architecture

```
src/
├── App.tsx                 # Shell: navbar, dockable toolbar, canvas, preview
├── ui.tsx                  # React Flow canvas (nodes, edges, controls)
├── store.ts                # Zustand pipeline state + undo/redo + persistence
├── submit.tsx              # Submit button → backend parse endpoint
├── nodes/
│   ├── nodeRegistry.tsx    # Declarative node definitions (9 types)
│   ├── createNode.tsx      # NodeDefinition → React component factory
│   ├── BaseNode.tsx        # Shared node shell (handles, body, collapse)
│   ├── NodeHeader.tsx      # Toolbar actions (duplicate, collapse, delete)
│   └── fields.tsx          # Reusable field components (+ growing textarea)
├── hooks/
│   ├── useNodeChrome.ts    # Shared header/toolbar behavior
│   └── useGrowingTextNodeSize.ts
├── utils/
│   ├── textVariables.ts    # {{variable}} parsing + dynamic handles
│   └── pipelineImportExport.ts
├── services/pipelineService.ts
└── components/             # Navbar, modals, canvas controls, Icon wrapper
test/                         # Unit & component tests
```

### Data flow

1. **Toolbar** — drag or click to add nodes; definitions come from `nodeRegistry`.
2. **Canvas** — React Flow renders `nodeTypes` / `edgeTypes`; Zustand holds `nodes` and `edges`.
3. **Nodes** — most types are config-only (`NodeDefinition` → `createNodeComponent` → `BaseNode`). The Text node uses a `growingTextarea` field and `getDynamicHandles()` for auto-resize and `{{var}}` inputs.
4. **Submit** — `parsePipeline()` POSTs `{ nodes, edges }` to `/pipelines/parse`; results show in `ResultModal`.

### Key patterns

- **Node abstraction** — add a node by adding a `NodeDefinition` (fields, handles, optional `getDynamicHandles`, `getError`) instead of copying a component.
- **Shared chrome** — `useNodeChrome` + `NodeHeader` centralize duplicate/delete/collapse and canvas focus.
- **Icons** — `<Icon icon={FiX} />` wraps react-icons with one internal type cast.

---

## Tradeoffs

| Choice | Why | Cost |
|--------|-----|------|
| **Config-driven nodes** | Fast to add nodes; styles stay consistent | Text node needs extra hooks (`growingTextarea`, dynamic handles) beyond plain fields |
| **Zustand + persist** | Simple global state, survives refresh | Large pipelines increase localStorage payload |
| **Modal vs `alert` for submit** | Better UX for errors and DAG status | Slightly deviates from bare assessment spec |
| **Extra features** (undo/redo, import/export, preview, dock toolbar) | Demonstrates product thinking | More surface area than a minimal take-home |
| **CRA + custom Jest config** | No eject; tests in `/test` folder | Two test setups (`react-scripts` vs `jest.config.js`) |
| **CSS modules avoided** | Shared theme tokens in `styles/theme.css` | Global class names (`vs-*`) require naming discipline |
| **Backend DAG check on edges only** | Matches provided API shape | Isolated nodes with no edges still count as a valid DAG |

---

## Assessment coverage

- **Part 1** — Node abstraction + 5 custom nodes (Condition, HTTP Request, Merge, Note, JSON Parse)
- **Part 2** — Unified styling (VectorShift-inspired tokens and layout)
- **Part 3** — Text node auto-resize + `{{variable}}` handles
- **Part 4** — Submit integration with FastAPI `/pipelines/parse`
