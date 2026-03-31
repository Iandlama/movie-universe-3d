
let filmsData = [];
let filmStars = [];
let currentYear = 2025;
let animationInterval = null;

// THREE.JS
let scene, camera, renderer, starGroup;
let raycaster, mouseVector;
let isDragging = false;
let lastMouseX = 0, lastMouseY = 0;

// Вращение
let targetRotationX = 0, targetRotationY = 0, targetRotationZ = 0;
let currentRotationX = 0, currentRotationY = 0, currentRotationZ = 0;
let autoRotate = true;
let autoRotateSpeed = 0.002;
let tooltip = null;

const MIN_YEAR = 1997;
const MAX_YEAR = 2025;

// LOAD DATA
async function loadData() {
    try {
        const response = await fetch('films.json');
        const data = await response.json();
        processData(data);
    } catch (e) {
        const fallback = [
            { "title": "Titanic", "release_year": 1997, "director": "James Cameron", "box_office": 2257906828, "country": "United States" },
            { "title": "The Lord of the Rings: Return of the King", "release_year": 2003, "director": "Peter Jackson", "box_office": 1147997407, "country": "New Zealand; USA" },
            { "title": "Avatar", "release_year": 2009, "director": "James Cameron", "box_office": 2923710708, "country": "USA; UK" },
            { "title": "Harry Potter 7.2", "release_year": 2011, "director": "David Yates", "box_office": 1342139727, "country": "UK; USA" },
            { "title": "The Avengers", "release_year": 2012, "director": "Joss Whedon", "box_office": 1518815515, "country": "USA" },
            { "title": "Frozen", "release_year": 2013, "director": "Chris Buck", "box_office": 1290000000, "country": "USA" },
            { "title": "Star Wars: Force Awakens", "release_year": 2015, "director": "J.J. Abrams", "box_office": 2068223624, "country": "USA" },
            { "title": "Jurassic World", "release_year": 2015, "director": "Colin Trevorrow", "box_office": 1671537444, "country": "USA" },
            { "title": "Avengers: Infinity War", "release_year": 2018, "director": "Russo Bros", "box_office": 2048359754, "country": "USA" },
            { "title": "Avengers: Endgame", "release_year": 2019, "director": "Russo Bros", "box_office": 2797501328, "country": "USA" },
            { "title": "The Lion King", "release_year": 2019, "director": "Jon Favreau", "box_office": 1656943394, "country": "USA" },
            { "title": "Spider-Man: No Way Home", "release_year": 2021, "director": "Jon Watts", "box_office": 1922598800, "country": "USA" },
            { "title": "Avatar: Way of Water", "release_year": 2022, "director": "James Cameron", "box_office": 2334484620, "country": "USA" },
            { "title": "Top Gun: Maverick", "release_year": 2022, "director": "Joseph Kosinski", "box_office": 1495696292, "country": "USA" },
            { "title": "Barbie", "release_year": 2023, "director": "Greta Gerwig", "box_office": 1447138421, "country": "USA; UK" },
            { "title": "Inside Out 2", "release_year": 2024, "director": "Kelsey Mann", "box_office": 1698863816, "country": "USA" },
            { "title": "Deadpool & Wolverine", "release_year": 2024, "director": "Shawn Levy", "box_office": 1338073645, "country": "USA" },
            { "title": "Ne Zha 2", "release_year": 2025, "director": "Jiaozi", "box_office": 2215690000, "country": "China" },
            { "title": "Avatar: Fire and Ash", "release_year": 2025, "director": "James Cameron", "box_office": 1485690293, "country": "USA" },
            { "title": "Zootopia 2", "release_year": 2025, "director": "Jared Bush", "box_office": 1866590453, "country": "USA" }
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
        countries: f.country ? f.country.split(/[;,]/).map(c => c.trim()) : ['Unknown']
    }));
    document.getElementById('loading').style.display = 'none';
    init3D();
    initUI();
    updateByYear(currentYear);
    showMsg('✨ Ready! Drag mouse to rotate in 3D • Auto-rotate enabled');
}

function showMsg(msg) {
    const div = document.createElement('div');
    div.className = 'notification';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2000);
}

function getColor(bo) {
    if (bo >= 2000000000) return 0xffd700;
    if (bo >= 1500000000) return 0xffaa44;
    if (bo >= 1000000000) return 0xff8844;
    if (bo >= 500000000) return 0xff6644;
    return 0xff4444;
}

function formatMoney(v) {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    return `$${v.toLocaleString()}`;
}

function init3D() {
    const container = document.getElementById('galaxy-container');
    container.innerHTML = '';

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030318);
    scene.fog = new THREE.FogExp2(0x030318, 0.0003);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 20, 160);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Stars background
    const starGeo = new THREE.BufferGeometry();
    const starsPos = [];
    for (let i = 0; i < 3000; i++) {
        starsPos.push((Math.random() - 0.5) * 1000);
        starsPos.push((Math.random() - 0.5) * 600);
        starsPos.push((Math.random() - 0.5) * 500 - 200);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starsPos), 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.25 })));

    // Galaxy center
    const core = new THREE.Mesh(new THREE.SphereGeometry(6, 64, 64), new THREE.MeshStandardMaterial({ color: 0xffaa66, emissive: 0xff4422, emissiveIntensity: 0.8 }));
    scene.add(core);

    starGroup = new THREE.Group();
    scene.add(starGroup);

    // Lights
    scene.add(new THREE.AmbientLight(0x333333));
    const light = new THREE.DirectionalLight(0xffaa66, 0.8);
    light.position.set(10, 20, 30);
    scene.add(light);

    const backLight = new THREE.PointLight(0x4466ff, 0.3);
    backLight.position.set(-15, 10, -20);
    scene.add(backLight);

    raycaster = new THREE.Raycaster();
    mouseVector = new THREE.Vector2();

    // Events - ПОДДЕРЖКА ВРАЩЕНИЯ ПО 3 ОСЯМ
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('mousemove', onHover);

    renderer.domElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        autoRotate = false; // Отключаем авто-вращение при перетаскивании
    });

    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;

            // Вращение по Y (горизонтальное) и по X (вертикальное)
            targetRotationY += deltaX * 0.008;
            targetRotationX += deltaY * 0.006;

            // Ограничиваем вращение по X, чтобы не переворачивать слишком сильно
            targetRotationX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRotationX));

            lastMouseX = e.clientX;
            lastMouseY = e.clientY;

            currentRotationX = targetRotationX;
            currentRotationY = targetRotationY;
            currentRotationZ = targetRotationZ;

            starGroup.rotation.x = currentRotationX;
            starGroup.rotation.y = currentRotationY;
            starGroup.rotation.z = currentRotationZ;
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        // Через 3 секунды включаем авто-вращение снова
        setTimeout(() => {
            if (!isDragging) {
                autoRotate = true;
            }
        }, 3000);
    });

    // Поддержка touch для мобильных
    renderer.domElement.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
        autoRotate = false;
    });

    window.addEventListener('touchmove', (e) => {
        if (isDragging) {
            const deltaX = e.touches[0].clientX - lastMouseX;
            const deltaY = e.touches[0].clientY - lastMouseY;
            targetRotationY += deltaX * 0.008;
            targetRotationX += deltaY * 0.006;
            targetRotationX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRotationX));
            lastMouseX = e.touches[0].clientX;
            lastMouseY = e.touches[0].clientY;
            currentRotationX = targetRotationX;
            currentRotationY = targetRotationY;
            starGroup.rotation.x = currentRotationX;
            starGroup.rotation.y = currentRotationY;
        }
    });

    window.addEventListener('touchend', () => {
        isDragging = false;
        setTimeout(() => {
            if (!isDragging) autoRotate = true;
        }, 3000);
    });

    // Animation - с поддержкой авто-вращения по всем осям
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.016;

        if (!isDragging && autoRotate) {
            // Плавное авто-вращение по Y и легкое покачивание по X и Z
            targetRotationY += autoRotateSpeed;
            // Небольшое волнообразное движение по X и Z для эффекта "дрейфа"
            targetRotationX = Math.sin(time * 0.2) * 0.15;
            targetRotationZ = Math.cos(time * 0.25) * 0.08;

            currentRotationX = targetRotationX;
            currentRotationY = targetRotationY;
            currentRotationZ = targetRotationZ;

            starGroup.rotation.x = currentRotationX;
            starGroup.rotation.y = currentRotationY;
            starGroup.rotation.z = currentRotationZ;
        }

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    generateStars();

    // Добавляем информационную подсказку о 3D вращении
    setTimeout(() => {
        showMsg('🖱️ Drag mouse to rotate galaxy in 3D!');
    }, 1500);
}

function generateStars() {
    while (starGroup.children.length) starGroup.remove(starGroup.children[0]);
    filmStars = [];

    const sorted = [...filmsData].sort((a, b) => a.year - b.year);

    sorted.forEach((film, idx) => {
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

function onHover(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouseVector.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVector.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouseVector, camera);
    const intersects = raycaster.intersectObjects(filmStars.map(s => s.mesh));

    if (intersects.length > 0 && !isDragging) {
        const film = intersects[0].object.userData.film;
        if (film) {
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                document.body.appendChild(tooltip);
            }
            tooltip.style.display = 'block';
            tooltip.style.left = (event.clientX + 15) + 'px';
            tooltip.style.top = (event.clientY - 35) + 'px';
            tooltip.innerHTML = `🎬 ${film.title}<br>📅 ${film.year} | 💰 ${formatMoney(film.box_office)}`;
            intersects[0].object.material.emissiveIntensity = 0.9;
            setTimeout(() => {
                if (intersects[0]) intersects[0].object.material.emissiveIntensity = 0.4;
            }, 150);
            return;
        }
    }
    if (tooltip) tooltip.style.display = 'none';
    filmStars.forEach(s => s.mesh.material.emissiveIntensity = 0.4);
}

function onClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouseVector.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVector.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouseVector, camera);
    const intersects = raycaster.intersectObjects(filmStars.map(s => s.mesh));
    if (intersects.length > 0) {
        const film = intersects[0].object.userData.film;
        if (film) showModal(film);
    }
}

function showModal(film) {
    const modal = document.getElementById('filmModal');
    document.getElementById('modalTitle').innerHTML = `🎬 ${film.title}`;
    document.getElementById('modalYear').innerText = film.year;
    document.getElementById('modalDirector').innerText = film.director;
    document.getElementById('modalBoxOffice').innerText = formatMoney(film.box_office);
    document.getElementById('modalCountry').innerText = film.countries.join(', ');
    modal.classList.add('active');

    const close = () => {
        modal.classList.remove('active');
        document.removeEventListener('click', close);
    };
    setTimeout(() => {
        document.addEventListener('click', function handler(e) {
            if (!modal.contains(e.target)) close();
        });
    }, 100);
}

function updateByYear(year) {
    filmStars.forEach(star => {
        star.mesh.visible = star.film.year <= year;
    });
    updateStats(year);
    updateNowPlaying(year);
}

function updateStats(year) {
    const filtered = filmsData.filter(f => f.year <= year);
    const total = filtered.length;
    let topFilm = null, totalBox = 0;
    filtered.forEach(f => {
        totalBox += f.box_office;
        if (!topFilm || f.box_office > topFilm.box_office) topFilm = f;
    });
    document.getElementById('totalFilms').innerText = total;
    document.getElementById('topFilm').innerText = topFilm ? topFilm.title : '—';
    document.getElementById('totalBoxOffice').innerText = formatMoney(totalBox);
}

function updateNowPlaying(year) {
    const films = filmsData.filter(f => f.year === year).sort((a, b) => b.box_office - a.box_office);
    document.getElementById('nowPlayingYear').innerText = year;
    const html = films.map(f => `
            <div class="now-playing-item" onclick="focusFilm('${f.title.replace(/'/g, "\\'")}')">
                <div style="font-weight:600;">🎬 ${f.title}</div>
                <div style="font-size:0.7rem; color:#ffaa44;">💰 ${formatMoney(f.box_office)}</div>
            </div>
        `).join('');
    document.getElementById('nowPlayingList').innerHTML = html || '<div style="color:#aaa;">No films this year</div>';
}

window.focusFilm = function (title) {
    const film = filmsData.find(f => f.title === title);
    if (film) {
        const star = filmStars.find(s => s.film.title === title);
        if (star && star.mesh) {
            const pos = star.mesh.position.clone();
            camera.position.set(pos.x * 1.2, pos.y + 8, pos.z + 35);
            camera.lookAt(pos);
            showMsg(`🎯 ${film.title}`);
            setTimeout(() => showModal(film), 300);
        }
    }
};

function setYear(year) {
    if (year < MIN_YEAR) year = MIN_YEAR;
    if (year > MAX_YEAR) year = MAX_YEAR;
    currentYear = year;
    document.getElementById('currentYear').innerText = year;
    document.getElementById('yearSlider').value = year;
    const percent = ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
    document.getElementById('timelineProgress').style.width = `${percent}%`;
    updateByYear(year);
}

function playTimeline() {
    if (animationInterval) clearInterval(animationInterval);
    animationInterval = setInterval(() => {
        if (currentYear < MAX_YEAR) setYear(currentYear + 1);
        else clearInterval(animationInterval);
    }, 450);
}

function initUI() {
    const slider = document.getElementById('yearSlider');
    const yearDisplay = document.getElementById('currentYear');
    const progressBar = document.getElementById('timelineProgress');

    slider.value = currentYear;
    yearDisplay.innerText = currentYear;

    // ПЛАВНЫЙ СЛАЙДЕР
    let updatePending = false;

    slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        yearDisplay.innerText = val;
        const percent = ((val - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
        progressBar.style.width = `${percent}%`;

        if (!updatePending) {
            updatePending = true;
            requestAnimationFrame(() => {
                setYear(val);
                updatePending = false;
            });
        } else {
            currentYear = val;
        }
    });

    document.getElementById('playBtn').onclick = () => {
        if (animationInterval) clearInterval(animationInterval);
        animationInterval = setInterval(() => {
            if (currentYear < MAX_YEAR) setYear(currentYear + 1);
            else clearInterval(animationInterval);
        }, 400);
    };

    document.getElementById('resetBtn').onclick = () => setYear(MIN_YEAR);
    document.getElementById('closeModalBtn').onclick = () => {
        document.getElementById('filmModal').classList.remove('active');
    };

    // Search
    const searchInput = document.getElementById('searchInput');
    const searchResult = document.getElementById('searchResult');
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        if (query.length < 2) { searchResult.classList.remove('active'); return; }
        const matches = filmsData.filter(f => f.title.toLowerCase().includes(query)).slice(0, 6);
        if (matches.length) {
            searchResult.innerHTML = matches.map(f => `<div class="search-result-item" onclick="focusFilm('${f.title.replace(/'/g, "\\'")}')">🎬 ${f.title} (${f.year})</div>`).join('');
            searchResult.classList.add('active');
        } else searchResult.classList.remove('active');
    });
    document.getElementById('searchBtn').onclick = () => {
        const match = filmsData.find(f => f.title.toLowerCase().includes(searchInput.value.toLowerCase()));
        if (match) focusFilm(match.title);
        else showMsg('Film not found');
    };
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target)) searchResult.classList.remove('active');
    });

    setYear(currentYear);
}

loadData();
