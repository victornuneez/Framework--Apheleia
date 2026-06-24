// Responsabilidad de la funcion: Construir y devolver un objeto js que representa el nodo de la interfaz.
// Babel al llamar a la funcion entrega los datos por separado a esta funcion y las empaquetamos en un objeto js.
// "..." Operador Rest: Al escrbir "...children" en los parametros de la funcion decimos que tome todos los parametros extra que lleguen 
// y que los agrupe dentro de un arreglo llamado children.
export const createElement = (type, props, ...children) => {
    return {
        type: type,
        props: props || {}, // Si props es null entonces usa un objeto vacio para evitar errores.
        children: children
    };
};

// Esta funcion toma el objeto js que representa los nodos de la interfaz y lo renderiza en el DOM.
export const render = (node, container) => {

    // Verificamos si el nodo contiene un string(contenido del elemento), si es asi lo convertimos en un elemento nodo de texto y lo adjuntamos a su nodo elemento.
    if (typeof node === 'string') {
        const textNode = document.createTextNode(node);
        return container.appendChild(textNode);
    };

    // Creamos el nodo elemento segundo el tipo de etiqueta que contenga node.
    const element = document.createElement(node.type);

    // Agregamos los atributos que existan al nodo elemento.
    for(const attr in node.props) {
        if (attr.startsWith("on")) {
            element[attr] = node.props[attr]; // Guardamos la funcion como una propiedad del elemento .

        } else {
            element.setAttribute(attr, node.props[attr]);
        }
    };

    // Recorre todos los hijos tanto como si es un objeto o si es un texto y renderiza cada uno dentro del nodo elemento que se acaba de crear.
    node.children.forEach(child => render(child, element));

    // Insertamos el elemento en el contenedor padre.
    container.appendChild(element);
};

export const createStore = (reducer, initialState) => {
    // guardamos el estado inicial
    let state = initialState;

    // Lista de suscriptores
    const listeners = [];

    return {
        getState: () => state,

        subscribe: (listener) => {
            listeners.push(listener);
        },

        dispatch: (action) => {
            state = reducer(state, action);
            listeners.forEach(listener => listener());
        }
    };
};

// Esta funcion crea otra funcion que crea un objeto js con la accion que se quiere realizar y con los datos que esa accion necesita.
export const createAction = (type) => {
    return (payload) => ({ type: type, payload: payload });
}