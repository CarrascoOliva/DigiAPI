document.querySelector('form').addEventListener('submit', function (event) {
  event.preventDefault(); // Evitar que se envíe el formulario
  const searchValue = document.querySelector('input[type="search"]').value;

  // Haz visible la imagen de carga y muestra por consola que se ejecuta la imagen
  document.getElementById('loadingImage').style.display = 'block';
  console.log('Se ejecuta la imagen');

  fetch(`https://www.digi-api.com/api/v1/digimon/${searchValue}`)
    .then(response => response.json())
    .then(digimon => {
      const digimonContainer = document.getElementById('digimonContainer');
      digimonContainer.innerHTML = ''; // Limpiar
      const card = `
                <div class="card" style="width: 18rem;">
                    <img src="${digimon.images?.[0]?.href ?? 'ruta/a/imagen/por/defecto.png'}" class="card-img-top" alt="${digimon.name ?? 'Sin nombre'}">
                    <div class="card-body">
                        <h5 class="card-title">${digimon.name ?? 'Sin nombre'}</h5>
                        <p class="card-text">#${digimon.id ?? 'Sin ID'}</p>
                        <p class="card-text">Level: ${digimon.levels?.[0]?.level ?? 'Sin nivel'}</p>
                        NickName: <br>
                        <textarea class="form-control" rows="1" placeholder="..." style="resize: none;">${digimon.nickname ?? ''}</textarea>
                        <br>
                        <a href="javascript:void(0);" title="Agregar a favoritos" class="btn btn-outline"><i class="bi bi-suit-heart"></i></a>
                        
                    </div>
                </div>
            `;

            
      digimonContainer.innerHTML += card;
      // Oculta la imagen de carga
      document.getElementById('loadingImage').style.display = 'none';
    })
    .catch(error => console.error('Error:', error));
  // Oculta la imagen de carga
  document.getElementById('loadingImage').style.display = 'none';
});
// Mostrar la lista completa
document.getElementById('fullListButton').addEventListener('click', function () {
  fetch('https://digi-api.com/api/v1/digimon?pageSize=100')
    .then(response => response.json())
    .then(data => {
      const digimonContainer = document.getElementById('digimonContainer');
      digimonContainer.innerHTML = ''; // Limpiar

      data.content.forEach(digimon => {
        const card = `
        <div class="card" style="width: 18rem;">
          <img src="${digimon.image}" class="card-img-top" alt="${digimon.name}">
          <div class="card-body">
            <h5 class="card-title">${digimon.name}</h5>
            <p class="card-text">#${digimon.id}</p>
            <a href="javascript:void(0);" title="Agregar a favoritos" class="btn btn-outline"><i class="bi bi-suit-heart"></i></a>
            
          </div>
        </div>
      `;
        digimonContainer.innerHTML += card;
      });
    });
});
//indexedDB
let db;
const request = indexedDB.open('digimonDB', 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  if (!db.objectStoreNames.contains('favorites')) {
    db.createObjectStore('favorites', { keyPath: 'id' });
  }
};

request.onsuccess = function (event) {
  db = event.target.result;
};
//agregar favoritos
document.addEventListener('click', function (event) {
  if (event.target.closest('.btn-outline')) {
    const card = event.target.closest('.card');
    const digimon = {
      id: Number(card.querySelector('.card-text').textContent.replace('#', '')), // Convertir a número
      name: card.querySelector('.card-title').textContent,
      image: card.querySelector('.card-img-top').src,
      href: card.querySelector('.btn-outline').href
    };
    const transaction = db.transaction(['favorites'], 'readwrite');
    const store = transaction.objectStore('favorites');
    store.put(digimon);
  }
});
//mostrar favoritos
document.getElementById('favoritesButton').addEventListener('click', function () {
  const transaction = db.transaction(['favorites'], 'readonly');
  const store = transaction.objectStore('favorites');
  const request = store.getAll();
  request.onsuccess = function () {
    const digimonContainer = document.getElementById('digimonContainer');
    digimonContainer.innerHTML = '';
    request.result.forEach(digimon => {
      const card = `
        <div class="card" style="width: 18rem;">
          <img src="${digimon.image}" class="card-img-top" alt="${digimon.name}">
          <div class="card-body">
            <h5 class="card-title">${digimon.name}</h5>
            <p class="card-text digimon-id"> #${digimon.id}</p>
            NickName: <br>
            <textarea class="form-control" rows="1" placeholder="..." style="resize: none;">${digimon.nickname ?? ''}</textarea>
            <br>
            <a href="${digimon.href}" title="Eliminar de favoritos" id="eliminar" class="btn btn-outline">
              <i class="bi bi-x-lg"></i>
            </a>
            
          </div>
        </div>
      `;
      digimonContainer.innerHTML += card;
    });
  };
});

//eliminar favoritos
document.addEventListener('click', function (event) {
  if (event.target.closest('#eliminar')) {
    const card = event.target.closest('.card');
    const digimonId = Number(card.querySelector('.digimon-id').textContent.replace('#', ''));

    // Abre una transacción de lectura/escritura en la base de datos
    const transaction = db.transaction(['favorites'], 'readwrite');

    // Accede al object store 'favorites'
    const store = transaction.objectStore('favorites');

    // Elimina el digimon con el ID especificado
    const request = store.delete(digimonId);

    request.onsuccess = function () {
      // Si la eliminación fue exitosa, elimina la tarjeta del DOM
      card.remove();
    };

    request.onerror = function (event) {
      // Si hubo un error, regístralo en la consola
      console.log("Error al eliminar: ", event.target.errorCode);
    };
  }
});

//mostrar opciones
document.addEventListener('DOMContentLoaded', (event) => {
  var myOffcanvas = document.getElementById('opciones');
  var bsOffcanvas = new bootstrap.Offcanvas(myOffcanvas);
  bsOffcanvas.show();
});

