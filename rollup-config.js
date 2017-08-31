import nodeResolve from "rollup-plugin-node-resolve";
import { external, globals } from "./rollup-constants";

export default {
    banner: "/*MIT license https://github.com/cartant/firebase-thermite/blob/master/LICENSE*/",
    external: external,
    globals: Object.assign({}, globals),
    input: "dist/index.js",
    name: "firebaseThermite",
    output: {
        file: "bundles/firebase-thermite.umd.js",
        format: "umd"
    },
    plugins: [nodeResolve({})]
}
