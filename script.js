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

    // Create a set to track the abbreviations that have been added under the active type
    const addedAbbreviations = new Set();

    // Create a set to track the active types
    const activeTypes = new Set();

    // Check if the "Symbole" filter is active
    const isSymbolFilterActive = activeSymbolFilter === "SYMBOLE";

   // Filter the results based on the active filters
    const filteredResults = data.filter(item => {
        const letterMatches = !activeLetterButton || item.abreviation.charAt(0).toLowerCase() === activeLetterButton.toLowerCase();
        const categoryMatches = !activeCategoryFilter || (item.categorie && item.categorie.includes(activeCategoryFilter));

        // Check if "type" is directly present in the item
        const typeMatches = !activeTypeFilter || (item.type && item.type.includes(activeTypeFilter));

        // Check if "type" is nested within "significations"
        if (!typeMatches && item.significations) {
            typeMatches = item.significations.some(signification => signification.type === activeTypeFilter);
        }

        if (isSymbolFilterActive && item.type === "SYMBOLE") {
            activeTypes.add("SYMBOLE"); // Add "SYMBOLE" to the active types
            return true;
        }

        if (letterMatches && categoryMatches) {
            if (typeMatches) {
                activeTypes.add(item.type); // Add the item's type to the active types
                return true;
            } else if (item.significations) {
                const significationTypes = item.significations.map(signification => signification.type);
                if (significationTypes.includes(activeTypeFilter)) {
                    activeTypes.add(activeTypeFilter); // Add the active type to the active types
                    return true;
                }
            }
        }

        return false;
    });

    // If "SYMBOLE" is in activeTypes, clear other active types
    if (activeTypes.has("SYMBOLE")) {
        activeTypes.clear();
        activeTypes.add("SYMBOLE");
    }

    // Filter the results again to ensure only one type is active
    const finalFilteredResults = filteredResults.filter(item => {
        return activeTypes.has("SYMBOLE") || activeTypes.has(item.type);
    });

    displayResults(finalFilteredResults);
}

function sortDataAlphabeticallyWithFallback(data) {
    // Divisez les données en deux groupes : celles avec une catégorie "type" et celles sans
    const withTypeCategory = data.filter(item => item.type !== undefined && item.type !== null);
    const withoutTypeCategory = data.filter(item => item.type === undefined || item.type === null);

    // Triez d'abord les éléments avec une catégorie "type" par abréviation
    const sortedWithTypeCategory = withTypeCategory.sort((a, b) => a.abreviation.localeCompare(b.abreviation));

    // Ensuite, triez les éléments sans catégorie "type" comme s'ils avaient la catégorie "symbole"
    const sortedWithoutTypeCategory = withoutTypeCategory.sort((a, b) => {
        if (a.type === "SYMBOLE" && b.type !== "SYMBOLE") {
            return 1; // "a" (SYMBOLE) va à la fin
        } else if (a.type !== "SYMBOLE" && b.type === "SYMBOLE") {
            return -1; // "b" (SYMBOLE) va à la fin
        } else {
            // Si les deux ont la même catégorie ou aucune catégorie, triez par abréviation
            return a.abreviation.localeCompare(b.abreviation);
        }
    });

    // Fusionnez les deux groupes triés
    const sortedData = sortedWithTypeCategory.concat(sortedWithoutTypeCategory);

    return sortedData;
}

function displaySearchResults(results) {
    resultsList.innerHTML = '';
    if (results.length === 0) {
        resultsList.innerHTML = "<li>Aucun résultat trouvé</li>";
        return;
    }

    // Create an object to store the results grouped by type
    const groupedResults = {};

    results.forEach(result => {
        // Initialize types as an array
        let types = result.type || ["SYMBOLE"];

        // Ensure "types" is an array
        if (!Array.isArray(types)) {
            types = [types];
        }

        types = types.map(type => type.toUpperCase()); // Convert each type to uppercase

        // Create a group for each type
        types.forEach(type => {
            if (!groupedResults[type]) {
                groupedResults[type] = [];
            }

            groupedResults[type].push(result);
        });
    });

    // Get the active type filter
    const activeType = activeTypeFilter && activeTypeFilter.toUpperCase();

    for (const group in groupedResults) {
        if (groupedResults.hasOwnProperty(group)) {
            if (activeType && group !== activeType) {
                continue; // Skip this type if the activeType is set and doesn't match
            }

            const groupResults = groupedResults[group];

            // Create a section for the group (type or "SYMBOLE")
            const groupSection = document.createElement("div");
            groupSection.classList.add("type-section");

            groupSection.innerHTML = `<h2>${group}</h2>`;

            groupResults.forEach(result => {
                const row = document.createElement("li");
                const abbrCell = document.createElement("abbr");
                abbrCell.textContent = result.abreviation;
                row.appendChild(abbrCell);

                const descriptionContainer = document.createElement("div");
                descriptionContainer.classList.add("description-container");

            if (result.significations) {
    result.significations.forEach(signification => {
        const significationContainer = document.createElement("div");
        significationContainer.classList.add("signification-container");

        const descriptionText = document.createElement("p");
        descriptionText.innerHTML = `➤ ${signification.signification}`;
        significationContainer.appendChild(descriptionText);

        if (signification.url) {
            const iconLinkContainer = document.createElement("div");
            iconLinkContainer.classList.add("icon-link-container");

            const icon = document.createElement("img");
            icon.src = "monicone.svg";
            icon.alt = "Lien externe";
            icon.style.cursor = "pointer";
            icon.classList.add("icon-class");

            icon.addEventListener("click", () => {
                window.open(signification.url, "_blank");
            });

            iconLinkContainer.appendChild(icon);
            significationContainer.appendChild(iconLinkContainer);
        }

        descriptionContainer.appendChild(significationContainer);
    });
} else {
                    // Handle the case where there's only one signification
                    const significationContainer = document.createElement("div");
                    significationContainer.classList.add("signification-container");

                    const descriptionText = document.createElement("p");
                    descriptionText.innerHTML = `➤ ${result.signification}`;
                    significationContainer.appendChild(descriptionText);

                    if (result.url) {
                        const icon = document.createElement("img");
                        icon.src = "monicone.svg";
                        icon.alt = "Lien externe";
                        icon.style.cursor = "pointer";
                        icon.classList.add("icon-class");

                        icon.addEventListener("click", () => {
                            window.open(result.url, "_blank");
                        });

                        significationContainer.appendChild(icon);
                    }

                    descriptionContainer.appendChild(significationContainer);
                }

                row.appendChild(descriptionContainer);

                const languePopover = document.createElement("div");
                languePopover.classList.add("langue-popover");
                languePopover.textContent = result.langue;

                row.appendChild(languePopover);

                groupSection.appendChild(row);

                row.addEventListener('mouseenter', handleMouseEnter);
                row.addEventListener('mouseleave', handleMouseLeave);
            });

            resultsList.appendChild(groupSection);
        }
    }
}


function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth" // Cela permettra une animation de défilement en douceur
    });
}

function handleSearch(event, data) {
    const searchTerm = event.target.value.toLowerCase();
    const normalizedSearchTerm = normalizeString(searchTerm);
    const filteredResults = data.filter(item => {
        const matchesSearch = searchMatches(item, normalizedSearchTerm);
        const categoryMatches = !activeCategoryFilter || item.categorie === activeCategoryFilter;
        // Check if "type" is directly present in the item
        const typeMatches = !activeTypeFilter || item.type === activeTypeFilter;
         // Check if "type" is nested within "significations"
        if (!typeMatches && item.significations) {
            typeMatches = item.significations.some(signification => signification.type === activeTypeFilter);
        }
        
        return matchesSearch && categoryMatches && typeMatches;
    });
    applyActiveFilters(filteredResults);
}

function searchMatches(item, searchTerm) {
    const abbreviationMatch = matchesString(item.abreviation, searchTerm);
    const significationMatch = matchesString(item.signification, searchTerm);
    const significationsMatch = matchesSignifications(item.significations, searchTerm);
    return abbreviationMatch || significationMatch || significationsMatch;
}

function matchesString(text, searchTerm) {
    if (!text) return false;
    const normalizedText = normalizeString(text);
    return normalizedText.includes(searchTerm);
}

function matchesSignifications(significations, searchTerm) {
    if (!significations || !Array.isArray(significations)) return false;
    
    // Check if "type" is directly present in the signification object
    const typeMatches = significations.some(significationObj => normalizeString(significationObj.type).includes(searchTerm));
    
    // Check if "type" is nested within "significations"
    const nestedTypeMatches = significations.some(significationObj => normalizeString(significationObj.signification).includes(searchTerm));
    
    return typeMatches || nestedTypeMatches;
}

function normalizeString(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // Supprime la ponctuation
        .replace(/\s/g, ""); // Supprime les espaces
}

function displayResults(results) {
  resultsList.innerHTML = '';
  if (results.length === 0) {
    resultsList.innerHTML = "<li>Aucun résultat trouvé</li>";
    return;
  }

 // Create an object to store the results grouped by type
    const groupedResults = {};

    results.forEach(result => {
        // Initialize types as an array
        let types = result.type || ["SYMBOLE"];

        // Ensure "types" is an array
        if (!Array.isArray(types)) {
            types = [types];
        }

        types = types.map(type => type.toUpperCase()); // Convert each type to uppercase

        // Create a group for each type
        types.forEach(type => {
            if (!groupedResults[type]) {
                groupedResults[type] = [];
            }

            groupedResults[type].push(result);
        });
    });

    // Initialize a flag to track the first type
    let isFirstType = true;

    // Get the active type filter
    const activeType = activeTypeFilter && activeTypeFilter.toUpperCase();

    for (const group in groupedResults) {
        if (groupedResults.hasOwnProperty(group)) {
            if (activeType && group !== activeType) {
                continue; // Skip this type if the activeType is set and doesn't match
            }

            const groupResults = groupedResults[group];

            // Create a section for the group (type or "SYMBOLE")
            const groupSection = document.createElement("div");
            groupSection.classList.add("type-section");

            // Add a separator line before the type name if it's not the first type
            if (!isFirstType) {
                const separator = document.createElement("hr");
                groupSection.appendChild(separator);
            } else {
                isFirstType = false; // Set the flag to false for subsequent types
            }

            groupSection.innerHTML = `<h2>${group}</h2>`;

            groupResults.forEach(result => {
                const row = document.createElement("li");
                const abbrCell = document.createElement("abbr");
                abbrCell.textContent = result.abreviation;
                row.appendChild(abbrCell);

                const descriptionContainer = document.createElement("div");
                descriptionContainer.classList.add("description-container");

                if (result.significations) {
                    result.significations.forEach(signification => {
                        const significationContainer = document.createElement("div");
                        significationContainer.classList.add("signification-container");

                        const descriptionText = document.createElement("p");
                        descriptionText.innerHTML = `➤ ${signification.signification}`;
                        significationContainer.appendChild(descriptionText);

                        if (signification.url) {
                            const icon = document.createElement("img");
                            icon.src = "monicone.svg";
                            icon.alt = "Lien externe";
                            icon.style.cursor = "pointer";
                            icon.classList.add("icon-class");

                            icon.addEventListener("click", () => {
                                window.open(signification.url, "_blank");
                            });

                            significationContainer.appendChild(icon);
                        }

                        descriptionContainer.appendChild(significationContainer);
                    });
                } else {
                    // Handle the case where there's only one signification
                    const significationContainer = document.createElement("div");
                    significationContainer.classList.add("signification-container");

                    const descriptionText = document.createElement("p");
                    descriptionText.innerHTML = `➤ ${result.signification}`;
                    significationContainer.appendChild(descriptionText);

                    if (result.url) {
                        const icon = document.createElement("img");
                        icon.src = "monicone.svg";
                        icon.alt = "Lien externe";
                        icon.style.cursor = "pointer";
                        icon.classList.add("icon-class");

                        icon.addEventListener("click", () => {
                            window.open(result.url, "_blank");
                        });

                        significationContainer.appendChild(icon);
                    }

                    descriptionContainer.appendChild(significationContainer);
                }

                row.appendChild(descriptionContainer);

                const languePopover = document.createElement("div");
                languePopover.classList.add("langue-popover");
                languePopover.textContent = result.langue;

                row.appendChild(languePopover);

                groupSection.appendChild(row);

                row.addEventListener('mouseenter', handleMouseEnter);
                row.addEventListener('mouseleave', handleMouseLeave);
            });

            resultsList.appendChild(groupSection);
        }
    }
}

function handleMouseEnter(event) {
  const row = event.currentTarget;
  const popover = row.querySelector('.langue-popover');

  if (popover) {
    const langueContent = popover.textContent.trim();

    if (langueContent) {
      const rowRect = row.getBoundingClientRect();
      const top = rowRect.bottom + window.scrollY - 12;
      const left = rowRect.right + window.scrollX - 18;

      popover.style.top = `${top}px`;
      popover.style.left = `${left}px`;
      popover.style.display = 'block';
    }
  }
}

function handleMouseLeave(event) {
  const popover = event.currentTarget.querySelector(".langue-popover");
  if (popover) {
    popover.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
    fetch("data.json")
        .then(response => response.json())
        .then(data => {
            const sortedData = sortDataAlphabeticallyWithFallback(data);
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
                     // Désactivez le bouton "Symbole" s'il est actif
                if (activeSymbolButton) {
                activeSymbolButton.classList.remove("active");
                activeSymbolButton = null;
                activeSymbolFilter = null;
                    }
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

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.value = "";
    }

    // Appliquez les filtres réinitialisés aux données
    applyActiveFilters(sortedData);
    scrollToTop();
}

const resetFiltersButton = document.getElementById("resetFiltersButton");

resetFiltersButton.addEventListener("click", () => {
    resetFilters();
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
            const allTypes = ["Anatomie", "Diagnostic", "Examen", "Médication", "Traitement", "+ Général"];

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

             // Apply filters based on the updated category filter
  const filteredResults = sortedData.filter(item => {
    return (
      activeCategoryFilter === null ||
      (Array.isArray(item.categorie) && item.categorie.includes(activeCategoryFilter))
    );
  });

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

             // Apply filters based on the updated type filter
  const filteredResults = sortedData.filter(item => {
    return (
      activeTypeFilter === null ||
      (Array.isArray(item.type) && item.type.includes(activeTypeFilter))
    );
  });

                applyActiveFilters(sortedData);
                scrollToTop();
            }
        })
        .catch(error => {
            console.error("Une erreur s'est produite lors du chargement des données.", error);
        });
});
