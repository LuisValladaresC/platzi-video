const API_USUARIOS = `https://randomuser.me/api/?inc=name,picture&results=`;
const API_PELICULAS = "https://yts.am/api/v2/list_movies.json";

const $navbar = document.getElementById('header');
const $listaAmigos = document.getElementById('lista-amigos');
const $listaPeliculasRecientes = document.getElementById('lista-peliculas-recientes');
const $peliculasAccion = document.getElementById('peliculas-accion');
const $peliculasDrama = document.getElementById('peliculas-drama');
const $peliculasAnimation = document.getElementById('peliculas-animacion');
const $seccionBusqueda = document.getElementById('seccion-busqueda');

const $formularioBusqueda = document.getElementById('formulario');

$formularioBusqueda.addEventListener("submit", async (event) => {
    event.preventDefault()

    const formData = new FormData($formularioBusqueda);
    const inputBusqueda = formData.get("pelicula");

    try {
        if($seccionBusqueda.children[0]) $seccionBusqueda.children[0].remove()
        $formularioBusqueda.appendChild(crear_elementoHTML("", $formularioBusqueda))

        const {data: {movies: pelicula}} = await cargar_peliculas(API_PELICULAS+`?query_term=${inputBusqueda}&limit=1`)
        agregar_datos_a_HTML(pelicula, $seccionBusqueda)
        $formularioBusqueda.children[1].remove()
    } catch (error) {
        console.log(error)
        $formularioBusqueda.children[1].remove()
    }
});

(async function cargar_datos() {
    try {
        const usuario = await cargar_usuarios(1, "usuario")
        agregar_datos_a_HTML(usuario, $navbar)

        const amigos = await cargar_usuarios(8, "amigos")
        agregar_datos_a_HTML(amigos, $listaAmigos)
    } catch (error) {     
        console.log(error)
    }

    try {
        const peliculasRecientes = await cargar_peliculas("?query_term=2019&limit=9", 'recientes')
        agregar_datos_a_HTML(peliculasRecientes, $listaPeliculasRecientes)
        
        const peliculasAccion = await cargar_peliculas("?genre=action", 'accion')
        agregar_datos_a_HTML(peliculasAccion, $peliculasAccion)
        $peliculasAccion.children[0].remove()
        
        const peliculasDrama = await cargar_peliculas("?genre=drama", 'drama')
        agregar_datos_a_HTML(peliculasDrama, $peliculasDrama)
        $peliculasDrama.children[0].remove()

        const peliculasAnimation = await cargar_peliculas("?genre=animation", 'animacion')
        agregar_datos_a_HTML(peliculasAnimation, $peliculasAnimation)
        $peliculasAnimation.children[0].remove()
    } catch (error) {
        console.log(error)
    }
})();

function cargar_usuarios(cantidad, identificador) {
    let url = API_USUARIOS + cantidad
    if (sessionStorage.getItem(identificador)) return JSON.parse(window.sessionStorage.getItem(identificador));

    return new Promise((resolve, reject) => {
        fetch(url)
            .then(data => data.json())
            .then(data => {
                if (data.results.length == 0) throw new Error('No se encontró ningun resultado')

                sessionStorage.setItem(identificador, JSON.stringify(data.results))
                return resolve(data.results)
            })
            .catch(error => {
                return reject(`${error.message} | ${url}`)
            })
    }) 
}

function cargar_peliculas(urlOptions, identificador) {
    let url = API_PELICULAS + urlOptions;
    if (sessionStorage.getItem(identificador)) return JSON.parse(window.sessionStorage.getItem(identificador));

    return new Promise((resolve, reject) => {
        fetch(url)
            .then(data => data.json())
            .then(data => {
                if (data.data.movie_count == 0) throw new Error('No se encontró ningun resultado')
            
                sessionStorage.setItem(identificador, JSON.stringify(data.data.movies))
                return resolve(data.data.movies)
            })
            .catch(error => {
                return reject(`${error.message} | ${url}`)
            })
    }) 
}

function agregar_datos_a_HTML(datos, $contenedor) {
    datos.map(data => {
        let $elemento = crear_elementoHTML(data, $contenedor);
        $contenedor.appendChild($elemento)

        if ($contenedor === $peliculasAccion || $contenedor === $peliculasDrama || $contenedor == $peliculasAnimation || $contenedor === $listaPeliculasRecientes) {
            $elemento.addEventListener("click", () => abrirModal(data))
        }
    })
}

function crear_elementoHTML(data, $contenedor) {
    switch ($contenedor) {
        case $navbar:
            var $elemento = document.createElement('p')
            $elemento.innerHTML = 
            `<img src="${data.picture.medium}"><span>${data.name.first} ${data.name.last}</span>`
        return $elemento;

        case $listaAmigos:
            var $elemento = document.createElement('li')
            $elemento.innerHTML = 
            `<a class="menu-link">
                <img src="${data.picture.medium}"><span>${data.name.first} ${data.name.last}</span>
            </a>`
        return $elemento;

        case $listaPeliculasRecientes:
            var $elemento = document.createElement('li')
            $elemento.innerHTML = 
            `<a class="menu-link">
                ${data.title_long}
            </a>`
        return $elemento;

        case $peliculasAccion:
        case $peliculasDrama:
        case $peliculasAnimation:
            var $elemento = document.createElement('figure')
            $elemento.classList.add('pelicula')
            $elemento.innerHTML = 
            `<img src="${data.medium_cover_image}">
            <figcaption>${data.title}</figcaption>`
        return $elemento;

        case $formularioBusqueda:
            var $elemento = document.createElement('img')
            $elemento.setAttribute("src", "./images/loader.gif");

        return $elemento;

        case $seccionBusqueda:
            var $elemento = document.createElement('figure')
            $elemento.classList.add('busqueda-pelicula')
            $elemento.innerHTML = 
            `<img src="${data.medium_cover_image}">
            <div>
                <p>Pelicula Encontrada</p>
                <h3>${data.title}</h3>
            </div>`
        return $elemento;
    }
}

function agregar_atributos_a_nodo($elemento, atributos) {
    for (let clave in atributos) {
        $elemento.setAttribute(clave, atributos[clave])
    }
}

function abrirModal(data) {
    console.log(data)
}

