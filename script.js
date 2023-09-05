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
let activeSymbolButton = null;
let activeSymbolFilter = null;

function applyActiveFilters(data) {
    console.log("Applying active filters...");
    console.log("Active Symbol Filter:", activeSymbolFilter);

    if (activeSymbolFilter) {
        // Si le filtre "Symbole" est actif, ignorer les autres filtres
        const filteredResults = data.filter(item => item.symbole === "SYMBOLE");
        displayResults(filteredResults);
    } else {
        // Si le filtre "Symbole" n'est pas actif, appliquer les autres filtres
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
}

function resetFilters() {
    // Réinitialisez les filtres de lettre
    letterButtons.forEach(letterButton => {
        letterButton.classList.remove("active");
    });
    activeLetterButton = null;

    // Réinitialisez le filtre "Symbole"
    if (activeSymbolButton) {
        activeSymbolButton.classList.remove("active");
        activeSymbolButton = null;
        activeSymbolFilter = null;
    }

    // Réinitialisez les filtres de catégorie
    categoryButtons.forEach(categoryButton => {
        categoryButton.classList.remove("active");
    });
    activeCategoryButton = null;
    activeCategoryFilter = null;

    // Réinitialisez les filtres de type
    typeButtons.forEach(typeButton => {
        typeButton.classList.remove("active");
    });
    activeTypeButton = null;
    activeTypeFilter = null;

    // Appliquez les filtres réinitialisés aux données
    applyActiveFilters(sortedData);
    scrollToTop();
}

const resetFiltersButton = document.getElementById("resetFiltersButton"); // Remplacez "resetFiltersButton" par l'ID de votre bouton de réinitialisation

resetFiltersButton.addEventListener("click", () => {
    resetFilters();
});


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
        
        const descriptionCell = document.createElement("div"); // Create a container for description
        descriptionCell.classList.add("description-container");
        
        const descriptionText = document.createElement("p"); // Create a cell for description
        descriptionText.textContent = result.signification;
        descriptionCell.appendChild(descriptionText); // Add the description cell to the container
        
        row.appendChild(descriptionCell); // Add the description container to the row
        
        resultsList.appendChild(row); // Add the row to the results list
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
        item.abreviation.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, "")) ||
        item.signification.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
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
        
        const descriptionCell = document.createElement("div"); // Create a container for description
        descriptionCell.classList.add("description-container");
        
        const descriptionText = document.createElement("p"); // Create a cell for description
        descriptionText.textContent = result.signification;
        descriptionCell.appendChild(descriptionText); // Add the description cell to the container
        
        row.appendChild(descriptionCell); // Add the description container to the row
        
        resultsList.appendChild(row); // Add the row to the results list
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
            const symbolFilterButton = document.getElementById("symbolFilterButton");
            
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

          
function handleSymbolFilterButtonClick() {
    const isFilterActive = symbolFilterButton.classList.contains("active");

    // Désactivez tous les autres filtres actifs
    letterButtons.forEach(letterButton => {
        letterButton.classList.remove("active");
    });
    activeLetterButton = null;

    categoryButtons.forEach(categoryButton => {
        categoryButton.classList.remove("active");
    });
    activeCategoryButton = null;
    activeCategoryFilter = null;

    typeButtons.forEach(typeButton => {
        typeButton.classList.remove("active");
    });
    activeTypeButton = null;
    activeTypeFilter = null;

    // Si le filtre "Symbole" n'est pas actif, activez-le
    if (!isFilterActive) {
        symbolFilterButton.classList.add("active");
        activeSymbolButton = symbolFilterButton;
        activeSymbolFilter = "SYMBOLE";

        const filteredResults = sortedData.filter(item => {
            return activeSymbolFilter === null || (item.symbole === "SYMBOLE");
        });

        displayResults(filteredResults);
    } else {
        // Si le filtre "Symbole" est désactivé, réinitialisez les filtres
        symbolFilterButton.classList.remove("active");
        activeSymbolButton = null;
        activeSymbolFilter = null;
        applyActiveFilters(sortedData);
    }
}


// Associez la fonction handleSymbolFilterButtonClick au clic sur le bouton de filtre "Symbole"
symbolFilterButton.addEventListener("click", handleSymbolFilterButtonClick);
                    
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

                 // Désactivez le filtre "Symbole" si actif
                if (activeSymbolButton) {
                activeSymbolButton.classList.remove("active");
                activeSymbolButton = null;
                activeSymbolFilter = null;
                }
                
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

                 // Désactivez le filtre "Symbole" si actif
                if (activeSymbolButton) {
                activeSymbolButton.classList.remove("active");
                activeSymbolButton = null;
                activeSymbolFilter = null;
                }
                
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
        })
        .catch(error => {
            console.error("Une erreur s'est produite lors du chargement des données.", error);
        });
});
