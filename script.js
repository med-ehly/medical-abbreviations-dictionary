// script.js

function sortDataAlphabetically(data) {
  return data.sort((a, b) => a.abreviation.localeCompare(b.abreviation));
}

function displaySearchResults(results) {
  const resultsList = document.getElementById("resultsList");
  resultsList.innerHTML = "";
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

function handleSearch(event, data) {
  const searchTerm = event.target.value.toLowerCase();
  const filteredResults = data.filter(item =>
    item.abreviation.toLowerCase().includes(searchTerm)
  );
  displaySearchResults(filteredResults);
}

function displayResults(results) {
  console.log("Displaying results:", results);
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

const searchInput = document.getElementById("searchInput");

fetch("data.json")
  .then(response => response.json())
  .then(data => {
    const sortedData = sortDataAlphabetically(data);
    displaySearchResults(sortedData);
    searchInput.addEventListener("input", event => handleSearch(event, sortedData));

    const letterButtons = document.querySelectorAll(".letter-button");
    let activeLetterButton = null;

letterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const selectedLetter = button.getAttribute("data-letter");
    console.log("Button clicked:", button.getAttribute("data-letter"));
    const isFilterActive = button.classList.contains("active");

    if (activeLetterButton) {
      activeLetterButton.classList.remove("active");
      console.log("Removing active from previous letter:", activeLetterButton.getAttribute("data-letter"));
    }

    if (!isFilterActive) {
      console.log("Applying filter...");
      button.classList.add("active");
      activeLetterButton = button;
    } else {
      console.log("Removing filter...");
      activeLetterButton = null; // Désactive la lettre active
    }

    // Si aucune lettre n'est active, affiche tous les résultats
    if (!activeLetterButton) {
      displayResults(sortedData);
    } else {
      const filteredResults = filterResultsByLetter(selectedLetter, sortedData);
      displayResults(filteredResults);
    }
  });
});
  })
  .catch(error => {
    console.error("Une erreur s'est produite lors du chargement des données.", error);
  });

function filterResultsByLetter(letter, data) {
  return data.filter(item =>
    item.abreviation.charAt(0).toLowerCase() === letter.toLowerCase()
  );
}
