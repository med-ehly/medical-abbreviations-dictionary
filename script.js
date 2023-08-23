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

    const allCategories = ["Anesthésie", "Cardiologie", "CEGDC", "CCVT", "Dermatologie", "Endocrinologie", "Gastrologie", "Génétique", "Gériatrie", "Gynécologie", "Hémato-Onco", "Immuno-Allergie", "Med Interne", "Infectio", "Néphrologie", "Neurochirurgie", "Neurologie", "Ophtalmologie", "ORL", "Orthopédie", "Pédiatrie", "Physiatrie", "Plastie", "Pneumologie", "Psychiatrie", "Rhumatologie", "Urologie"];
    const allTypes = ["Traitement", /* Ajoutez d'autres types */];

    const categoryFilter = document.querySelector(".category-filter");
    categoryFilter.innerHTML = "<h2>Catégories</h2>";

    allCategories.forEach(category => {
      const categoryButton = createFilterButton(category, "data-category", sortedData, handleCategoryFilterButtonClick);
      categoryFilter.appendChild(categoryButton);
    });

    const typeFilter = document.querySelector(".type-filter");
    typeFilter.innerHTML = "<h2>Types</h2>";

    allTypes.forEach(type => {
      const typeButton = createFilterButton(type, "data-type", sortedData, handleTypeFilterButtonClick);
      typeFilter.appendChild(typeButton);
    });
  })
  .catch(error => {
    console.error("Une erreur s'est produite lors du chargement des données.", error);
  });

const categoryButtons = document.querySelectorAll(".category-button");
const typeButtons = document.querySelectorAll(".type-button");

let activeCategoryFilter = null;
let activeTypeFilter = null;

function createFilterButton(text, attribute, data, filterFunction) {
  const button = document.createElement("button");
  button.textContent = text;
  button.classList.add("category-button");
  button.setAttribute(attribute, text);
  button.addEventListener("click", () => filterFunction(button, data));
  return button;
}

function handleCategoryFilterButtonClick(button, data) {
  const selectedCategoryFilter = button.getAttribute("data-category");
  const isCategoryFilterActive = button.classList.contains("active-filter");

  if (isCategoryFilterActive) {
    button.classList.remove("active-filter");
    activeCategoryFilter = null;
  } else {
    categoryButtons.forEach(categoryButton => {
      categoryButton.classList.remove("active-filter");
    });
    button.classList.add("active-filter");
    activeCategoryFilter = selectedCategoryFilter;
  }

  applyActiveFilters(data);
}

function handleTypeFilterButtonClick(button, data) {
  const selectedTypeFilter = button.getAttribute("data-type");
  const isTypeFilterActive = button.classList.contains("active-filter");

  if (isTypeFilterActive) {
    button.classList.remove("active-filter");
    activeTypeFilter = null;
  } else {
    typeButtons.forEach(typeButton => {
      typeButton.classList.remove("active-filter");
    });
    button.classList.add("active-filter");
    activeTypeFilter = selectedTypeFilter;
  }

  applyActiveFilters(data);
}

function applyActiveFilters(data) {
  const filteredResults = data.filter(item => {
    const categoryMatches = !activeCategoryFilter || item.categorie === activeCategoryFilter;
    const typeMatches = !activeTypeFilter || item.type === activeTypeFilter;
    return categoryMatches && typeMatches;
  });

  displayResults(filteredResults);
}

function filterResultsByLetter(letter, data) {
  return data.filter(item =>
    item.abreviation.charAt(0).toLowerCase() === letter.toLowerCase()
  );
}
