const projects = [
    {
      id:1,
      title:'Mode Dark/Mode Light',
      description:'En este proyecto manipulamos los estilos del DOM para cambiar el modo de la pantalla',
      img:'https://res.cloudinary.com/erpersonalprojects/image/upload/v1691505823/projects/modedark_ssbymw.jpg',
      url:'https://er-js-modedark-mode-light.netlify.app/'
    },
    {
      id:2,
      title:'Formulario de contáctenos',
      description:'Utiizando la app de emailjs y ayudados de React, creamos un formulario de contáctenos',
      img:'https://res.cloudinary.com/erpersonalprojects/image/upload/v1691505823/projects/email_c8ttlr.jpg',
      url:'https://sendemailer.netlify.app/'
    },
    {
      id:3,
      title:'Piedra, Papel o tijera',
      description:'Practicando eventos del DOM, hemos realizado el popular juego: Piedra Papel o tijera',
      img:'https://res.cloudinary.com/erpersonalprojects/image/upload/v1691505823/projects/piedrapapeltijera_dbek9s.jpg',
      url:'https://er-rock-paper-scissors.netlify.app/'
    },
    {
      id:4,
      title:'Rick And Morty',
      description:'Consumiendo nuestra primera Api con la popular serie de Rick and morty, aplicando asincronismo',
      img:'https://res.cloudinary.com/erpersonalprojects/image/upload/v1691505824/projects/rickandmorty_ztppzl.jpg',
      url:'https://edwin-dev-rick-and-morty.netlify.app/'
    },
    {
      id:5,
      title:'Chat bidireccional',
      description:'En este proyecto aplicamo conceptos básicos de web socket, con la librería sockwet.io',
      img:'https://res.cloudinary.com/erpersonalprojects/image/upload/v1691505823/projects/chat_vef2ro.jpg',
      url:'https://chat-client-edwin-dev.netlify.app/'
    },
    {
      id:6,
      title:'Carrito de compras',
      description:'Es una de las primeras prácticas donde almacenamos en local storag los elementos del carrito',
      img:'https://res.cloudinary.com/erpersonalprojects/image/upload/v1691505823/projects/marketplace_eckbd5.jpgz',
      url:'https://chat-client-edwin-dev.netlify.app/'
    }
  ]


const sectionProjects = document.querySelector('projects')




const generateCards = () => {
  projects.forEach(project => (createCardProjects))
}


window.addEventListener('DOMcontentLoaded', generateCards)


const createProjects = (project) => {
  const container = document.createElement('div')
  container.classList.add('card-example')


  const containerimgCard = document.createElement('div')
  containerimgCard.classList.add('img')


  const imgCard = document.createElement('img')
  imgCard.src = project.img
  imgCard.alt = project.title


  const Pdescription = document.createElement('p')
  Pdescription.textContent = project.description


  const seeMore = document.createElement('a')
  seeMore.href = project.url
  seeMore.textContent = ('Ver Mas')


  container.appendChild('imgCard')
  container.appendChild('Pdescription')
  container.appendChild('seeMore')
}

document.addEventListener('DOMContentLoaded', function() {
  const menuIcon = document.querySelector('nav .menu-icon');
  const menu = document.querySelector('nav .menu');
  const paragraphs = document.querySelectorAll('p');

  menuIcon.addEventListener('click', function() {
      menu.classList.toggle('active');

      // Añade o remueve la clase 'menu-active' a los párrafos
      paragraphs.forEach(function(paragraph) {
          paragraph.classList.toggle('menu-active');
      });
  });

  window.addEventListener('resize', function() {
      if (window.innerWidth > 480) {
          menu.classList.remove('active');

          // Remueve la clase 'menu-active' de los párrafos cuando el menú se oculta
          paragraphs.forEach(function(paragraph) {
              paragraph.classList.remove('menu-active');
          });
      }
  });
});