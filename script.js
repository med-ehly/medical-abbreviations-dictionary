// script.js

// Fonction pour trier les données en ordre alphabétique
function sortDataAlphabetically(data) {
  return data.sort((a, b) => a.abreviation.localeCompare(b.abreviation));
}

// Fonction pour afficher les résultats de recherche
function displaySearchResults(results) {
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
  displaySearchResults(filteredResults);
}

// Écouteur d'événement pour la barre de recherche
const searchInput = document.getElementById("searchInput");

fetch("data.json")
  .then(response => response.json())
  .then(data => {
    const sortedData = sortDataAlphabetically(data);
    displaySearchResults(sortedData);
    searchInput.addEventListener("input", event => handleSearch(event, sortedData));
  })
  .catch(error => {
    console.error("Une erreur s'est produite lors du chargement des données.", error);
  });

// Fonction pour filtrer les résultats par lettre
function filterResultsByLetter(letter, data) {
  return data.filter(item =>
    item.abreviation.charAt(0).toLowerCase() === letter.toLowerCase()
  );
}

// Écouteurs d'événement pour les boutons de lettre
letterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const selectedLetter = button.getAttribute("data-letter");
    const filteredResults = filterResultsByLetter(selectedLetter, sortedData);
    displayResults(filteredResults); // Utilisez la fonction displayResults ici
  });
});

// Fonction pour afficher les résultats (filtrés ou non)
function displayResults(results) {
  const resultsList = document.getElementById("results-list");
  resultsList.innerHTML = '';

  if (results.length === 0) {
    resultsList.innerHTML = "<li>Aucun résultat trouvé</li>";
    return;
  }

  results.forEach(result => {
    const li = document.createElement("li");
    li.innerHTML = `<abbr>${result.abreviation}</abbr> - ${result.description}`;
    resultsList.appendChild(li);
  });
}
