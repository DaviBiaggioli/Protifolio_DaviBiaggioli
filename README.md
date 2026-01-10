# 🚀 Davi Biaggioli | Portfólio Profissional

> A interseção entre **Código**, **Educação** e **Comunicação**.

Este repositório hospeda o portfólio profissional desenvolvido com uma arquitetura **JAMstack serverless**, focada em performance, facilidade de manutenção e design limpo.

![Status](https://img.shields.io/badge/Status-Production-success)
![Design](https://img.shields.io/badge/Style-Clean%20UI-blue)
![Data](https://img.shields.io/badge/Data-Google%20Sheets-green)

---

## 🎯 Sobre o Projeto

O objetivo deste projeto não é apenas apresentar um currículo, mas demonstrar competência técnica através da própria construção do site. Ele opera sob a tese de que tecnologia, ensino e arte não competem, mas se complementam.

### Destaques Técnicos
- **No-Code CMS:** Todo o conteúdo (textos, links, projetos) é gerenciado via **Google Sheets**, sem necessidade de tocar no código para atualizações de rotina.
- **Smart Media Rendering:** Algoritmo CSS/JS que adapta imagens verticais (Stories/Reels) para cards horizontais (16:9) usando *Blur Background*, evitando cortes indesejados.
- **Performance:** Implementação de *Skeleton Loading* para UX fluida durante o fetch de dados.
- **Design System:** Interface "Clean/Paper" focada em tipografia e hierarquia visual, abandonando o "Dark Mode Gamer" tradicional para uma estética mais executiva e editorial.

---

## 🛠 Arquitetura & Stack

O projeto segue uma abordagem **Client-Side Rendering (CSR)** consumindo dados estáticos remotos.

| Componente | Tecnologia | Função |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JS (ES6+) | Renderização e lógica visual. |
| **Database** | Google Sheets | Painel administrativo (CMS) para inserção de dados. |
| **API/Parser** | PapaParse.js | Consumo e conversão de TSV (Tab-Separated Values) para JSON. |
| **Hosting** | GitHub Pages | Hospedagem estática e versionamento de imagens. |

### Fluxo de Dados
1. O usuário acessa o site.
2. O `script.js` faz três requisições assíncronas (`fetch`) para os links públicos do Google Sheets (Profile, Projects, Certifications).
3. A biblioteca `PapaParse` converte os dados brutos (TSV) em Objetos JSON.
4. O DOM é hidratado dinamicamente, substituindo os *Skeletons* pelo conteúdo real.

---

## ⚙️ Como Atualizar o Conteúdo

O sistema foi desenhado para separar **Código** de **Conteúdo**.

### 1. Atualizar Textos e Projetos
Toda a gestão é feita na planilha mestre no Google Sheets.
* **Projetos:** Adicione uma nova linha na aba `projects`. O campo `category` define onde o card aparece (`tech`, `edu`, `comm_proj`, `comm_net`).
* **Perfil:** Edite a aba `profile` para mudar Bio, E-mail ou Links.
* **Certificações:** Edite a aba `certifications`.

### 2. Adicionar Novas Imagens
Como o Google Sheets não hospeda arquivos de imagem, usamos este repositório como CDN.
1. Salve a imagem na pasta local `/assets`.
2. Faça o upload para o GitHub (via Terminal ou Drag-and-Drop).
3. Na planilha, na coluna `image`, use o caminho: `assets/nome-da-foto.jpg`.

---

## 💻 Instalação e Execução Local

Para rodar ou modificar a estrutura do código:

```bash
# 1. Clone o repositório
git clone [https://github.com/DaviBiaggioli/portfolio-2025.git](https://github.com/DaviBiaggioli/portfolio-2025.git)

# 2. Entre na pasta
cd portfolio-2025

# 3. Abra no VS Code
code .

Recomenda-se usar a extensão Live Server do VS Code para visualizar as alterações em tempo real.

📄 Licença
Este projeto é de uso pessoal e profissional de Davi Biaggioli. O código fonte da estrutura é livre para estudos, mas o conteúdo (textos e imagens) é proprietário.

Desenvolvido com foco em Engenharia, Educação e Arte.
