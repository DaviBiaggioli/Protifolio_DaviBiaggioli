// --- CONFIGURAÇÃO: LINKS DO GOOGLE SHEETS ---
const GOOGLE_SHEETS_URLS = {
    profile:  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS4c0Z-2wtg7pJ8tPEfeplaNCkVWMJGUEI1mS2ig3dcIXFtoXkBk6zX15G-Wo1ObQZF18KAhGj-r59o/pub?gid=1068168971&single=true&output=tsv",
    projects: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS4c0Z-2wtg7pJ8tPEfeplaNCkVWMJGUEI1mS2ig3dcIXFtoXkBk6zX15G-Wo1ObQZF18KAhGj-r59o/pub?gid=0&single=true&output=tsv",
    certs:    "https://docs.google.com/spreadsheets/d/e/2PACX-1vS4c0Z-2wtg7pJ8tPEfeplaNCkVWMJGUEI1mS2ig3dcIXFtoXkBk6zX15G-Wo1ObQZF18KAhGj-r59o/pub?gid=700819754&single=true&output=tsv"
};

const FALLBACK_IMAGE = 'assets/icon.png'; 

// --- ELEMENTOS ---
const modal = document.getElementById('project-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalSubtitle = document.getElementById('modal-subtitle');
const modalDesc = document.getElementById('modal-text'); 
const modalTags = document.getElementById('modal-tags');
const modalLink = document.getElementById('modal-link');
const closeModal = document.querySelector('.modal-close');

let portfolioData = {};

// --- FUNÇÕES ---
function safe(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function resolveImage(url) {
    return (url && url.trim() !== '' && url !== 'null') ? url : FALLBACK_IMAGE;
}

function fetchSheet(url) {
    return new Promise((resolve) => {
        Papa.parse(url, {
            download: true, header: true, delimiter: "\t", skipEmptyLines: true,
            complete: (res) => resolve(res.data),
            error: () => resolve([]) 
        });
    });
}

// --- CORE ---
async function loadPortfolio() {
    try {
        const [prof, proj, certs] = await Promise.all([
            fetchSheet(GOOGLE_SHEETS_URLS.profile),
            fetchSheet(GOOGLE_SHEETS_URLS.projects),
            fetchSheet(GOOGLE_SHEETS_URLS.certs)
        ]);

        if (prof && prof.length) updateProfileUI(prof[0]);

        if (proj && proj.length) {
            document.getElementById('tech-grid').innerHTML = '';
            document.getElementById('edu-timeline').innerHTML = '';
            document.getElementById('comm-projects-grid').innerHTML = '';
            document.getElementById('comm-networks-grid').innerHTML = '';

            renderTech(proj.filter(p => p.category === 'tech'));
            renderCommProjects(proj.filter(p => p.category === 'comm_proj'));
            renderEdu(proj.filter(p => p.category === 'edu'));
            renderCommNetworks(proj.filter(p => p.category === 'comm_net'));
        }

        if (certs && certs.length) {
            document.getElementById('cert-list').innerHTML = '';
            renderCerts(certs);
        }
        
        // Inicia o ScrollSpy depois que o conteúdo carregou
        initScrollSpy();

    } catch (e) { console.error("Erro:", e); }
}

function updateProfileUI(p) {
    if (!p.name) return;
    document.querySelector('.logo').innerText = p.name;
    document.title = `${p.name} | Portfólio`;
    document.querySelector('.bio').innerText = p.bio;
    const heroImg = document.getElementById('hero-profile-img');
    if (heroImg && p.image) heroImg.src = resolveImage(p.image);

    const emailLink = document.querySelector('a[href^="mailto"]');
    if(emailLink) {
        emailLink.href = `mailto:${p.email}`;
        if(emailLink.querySelector('span')) emailLink.querySelector('span').innerText = "E-mail";
    }
    if(p.linkedin) document.querySelector('a[href*="linkedin"]').href = p.linkedin;
    if(p.github) document.querySelector('a[href*="github"]').href = p.github;
}

// --- RENDERIZADORES ---

function renderTech(items) {
    const container = document.getElementById('tech-grid');
    items.forEach(item => {
        const card = document.createElement('article');
        card.className = 'tech-card';
        card.onclick = (e) => {
            if(e.target.closest('.card-link-btn')) return;
            openModal(item);
        };

        const imgSrc = resolveImage(item.image);
        const tagsHtml = item.tags ? item.tags.split(';').slice(0,3).map(t => `<span class="stack-badge">${safe(t.trim())}</span>`).join('') : '';
        const linkBtn = (item.link && item.link !== 'null') 
            ? `<a href="${item.link}" target="_blank" class="card-link-btn" title="Ver Código" style="z-index:10; font-size:1.3rem; color:var(--tech-color);"><i class="ph ph-github-logo"></i></a>` 
            : '';

        // CORREÇÃO: CSS Absolute já ajustado no style.css
        card.innerHTML = `
            <div class="smart-img-container">
                <div class="smart-img-blur" style="background-image:url('${imgSrc}');"></div>
                <img class="smart-img-front" src="${imgSrc}" onerror="this.src='${FALLBACK_IMAGE}'">
            </div>
            <div class="tech-body">
                <div>
                    <h3 class="tech-title">${safe(item.title)}</h3>
                    <p>${safe(item.summary)}</p>
                </div>
                <div style="margin-top:auto; padding-top:15px; display:flex; justify-content:space-between; align-items:center;">
                    <div class="tech-tags">${tagsHtml}</div>
                    ${linkBtn}
                </div>
            </div>`;
        container.appendChild(card);
    });
}

function renderCommProjects(items) {
    const container = document.getElementById('comm-projects-grid');
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'comm-item';
        div.onclick = () => openModal(item);
        const imgSrc = resolveImage(item.image);

        div.innerHTML = `
            <div class="smart-img-container" style="height:100%;">
                <div class="smart-img-blur" style="background-image:url('${imgSrc}');"></div>
                <img class="smart-img-front" src="${imgSrc}" onerror="this.src='${FALLBACK_IMAGE}'">
            </div> 
            <div class="comm-overlay">
                <span>${safe(item.subtitle)}</span>
                <h3>${safe(item.title)}</h3>
            </div>`;
        container.appendChild(div);
    });
}

function renderEdu(items) {
    const container = document.getElementById('edu-timeline');
    items.forEach(item => {
        const block = document.createElement('div');
        block.className = 'edu-block';
        block.onclick = () => openModal(item);
        block.innerHTML = `
            <div class="edu-visual"><img src="${resolveImage(item.image)}" onerror="this.src='${FALLBACK_IMAGE}'"></div>
            <div class="edu-content">
                <h3>${safe(item.title)}</h3>
                <span class="edu-role">${safe(item.subtitle)}</span>
                <p>${safe(item.summary)}</p>
            </div>`;
        container.appendChild(block);
    });
}

function renderCommNetworks(items) {
    const container = document.getElementById('comm-networks-grid');
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'comm-item';
        div.onclick = () => openModal(item);
        const imgSrc = resolveImage(item.image);
        div.innerHTML = `
            <div class="smart-img-container" style="height:100%;">
                <div class="smart-img-blur" style="background-image:url('${imgSrc}');"></div>
                <img class="smart-img-front" src="${imgSrc}" onerror="this.src='${FALLBACK_IMAGE}'">
            </div>
            <div class="comm-overlay">
                <span style="background:var(--comm-color);">INSTITUCIONAL</span>
                <h3 style="margin-top:5px;">${safe(item.title)}</h3>
            </div>`;
        container.appendChild(div);
    });
}

function renderCerts(items) {
    const container = document.getElementById('cert-list');
    if(!container) return;
    
    container.innerHTML = '';
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cert-item';
        
        // Verifica se tem link (ignora imagem)
        const linkHtml = (item.link && item.link !== 'null' && item.link.trim() !== '') 
            ? `<a href="${item.link}" target="_blank" class="cert-link">
                 Ver Certificado <i class="ph ph-arrow-square-out"></i>
               </a>` 
            : '';

        div.innerHTML = `
            <div>
                <h4>${safe(item.title)}</h4>
                <p>${safe(item.org)} • ${safe(item.year)}</p>
            </div>
            ${linkHtml}
        `;
        container.appendChild(div);
    });
}

// --- MODAL ---
function openModal(item) {
    modalImg.src = resolveImage(item.image);
    modalTitle.innerText = item.title;
    let sub = item.subtitle || item.role || "";
    if (item.year) sub += ` | ${item.year}`;
    modalSubtitle.innerText = sub;
    modalDesc.innerText = item.description || item.summary || "";
    modalTags.innerHTML = '';
    if (item.tags) {
        item.tags.split(';').forEach(tag => {
            if(!tag.trim()) return;
            const span = document.createElement('span');
            span.className = 'modal-tag';
            span.innerText = tag.trim();
            modalTags.appendChild(span);
        });
    }
    if (item.link && item.link !== 'null' && item.link.trim() !== '') {
        modalLink.href = item.link;
        modalLink.style.display = 'inline-block';
        modalLink.innerHTML = 'Ver Projeto <i class="ph ph-arrow-square-out"></i>';
    } else { modalLink.style.display = 'none'; }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

if(closeModal) closeModal.addEventListener('click', hideModal);
if(modal) modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideModal(); });

// --- SCROLL SPY (NAVBAR ACTIVE) ---
function initScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // -150px é um ajuste fino para o highlight mudar um pouco antes de chegar na seção
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href').includes(current)) {
                a.classList.add('active');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', loadPortfolio);
