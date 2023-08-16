// Fonction pour trier les données en ordre alphabétique
function sortDataAlphabetically(data) {
  return data.sort((a, b) => a.abreviation.localeCompare(b.abreviation));
}

// Fonction pour gérer la recherche
function handleSearch(event, data) {
  const searchTerm = event.target.value.toLowerCase();
  const filteredResults = data.filter(item =>
    item.abreviation.toLowerCase().includes(searchTerm)
  );
  displayResults(filteredResults);
}

// Fonction pour afficher les résultats (filtrés ou non)
function displayResults(results) {
  const resultsList = document.getElementById("resultsList");
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

    const descriptionCell = document.createElement("p");
    descriptionCell.textContent = result.signification;
    row.appendChild(descriptionCell);

    resultsList.appendChild(row);
  });
}

// Écouteur d'événement pour la barre de recherche
const searchInput = document.getElementById("searchInput");

// Fetch data and set up letter buttons
fetch("data.json")
  .then(response => response.json())
  .then(data => {
    const sortedData = sortDataAlphabetically(data);
    const letterButtons = document.querySelectorAll(".letter-button");

    letterButtons.forEach(button => {
      button.addEventListener("click", () => {
        const selectedLetter = button.getAttribute("data-letter");
        const isFilterActive = button.classList.contains("active");

        letterButtons.forEach(otherButton => {
          if (otherButton !== button) {
            otherButton.classList.remove("active");
          }
        });

        if (isFilterActive) {
          button.classList.remove("active");
          displayResults(sortedData);
        } else {
          button.classList.add("active");
          const filteredResults = filterResultsByLetter(selectedLetter, sortedData);
          displayResults(filteredResults);
        }
      });
    });

    displayResults(sortedData);
    searchInput.addEventListener("input", event => handleSearch(event, sortedData));
  })
  .catch(error => {
    console.error("Une erreur s'est produite lors du chargement des données.", error);
  });

// Fonction pour filtrer les résultats par lettre
function filterResultsByLetter(letter, data) {
  return data.filter(item =>
    item.abreviation.charAt(0).toLowerCase() === letter.toLowerCase()
  );
}
