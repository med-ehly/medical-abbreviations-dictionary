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

    // Créez un groupe pour les résultats avec le type "SYMBOLE"
    const symboleResults = data.filter(item => item.type === "SYMBOLE");

    // Vérifiez si le filtre "Symbole" est actif
    const isSymbolFilterActive = activeSymbolFilter === "SYMBOLE";

    // Appliquez les filtres en fonction de l'état des filtres
    const filteredResults = data.filter(item => {
        const letterMatches = !activeLetterButton || item.abreviation.charAt(0).toLowerCase() === activeLetterButton.toLowerCase();
        const categoryMatches = !activeCategoryFilter || item.categorie === activeCategoryFilter;
        const typeMatches = !activeTypeFilter || item.type === activeTypeFilter;

        // Vérifiez si le filtre "Symbole" est actif et que l'élément est de type "SYMBOLE"
        if (isSymbolFilterActive && item.type === "SYMBOLE") {
            return true;
        }

        // Vérifiez si d'autres filtres correspondent également
        return letterMatches && categoryMatches && typeMatches;
    });

    displayResults(filteredResults);
}

 function handleMouseEnter(event) {
  const popover = event.currentTarget.querySelector(".langue-popover");
  if (popover) {
    popover.style.display = "block";
  }
}

function handleMouseLeave(event) {
  const popover = event.currentTarget.querySelector(".langue-popover");
  if (popover) {
    popover.style.display = "none";
  }
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
    
// Créez un objet pour stocker les résultats groupés par type
  const groupedResults = {};

  results.forEach(result => {
    const type = (result.type || "SYMBOLE").toUpperCase();

    // Créez un groupe s'il n'existe pas encore
    if (!groupedResults[type]) {
      groupedResults[type] = [];
    }

    // Ajoutez le résultat au groupe correspondant
    groupedResults[type].push(result);
  });

 // Parcourez les groupes et ajoutez les résultats à la liste
let isFirstType = true; // Initialize a flag to track the first type

for (const group in groupedResults) {
  if (groupedResults.hasOwnProperty(group)) {
    const groupResults = groupedResults[group];

    // Créez une section pour le groupe (type ou "SYMBOLE")
    const groupSection = document.createElement("div");
    groupSection.classList.add("type-section");

    // Add a separator line before the type name if it's not the first type
    if (!isFirstType) {
      const separator = document.createElement("hr");
      groupSection.appendChild(separator);
    } else {
      // If it's the first type, set the flag to false
      isFirstType = false;
    }

    groupSection.innerHTML = `<h2>${group}</h2>`;

      // Ajoutez chaque résultat à la section
      groupResults.forEach(result => {
        const row = document.createElement("li");
        const abbrCell = document.createElement("abbr");
        abbrCell.textContent = result.abreviation;
        row.appendChild(abbrCell);

        // Create a container for the significations
        const descriptionContainer = document.createElement("div");
        descriptionContainer.classList.add("description-container");

       // Check if there are multiple significations
        if (result.significations && Array.isArray(result.significations)) {
           
          // Add each signification to the container
          result.significations.forEach((signification, index) => {
            const descriptionText = document.createElement("p");
            descriptionText.innerHTML = `" ${signification} "`;
            descriptionContainer.appendChild(descriptionText);
          });
        } else {
          // If there's only one signification, display it
          const descriptionText = document.createElement("p");
          descriptionText.innerHTML = `" ${result.signification}"`;
          descriptionContainer.appendChild(descriptionText);
        }

        // Add the descriptionContainer to the row
        row.appendChild(descriptionContainer);

        // Créez un conteneur pour l'icône et le lien
        const iconAndLinkContainer = document.createElement("div");
        iconAndLinkContainer.classList.add("icon-link-container");

        if (result.url) {
          const icon = document.createElement("img");
          icon.src = "monicone.svg";
          icon.alt = "Lien externe";
          icon.style.cursor = "pointer";
          icon.classList.add("icon-class");

          icon.addEventListener("click", () => {
            window.open(result.url, "_blank");
          });

          iconAndLinkContainer.appendChild(icon);
        }

        // Create a "langue popover" element for both single and multiple significations
        const languePopover = document.createElement("div");
        languePopover.classList.add("langue-popover");
        languePopover.textContent = result.langue; // Récupérez la langue à partir des données JSON

        iconAndLinkContainer.appendChild(languePopover);

        // Add the iconAndLinkContainer to the row
        row.appendChild(iconAndLinkContainer);

        groupSection.appendChild(row);

        // Ajoutez les gestionnaires d'événements au survol (mouseenter et mouseleave) pour chaque élément <li>
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
    const filteredResults = data.filter(item =>
        (item.abreviation.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").startsWith(searchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))) ||
        (item.signification.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").startsWith(searchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, "")))
    );
    applyActiveFilters(filteredResults);
}

function displayResults(results){
   resultsList.innerHTML = '';
  if (results.length === 0) {
    resultsList.innerHTML = "<li>Aucun résultat trouvé</li>";
    return;
  }
    
// Créez un objet pour stocker les résultats groupés par type
  const groupedResults = {};

  results.forEach(result => {
    const type = (result.type || "SYMBOLE").toUpperCase();

    // Créez un groupe s'il n'existe pas encore
    if (!groupedResults[type]) {
      groupedResults[type] = [];
    }

    // Ajoutez le résultat au groupe correspondant
    groupedResults[type].push(result);
  });

 // Parcourez les groupes et ajoutez les résultats à la liste
let isFirstType = true; // Initialize a flag to track the first type

for (const group in groupedResults) {
  if (groupedResults.hasOwnProperty(group)) {
    const groupResults = groupedResults[group];

    // Créez une section pour le groupe (type ou "SYMBOLE")
    const groupSection = document.createElement("div");
    groupSection.classList.add("type-section");

    // Add a separator line before the type name if it's not the first type
    if (!isFirstType) {
      const separator = document.createElement("hr");
      groupSection.appendChild(separator);
    } else {
      // If it's the first type, set the flag to false
      isFirstType = false;
    }

    groupSection.innerHTML = `<h2>${group}</h2>`;

      // Ajoutez chaque résultat à la section
      groupResults.forEach(result => {
        const row = document.createElement("li");
        const abbrCell = document.createElement("abbr");
        abbrCell.textContent = result.abreviation;
        row.appendChild(abbrCell);

        // Create a container for the significations
        const descriptionContainer = document.createElement("div");
        descriptionContainer.classList.add("description-container");

       // Check if there are multiple significations
        if (result.significations && Array.isArray(result.significations)) {
                      
          // Add each signification to the container
          result.significations.forEach((signification, index) => {
            const descriptionText = document.createElement("p");
            descriptionText.innerHTML = `" ${signification} "`;
            descriptionContainer.appendChild(descriptionText);
          });
        } else {
          // If there's only one signification, display it
          const descriptionText = document.createElement("p");
          descriptionText.innerHTML = `" ${result.signification}"`;
          descriptionContainer.appendChild(descriptionText);
        }

        // Add the descriptionContainer to the row
        row.appendChild(descriptionContainer);

        // Créez un conteneur pour l'icône et le lien
        const iconAndLinkContainer = document.createElement("div");
        iconAndLinkContainer.classList.add("icon-link-container");

        if (result.url) {
          const icon = document.createElement("img");
          icon.src = "monicone.svg";
          icon.alt = "Lien externe";
          icon.style.cursor = "pointer";
          icon.classList.add("icon-class");

          icon.addEventListener("click", () => {
            window.open(result.url, "_blank");
          });

          iconAndLinkContainer.appendChild(icon);
        }

        // Create a "langue popover" element for both single and multiple significations
        const languePopover = document.createElement("div");
        languePopover.classList.add("langue-popover");
        languePopover.textContent = result.langue; // Récupérez la langue à partir des données JSON

        iconAndLinkContainer.appendChild(languePopover);

        // Add the iconAndLinkContainer to the row
        row.appendChild(iconAndLinkContainer);

        groupSection.appendChild(row);

        // Ajoutez les gestionnaires d'événements au survol (mouseenter et mouseleave) pour chaque élément <li>
        row.addEventListener('mouseenter', handleMouseEnter);
        row.addEventListener('mouseleave', handleMouseLeave);
      });

      resultsList.appendChild(groupSection);
    }
  }
}

// Ajoutez une fonction pour gérer l'affichage du popover lors du hover
function handleMouseEnter(event) {
  const row = event.currentTarget;
  const popover = row.querySelector('.langue-popover');

  // Vérifier si le contenu de la popover n'est pas vide
  const langueContent = popover.textContent.trim(); // Récupérez le contenu de la popover en supprimant les espaces inutiles

  if (langueContent) {
    // Calculer la position en fonction de l'élément cible
    const rowRect = row.getBoundingClientRect();
    const top = rowRect.bottom + window.scrollY - 26;
    const left = rowRect.right + window.scrollX - 32; 

    // Appliquer la position calculée au popover
    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;

    // Afficher le popover
    popover.style.display = 'block';
  }
}


// Ajoutez un gestionnaire d'événements pour le survol (mouseenter) de chaque élément <li>
document.querySelectorAll('.type-section li').forEach(row => {
  row.addEventListener('mouseenter', handleMouseEnter);
});

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

// Attachez les gestionnaires d'événements aux éléments qui nécessitent des popovers de langue
const elementsWithPopover = document.querySelectorAll('.element-with-popover');

elementsWithPopover.forEach(element => {
  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);
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

              // Effacez le contenu de la barre de recherche
    const searchInput = document.getElementById("searchInput"); // Remplacez "searchInput" par l'ID de votre champ de recherche
    if (searchInput) {
        searchInput.value = "";
    }


    // Appliquez les filtres réinitialisés aux données
    applyActiveFilters(sortedData);
    scrollToTop();
}

const resetFiltersButton = document.getElementById("resetFiltersButton"); // Remplacez "resetFiltersButton" par l'ID de votre bouton de réinitialisation

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
