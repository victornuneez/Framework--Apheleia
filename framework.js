// Variable que guardara el valor del ultimo arbol de nodos renderizado.
let oldNode = null;

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

// Esta funcion crea otra funcion que crea un objeto js con la accion que se quiere realizar y con los datos que esa accion necesita .
export const createAction = (type) => {
    return (payload) => ({ type: type, payload: payload });
};

// Esta funcion decide si renderizar todo el DOM por primera vez o si debe compara el arbolr virtual anterior con el nuevo para aplicar las nuevos datos.
export const update = (container, newNode) => {
    if(oldNode === null) {
        render(newNode, container);
    } else {
        reconcile(container, oldNode, newNode, 0);
    }

    oldNode = newNode;
};


export const reconcile = (parent, oldNode, newNode, index = 0) => {
    // Contiene el nodo actual.
    const currentNode = parent.childNodes[index];

    // Crea nodos nuevos
    if(oldNode === undefined || oldNode === null) {
        render(newNode, parent);
        return; 
    }

    // Elimina nodos que ya no existen en el nuevo arbol virtual. 
    if(newNode === undefined || newNode === null) {
        parent.removeChild(currentNode);
        return;
    }

    // Reemplaza los nodos elemento que son actualizados a un distinto tipo de nodo elemento.
    if(typeof oldNode !== typeof newNode || (typeof oldNode === 'object' && oldNode.type !== newNode.type)) {
        const tempContainer = document.createElement('div');
        render(newNode, tempContainer);

        parent.replaceChild(tempContainer.firstChild, currentNode);
        return;
    }

    // Reemplaza el contenido de los atributos y el contenidos de los nodo elementos.
    if(typeof newNode === 'object') {
        for (const atrr in newNode.props) { // El primer for compara y actualiza los atributos o eventos del nodo anterior con su nuevo valor.
            if(newNode.props[atrr] !== oldNode.props[atrr]) {
                
                if(atrr.startsWith('on')) { // verifica si la propiedad es un evento y lo actualiza por el nuevo evento.
                    currentNode[atrr] = newNode.props[atrr]
                
                } else {
                    currentNode.setAttribute(atrr, newNode.props[atrr]) // actualiza el atributo html del nodo elemento.
                }
            }
        }
        
        // El segundo for elimina los atributos y elementos no existen en el nuevo nodo elemento.
        for (const atrr in oldNode.props) {
            if(!(atrr in newNode.props)) {
                
                if(atrr.startsWith('on')) { // Eliminamos la funcion del evento 
                    currentNode[atrr] = null;
                
                } else {
                    currentNode.removeAttribute(atrr);
                }
            }
        }

        const oldChildren = oldNode.children || [];
        const newChildren = newNode.children || [];

        // Obtiene el numero de veces que el bucle debe repetirse.
        const maxChildren = Math.max(oldChildren.length, newChildren.length);

        for (let i = 0; i < maxChildren; i++) {
            reconcile(currentNode, oldChildren[i], newChildren[i], i)
        }
    
    // Si el nuevo nodo es un texto entonces actualizamos el contenido de nodo elemento por el nuevo.
    } else if (typeof newNode === 'string' && oldNode !== newNode) {
        currentNode.nodeValue = newNode;
    }
};