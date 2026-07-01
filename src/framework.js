// Virtual Dom (lo que ya esta en pantalla) en memoria.
let oldNode = null;

// Esta funcion crea un objeto js que describe el nodo o varios nodos de la UI.
export const createElement = (type, props, ...children) => {
    return {
        type: type,
        props: props || {}, 
        children: children
    };
};


// Esta funcion renderiza en el DOM el objetos js que describe un componente de la UI.
export const render = (node, container) => {
    
    // Validacion que termina la recursion.
    if (typeof node === 'string') {
        const textNode = document.createTextNode(node);
        return container.appendChild(textNode);
    };

    const element = document.createElement(node.type);
    
    for(const attr in node.props) {
        if (attr.startsWith("on")) {
            element[attr] = node.props[attr]; // Los eventos se asignan como propiedad del elemento
            
        } else {
            element.setAttribute(attr, node.props[attr]); // Lo asignamos como atributos HTML
        }
    };
    
    node.children.forEach(child => render(child, element)); // Por cada elemento de children se repite la misma logica hasta que se cumpla la validacion.
    container.appendChild(element);
};

// Funcion que crea el store que administra el estado de la app, y devuelve funciones para interactuar con el estado.
export const createStore = (reducer, initialState) => {
    
    let state = initialState;
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


// Esta funcion crea acciones, para representar eventos
export const createAction = (type) => {
    return (payload) => ({ type: type, payload: payload });
};


// Esta funcion decide si construir el DOM por primera vez o actualizarlo.
export const update = (container, newNode) => {
    if(oldNode === null) {
        render(newNode, container);
    
    } else {
        reconcile(container, oldNode, newNode, 0);
    }
    
    oldNode = newNode;
};


// Esta funcion compara el virtual DOM que representa el DOM renderizado en pantalla con el virtual DOM actualizado, para realizar unicamente los cambios necesarios.
export const reconcile = (parent, oldNode, newNode, index = 0) => {
    // Nodo fisico el cual reemplazar o actualizar
    const currentNode = parent.childNodes[index];
    
    // Crea un nuevo nodo que no existe en el oldNode.
    if(oldNode === undefined || oldNode === null) {
        render(newNode, parent);
        return; 
    }

    // Borra el nodo que ya no existe en el newNode.
    if(newNode === undefined || newNode === null) {
        parent.removeChild(currentNode);
        return;
    }

    // Reemplaza por completo si el nodo es un tipo diferente de dato o si es un tipo diferente de etiqueta.
    if(typeof oldNode !== typeof newNode || (typeof oldNode === 'object' && oldNode.type !== newNode.type)) {
        const tempContainer = document.createElement('div');
        render(newNode, tempContainer);

        parent.replaceChild(tempContainer.firstChild, currentNode);
        return;
    }

    // Actualiza atributos y eventos del nodo real, comparando el virtual DOM nuevo con el viejo.
    if(typeof newNode === 'object') {
        for (const atrr in newNode.props) { // agrega atributos nuevos y actualiza los que cambian, ignora los nodos exitentes sin cambios de oldNode.
            if(newNode.props[atrr] !== oldNode.props[atrr]) {
                
                if(atrr.startsWith('on')) { 
                    currentNode[atrr] = newNode.props[atrr]
                
                } else {
                    currentNode.setAttribute(atrr, newNode.props[atrr]) 
                }
            }
        }
        
        // Elimina todos los atributos del nodo viejo que ya no existen en el nodo nuevo, en el DOM(currentNode).
        for (const atrr in oldNode.props) {
            if(!(atrr in newNode.props)) {
                
                if(atrr.startsWith('on')) {
                    currentNode[atrr] = null;
                
                } else {
                    currentNode.removeAttribute(atrr);
                }
            }
        }

        // Aplicamos la misma logica de comparar, crear, actualizar, borrar a todos los hijos del nodo de forma recursiva.
        const oldChildren = oldNode.children || [];
        const newChildren = newNode.children || [];
        const maxChildren = Math.max(oldChildren.length, newChildren.length);
        
        for (let i = 0; i < maxChildren; i++) {
            reconcile(currentNode, oldChildren[i], newChildren[i], i) // El cuarto argumento indica en que posicion real del DOM se trabaja y deben implementarse los actualizaciones.
        }
    
    } else if (typeof newNode === 'string' && oldNode !== newNode) {
        currentNode.nodeValue = newNode;
    }
};