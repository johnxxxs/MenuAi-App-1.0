// ==================================================
// MENUAI APP 1.1
// ARCHIVO PRINCIPAL DE ARRANQUE
// ==================================================

// Cargar aplicación Express
const { app } = require("./server/app");


// ==================================================
// RUTAS
// ==================================================

const homeRoutes =
    require("./server/routes/home");

const processRoutes =
    require("./server/routes/process");

const dishInfoRoutes =
    require("./server/routes/dishInfo");

const translateRoutes =
    require("./server/routes/translate");


// ==================================================
// API MENUAI V1
// ==================================================

const menuApiRoutes =
    require("./server/routes/api/menu");

const translateApiRoutes =
    require("./server/routes/api/translate");

const importMenuApiRoutes =
    require("./server/routes/api/import-menu");


// ==================================================
// CONFIGURACIÓN DE RUTAS
// ==================================================

app.use("/", homeRoutes);

app.use("/", processRoutes);

app.use("/", dishInfoRoutes);

app.use("/", translateRoutes);


// ==================================================
// API MENUAI PARA OTRAS APLICACIONES
// ==================================================

app.use(
    "/api/v1",
    menuApiRoutes
);

app.use(
    "/api/v1",
    translateApiRoutes
);

app.use(
    "/api/v1",
    importMenuApiRoutes
);


// ==================================================
// CONFIGURACIÓN HOSTINGER / PROXY
// ==================================================

app.set("trust proxy", 1);


// Hostinger proporciona dinámicamente process.env.PORT.
// En desarrollo local utilizará 3000.

const PORT =
    process.env.PORT || 3000;


// ==================================================
// ARRANQUE DEL SERVIDOR
// ==================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "========================================"
        );

        console.log(
            "MenuAI App running"
        );

        console.log(
            `PORT: ${PORT}`
        );

        console.log(
            `Environment: ${process.env.NODE_ENV || "development"}`
        );

        console.log(
            "API Menu: /api/v1/menu"
        );

        console.log(
            "API Translate: /api/v1/translate"
        );

        console.log(
            "API Import Menu: /api/v1/import-menu"
        );

        console.log(
            "========================================"
        );

    }
);