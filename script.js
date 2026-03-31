// DATA & GLOBALS
let filmsData = [];
let filmStars = [];
let currentYear = 2025;
let animationInterval = null;

// Comparison state (max 50)
let comparisonFilms = [];

// THREE.JS
let scene, camera, renderer, starGroup;
let raycaster, mouseVector;
let isDragging = false;
let lastMouseX = 0, lastMouseY = 0;
let targetRotationX = 0, targetRotationY = 0, targetRotationZ = 0;
let autoRotate = true;
let autoRotateSpeed = 0.002;
let tooltip = null;
let hoverTimeout = null;

// Current selected film for modal
let currentModalFilm = null;

const MIN_YEAR = 1997;
const MAX_YEAR = 2025;
const defaultCameraPos = { x: 0, y: 20, z: 160 };

let comparisonChart = null;

// LOAD DATA
async function loadData() {
    try {
        const response = await fetch('films.json');
        const data = await response.json();
        processData(data);
    } catch (e) {
        const fallback = [
            { "title": "Titanic", "release_year": 1997, "director": "James Cameron", "box_office": 2257906828, "country": "United States", "production_companies": "Paramount Pictures; 20th Century Fox" },
            { "title": "The Lord of the Rings: The Return of the King", "release_year": 2003, "director": "Peter Jackson", "box_office": 1147997407, "country": "New Zealand; Germany; United States", "production_companies": "WingNut Films; New Line Cinema" },
            { "title": "Avatar", "release_year": 2009, "director": "James Cameron", "box_office": 2923710708, "country": "United States", "production_companies": "20th Century Fox; Lightstorm Entertainment" },
            { "title": "Harry Potter and the Deathly Hallows – Part 2", "release_year": 2011, "director": "David Yates", "box_office": 1342139727, "country": "United Kingdom", "production_companies": "Warner Bros." },
            { "title": "The Avengers", "release_year": 2012, "director": "Joss Whedon", "box_office": 1518815515, "country": "United States", "production_companies": "Marvel Studios" },
            { "title": "Frozen", "release_year": 2013, "director": "Chris Buck; Jennifer Lee", "box_office": 1290000000, "country": "United States", "production_companies": "Walt Disney Animation" },
            { "title": "Star Wars: The Force Awakens", "release_year": 2015, "director": "J. J. Abrams", "box_office": 2068223624, "country": "United States", "production_companies": "Lucasfilm" },
            { "title": "Jurassic World", "release_year": 2015, "director": "Colin Trevorrow", "box_office": 1671537444, "country": "United States", "production_companies": "Universal Pictures" },
            { "title": "Avengers: Infinity War", "release_year": 2018, "director": "Anthony Russo; Joe Russo", "box_office": 2048359754, "country": "United States", "production_companies": "Marvel Studios" },
            { "title": "Avengers: Endgame", "release_year": 2019, "director": "Anthony Russo; Joe Russo", "box_office": 2797501328, "country": "United States", "production_companies": "Marvel Studios" },
            { "title": "The Lion King", "release_year": 2019, "director": "Jon Favreau", "box_office": 1656943394, "country": "United States", "production_companies": "Disney" },
            { "title": "Spider-Man: No Way Home", "release_year": 2021, "director": "Jon Watts", "box_office": 1922598800, "country": "United States", "production_companies": "Columbia Pictures; Marvel" },
            { "title": "Avatar: The Way of Water", "release_year": 2022, "director": "James Cameron", "box_office": 2334484620, "country": "United States", "production_companies": "Lightstorm Entertainment" },
            { "title": "Top Gun: Maverick", "release_year": 2022, "director": "Joseph Kosinski", "box_office": 1495696292, "country": "United States", "production_companies": "Paramount" },
            { "title": "Barbie", "release_year": 2023, "director": "Greta Gerwig", "box_office": 1447138421, "country": "United States", "production_companies": "Heyday Films" },
            { "title": "Inside Out 2", "release_year": 2024, "director": "Kelsey Mann", "box_office": 1698863816, "country": "United States", "production_companies": "Pixar" },
            { "title": "Deadpool & Wolverine", "release_year": 2024, "director": "Shawn Levy", "box_office": 1338073645, "country": "United States", "production_companies": "Marvel Studios" },
            { "title": "Ne Zha 2", "release_year": 2025, "director": "Jiaozi", "box_office": 2215690000, "country": "China", "production_companies": "Chengdu Coco Cartoon" },
            { "title": "Avatar: Fire and Ash", "release_year": 2025, "director": "James Cameron", "box_office": 1485690293, "country": "United States", "production_companies": "Lightstorm" },
            { "title": "Zootopia 2", "release_year": 2025, "director": "Jared Bush", "box_office": 1866590453, "country": "United States", "production_companies": "Disney Animation" }
        ];
        processData(fallback);
    }
}

function processData(data) {
    filmsData = data.map(f => ({
        title: f.title,
        year: f.release_year,
        director: f.director,
        box_office: f.box_office,
        countries: f.country ? f.country.split(/[;,]/).map(c => c.trim()) : ['Unknown'],
        production: f.production_companies || f.production || 'N/A'
    }));
    document.getElementById('loading').style.display = 'none';
    init3D();
    initUI();
    updateByYear(currentYear);
    showMsg('✨ Hover over stars for title | Double-click for full details');
}

function showMsg(msg) {
    const div = document.createElement('div');
    div.className = 'notification';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2000);
}

function formatMoney(v) {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    return `$${v.toLocaleString()}`;
}

function getColor(bo) {
    if (bo >= 2000000000) return 0xffd700;
    if (bo >= 1500000000) return 0xffaa44;
    if (bo >= 1000000000) return 0xff8844;
    if (bo >= 500000000) return 0xff6644;
    return 0xff4444;
}

// Show comparison panel when first film added
function showComparisonPanel() {
    const panel = document.getElementById('comparisonPanel');
    if (!panel.classList.contains('visible')) {
        panel.classList.add('visible');
        showMsg('📊 Comparison panel opened! Add more films (max 50)');
    }
}

// Comparison Functions
function addToComparison(film) {
    if (comparisonFilms.length >= 50) {
        showMsg('❌ Maximum 50 films in comparison!');
        return false;
    }
    if (comparisonFilms.some(f => f.title === film.title)) {
        showMsg(`⚠️ "${film.title}" is already in comparison`);
        return false;
    }
    comparisonFilms.push(film);
    if (comparisonFilms.length === 1) {
        showComparisonPanel();
    }
    updateComparisonUI();
    showMsg(`➕ Added "${film.title}" to comparison (${comparisonFilms.length}/50)`);
    return true;
}

function removeFromComparison(index) {
    const removed = comparisonFilms[index].title;
    comparisonFilms.splice(index, 1);
    updateComparisonUI();
    showMsg(`➖ Removed "${removed}" from comparison`);
    if (comparisonFilms.length === 0) {
        document.getElementById('comparisonPanel').classList.remove('visible');
    }
}

function clearComparison() {
    comparisonFilms = [];
    updateComparisonUI();
    document.getElementById('comparisonPanel').classList.remove('visible');
    showMsg('🗑️ Comparison cleared');
}

function updateComparisonUI() {
    const listDiv = document.getElementById('comparisonList');
    const countSpan = document.getElementById('compareCount');
    countSpan.innerText = comparisonFilms.length;

    if (comparisonFilms.length === 0) {
        listDiv.innerHTML = '<div style="text-align:center; padding:20px; opacity:0.6;">✨ Add films to start comparison (2+ for chart)</div>';
        if (comparisonChart) {
            comparisonChart.data.datasets = [];
            comparisonChart.update();
        }
        return;
    }

    listDiv.innerHTML = comparisonFilms.map((film, idx) => `
        <div class="comparison-film-item">
            <div class="comparison-film-info">
                <div class="comparison-film-title">${film.title}</div>
                <div class="comparison-film-year">${film.year} · ${formatMoney(film.box_office)}</div>
            </div>
            <button class="remove-film" data-idx="${idx}">✕</button>
        </div>
    `).join('');

    document.querySelectorAll('.remove-film').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.idx);
            removeFromComparison(idx);
        });
    });

    updateComparisonChart();
}

function updateComparisonChart() {
    const ctx = document.getElementById('comparisonChart').getContext('2d');

    if (comparisonFilms.length < 2) {
        if (comparisonChart) {
            comparisonChart.data.datasets = [];
            comparisonChart.update();
        }
        return;
    }

    const labels = comparisonFilms.map(f => f.title.length > 18 ? f.title.slice(0, 15) + '...' : f.title);
    const boxOfficeData = comparisonFilms.map(f => f.box_office / 1e9);

    if (comparisonChart) {
        comparisonChart.data.labels = labels;
        comparisonChart.data.datasets = [{
            label: 'Box Office (Billions $)',
            data: boxOfficeData,
            backgroundColor: 'rgba(255, 170, 68, 0.7)',
            borderColor: '#ffaa44',
            borderWidth: 2,
            borderRadius: 8,
            barPercentage: 0.7
        }];
        comparisonChart.update();
    } else {
        comparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Box Office (Billions $)',
                    data: boxOfficeData,
                    backgroundColor: 'rgba(255, 170, 68, 0.7)',
                    borderColor: '#ffaa44',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { color: '#fff', font: { size: 10 } } },
                    tooltip: { callbacks: { label: (ctx) => `$${ctx.raw.toFixed(2)} Billion` } }
                },
                scales: {
                    y: { title: { display: true, text: 'Box Office (Billions USD)', color: '#ffaa44' }, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#fff' } },
                    x: { ticks: { color: '#fff', maxRotation: 35, minRotation: 25, font: { size: 9 } }, grid: { display: false } }
                }
            }
        });
    }
}

// MODAL with ADD button
function showModal(film) {
    const modal = document.getElementById('filmModal');

    if (modal.classList.contains('active')) {
        modal.classList.remove('active');
    }

    setTimeout(() => {
        currentModalFilm = film;
        document.getElementById('modalTitle').innerHTML = `🎬 ${film.title}`;
        document.getElementById('modalYear').innerText = film.year;
        document.getElementById('modalDirector').innerText = film.director;
        document.getElementById('modalBoxOffice').innerText = formatMoney(film.box_office);
        document.getElementById('modalCountry').innerText = film.countries.join(', ');
        document.getElementById('modalProduction').innerText = film.production || 'N/A';

        modal.classList.add('active');

        const addBtn = document.getElementById('modalAddBtn');
        const newAddBtn = addBtn.cloneNode(true);
        addBtn.parentNode.replaceChild(newAddBtn, addBtn);
        newAddBtn.onclick = () => {
            addToComparison(film);
            modal.classList.remove('active');
        };

        const closeBtn = document.getElementById('closeModalBtn');
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.onclick = () => modal.classList.remove('active');

        const closeModalHandler = (e) => {
            if (!modal.contains(e.target)) {
                modal.classList.remove('active');
                document.removeEventListener('click', closeModalHandler);
            }
        };
        setTimeout(() => {
            document.addEventListener('click', closeModalHandler);
        }, 100);
    }, 50);
}

// Show tooltip on hover
function showTooltip(event, film) {
    if (tooltip) {
        tooltip.style.display = 'block';
        tooltip.style.left = (event.clientX + 15) + 'px';
        tooltip.style.top = (event.clientY - 40) + 'px';
        tooltip.innerHTML = `🎬 <strong>${film.title}</strong><br>📅 ${film.year} | 💰 ${formatMoney(film.box_office)}<br>✨ Double-click for details`;
    } else {
        tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        document.body.appendChild(tooltip);
        tooltip.style.display = 'block';
        tooltip.style.left = (event.clientX + 15) + 'px';
        tooltip.style.top = (event.clientY - 40) + 'px';
        tooltip.innerHTML = `🎬 <strong>${film.title}</strong><br>📅 ${film.year} | 💰 ${formatMoney(film.box_office)}<br>✨ Double-click for details`;
    }
}

function hideTooltip() {
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// 3D INIT with hover and double-click
function init3D() {
    const container = document.getElementById('galaxy-container');
    container.innerHTML = '';
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030318);
    scene.fog = new THREE.FogExp2(0x030318, 0.0003);
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(defaultCameraPos.x, defaultCameraPos.y, defaultCameraPos.z);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Stars background
    const starGeo = new THREE.BufferGeometry();
    const starsPos = [];
    for (let i = 0; i < 2000; i++) { starsPos.push((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 600, (Math.random() - 0.5) * 500 - 200); }
    starGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starsPos), 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.25 })));

    const core = new THREE.Mesh(new THREE.SphereGeometry(6, 64, 64), new THREE.MeshStandardMaterial({ color: 0xffaa66, emissive: 0xff4422, emissiveIntensity: 0.8 }));
    scene.add(core);
    starGroup = new THREE.Group();
    scene.add(starGroup);

    scene.add(new THREE.AmbientLight(0x333333));
    const light = new THREE.DirectionalLight(0xffaa66, 0.8);
    light.position.set(10, 20, 30);
    scene.add(light);

    raycaster = new THREE.Raycaster();
    mouseVector = new THREE.Vector2();

    // HOVER handler - show tooltip on mouse move
    renderer.domElement.addEventListener('mousemove', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouseVector.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVector.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseVector, camera);

        const visibleStars = filmStars.filter(star => star.mesh.visible === true);
        const intersects = raycaster.intersectObjects(visibleStars.map(s => s.mesh));

        if (intersects.length > 0 && !isDragging) {
            const film = intersects[0].object.userData.film;
            if (film) {
                showTooltip(event, film);
                intersects[0].object.material.emissiveIntensity = 0.9;
                if (hoverTimeout) clearTimeout(hoverTimeout);
                hoverTimeout = setTimeout(() => {
                    filmStars.forEach(s => s.mesh.material.emissiveIntensity = 0.4);
                }, 100);
            }
        } else {
            hideTooltip();
            filmStars.forEach(s => s.mesh.material.emissiveIntensity = 0.4);
        }
    });

    // Double-click handler for film info
    renderer.domElement.addEventListener('dblclick', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouseVector.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVector.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseVector, camera);
        const intersects = raycaster.intersectObjects(filmStars.map(s => s.mesh));
        if (intersects.length > 0) {
            const film = intersects[0].object.userData.film;
            if (film) {
                showModal(film);
                intersects[0].object.material.emissiveIntensity = 1.2;
                setTimeout(() => {
                    if (intersects[0]) intersects[0].object.material.emissiveIntensity = 0.4;
                }, 300);
            }
        }
    });

    renderer.domElement.addEventListener('mousedown', (e) => { isDragging = true; lastMouseX = e.clientX; lastMouseY = e.clientY; autoRotate = false; });
    window.addEventListener('mousemove', (e) => { if (isDragging) { const dx = e.clientX - lastMouseX, dy = e.clientY - lastMouseY; targetRotationY += dx * 0.008; targetRotationX += dy * 0.006; targetRotationX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRotationX)); lastMouseX = e.clientX; lastMouseY = e.clientY; starGroup.rotation.x = targetRotationX; starGroup.rotation.y = targetRotationY; } });
    window.addEventListener('mouseup', () => { isDragging = false; setTimeout(() => { if (!isDragging) autoRotate = true; }, 2000); });

    generateStars();
    function animate() {
        requestAnimationFrame(animate);
        if (!isDragging && autoRotate) { targetRotationY += autoRotateSpeed; starGroup.rotation.x = targetRotationX; starGroup.rotation.y = targetRotationY; starGroup.rotation.z = targetRotationZ; }
        renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
}

function generateStars() {
    while (starGroup.children.length) starGroup.remove(starGroup.children[0]);
    filmStars = [];
    filmsData.forEach((film, idx) => {
        const t = (film.year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR);
        const radius = 30 + t * 60;
        const angle = t * Math.PI * 5.5 + idx * 0.02;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(angle * 2) * 3 + (Math.random() - 0.5) * 2;
        const size = 0.5 + Math.min(film.box_office / 2500000000, 0.7);
        const color = getColor(film.box_office);
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.4 });
        const star = new THREE.Mesh(geometry, material);
        star.position.set(x, y, z);
        star.userData = { film: film };
        starGroup.add(star);
        filmStars.push({ mesh: star, film: film });
    });
}

function updateByYear(year) { filmStars.forEach(star => { star.mesh.visible = star.film.year <= year; }); updateStats(year); updateNowPlaying(year); }

function updateStats(year) {
    const filtered = filmsData.filter(f => f.year <= year);
    const total = filtered.length;
    let top = null, sum = 0;
    filtered.forEach(f => {
        sum += f.box_office;
        if (!top || f.box_office > top.box_office) top = f;
    });
    document.getElementById('totalFilms').innerText = total;
    document.getElementById('topFilm').innerText = top ? top.title : '—';
    document.getElementById('totalBoxOffice').innerText = formatMoney(sum);
}

function updateNowPlaying(year) {
    const films = filmsData.filter(f => f.year === year);
    document.getElementById('nowPlayingYear').innerText = year;
    document.getElementById('nowPlayingList').innerHTML = films.map(f => `
        <div class="now-playing-item" onclick="showModalFromTitle('${f.title.replace(/'/g, "\\'")}')">
            <div style="font-weight:600;">🎬 ${f.title}</div>
            <div style="font-size:0.7rem; color:#ffaa44;">💰 ${formatMoney(f.box_office)}</div>
        </div>
    `).join('') || '<div style="color:#aaa;">No films this year</div>';
}

window.showModalFromTitle = function (title) {
    const film = filmsData.find(f => f.title === title);
    if (film) {
        showModal(film);
    }
};

function setYear(year) {
    year = Math.min(MAX_YEAR, Math.max(MIN_YEAR, year));
    currentYear = year;
    document.getElementById('currentYear').innerText = year;
    document.getElementById('yearSlider').value = year;
    const percent = ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
    document.getElementById('timelineProgress').style.width = `${percent}%`;
    updateByYear(year);
}

function initUI() {
    const slider = document.getElementById('yearSlider');
    slider.addEventListener('input', (e) => setYear(parseInt(e.target.value)));

    document.getElementById('playBtn').onclick = () => {
        if (animationInterval) clearInterval(animationInterval);
        animationInterval = setInterval(() => {
            if (currentYear < MAX_YEAR) setYear(currentYear + 1);
            else clearInterval(animationInterval);
        }, 400);
    };

    document.getElementById('resetBtn').onclick = () => setYear(MIN_YEAR);

    document.getElementById('resetViewBtn').onclick = () => {
        camera.position.set(defaultCameraPos.x, defaultCameraPos.y, defaultCameraPos.z);
        targetRotationX = targetRotationY = targetRotationZ = 0;
        starGroup.rotation.set(0, 0, 0);
        showMsg('Camera reset');
    };

    document.getElementById('clearCompareBtn').onclick = () => clearComparison();

    // SORTING BUTTONS
    document.getElementById('sortByYearBtn').onclick = () => {
        filmsData.sort((a, b) => a.year - b.year);
        generateStars();
        updateByYear(currentYear);
        showMsg('📅 Sorted by year');
    };

    document.getElementById('sortByBoxOfficeBtn').onclick = () => {
        filmsData.sort((a, b) => b.box_office - a.box_office);
        generateStars();
        updateByYear(currentYear);
        showMsg('💰 Sorted by box office');
    };

    // Search
    const searchInput = document.getElementById('searchInput');
    const searchResult = document.getElementById('searchResult');

    searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase();
        if (q.length < 2) {
            searchResult.classList.remove('active');
            return;
        }
        const matches = filmsData.filter(f => f.title.toLowerCase().includes(q)).slice(0, 6);
        if (matches.length) {
            searchResult.innerHTML = matches.map(f => `<div class="search-result-item" onclick="showModalFromTitle('${f.title.replace(/'/g, "\\'")}')">🎬 ${f.title} (${f.year})</div>`).join('');
            searchResult.classList.add('active');
        } else {
            searchResult.classList.remove('active');
        }
    });

    document.getElementById('searchBtn').onclick = () => {
        const match = filmsData.find(f => f.title.toLowerCase().includes(searchInput.value.toLowerCase()));
        if (match) showModalFromTitle(match.title);
        else showMsg('Film not found');
    };

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target)) searchResult.classList.remove('active');
    });

    setYear(2025);
}

loadData();
