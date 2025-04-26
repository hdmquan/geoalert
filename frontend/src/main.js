import { createApp } from "vue"
import "./assets/style.css"
import App from "./App.vue"
import VueSmoothScroll from "vue3-smooth-scroll"
import router from "./router"

import MainButton from "./components/MainButton.vue"
import LinkButton from "./components/LinkButton.vue"

let app = createApp(App)

app.use(VueSmoothScroll)
app.use(router)

app.component("MainButton", MainButton)
app.component("LinkButton", LinkButton)

app.mount("#app")
