// Constantes pour les sélecteurs DOM
const searchInput = document.getElementById("searchInput");
const resultsList = document.getElementById("resultsList");

// Variables for active filters
let activeFilters = {
  letter: null,
  category: null,
  type: null,
  symbol: false,
};

function applyActiveFilters(data) {
  console.log("Applying active filters...");

  const filteredResults = data.filter(item => {
    const letterMatches =
      !activeFilters.letter ||
      item.abreviation.charAt(0).toLowerCase() === activeFilters.letter.toLowerCase();
    const categoryMatches =
      !activeFilters.category ||
      (item.categorie && item.categorie.includes(activeFilters.category));
    const typeMatches = !activeFilters.type || item.type === activeFilters.type;

    if (activeFilters.symbol && item.type === "SYMBOLE") {
      return true;
    }

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
    if (result.significations && Array.isArray(result.significations)) {
      result.significations.forEach(signification => {
        const type = signification.type || "SYMBOLE";
        const typeKey = type.toUpperCase();

        // Créez un groupe s'il n'existe pas encore
        if (!groupedResults[typeKey]) {
          groupedResults[typeKey] = [];
        }

        // Push the result along with its type
        groupedResults[typeKey].push({
          abreviation: result.abreviation,
          signification: signification.signification,
          url: signification.url,
          langue: result.langue,
        });
      });
    }
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
          // Add each signification and its icon to the container
          result.significations.forEach(signification => {
            const significationContainer = document.createElement("div");
            significationContainer.classList.add("signification-container");

            // Check if the signification matches the active category filter
            const matchesCategory = signification.type === activeCategoryFilter;

            // Add a CSS class to highlight the matching signification
            if (matchesCategory) {
              significationContainer.classList.add("highlighted-signification");
            }

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
          // If there's only one signification, display it along with its icon
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

        // Add the descriptionContainer to the row
        row.appendChild(descriptionContainer);

        // Create a "langue popover" element for both single and multiple significations
        const languePopover = document.createElement("div");
        languePopover.classList.add("langue-popover");
        languePopover.textContent = result.langue; // Récupérez la langue à partir des données JSON

        // Add the languePopover to the row
        row.appendChild(languePopover);

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
    behavior: "smooth", // Cela permettra une animation de défilement en douceur
  });
}

function handleSearch(event, data) {
  const searchTerm = event.target.value.toLowerCase();
  const filteredResults = data.filter(item => {
    // Vérifiez si le terme de recherche est contenu dans l'abréviation ou la signification
    const abbreviationMatch = abbreviationMatches(item.abreviation, searchTerm);
    const significationMatch = significationMatches(item.signification, searchTerm);
    const significationsMatch = significationsMatches(item.significations, searchTerm);

    // Vérifiez si les filtres sont actifs et si l'élément correspond aux filtres
    const categoryMatches = !activeCategoryFilter || item.categorie === activeCategoryFilter;
    const typeMatches = !activeTypeFilter || item.type === activeTypeFilter;

    // Retournez le résultat uniquement si la recherche et les filtres correspondent
    return (abbreviationMatch || significationMatch || significationsMatch) && categoryMatches && typeMatches;
  });
  applyActiveFilters(filteredResults);
}

function significationsMatches(significations, searchTerm) {
  if (!significations || !Array.isArray(significations)) return false;
  return significations.some(significationObj =>
    significationObj.signification
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .includes(searchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  );
}

function abbreviationMatches(abbreviation, searchTerm) {
  if (!abbreviation) return false;
  return abbreviation
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .includes(searchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
}

function significationMatches(signification, searchTerm) {
  if (!signification) return false;
  return signification
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .includes(searchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
}

function displayResults(results) {
  resultsList.innerHTML = '';
  if (results.length === 0) {
    resultsList.innerHTML = "<li>Aucun résultat trouvé</li>";
    return;
  }

  // Créez un objet pour stocker les résultats groupés par type
  const groupedResults = {};

  results.forEach(result => {
    if (result.significations && Array.isArray(result.significations)) {
      result.significations.forEach(signification => {
        const type = signification.type || "SYMBOLE";
        const typeKey = type.toUpperCase();

        // Créez un groupe s'il n'existe pas encore
        if (!groupedResults[typeKey]) {
          groupedResults[typeKey] = [];
        }

        // Push the result along with its type
        groupedResults[typeKey].push({
          abreviation: result.abreviation,
          signification: signification.signification,
          url: signification.url,
          langue: result.langue,
        });
      });
    }
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
          // Add each signification and its icon to the container
          result.significations.forEach(signification => {
            const significationContainer = document.createElement("div");
            significationContainer.classList.add("signification-container");

            // Check if the signification matches the active category filter
            const matchesCategory = signification.type === activeCategoryFilter;

            // Add a CSS class to highlight the matching signification
            if (matchesCategory) {
              significationContainer.classList.add("highlighted-signification");
            }

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
          // If there's only one signification, display it along with its icon
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

        // Add the descriptionContainer to the row
        row.appendChild(descriptionContainer);

        // Create a "langue popover" element for both single and multiple significations
        const languePopover = document.createElement("div");
        languePopover.classList.add("langue-popover");
        languePopover.textContent = result.langue; // Récupérez la langue à partir des données JSON

        // Add the languePopover to the row
        row.appendChild(languePopover);

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
    const top = rowRect.bottom + window.scrollY - 12;
    const left = rowRect.right + window.scrollX - 18;

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

      // Handle symbol filter button click
      function handleSymbolFilterButtonClick() {
        activeFilters.symbol = !activeFilters.symbol;

        if (activeFilters.symbol) {
          // If the symbol filter is active, deactivate other filters
          activeFilters.letter = null;
          activeFilters.category = null;
          activeFilters.type = null;
        }

        applyActiveFilters(sortedData);
      }

      // Add an event listener to the symbol filter button
      symbolFilterButton.addEventListener("click", handleSymbolFilterButtonClick);

      // Handle category filter button click
      function handleCategoryFilterButtonClick(button) {
        const selectedCategoryFilter = button.getAttribute("data-category");
        activeFilters.category = activeFilters.category === selectedCategoryFilter ? null : selectedCategoryFilter;

        if (activeFilters.category) {
          // If a category filter is active, deactivate the symbol filter
          activeFilters.symbol = false;
          activeSymbolButton.classList.remove("active");
          activeSymbolButton = null;
        }

        applyActiveFilters(sortedData);
      }

      // Add event listeners to category filter buttons
      categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
          handleCategoryFilterButtonClick(button);
        });
      });

      // Handle type filter button click
      function handleTypeFilterButtonClick(button) {
        const selectedTypeFilter = button.getAttribute("data-type");
        activeFilters.type = activeFilters.type === selectedTypeFilter ? null : selectedTypeFilter;

        applyActiveFilters(sortedData);
      }

      // Add event listeners to type filter buttons
      typeButtons.forEach(button => {
        button.addEventListener("click", () => {
          handleTypeFilterButtonClick(button);
        });
      });

      // Initialize the filters and display data on page load
      resetFilters();
    })
    .catch(error => {
      console.error("Error fetching data:", error);
    });
});
