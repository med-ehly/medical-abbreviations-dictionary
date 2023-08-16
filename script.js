// script.js

// Fonction pour afficher les résultats de recherche
function displayResults(results) {
  const resultsList = document.getElementById("resultsList");
  resultsList.innerHTML = "";

  if (results.length === 0) {
    resultsList.innerHTML = "<li>Aucun résultat trouvé</li>";
    return;
  }

  results.forEach(item => {
    const listItem = document.createElement("li");
    listItem.textContent = `${item.abreviation} - ${item.signification}`;
    resultsList.appendChild(listItem);
  });
}

// Fonction pour gérer la recherche
function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  fetch("data.json") // Chemin vers le fichier JSON contenant vos données
    .then(response => response.json())
    .then(data => {
      const filteredResults = data.filter(item =>
        item.abreviation.toLowerCase().includes(searchTerm)
      );
      displayResults(filteredResults);
    })
    .catch(error => {
      console.error("Une erreur s'est produite lors du chargement des données.", error);
    });
}

// Écouteur d'événement pour la barre de recherche
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", handleSearch);
