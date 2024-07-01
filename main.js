const introductionText = document.querySelector('.introduction-text');
const noResultsText = document.querySelector('.no-results-text');
const searchInput = document.querySelector('#search');
const demoLink = document.querySelector('#demo-link');
const demoText = 'frost';
let timeoutId;
let resultContainer = document.querySelector('.result-container');
let strainData = [];
let sortingBy = 'name';
let sortingOrder = 'asc';
let demoIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    fetch('https://strainsapi.netlify.app/strains.json')
        .then(response => response.json())
        .then(data => {
            strainData = data;
            if (getSessionData('sortingBy')) {
                sortingBy = getSessionData('sortingBy');
                document.querySelectorAll('.sort-by-input').forEach(button => {
                    button.id === sortingBy ? button.checked = true : button.checked = false
                });
            }
            if (getSessionData('sortingOrder')) {
                sortingOrder = getSessionData('sortingOrder');
                document.querySelector('.sorting-order').textContent = sortingOrder === 'asc' ? '↓ ASC' : '↑ DESC';
            }
            if (getSessionData('searchText')) {
                const searchText = getSessionData('searchText');
                searchInput.value = searchText;
                const filteredData = filterData(searchText, strainData);
                sortBy(filteredData, sortingBy, sortingOrder);
                filteredData.forEach(strain => resultContainer.appendChild(createCard(strain)));
                startObserving();
            } else {
                sortingBy = 'name';
                sortingOrder = 'asc';
                introductionText.classList.add('show');
                // alert('dom content loaded: introduction text shown');
            }
        })
        .catch(error => console.error('Error fetching data:', error));
});

document.querySelector('#filter-button').addEventListener('click', () => {
    const filterButtonIcon = document.querySelector('.filter-button-icon');
    const filterSection = document.querySelector('.filter-container');
    const content = document.querySelector('.content');
    if (filterSection.classList.contains('open')) {
        filterSection.classList.remove('open');
        filterButtonIcon.classList.remove('fa-angle-up');
        filterButtonIcon.classList.add('fa-angle-down');
        content.classList.remove('filter-opened');
    } else {
        filterSection.classList.add('open');
        filterButtonIcon.classList.remove('fa-angle-down');
        filterButtonIcon.classList.add('fa-angle-up');
        content.classList.add('filter-opened');
    }
});

document.querySelector('#start-demo').addEventListener('click', () => startDemoMode());

document.querySelectorAll('.sort-by').forEach(button => {
    button.addEventListener('click', () => {
        const key = button.id;
        const filteredData = filterData(getSessionData('searchText'), strainData);
        saveSessionData('sortingBy', key);
        if (filteredData) {
            sortBy(filteredData, key, getSessionData('sortingOrder'));
            resultContainer.innerHTML = '';
            filteredData.forEach(strain => resultContainer.appendChild(createCard(strain)));
            startObserving();
        }
    });
});

// set sorting order on button click
document.querySelector('.sorting-order').addEventListener('click', () => {
    const filteredData = filterData(getSessionData('searchText'), strainData);
    if (sortingOrder === 'asc') {
        document.querySelector('.sorting-order').textContent = '↑ DESC';
        sortingOrder = 'desc';
        sortBy(filteredData, getSessionData('sortingBy'), sortingOrder);
        saveSessionData('sortingOrder', 'desc');
        resultContainer.innerHTML = '';
        filteredData.forEach(strain => resultContainer.appendChild(createCard(strain)));
        startObserving();
    } else if (sortingOrder === 'desc') {
        document.querySelector('.sorting-order').textContent = '↓ ASC';
        sortingOrder = 'asc';
        sortBy(filteredData, getSessionData('sortingBy'), sortingOrder);
        saveSessionData('sortingOrder', 'asc');
        resultContainer.innerHTML = '';
        filteredData.forEach(strain => resultContainer.appendChild(createCard(strain)));
        startObserving();
    }
});

// UTILS
// debounce function
const debounce = (func, delay) => {
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

// session storage functions
const saveSessionData = (key, value) => {
    sessionStorage.setItem(key, value);
}

const getSessionData = (key) => {
    return sessionStorage.getItem(key);
}

const clearSessionData = (key) => {
    sessionStorage.removeItem(key);
}

const sortBy = (data, key, order) => {
    if (order === 'desc') {
        data.sort((a, b) => {
            if (a[key] < b[key]) {
                return 1;
            }
            if (a[key] > b[key]) {
                return -1;
            }
            return 0;
        });
    } else if (order === 'asc') {
        data.sort((a, b) => {
            if (a[key] < b[key]) {
                return -1;
            }
            if (a[key] > b[key]) {
                return 1;
            }
            return 0;
        });
    }
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

    // create the image
    const image = document.createElement('img');
    image.classList.add('card-img-top', 'lazy-load');
    image.dataset.src = strain.img_url;
    image.src = './assets/strainfinder_400.jpeg';
    image.width = 240;
    cardContainer.appendChild(image);

    // create the card body
    const cardContent = document.createElement('div');
    cardContent.classList.add('card-body');
    cardContainer.appendChild(cardContent);

    const subTitle = document.createElement('h5');
    subTitle.classList.add('card-subtitle');
    cardContent.appendChild(subTitle);

    const thcContent = document.createElement('span');
    thcContent.textContent = `THC: ${strain.thc_level ? strain.thc_level : 'N/A'}`;
    subTitle.appendChild(thcContent);

    const type = document.createElement('span');
    type.textContent = `Type: ${strain.type ? strain.type : 'N/A'}`;
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
                entry.target.classList.add('show');
                if (img) {
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                }
                observer.unobserve(entry.target);
            } else {
                entry.target.classList.remove('show');
            }
        })
    }, {
        rootMargin: '0px 0px 100px 0px'
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
            clearSessionData('searchText');
            return;
        } else {
            saveSessionData('searchText', searchText);
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
    const content = document.querySelector('.content');
    // Show the overlay after short delay
    setTimeout(() => {
        const overlay = document.getElementById('overlay');
        overlay.style.display = 'flex';
        content.classList.add('blur');
    }, 300);

    // Show the overlay text after short delay
    setTimeout(() => {
        const overlayText = document.getElementById('overlay-text');
        overlayText.classList.add('show');
    }, 600);

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
                    sortBy(filteredData, 'name', 'asc')
                    filteredData.forEach(strain => {
                        const card = createCard(strain);
                        resultContainer.appendChild(card);
                    });
                    content.classList.remove('blur');
                    introductionText.classList.remove('show');
                    startObserving();
                    saveSessionData('searchText', demoText);
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