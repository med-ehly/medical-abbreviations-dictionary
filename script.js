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

    // Liste de toutes les catégories et types possibles
    const allCategories = ["Anesthésie", "Cardiologie", "CEGDC", "CCVT", "Dermatologie", "Endocrinologie", "Gastrologie", "Génétique", "Gériatrie", "Gynécologie", "Hémato-Onco", "Immuno-Allergie", "Med Interne", "Infectio", "Néphrologie", "Neurochirurgie", "Neurologie", "Ophtalmologie", "ORL", "Orthopédie", "Pédiatrie", "Physiatrie", "Plastie", "Pneumologie", "Psychiatrie", "Rhumatologie", "Urologie"];
    const allTypes = ["Traitement", /* Ajoutez d'autres types */];

    // Générer les boutons de filtre pour les catégories
    const categoryFilter = document.querySelector(".category-filter");
    categoryFilter.innerHTML = "<h2>Catégories</h2>";

    allCategories.forEach(category => {
      const categoryButton = createFilterButton(category, "data-category", sortedData, handleCategoryFilter);
      categoryFilter.appendChild(categoryButton);
    });

    // Générer les boutons de filtre pour les types de termes
    const typeFilter = document.querySelector(".type-filter");
    typeFilter.innerHTML = "<h2>Types</h2>";

    allTypes.forEach(type => {
      const typeButton = createFilterButton(type, "data-type", sortedData, handleTypeFilter);
      typeFilter.appendChild(typeButton);
    });
  })
  .catch(error => {
    console.error("Une erreur s'est produite lors du chargement des données.", error);
  });

const categoryButtons = document.querySelectorAll(".category-button");
const typeButtons = document.querySelectorAll(".type-button");

// Déclarez des tableaux pour stocker les filtres actifs de chaque type
let activeCategoryFilters = [];
let activeTypeFilters = [];

function createFilterButton(text, attribute, data, filterFunction) {
  const button = document.createElement("button");
  button.textContent = text;
  button.classList.add("category-button");
  button.setAttribute(attribute, text);
  button.addEventListener("click", () => handleFilterButtonClick(button, data, filterFunction));
  return button;
}

// Fonction pour gérer le clic sur un bouton de filtre de catégorie
function handleCategoryFilterButtonClick(button, data) {
  const selectedCategoryFilter = button.getAttribute("data-category");
  const isCategoryFilterActive = button.classList.contains("active");

  if (isCategoryFilterActive) {
    // Si le filtre de catégorie est déjà actif, désactivez-le
    button.classList.remove("active");
    activeCategoryFilter = null;
  } else {
    // Si aucun filtre de catégorie n'est actif, activez celui-ci
    // D'abord, désactivez tous les autres filtres de catégorie actifs
    categoryButtons.forEach(categoryButton => {
      categoryButton.classList.remove("active");
    });
    // Activez le filtre de catégorie sélectionné
    button.classList.add("active");
    activeCategoryFilter = selectedCategoryFilter;
  }

  // Appliquez les filtres actifs sur les données
  applyActiveFilters(data);
}

// Fonction pour gérer le clic sur un bouton de filtre de type
function handleTypeFilterButtonClick(button, data) {
  const selectedTypeFilter = button.getAttribute("data-type");
  const isTypeFilterActive = button.classList.contains("active");

  if (isTypeFilterActive) {
    // Si le filtre de type est déjà actif, désactivez-le
    button.classList.remove("active");
    activeTypeFilter = null;
  } else {
    // Si aucun filtre de type n'est actif, activez celui-ci
    // D'abord, désactivez tous les autres filtres de type actifs
    typeButtons.forEach(typeButton => {
      typeButton.classList.remove("active");
    });
    // Activez le filtre de type sélectionné
    button.classList.add("active");
    activeTypeFilter = selectedTypeFilter;
  }

  // Appliquez les filtres actifs sur les données
  applyActiveFilters(data);
}

// Fonction pour appliquer les filtres actifs
function applyActiveFilters(data) {
  const filteredResults = data.filter(item => {
    // Vérifiez si la catégorie de l'élément correspond au filtre de catégorie actif
    const categoryMatches = !activeCategoryFilter || item.categorie === activeCategoryFilter;

    // Vérifiez si le type de l'élément correspond au filtre de type actif
    const typeMatches = !activeTypeFilter || item.type === activeTypeFilter;

    // Retournez true si à la fois la catégorie et le type correspondent
    return categoryMatches && typeMatches;
  });

  displayResults(filteredResults);
}

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

// Écoutez les clics sur les boutons de filtre de catégorie et de type
categoryButtons.forEach(categoryButton => {
  categoryButton.addEventListener("click", () =>
    handleCategoryFilterButtonClick(categoryButton, sortedData)
  );
});
typeButtons.forEach(typeButton => {
  typeButton.addEventListener("click", () =>
    handleTypeFilterButtonClick(typeButton, sortedData)
  );
});
