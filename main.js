const introductionText = document.querySelector('.introduction-text');
const noResultsText = document.querySelector('.no-results-text');
const searchInput = document.querySelector('#search');
const demoLink = document.querySelector('#demo-link');
const demoText = 'frost';
let timeoutId;
let resultContainer = document.querySelector('.result-container');
let strainData = [];
let demoIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    fetch('https://strainsapi.netlify.app/strains.json')
        .then(response => response.json())
        .then(data => {
            strainData = data;
            if (getSearchText()) {
                const searchText = getSearchText();
                searchInput.value = searchText;
                let filteredData = filterData(searchText, strainData);
                filteredData.forEach(strain => {
                    const card = createCard(strain);
                    resultContainer.appendChild(card);
                });
                startObserving();
            } else {
                introductionText.classList.add('show');
            }
        })
        .catch(error => console.error('Error fetching data:', error));
});


// Debounce function
const debounce = (func, delay) => {
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

// session storage functions
const storeSearchText = (searchText) => {
    sessionStorage.setItem('searchText', searchText);
}

const getSearchText = () => {
    return sessionStorage.getItem('searchText');
}

const clearSearchText = () => {
    sessionStorage.removeItem('searchText');
}

const filterData = (searchText, strainData) => {
    if (!searchText) return null;
    return strainData.filter(strain => {
        return (strain.name && typeof strain.name === 'string' && strain.name.toLowerCase().includes(searchText)) ||
            (strain.thc_level && typeof strain.thc_level === 'string' && strain.thc_level.toLowerCase().includes(searchText)) ||
            (strain.type && typeof strain.type === 'string' && strain.type.toLowerCase().includes(searchText));
    });
}

const createCard = (strain) => {
    // wrap the whole card inside a link to the strain page which is /strain + strain name as url parameter
    const card = document.createElement('a');
    card.href = `/strain.html?name=${encodeURIComponent(strain.name)}`;

    // create the card
    const cardContainer = document.createElement('div');
    cardContainer.classList.add('card', 'hidden');
    const name = document.createElement('h5');
    name.classList.add('card-header');
    name.textContent = strain.name;
    cardContainer.appendChild(name);

    const image = document.createElement('img');
    image.classList.add('card-img-top', 'lazy-load');
    image.dataset.src = strain.img_url;
    image.src = './assets/strainfinder_400.jpeg';
    image.width = 240;
    cardContainer.appendChild(image);

    const cardContent = document.createElement('div');
    cardContent.classList.add('card-body');
    cardContainer.appendChild(cardContent);

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
    card.appendChild(cardContainer);
    return card;
}

const startObserving = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Lazy load the image
                const img = entry.target.querySelector('.lazy-load');
                if (img) {
                    img.src = img.getAttribute('data-src');
                    img.onload = () => {
                        img.classList.add('loaded'); // Optional: Add a class when the image is loaded
                    };
                    img.removeAttribute('data-src');
                }
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            } else {
                entry.target.classList.remove('show');
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
            clearSearchText();
            return;
        } else {
            storeSearchText(searchText);
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
    const container = document.querySelector('.container');

    // Show the overlay after short delay
    setTimeout(() => {
        const overlay = document.getElementById('overlay');
        overlay.style.display = 'flex';
        container.classList.add('blur');
    }, 400);

    // Highlight the input field and change the placeholder text
    setTimeout(() => {
        searchInput.classList.add('demo-mode');
        searchInput.placeholder = 'DEMO MODE. Start searching...';
        searchInput.value = '';
    }, 900);

    setTimeout(() => {
        // Simulate typing
        const typeNextLetter = () => {
            if (demoIndex < demoText.length) {
                searchInput.value += demoText[demoIndex];
                demoIndex++;
                debounce(typeNextLetter, 500)();
            } else {
                // Demo complete, reset styles after a delay
                debounce(() => {
                    searchInput.classList.remove('demo-mode');
                    searchInput.placeholder = 'Enter a cannabis strain you are curious about';
                    const demoButton = document.getElementById('start-demo');
                    demoButton.style.display = 'block';
                    let filteredData = filterData(searchInput.value, strainData);
                    filteredData.forEach(strain => {
                        const card = createCard(strain);
                        resultContainer.appendChild(card);
                    });
                    container.classList.remove('blur');
                    introductionText.classList.remove('show');
                    startObserving();
                    storeSearchText(demoText);
                }, 750)();
            }
        };
        debounce(() => {
            typeNextLetter();
        }, 1000)();
    }, 1600)

    // Hide the overlay after a delay
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 6660);
};