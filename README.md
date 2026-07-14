# Framework Apheleia

Mini-framework de UI declarativa hecho desde cero en JavaScript, con Virtual DOM, soporte para JSX (vía Babel) y gestión de estado estilo Redux.

## Características

- **Virtual DOM** con algoritmo de reconciliación (diffing) para actualizar solo lo que cambió en el DOM real.
- **Soporte JSX** mediante `@babel/plugin-transform-react-jsx` en modo `classic`, apuntando a `createElement` como pragma.
- **Store de estado global** estilo Redux: `createStore`, `createAction`, `dispatch`, `subscribe`.
- Sin dependencias en tiempo de ejecución (Babel se usa solo como herramienta de build).

## Requisitos

- Node.js
- npm

## Instalación

```bash
git clone https://github.com/victornuneez/Framework--Apheleia.git
cd Framework--Apheleia
npm install
```

## Estructura del proyecto

```
Framework--Apheleia/
├── src/                  # Código fuente en JSX
│   ├── framework.js      # Core del framework (VDOM, store, etc.)
│   ├── main.jsx
│   ├── App.jsx
│   ├── Board.jsx
│   └── Column.jsx
├── dist/                 # Código transpilado (generado con Babel)
├── babel.config.json
└── package.json
```

## Uso

### Transpilar el código

El código fuente en `src/` (JSX) debe transpilarse a JavaScript plano antes de poder ejecutarse en el navegador:

```bash
npx babel src --out-dir dist
```

Esto genera la carpeta `dist/` con los archivos ya transpilados (JSX → llamadas a `createElement`).

### ⚠️ Problema conocido: importaciones con extensión `.jsx` después de transpilar

Babel transpila el **contenido** de los archivos (convierte JSX en `createElement(...)`), pero **no modifica las rutas de importación**. Esto significa que, dentro de `dist/`, archivos como `main.js`, `App.js`, `Board.js` y `Column.js` van a seguir teniendo líneas como:

```js
import App from './App.jsx';
import Board from './Board.jsx';
import Column from './Column.jsx';
```

El problema es que en `dist/` esos archivos ya no existen como `.jsx`, sino como `.js` (por ejemplo `App.js`), por lo que el navegador no encuentra el módulo y la app no renderiza.

**Solución (manual, por ahora):** después de transpilar, hay que editar a mano las importaciones dentro de `dist/main.js`, `dist/App.js`, `dist/Board.js` y `dist/Column.js`, cambiando la extensión `.jsx` por `.js`:

```diff
- import App from './App.jsx';
+ import App from './App.js';

- import Board from './Board.jsx';
+ import Board from './Board.js';

- import Column from './Column.jsx';
+ import Column from './Column.js';
```

Repetir este cambio en cada archivo transpilado que importe otro componente.

> 💡 **Nota:** esto habría que automatizarlo a futuro (por ejemplo con un plugin de Babel que reescriba extensiones de import, o con un pequeño script post-build que haga un find & replace de `.jsx` a `.js` dentro de `dist/`), para no tener que hacerlo a mano en cada build.

## Uso básico del framework

```jsx
import { createElement, update, createStore, createAction } from './framework.js';

const increment = createAction('INCREMENT');

const reducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case increment.type:
      return { count: state.count + 1 };
    default:
      return state;
  }
};

const store = createStore(reducer, { count: 0 });

const Counter = ({ count }) => (
  <div>
    <h1>Contador: {count}</h1>
    <button onClick={() => store.dispatch(increment())}>Sumar</button>
  </div>
);

const root = document.getElementById('root');

const render = () => {
  update(root, <Counter count={store.getState().count} />);
};

store.subscribe(render);
render();
```

## API principal

| Función | Descripción |
|---|---|
| `createElement(type, props, ...children)` | Crea un nodo de Virtual DOM. |
| `update(container, vNode)` | Renderiza o re-renderiza la app dentro de `container`. |
| `mount(vNode, container)` | Renderizado inicial (uso interno). |
| `createStore(reducer, initialState)` | Crea el store global de estado. |
| `createAction(type)` | Crea un *action creator* con `type` asociado. |

## Limitaciones conocidas

- La reconciliación de listas se hace por índice, no por `key` única (puede haber renders sub-óptimos al reordenar listas).
- No hay estado local por componente ni *hooks* (`useState`, `useEffect`); todo el estado vive en el store global.
- `store.subscribe` no devuelve una función para desuscribirse.
- Las importaciones `.jsx` no se ajustan automáticamente al transpilar (ver sección de arriba).

## Licencia

ISC
