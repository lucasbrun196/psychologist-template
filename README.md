# psychologist-template

Landing page demonstrativa para psicólogas — persona fictícia **Helena Duarte**, psicóloga clínica em Terapia Cognitivo-Comportamental (ansiedade, estresse e burnout), com atendimento presencial em Pinheiros (SP) e online.

Site estático, sem build: HTML + CSS + JavaScript puro.

```
index.html
css/styles.css
js/main.js
assets/img/
```

## Rodar localmente

```bash
python -m http.server 8080
```

Depois abra http://localhost:8080.

## Personalizar para uma cliente

- **Nome, endereço, e-mail e WhatsApp**: buscar e substituir `Helena Duarte`, `Rua dos Pinheiros`, `helenaduarte.psi.br` e `5511900000000` (aparece em `index.html` e `js/main.js`).
- **Fotos**: substituir os arquivos em `assets/img/`.
- **Cores e fontes**: variáveis no topo de `css/styles.css` (`:root`).

## Efeitos

Loader de entrada, títulos revelados linha a linha, imagens com revelação por máscara e parallax, reveal on scroll, barra de progresso, header que encolhe e se esconde ao rolar, faixa marquee, cards com tilt 3D e spotlight no hover, botões magnéticos, linha do tempo que preenche com o scroll, frase revelada palavra por palavra, FAQ em acordeão, formulário que monta a mensagem no WhatsApp e botão flutuante. Tudo respeita `prefers-reduced-motion`.

## Publicidade em Psicologia

O conteúdo foi escrito tendo em mente as orientações do CFP para divulgação profissional (vale revisar com cada cliente): sem depoimentos de pacientes, sem promessa de resultados e sem divulgação de preços.

## Deploy na Vercel

O projeto é estático e não precisa de build. Na Vercel: **Add New → Project**, importe este repositório do GitHub e mantenha o Framework Preset em **Other**, sem Build Command e sem Output Directory. O `vercel.json` já configura cache e cabeçalhos de segurança.

> **Importante:** CSS e JS são cacheados por 1 ano. Ao alterar `css/styles.css` ou `js/main.js`, aumente o número em `?v=` nas duas tags do `index.html` (ex.: `?v=4` → `?v=5`) para os visitantes receberem a versão nova.
