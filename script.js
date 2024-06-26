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
    const typeMatches = !activeTypeFilter || (item.type && item.type.includes(activeTypeFilter));

    if (isSymbolFilterActive && item.type === "SYMBOLE") {
      activeTypes.add("SYMBOLE"); // Add "SYMBOLE" to the active types
      return true;
    }

    if (letterMatches && categoryMatches && typeMatches) {
      activeTypes.add(item.type); // Add the item's type to the active types

      // Check if the abbreviation has already been added under the active type
      if (typeMatches) {
        if (!addedAbbreviations.has(item.abreviation)) {
          addedAbbreviations.add(item.abreviation);
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

  results.forEach(result => {
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
        // Check if the signification should be highlighted
        if (signification.highlight) {
          // Create a <span> element for the highlighted text
          const highlightedSpan = document.createElement("span");
          highlightedSpan.classList.add("highlighted");
          highlightedSpan.textContent = `➤ ${signification.signification}`;
          // Append the <span> to the <p> element
          descriptionText.appendChild(highlightedSpan);
        } else {
          // If not highlighted, just set the text content directly
          descriptionText.textContent = `➤ ${signification.signification}`;
        }
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
    resultsList.appendChild(row);
    row.addEventListener('mouseenter', handleMouseEnter);
    row.addEventListener('mouseleave', handleMouseLeave);
  });
}


function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth" // Cela permettra une animation de défilement en douceur
  });
}

function handleSearch(event, data) {
  const searchTerm = (event.target.value || '').toLowerCase();
  const normalizedSearchTerm = normalizeString(searchTerm);
  const filteredResults = data.filter(item => {
    // Ensure "item" is defined and has the expected structure
    if (!item || !item.abreviation) {
      return false;
    }

    const matchesSearch = searchMatches(item, normalizedSearchTerm);

    // Check if "item.categorie" is an array (if it's defined)
    const categoryMatches = !activeCategoryFilter || (
      Array.isArray(item.categorie) && item.categorie.includes(activeCategoryFilter)
    );

    // Check if "item.type" is an array (if it's defined)
    const typeMatches = !activeTypeFilter || (
      Array.isArray(item.type) && item.type.includes(activeTypeFilter)
    );

    // Check if "item.significations" is an array (if it's defined)
    const significationMatches = !activeTypeFilter || (
      Array.isArray(item.significations) &&
      item.significations.some(signification => signification.type === activeTypeFilter)
    );
    // Exclude "symbole" from the search results only when there is a search term
    const isSymbole = item.symbole === "SYMBOLE" && searchTerm.trim() !== "";
    return matchesSearch && categoryMatches && typeMatches && !isSymbole;

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
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") // Remove punctuation
    .replace(/\s/g, ""); // Remove spaces
}

// Add an event listener for the keyup event on the search input
searchInput.addEventListener("keyup", function () {
  var search_term = searchInput.value.toLowerCase();
  removeHighlight(); // Assuming you have a function to remove highlighting
  highlight(search_term);
});

// Function to highlight matching results
function highlight(searchTerm) {
  // Define a character mapping for specific equivalences
  const characterMapping = {
    'e': '[eéè]',
    'i': '[iï]',
  };

  // Get all elements containing descriptions, for example, elements with class "description-container"
  const elementsToSearch = document.querySelectorAll('.description-container p');

  elementsToSearch.forEach(element => {
    // Get the text content of the element
    const elementText = element.textContent;

    // Check if the search term is not empty
    if (searchTerm.trim() !== '') {
      // Create a regular expression using the current search term (case-insensitive and accent-insensitive)
      const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
      const regexPattern = escapedSearchTerm
        .split('')
        .map(char => characterMapping[char] || char) // Use mapping or original character
        .join('');
      const regex = new RegExp(`(${regexPattern.replace(/\s/g, '.*')})`, 'gi');

      // Replace matching substrings with highlighted versions
      const highlightedText = elementText.replace(regex, match => `<span class="highlighted">${match}</span>`);

      // Set the modified HTML back into the element
      element.innerHTML = highlightedText;
    } else {
      // If the search term is empty, remove any existing highlighting
      element.innerHTML = elementText;
    }
  });
}





// Function to remove highlighting from all elements
function removeHighlight() {
  const highlightedElements = document.querySelectorAll('p, abbr');

  highlightedElements.forEach(element => {
    // Remove the class or styling applied for highlighting
    element.innerHTML = element.textContent; // Reset to original content
  });
}


function displayResults(results) {
  resultsList.innerHTML = '';
  if (results.length === 0) {
    resultsList.innerHTML = "<li>Aucun résultat trouvé</li>";
    return;
  }

  results.forEach(result => {
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
        if (signification.highlight) {
          // Create a <span> element for the highlighted text
          const highlightedSpan = document.createElement("span");
          highlightedSpan.classList.add("highlighted");
          highlightedSpan.textContent = `➤ ${signification.signification}`;
          // Append the <span> to the <p> element
          descriptionText.appendChild(highlightedSpan);
        } else {
          // If not highlighted, just set the text content directly
          descriptionText.textContent = `➤ ${signification.signification}`;
        }
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
    resultsList.appendChild(row);
    row.addEventListener('mouseenter', handleMouseEnter);
    row.addEventListener('mouseleave', handleMouseLeave);
  });
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

          // Filter out items with "symbole" set to "SYMBOLE"
          const filteredData = sortedData.filter(item => item.symbole !== "SYMBOLE");

          button.classList.add("active");
          activeLetterButton = selectedLetter; // Mettez à jour la variable globale activeLetterButton

          // Désactivez le bouton "Symbole" s'il est actif
          if (activeSymbolButton) {
            activeSymbolButton.classList.remove("active");
            activeSymbolButton = null;
            activeSymbolFilter = null;
          }

          applyActiveFilters(filteredData); // Apply filters to the filtered data
        } else {
          button.classList.remove("active");
          activeLetterButton = null; // Réinitialisez le filtre de lettre actif
          applyActiveFilters(sortedData); // Apply filters to the original data
        }
      }


      // Associez la fonction handleLetterButtonClick au clic sur chaque bouton de lettre
      letterButtons.forEach(button => {
        button.addEventListener("click", () => {
          handleLetterButtonClick(button);
        });
      });

      function resetFilters() {
        // Réinitialisez les filtres de lettre
        letterButtons.forEach((letterButton) => {
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
        categoryButtons.forEach((categoryButton) => {
          categoryButton.classList.remove("active");
        });
        activeCategoryButton = null;
        activeCategoryFilter = null;

        // Réinitialisez les filtres de type
        typeButtons.forEach((typeButton) => {
          typeButton.classList.remove("active");
        });
        activeTypeButton = null;
        activeTypeFilter = null;

        // Reset the "highlight" property to false for each signification in your data if there are no active type filters
        if (!activeTypeFilter) {
          data.forEach(item => {
            if (item.significations) {
              item.significations.forEach(signification => {
                signification.highlight = false;
              });
            }
          });

          // Remove the "highlighted" class from DOM elements
          const highlightedSignifications = document.querySelectorAll(".signification-container .highlighted");
          highlightedSignifications.forEach(significationElement => {
            significationElement.classList.remove("highlighted");
          });
        }
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
          searchInput.value = "";
        }

        // Remove highlighting from the elements
        const highlightedElements = document.querySelectorAll(".highlighted");
        highlightedElements.forEach((element) => {
          element.classList.remove("highlighted");
        });

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
      const allTypes = ["Anatomie", "Diagnostic", "Examen", "Médication", "Interventions", "Labos", "+ Général"];

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

        // Désactivez le bouton "Symbole" s'il est actif
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

          // Remove the "highlighted" class from matching elements
          const highlightedElements = document.querySelectorAll(".signification-container .highlighted");
          highlightedElements.forEach((element) => {
            element.classList.remove("highlighted");
          });
        }

        // Apply filters based on the updated type filter
        const filteredResults = sortedData.filter(item => {
          return (
            activeTypeFilter === null ||
            (Array.isArray(item.type) && item.type.includes(activeTypeFilter)) ||
            (Array.isArray(item.significations) &&
              item.significations.some(signification => signification.type === activeTypeFilter))
          );
        });

        // Highlight the matching significations
        filteredResults.forEach(item => {
          if (item.significations) {
            item.significations.forEach(signification => {
              signification.highlight = signification.type === activeTypeFilter;
            });
          }
        });

        applyActiveFilters(sortedData);
        scrollToTop();
      }
    })
    .catch(error => {
      console.error("Une erreur s'est produite lors du chargement des données.", error);
    });
});
