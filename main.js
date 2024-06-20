const introductionText = document.querySelector('.introduction-text');
const noResultsText = document.querySelector('.no-results-text');
const demoLink = document.querySelector('#demo-link');
const demoText = 'frost';
let resultContainer = document.querySelector('.result-container');
let strainData = [];
let demoIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    fetch('https://strainsapi.netlify.app/strains.json')
        .then(response => response.json())
        .then(data => {
            strainData = data;
            introductionText.classList.add('show');
        })
        .catch(error => console.error('Error fetching data:', error));
});
const searchInput = document.querySelector('#search');
let timeoutId;

// Debounce function
const debounce = (func, delay) => {
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

const filterData = (searchText, strainData) => {
    if (!searchText) return null;
    return strainData.filter(strain => {
        return (strain.name && typeof strain.name === 'string' && strain.name.toLowerCase().includes(searchText)) ||
            (strain.thc_level && typeof strain.thc_level === 'string' && strain.thc_level.toLowerCase().includes(searchText)) ||
            (strain.type && typeof strain.type === 'string' && strain.type.toLowerCase().includes(searchText));
    });
}

const createCard = (strain) => {
    const card = document.createElement('div');
    card.classList.add('card', 'hidden');
    const name = document.createElement('h5');
    name.classList.add('card-header');
    name.textContent = strain.name;
    card.appendChild(name);

    const image = document.createElement('img');
    image.classList.add('card-img-top');
    const randomNum = Math.floor(Math.random() * 20) + 1;
    image.src = strain.img_url ? strain.img_url : `./assets/strain-${randomNum}.png`;
    image.width = 240;
    card.appendChild(image);

    const cardContent = document.createElement('div');
    cardContent.classList.add('card-body');
    card.appendChild(cardContent);

    const subTitle = document.createElement('h5');
    subTitle.classList.add('card-subtitle');
    cardContent.appendChild(subTitle);

    const thcContent = document.createElement('span');
    thcContent.textContent = strain.thc_level ? `THC: ${strain.thc_level}` : 'THC: N/A';
    subTitle.appendChild(thcContent);

    const type = document.createElement('span');
    type.textContent = `Type: ${strain.type}`;
    subTitle.appendChild(type);

    const description = document.createElement('p');
    description.classList.add('card-text', 'description');
    description.textContent = strain.description;
    cardContent.appendChild(description);
    return card;
}

const startObserving = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show')
            } else {
                entry.target.classList.remove('show')
            }
        })
    })
    const hiddenElements = resultContainer.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el))
}

searchInput.addEventListener('input', (event) => {
    debounce(() => {
        let searchText = event.target.value.toLowerCase();
        introductionText.classList.remove('show');
        noResultsText.classList.remove('show');
        resultContainer.innerHTML = '';

        if (searchText === '') {
            // Clear previous results
            resultContainer.innerHTML = '';
            introductionText.classList.add('show');
            noResultsText.classList.remove('show');
            return;
        }
        let filteredData = filterData(searchText, strainData);

        if (searchText !== '' && !filteredData || filteredData.length === 0) {
            resultContainer.innerHTML = '';
            noResultsText.classList.add('show');
            noResultsText.innerHTML = `<h4>No results found for "${searchText}"</h4>`;
            return;
        }
        filteredData.forEach(strain => {
            const card = createCard(strain);
            resultContainer.appendChild(card);
        });
        startObserving();
    }, 350)();
});

const startDemoMode = () => {
    // Highlight the input field and change the placeholder text
    searchInput.classList.add('demo-mode');
    searchInput.placeholder = 'DEMO MODE: Search for strains...';
    searchInput.value = '';

    // Simulate typing
    demoIndex = 0;
    const typeNextLetter = () => {
        if (demoIndex < demoText.length) {
            searchInput.value += demoText[demoIndex];
            demoIndex++;
            setTimeout(typeNextLetter, 500);
        } else {
            // Demo complete, reset styles after a delay
            setTimeout(() => {
                searchInput.classList.remove('demo-mode');
                searchInput.placeholder = 'Search for strains...';
                let filteredData = filterData(searchInput.value, strainData);
                filteredData.forEach(strain => {
                    const card = createCard(strain);
                    resultContainer.appendChild(card);
                });
                introductionText.classList.remove('show');
                startObserving();
            }, 750);
        }
    };
    debounce(() => {
        typeNextLetter();
    }, 1000)();
};