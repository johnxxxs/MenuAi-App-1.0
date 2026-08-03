const {
    app
} = require("./server/app");

const homeRoutes =
require("./server/routes/home");

const processRoutes =
require("./server/routes/process");

const dishInfoRoutes =
require("./server/routes/dishInfo");

const translateRoutes =
require("./server/routes/translate");

const menuApiRoutes =
require("./server/routes/api/menu");

app.use("/", homeRoutes);
app.use("/", processRoutes);
app.use("/", dishInfoRoutes);
app.use("/", translateRoutes);
app.use("/api/v1", menuApiRoutes);

app.listen(3000,"0.0.0.0",()=>{

console.log("MenuAi App running");

});

