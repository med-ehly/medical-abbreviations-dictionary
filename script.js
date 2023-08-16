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
    const isFilterActive = button.classList.contains("active"); // Vérifier l'état actif

    // Si le filtre est actif, désactivez-le et affichez tous les résultats
    if (isFilterActive) {
      button.classList.remove("active");
      displayResults(sortedData);
    } else {
      // Sinon, activez le filtre et affichez les résultats filtrés
      button.classList.add("active");
      const filteredResults = filterResultsByLetter(selectedLetter, sortedData);
      displayResults(filteredResults);
    }
  });
});

// Fonction pour afficher les résultats (filtrés ou non)
function displayResults(results) {
  const resultsList = document.getElementById("resultsList"); // Correction de l'ID
  resultsList.innerHTML = '';

  if (results.length === 0) {
    resultsList.innerHTML = "<li>Aucun résultat trouvé</li>";
    return;
  }

  results.forEach(result => {
    const row = document.createElement("li"); // Créer une ligne de tableau (élément li)
    
    const abbrCell = document.createElement("abbr"); // Créer une cellule pour l'abréviation
    abbrCell.textContent = result.abreviation;
    row.appendChild(abbrCell); // Ajouter la cellule à la ligne
    
    const descriptionCell = document.createElement("p"); // Créer une cellule pour la description
    descriptionCell.textContent = result.signification;
    row.appendChild(descriptionCell); // Ajouter la cellule à la ligne
    
    resultsList.appendChild(row); // Ajouter la ligne au tableau de résultats
  });
}

