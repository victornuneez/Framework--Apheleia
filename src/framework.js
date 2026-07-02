// Funcion que crea y devuelve un objeto js con la descripcion de un nodo o varios nodos.
export const createElement = (type, props, ...children) => {
    return {
        type: type,
        props: props || {},
        children: children
    }
};

// Funcion reutilizable que crea recursivamente un DOM virtual con los elementos que le pases y lo devuelve
const createDomNode = (vNode) => {
    // Validacion que corta la recusividad.
    if(typeof vNode === 'string') {
        return document.createTextNode(vNode);
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