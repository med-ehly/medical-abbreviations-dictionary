// script.js

// Fonction pour trier les données en ordre alphabétique
function sortDataAlphabetically(data) {
  return data.sort((a, b) => a.abreviation.localeCompare(b.abreviation));
}

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
function handleSearch(event, data) {
  const searchTerm = event.target.value.toLowerCase();
  const filteredResults = data.filter(item =>
    item.abreviation.toLowerCase().includes(searchTerm)
  );
  displayResults(filteredResults);
}

// Écouteur d'événement pour la barre de recherche
const searchInput = document.getElementById("searchInput");

fetch("data.json")
  .then(response => response.json())
  .then(data => {
    const sortedData = sortDataAlphabetically(data);
    displayResults(sortedData);
    searchInput.addEventListener("input", event => handleSearch(event, sortedData));
  })
  .catch(error => {
    console.error("Une erreur s'est produite lors du chargement des données.", error);
  });

// Écouteurs d'événement pour les boutons de lettre
const letterButtons = document.querySelectorAll(".letter-button");
letterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const selectedLetter = button.getAttribute("data-letter");
    const filteredResults = filterResultsByLetter(selectedLetter, sortedData);
    displayResults(filteredResults);
  });
});
