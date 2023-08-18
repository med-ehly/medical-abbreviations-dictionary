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
  const resultsList = document.getElementById("resultsList");
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
        const isFilterActive = button.classList.contains("active");

        if (activeLetterButton) {
          activeLetterButton.classList.remove("active");
        }

        if (!isFilterActive) {
          button.classList.add("active");
          activeLetterButton = button;
        } else {
          activeLetterButton = null;
        }

        if (!activeLetterButton) {
          displayResults(sortedData);
        } else {
          const filteredResults = filterResultsByLetter(selectedLetter, sortedData);
          displayResults(filteredResults);
        }
      });
    });

    // Récupérer les catégories uniques et les types uniques
    const uniqueCategories = [...new Set(sortedData.map(item => item.categorie))];
    const uniqueTypes = [...new Set(sortedData.map(item => item.type))];

    // Générer les boutons de filtre pour les catégories
    const categoryFilterContainer = document.createElement("div");
    categoryFilterContainer.classList.add("filter-container");

    uniqueCategories.forEach(category => {
      const categoryButton = document.createElement("button");
      categoryButton.textContent = category;
      categoryButton.classList.add("category-button");
      categoryButton.addEventListener("click", () => handleCategoryFilter(category, sortedData));
      categoryFilterContainer.appendChild(categoryButton);
    });

    // Insérer les boutons de filtre de catégories avant les résultats
    document.querySelector("main").insertBefore(categoryFilterContainer, resultsList);

    // Générer les boutons de filtre pour les types de termes
    const typeFilterContainer = document.createElement("div");
    typeFilterContainer.classList.add("filter-container");

    uniqueTypes.forEach(type => {
      const typeButton = document.createElement("button");
      typeButton.textContent = type;
      typeButton.classList.add("type-button");
      typeButton.addEventListener("click", () => handleTypeFilter(type, sortedData));
      typeFilterContainer.appendChild(typeButton);
    });

    // Insérer les boutons de filtre de types avant les résultats
    document.querySelector("main").insertBefore(typeFilterContainer, resultsList);
  })
  .catch(error => {
    console.error("Une erreur s'est produite lors du chargement des données.", error);
  });

function filterResultsByLetter(letter, data) {
  return data.filter(item =>
    item.abreviation.charAt(0).toLowerCase() === letter.toLowerCase()
  );
}

function handleCategoryFilter(category, data) {
  const filteredResults = data.filter(item => item.categorie === category);
  displayResults(filteredResults);
}

function handleTypeFilter(type, data) {
  const filteredResults = data.filter(item => item.type === type);
  displayResults(filteredResults);
}
