<div align="center">
    <h1>Qdrant Content Recommendation</h1>
    <p>
        <strong>Intelligent content recommendation system powered by Twelve Labs and Qdrant vector database for personalized content discovery.</strong>
    </p>
</div>

## Overview

Content Recommendation is an open source platform that makes use of vector similarity search to provide highly relevant content recommendations. The system uses Twelve Labs, for embedding creation and Qdrant, a vector similarity search engine, to store and retrieve content based on semantic similarity rather than just keywords. This enables more intuitive and personalized content discovery for users.

## Prerequisites

- Python 3.9+
- Flask
- Twelve Labs (Generate API KEY from [Twelve Labs Playground](https://www.twelvelabs.io/))
- Qdrant Cloud (Generate the Credentials [Qdrant Cloud](https://cloud.qdrant.io/))

## Features

1. Video Content are processed and converted into vector embeddings
2. Embeddings are stored in Qdrant vector database
3. Qdrant performs efficient similarity search to find relevant content
4. Top matches are returned as personalized recommendations

## Core Workflow Architecture

![Core Workflow Architecture](https://github.com/Hrishikesh332/Twelve-Labs-Content-Recommendation/blob/master/backend-api/src/Content%20Reccomendation%20Core%20Architecture.png)


## File Strcuture

```
├── backend-api
    ├── .gitignore
    ├── app.py
    ├── notebooks
    │   └── Video_Content_Embedding_Creation_and_Qdrant.ipynb
    ├── requirements.txt
    └── src
    │   └── Content Reccomendation Core Architecture.png
└── www.content-reccomender.vercel.app
    ├── .gitignore
    ├── README.md
    ├── app
        ├── explore
        │   ├── background.png
        │   ├── loading.tsx
        │   └── page.tsx
        ├── favicon.ico
        ├── global.css
        ├── globals.css
        ├── layout.tsx
        └── page.tsx
    ├── components.json
    ├── components
        ├── navbar.tsx
        ├── optimized-video-grid.tsx
        ├── style-selector.tsx
        ├── ui
        │   ├── button.tsx
        │   ├── drawer.tsx
        │   ├── input.tsx
        │   └── select.tsx
        ├── video-grid.tsx
        └── video-player.tsx
    ├── eslint.config.mjs
    ├── lib
        ├── api.ts
        └── utils.ts
    ├── next.config.ts
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.mjs
    ├── public
        ├── file.svg
        ├── globe.svg
        ├── next.svg
        ├── vercel.svg
        └── window.svg
    ├── tailwind.config.ts
    └── tsconfig.json
├── README.md
```

## API Key Setup

### Qdrant Setup

1. You can either use Qdrant Cloud or run Qdrant locally
   - For Qdrant Cloud - Create an account at [Qdrant Cloud](https://cloud.qdrant.io/)

2. Generate the API KEY from the [Twelve Labs Playground](https://www.twelvelabs.io/)

3. Configure your connection in the `.env` file:

```
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
API_KEY=your_twelvelabs_api_key
```



## Installation

Clone the repository
```
git clone https://github.com/Hrishikesh332/Twelve-Labs-Content-Recommendation-.git
```

For Backend - 

1. To the Backend Directory

```
cd backend-api
```

2. Install dependencies
```
pip install -r requirements.txt
```

3. Configure environment variables -

```
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
API_KEY=your_twelvelabs_api_key
```

4. Run the backend application -

```
python app.py
```

5. Navigate to `http://localhost:5000` in your browse
    

For Frontend 

1. To the Frontend Directory

```
cd www.content-reccomender.vercel.app
```

2. Setup the Environment

```
npm install
```

3. Run the application - 

```
npm run dev
```

4. Navigate to `http://localhost:3000` in your browse

## Queries

For any doubts or help you can reach out to me via hrishikesh3321@gmail.com or ask in the [Discord Channel](https://discord.com/invite/Sh6BRfakJa)

