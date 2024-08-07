const searchInput = document.querySelector('#search');
const suggestions = ["Sativa", "Indica", "Hybrid", "Afghani", "Lowryder", "Bubblegum", "Acapulco Gold", "Hindu Kush", "Durban Poison", "Panama", "White Widdow", "Lemon Haze", "Haze", "Purple Haze", "Kush", "Blueberry", "Jack Herer", "Cheese", "Silver Haze", "Amnesia Haze", "Sour Diesel", "OG Kush", "Super Lemon Haze", "Northern Lights", "Cheese", "AK-47", "Skunk", "Blue Dream", "Maui Wowie", "Gelato", "Wedding Cake", "Critical", "Orange Bud", "Cali", "10%", "11%", "12%", "13%", "14%", "15%", "17%", "18%", "19%", "20%", "21%", "22%", "23%", "24%", "25%", "30%"];
const demoText = 'Blueberry';
let resultContainer = document.querySelector('.result-container');
let timeoutId;
let demoMode;
let strainData = [];
let searchQuery = sessionStorage.getItem('searchQuery') || '';
let sortBy = sessionStorage.getItem('sortBy') || 'name';
let sortingOrder = sessionStorage.getItem('sortingOrder') || 'asc';
let demoIndex = 0;

// EVENT LISTENERS
// event listener to fetch data and intializing states
document.addEventListener('DOMContentLoaded', () => {
    const clearIcon = document.querySelector('#clearIcon');
    const toTopButton = document.querySelector('#toTopButton');
    const introductionText = document.querySelector('.introduction-text');
    const noResultsText = document.querySelector('.no-results-text');

    // fetch data
    fetch('https://strainsapi.netlify.app/strains.json')
        .then(response => response.json())
        .then(data => {
            strainData = data;
            if (searchQuery) {
                searchInput.value = searchQuery;
                const filteredData = filterData(searchQuery, strainData);
                sortData(filteredData, sortBy, sortingOrder);
                filteredData.forEach(strain => resultContainer.appendChild(createCard(strain)));
                startObserving();
                toggleClearIcon();
            } else {
                introductionText.classList.add('show');
            }
            document.querySelectorAll('.sort-by-input').forEach(button => {
                button.id === sortBy ? button.checked = true : button.checked = false
            });
            document.querySelector('.sorting-order').textContent = sortingOrder === 'asc' ? '↓ ASC' : '↑ DESC';
        })
        .catch(error => console.error('Error fetching data:', error));

    searchInput.addEventListener('input', toggleClearIcon);

    clearIcon.addEventListener('click', () => {
        searchInput.value = '';
        resultContainer.innerHTML = '';
        introductionText.classList.add('show');
        noResultsText.classList.remove('show');
        clearIcon.style.display = 'none';
        searchQuery = '';
        updateSessionStorage();
        toggleClearIcon();
        document.querySelector(".scroll-indicator-bar").style.width = "0%";
    });

    // scroll to top
    const checkScrollPosition = () => {
        if (window.scrollY > 800) {
            toTopButton.classList.add('show');
        } else {
            toTopButton.classList.remove('show');
        }
    };

    window.addEventListener('scroll', checkScrollPosition);

    toTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    toggleClearIcon();
    checkScrollPosition();
});

// clear icon in search input
const toggleClearIcon = () => {
    if (searchInput.value.trim() !== '') {
        clearIcon.style.display = 'block';
    } else {
        clearIcon.style.display = 'none';
    }
};

// add event listener to clear results when user clicks on header-logo
document.querySelector('.header-back-link').addEventListener('click', (event) => {
    const introductionText = document.querySelector('.introduction-text');
    const noResultsText = document.querySelector('.no-results-text');
    event.preventDefault();
    console.log("clicked logo");
    searchInput.value = '';
    searchQuery = '';
    updateSessionStorage();
    resultContainer.innerHTML = '';
    introductionText.classList.add('show');
    noResultsText.classList.remove('show');
    toggleClearIcon();
    document.querySelector(".scroll-indicator-bar").style.width = "0%";
});

// event listener to show results for suggestion
document.querySelector('#show-results-button').addEventListener('click', () => {
    let suggest = suggestions[Math.floor(Math.random() * suggestions.length)];
    document.querySelector('.introduction-text').classList.remove('show');
    searchInput.value = suggest;
    searchQuery = suggest;
    updateSessionStorage();
    let filteredData = filterData(searchQuery, strainData);
    sortData(filteredData, sortBy, sortingOrder);
    filteredData.forEach(strain => resultContainer.appendChild(createCard(strain)));
    toggleClearIcon();
    startObserving();
});

// event listener to open filter section
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

// event listener to start demo
document.querySelector('#start-demo-link').addEventListener('click', () => !demoMode ? startDemoMode() : null);

// event listener to set sorting
document.querySelectorAll('.sort-by').forEach(button => {
    button.addEventListener('click', () => {
        const key = button.id;
        const filteredData = filterData(searchQuery, strainData);
        sortBy = key;
        updateSessionStorage();
        if (filteredData) {
            sortData(filteredData, key, sortingOrder);
            resultContainer.innerHTML = '';
            filteredData.forEach(strain => resultContainer.appendChild(createCard(strain)));
            startObserving();
        }
    });
});

// event listener to set sorting order
document.querySelector('.sorting-order').addEventListener('click', () => {
    const filteredData = filterData(searchQuery, strainData);
    if (sortingOrder === 'asc') {
        document.querySelector('.sorting-order').textContent = '↑ DESC';
        sortingOrder = 'desc';
        updateSessionStorage();
        if (filteredData) {
            sortData(filteredData, sortBy, sortingOrder);
            resultContainer.innerHTML = '';
            filteredData.forEach(strain => resultContainer.appendChild(createCard(strain)));
            startObserving();
        }
    } else if (sortingOrder === 'desc') {
        document.querySelector('.sorting-order').textContent = '↓ ASC';
        sortingOrder = 'asc';
        updateSessionStorage();
        if (filteredData) {
            sortData(filteredData, sortBy, sortingOrder);
            resultContainer.innerHTML = '';
            filteredData.forEach(strain => resultContainer.appendChild(createCard(strain)));
            startObserving();
        }
    }
});

// event listener for search
searchInput.addEventListener('input', (event) => {
    debounce(() => {
        const introductionText = document.querySelector('.introduction-text');
        const noResultsText = document.querySelector('.no-results-text');
        let searchText = event.target.value;
        introductionText.classList.remove('show');
        noResultsText.classList.remove('show');
        resultContainer.innerHTML = '';

        if (searchText === '') {
            // Clear previous results
            resultContainer.innerHTML = '';
            introductionText.classList.add('show');
            noResultsText.classList.remove('show');
            searchQuery = '';
            updateSessionStorage();
            return;
        } else {
            searchQuery = searchText;
            updateSessionStorage();
        }
        let filteredData = filterData(searchText, strainData);

        sortData(filteredData, sortBy, sortingOrder);

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

// update session storage
const updateSessionStorage = () => {
    sessionStorage.setItem('searchQuery', searchQuery);
    sessionStorage.setItem('sortBy', sortBy);
    sessionStorage.setItem('sortingOrder', sortingOrder);
};

// sort data
const sortData = (data, key, order) => {
    const multiplier = order === 'desc' ? -1 : 1;

    data.sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];

        // Check if values are numerical strings (e.g., '25%')
        const aIsNumeric = !isNaN(parseFloat(aValue));
        const bIsNumeric = !isNaN(parseFloat(bValue));

        if (aIsNumeric && bIsNumeric) {
            // Convert to float for numerical comparison
            const numA = parseFloat(aValue);
            const numB = parseFloat(bValue);

            if (numA < numB) {
                return -1 * multiplier;
            }
            if (numA > numB) {
                return 1 * multiplier;
            }
        } else {
            // Lexicographic comparison for pure strings
            if (aValue < bValue) {
                return -1 * multiplier;
            }
            if (aValue > bValue) {
                return 1 * multiplier;
            }
        }
        return 0;
    });
};

// filter data from search
const filterData = (searchText, strainData) => {
    if (!searchText) return null;
    return strainData.filter(strain => {
        return (strain.name && typeof strain.name === 'string' && strain.name.toLowerCase().includes(searchText.toLowerCase())) ||
            (strain.thc_level && typeof strain.thc_level === 'string' && strain.thc_level.toLowerCase().includes(searchText.toLowerCase())) ||
            (strain.type && typeof strain.type === 'string' && strain.type.toLowerCase().includes(searchText.toLowerCase()));
    });
}

// create html cards
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

// lazy load and effects on scroll
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
        rootMargin: '0px 0px 20% 0px'
    })
    const hiddenElements = resultContainer.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el))
}

// start demo mode
const startDemoMode = () => {
    demoMode = true;
    const content = document.querySelector('.content');
    const demoButton = document.querySelector('#start-demo-link');
    demoButton.disabled = true;
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
                    const introductionText = document.querySelector('.introduction-text');
                    clearIcon.style.display = 'block';
                    let filteredData = filterData(demoText, strainData);
                    searchQuery = demoText;
                    updateSessionStorage();
                    sortData(filteredData, 'name', 'asc')
                    filteredData.forEach(strain => {
                        const card = createCard(strain);
                        resultContainer.appendChild(card);
                    });
                    content.classList.remove('blur');
                    introductionText.classList.remove('show');
                    startObserving();
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
        demoButton.disabled = false;
        demoMode = false;
    }, 6660);
};

// update the scroll indicator
const updateScrollIndicator = () => {
    var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var scrolled = (winScroll / height) * 100;
    document.querySelector(".scroll-indicator-bar").style.width = scrolled + "%";
}

// on scroll update the scroll indicator
window.onscroll = () => {
    updateScrollIndicator();
};