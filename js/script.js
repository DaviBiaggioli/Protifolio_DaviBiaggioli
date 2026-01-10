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

// --- FUNÇÕES DE SEGURANÇA E AUXILIARES ---
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

// --- CORE: CARREGAMENTO ---
async function loadPortfolio() {
    try {
        const [prof, proj, certs] = await Promise.all([
            fetchSheet(GOOGLE_SHEETS_URLS.profile),
            fetchSheet(GOOGLE_SHEETS_URLS.projects),
            fetchSheet(GOOGLE_SHEETS_URLS.certs)
        ]);

        if (prof && prof.length) updateProfileUI(prof[0]);

        if (proj && proj.length) {
            // Limpa Skeletons
            document.getElementById('tech-grid').innerHTML = '';
            document.getElementById('edu-timeline').innerHTML = '';
            document.getElementById('comm-projects-grid').innerHTML = '';
            document.getElementById('comm-networks-grid').innerHTML = '';

            renderTech(proj.filter(p => p.category === 'tech'));
            renderEdu(proj.filter(p => p.category === 'edu'));
            renderCommProjects(proj.filter(p => p.category === 'comm_proj'));
            renderCommNetworks(proj.filter(p => p.category === 'comm_net'));
        }

        if (certs && certs.length) {
            document.getElementById('cert-list').innerHTML = '';
            renderCerts(certs);
        }
    } catch (e) {
        console.error("Erro ao carregar dados:", e);
    }
}

function updateProfileUI(p) {
    if (!p.name) return;
    
    document.querySelector('.logo').innerText = p.name;
    document.title = `${p.name} | Portfólio`;
    document.querySelector('.bio').innerText = p.bio; // Bio curta e direta

    // Carrega imagem de perfil da coluna 'image'
    const heroImg = document.getElementById('hero-profile-img');
    if (heroImg && p.image) {
        heroImg.src = resolveImage(p.image);
    }

    const emailLink = document.querySelector('a[href^="mailto"]');
    if(emailLink) {
        emailLink.href = `mailto:${p.email}`;
        if(emailLink.querySelector('span')) emailLink.querySelector('span').innerText = "E-mail";
    }
    
    // Atualiza links se houver colunas correspondentes no CSV (opcional)
    if(p.linkedin) document.querySelector('a[href*="linkedin"]').href = p.linkedin;
    if(p.github) document.querySelector('a[href*="github"]').href = p.github;
}

// --- RENDERIZADORES ALINHADOS À CONSTITUIÇÃO ---

function renderTech(items) {
    const container = document.getElementById('tech-grid');
    items.forEach(item => {
        const card = document.createElement('article');
        card.className = 'tech-card';
        
        // Abre modal SOMENTE se não clicar nos botões de link
        card.onclick = (e) => {
            if(e.target.closest('.card-link-btn')) return;
            openModal(item);
        };

        const imgSrc = resolveImage(item.image);
        const tagsHtml = item.tags ? item.tags.split(';').slice(0,3).map(t => `<span class="stack-badge">${safe(t.trim())}</span>`).join('') : '';
        
        // REGRA 5: Link visível no card
        const linkBtn = (item.link && item.link !== 'null') 
            ? `<a href="${item.link}" target="_blank" class="card-link-btn" title="Ver Código/Projeto" style="z-index:10; font-size:1.2rem; color:var(--tech-color);"><i class="ph ph-github-logo"></i></a>` 
            : '';

        card.innerHTML = `
            <div class="tech-img">
                <img src="${imgSrc}" onerror="this.src='${FALLBACK_IMAGE}'">
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

        // REGRA 8: Blur Background para imagens verticais
        div.innerHTML = `
            <div class="comm-img-placeholder" style="background:#000; position:relative; overflow:hidden; width:100%; height:100%;">
                <div style="position:absolute; inset:0; background-image:url('${imgSrc}'); background-size:cover; filter:blur(15px); opacity:0.6;"></div>
                <img src="${imgSrc}" style="position:relative; width:100%; height:100%; object-fit:contain; z-index:1;" onerror="this.src='${FALLBACK_IMAGE}'">
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
            <div class="comm-img-placeholder"><img src="${imgSrc}" onerror="this.src='${FALLBACK_IMAGE}'"></div> 
            <div class="comm-overlay">
                <span style="color:#fff;background:var(--comm-color);padding:2px 8px;border-radius:4px;font-size:0.7rem;">INSTITUCIONAL</span>
                <h3 style="margin-top:5px;">${safe(item.title)}</h3>
            </div>`;
        container.appendChild(div);
    });
}

function renderCerts(items) {
    const container = document.getElementById('cert-list');
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cert-item';
        div.innerHTML = `<h4>${safe(item.title)}</h4><p>${safe(item.org)} • ${safe(item.year)}</p>`;
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
    } else {
        modalLink.style.display = 'none';
    }

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

// Inicializa
document.addEventListener('DOMContentLoaded', loadPortfolio);