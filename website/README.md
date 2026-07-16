website/
│
├── server.js          ← Point d'entrée, lance le serveur
├── website.js         ← Configure l'application Express
├── package.json
│
├── templates/
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   └── plant.html
│
├── assets/
│   ├── css/
│   │   ├── global.css
│   │   ├── dashboard.css
│   │   └── login.css
│   │
│   ├── js/
│   │   ├── dashboard.js
│   │   ├── login.js
│   │   └── common.js
│   │
│   └── images/
│       ├── logo.png
│       └── ...
│
├── routes/
│   ├── website.routes.js
│   └── api.routes.js
│
└── controllers/
    ├── website.controller.js
    └── api.controller.js