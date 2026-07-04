// Funcion que crea y devuelve un objeto js con la descripcion de un nodo o varios nodos.
export const createElement = (type, props, ...children) => {
    return {
        type: type,
        props: props || {},
        children: children.map(child => {
            if(typeof child === 'string' || typeof child === 'number') {
                return {
                    type: 'TEXT_ELEMENT',
                    props: { nodeValue: child },
                    children: []
                };
            }
            return child; // Si es un objeto, lo devolvemos tal cual.
        })
    }
};

// Funcion reutilizable que crea recursivamente un DOM virtual con los nodos que le pases y lo devuelve
const createDomNode = (vNode) => {
    // Validacion que corta la recusividad.
    if(vNode.type === 'TEXT_ELEMENT') {
        return document.createTextNode(vNode.props.nodeValue);
    }

    const element = document.createElement(vNode.type);
    Object.keys(vNode.props).forEach(key => {   
        if(key.startsWith('on')) {
            const eventName = key.toLocaleLowerCase().substring(2);
            element.addEventListener(eventName, vNode.props[key]);

        } else {
            element[key] = vNode.props[key]
        }
    });
    vNode.children.forEach(child => {
        element.appendChild(createDomNode(child));
    })

    return element;
};

// Funcion que monta el render inicial de la app.
export const mount = (vNode, container) => {
    container.innerHTML = "";

    const domNode = createDomNode(vNode);
    container.appendChild(domNode)
};


// Funcion que anhade, actualiza y elimina, las propiedades del DOM real en pantalla.
const updateProps = (dom, oldProps = {}, newProps = {}) => {
    // Eliminar las propiedades que ya no existen en las propiedades del nuevo virtualDOM. 
    Object.keys(oldProps).forEach(key => {
        if(!(key in newProps)) {
            if(key.startsWith('on')) {
                const eventName = key.toLocaleLowerCase().substring(2);
                dom.removeEventListener(eventName, oldProps[key]); 
            
            } else {
                dom[key] = "";
            }
        }
    });

    // Anhade o actualiza la nueva propiedad o evento en el DOM virtual
    Object.keys(newProps).forEach(key => {
        if(newProps[key] !== oldProps[key]) {
            if(key.startsWith('on')) {
                const eventName = key.toLocaleLowerCase().substring(2);
                
                if(oldProps[key]) {
                    dom.removeEventListener(eventName, oldProps[key]);
                }
                dom.addEventListener(eventName, newProps[key]);
            } else {
                dom[key] = newProps[key];
            }
        }
    });
};


// Funcion que compara los nodos del viejo arbol virtual con los nodos del nuevo arbol virtual para que el DOM real sea identico al nuevo arbol virtual.
export const reconcile = (parent, oldVNode, newVNode, index = 0) => {
    const currentNode = parent.childNodes[index]; // Obtenemos el nodo real del DOM.

    // El nuevo nodo no existe en la posicion del viejo nodo, entonces se borra el nodo actual en el dom real en esta posicion.
    if(!newVNode) {
        parent.removeChild(currentNode);
        return;
    }

    // El viejo nodo no existe en la posicion del nuevo nodo, entonces se crea este nuevo nodo en el DOM real en esta posicion.
    if(!oldVNode) {
        parent.appendChild(createDomNode(newVNode));
        return;
    }

    // El tipo de elementos de nodos son distintos, entonces se reemplaza el nodo viejo por el nuevo tipo de nodo en la misma posicion.
    if(oldVNode.type !== newVNode.type) {
        parent.replaceChild(createDomNode(newVNode), currentNode);
        return;
    }

    // El tipo de nodo de texto es distinto entonces lo actualizamos por el nuevo nodo de texto.
    if(oldVNode.type === "TEXT_ELEMENT") {
        if(oldVNode.props.nodeValue !== newVNode.props.nodeValue) {
            currentNode.nodeValue = newVNode.props.nodeValue;
        }
        return;
    }
    
    // Los tipos de nodos elementos coinciden en la misma posicion, entonces se evaluan sus propiedades.
    updateProps(currentNode, oldVNode.props, newVNode.props);
    
    // Obtenemos los hijos de cada arbol virtual, repetimos el proceso recursivamente de reconcile el numero de veces que obtenga max.
    const newChildren = newVNode.children || [];
    const oldChildren = oldVNode.children || [];
    const max = Math.max(newChildren.length, oldChildren.length);

    for(let i = 0; i < max; i++) {
        reconcile(currentNode, oldChildren[i], newChildren[i]);
        }
    }

