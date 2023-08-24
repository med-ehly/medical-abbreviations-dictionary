// Constantes pour les sélecteurs DOM
const searchInput = document.getElementById("searchInput");
const resultsList = document.getElementById("resultsList");

// Variables pour les filtres actifs
let activeLetterFilter = null;
let activeLetterButton = null;
let activeCategoryFilter = null;
let activeCategoryButton = null;
let activeTypeButton = null;
let activeTypeFilter = null;

// Déclarez ces variables en tant que constantes en dehors de la fonction DOMContentLoaded
const letterButtons = document.querySelectorAll(".letter-button");
const categoryButtons = document.querySelectorAll(".category-button");
const typeButtons = document.querySelectorAll(".type-button");

// Fonction pour réinitialiser les filtres
function resetFilters() {
    // Réinitialisez toutes les variables de filtre
    activeLetterFilter = null;
    activeLetterButton = null;
    activeCategoryFilter = null;
    activeCategoryButton = null;
    activeTypeButton = null;
    activeTypeFilter = null;

    // Réinitialisez visuellement les boutons de filtre
    letterButtons.forEach(letterButton => {
        letterButton.classList.remove("active");
    });
    categoryButtons.forEach(categoryButton => {
        categoryButton.classList.remove("active");
    });
    typeButtons.forEach(typeButton => {
        typeButton.classList.remove("active");
    });

    // Réappliquez les filtres
    applyActiveFilters(sortedData);
}

// Fonction de filtrage principale
function applyActiveFilters(data) {
    const filteredResults = data.filter(item => {
        const letterMatches = !activeLetterButton || item.abreviation.charAt(0).toLowerCase() === activeLetterButton.toLowerCase();
        const categoryMatches = !activeCategoryFilter || item.categorie === activeCategoryFilter;
        const typeMatches = !activeTypeFilter || item.type === activeTypeFilter;
        return letterMatches && categoryMatches && typeMatches;
    });

    if (activeLetterButton || activeCategoryFilter || activeTypeFilter) {
        displayResults(filteredResults);
    } else {
        // Aucun filtre actif, afficher tous les résultats
        displayResults(data);
    }
}

function sortDataAlphabetically(data) {
    return data.sort((a, b) => a.abreviation.localeCompare(b.abreviation));
}

function displaySearchResults(results) {
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

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth" // Cela permettra une animation de défilement en douceur
    });
}

function handleSearch(event, data) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredResults = data.filter(item =>
        item.abreviation.toLowerCase().includes(searchTerm) ||
        (item.signification && item.signification.toLowerCase().includes(searchTerm))
    );
    applyActiveFilters(filteredResults); // Appliquer les filtres actifs également lors de la recherche
}


function displayResults(results) {
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


// Charger les données et initialiser les événements après le chargement du document
document.addEventListener("DOMContentLoaded", () => {
    fetch("data.json")
        .then(response => response.json())
        .then(data => {
            const sortedData = sortDataAlphabetically(data);
            displaySearchResults(sortedData);
            searchInput.addEventListener("input", event => handleSearch(event, sortedData));

            const letterButtons = document.querySelectorAll(".letter-button");

            // Fonction pour gérer le clic sur une lettre
            function handleLetterButtonClick(button) {
                const selectedLetter = button.getAttribute("data-letter");
                const isFilterActive = button.classList.contains("active");

                if (!isFilterActive) {
                    // Désactivez toutes les autres lettres sélectionnées
                    letterButtons.forEach(letterButton => {
                        letterButton.classList.remove("active");
                    });
                    button.classList.add("active");
                    activeLetterButton = selectedLetter; // Mettez à jour la variable globale activeLetterButton
                } else {
                    button.classList.remove("active");
                    activeLetterButton = null; // Réinitialisez le filtre de lettre actif
                }

                applyActiveFilters(sortedData);
            }


            // Associez la fonction handleLetterButtonClick au clic sur chaque bouton de lettre
            letterButtons.forEach(button => {
                button.addEventListener("click", () => {
                    handleLetterButtonClick(button);
                });
            });

            const allCategories = ["Anesthésie", "Cardiologie", "CEGDC", "CCVT", "Dermatologie", "Endocrinologie", "Gastrologie", "Génétique", "Gériatrie", "Gynécologie", "Hémato-Onco", "Immuno-Allergie", "Med Interne", "Infectio", "Néphrologie", "Neurochirurgie", "Neurologie", "Ophtalmologie", "ORL", "Orthopédie", "Pédiatrie", "Physiatrie", "Plastie", "Pneumologie", "Psychiatrie", "Rhumatologie", "Urologie"];
            const allTypes = ["Anatomie", "Diagnostic", "Examen", "Médication", "Traitement"];

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

            const categoryButtons = document.querySelectorAll(".category-button");
            const typeButtons = document.querySelectorAll(".type-button");

            function createFilterButton(text, attribute, data, filterFunction) {
                const button = document.createElement("button");
                button.textContent = text;
                button.setAttribute(attribute, text);
                button.addEventListener("click", () => filterFunction(button, sortedData));

                // Ajoutez une classe CSS pour distinguer les boutons de catégories des boutons de types
                if (attribute === "data-category") {
                    button.classList.add("category-button");
                } else if (attribute === "data-type") {
                    button.classList.add("type-button");
                }

                return button;
            }

            function handleCategoryFilterButtonClick(button) {
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

                applyActiveFilters(sortedData);
                scrollToTop();
            }

            function handleTypeFilterButtonClick(button) {
                const selectedTypeFilter = button.getAttribute("data-type");
                const isTypeFilterActive = button.classList.contains("active");

                if (!isTypeFilterActive) {
                    // Désactivez le bouton de type actif s'il y en a un
                    if (activeTypeButton) {
                        activeTypeButton.classList.remove("active");
                    }
                    button.classList.add("active");
                    activeTypeButton = button;
                    activeTypeFilter = selectedTypeFilter;
                } else {
                    button.classList.remove("active");
                    activeTypeButton = null;
                    activeTypeFilter = null;
                }

                applyActiveFilters(sortedData);
                scrollToTop();
            }
          // Ajoutez un gestionnaire d'événements pour le bouton de réinitialisation des filtres
            const resetFiltersButton = document.getElementById("resetFiltersButton");
            resetFiltersButton.addEventListener("click", resetFilters);
        })
        .catch(error => {
            console.error("Une erreur s'est produite lors du chargement des données.", error);
        });
});
