// Constantes pour les sélecteurs DOM
const searchInput = document.getElementById("searchInput");
const resultsList = document.getElementById("resultsList");
const categoryFilter = document.querySelector(".category-filter");
const typeFilter = document.querySelector(".type-filter");

// Variables pour les filtres actifs
let activeLetterButton = null;
let activeCategoryFilter = null;
let activeCategoryButton = null;
let activeTypeButton = null;
let activeTypeFilter = null;

// Fonction de filtrage principale
function applyActiveFilters(data) {
    const filteredResults = data.filter(item => {
        const letterMatches = !activeLetterButton || item.abreviation.charAt(0).toLowerCase() === activeLetterButton.getAttribute("data-letter").toLowerCase();
        const categoryMatches = !activeCategoryFilter || item.categorie === activeCategoryFilter;
        const typeMatches = !activeTypeFilter || item.type === activeTypeFilter;
        return letterMatches && categoryMatches && typeMatches;
    });

    displayResults(filteredResults);
}

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
    applyActiveFilters(filteredResults); // Appliquer les filtres actifs également lors de la recherche
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

                if (!isFilterActive) {
                    // Désactivez toutes les autres lettres sélectionnées
                    letterButtons.forEach(letterButton => {
                        letterButton.classList.remove("active");
                    });
                    button.classList.add("active");
                    activeLetterButton = button;
                } else {
                    button.classList.remove("active");
                    activeLetterButton = null;
                }

                applyActiveFilters(sortedData);
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


function createFilterButton(text, attribute, data, filterFunction) {
    const button = document.createElement("button");
    button.textContent = text;
    button.setAttribute(attribute, text);
    button.addEventListener("click", () => filterFunction(button, data));

    // Ajoutez une classe CSS pour distinguer les boutons de catégories des boutons de types
    if (attribute === "data-category") {
        button.classList.add("category-button");
    } else if (attribute === "data-type") {
        button.classList.add("type-button");
    }

    return button;
}

function handleCategoryFilterButtonClick(button, data) {
    const selectedCategoryFilter = button.getAttribute("data-category");
    const isCategoryFilterActive = button.classList.contains("active");

    if (!isCategoryFilterActive) {
        // Désactivez le bouton de catégorie actif s'il y en a un
        if (activeCategoryButton) {
            activeCategoryButton.classList.remove("active");
        }
        button.classList.add("active");
        activeCategoryButton = button;
        activeCategoryFilter = selectedCategoryFilter;
    } else {
        button.classList.remove("active");
        activeCategoryButton = null;
        activeCategoryFilter = null;
    }

    applyActiveFilters(data);
}


function handleTypeFilterButtonClick(button, data) {
    const selectedTypeFilter = button.getAttribute("data-type");
    const isTypeFilterActive = button.classList.contains("active");

    if (!isTypeFilterActive) {
        // Désactivez le bouton de catégorie actif s'il y en a un
        if (activeTypeButton) {
            activeTypeButton.classList.remove("active");
        }
        button.classList.add("active");
        activeTypeButton = button;
        activeTypeFilter = selectedCategoryFilter;
    } else {
        button.classList.remove("active");
        activeTypeButton = null;
        activeTypeFilter = null;
    }

    applyActiveFilters(data);
}
