import ignore from "rollup-plugin-ignore";
import nodeResolve from "rollup-plugin-node-resolve";
import { external, globals } from "./rollup-constants";

export default {
    banner: "/*MIT license https://github.com/cartant/firebase-thermite/blob/master/LICENSE*/",
    dest: "bundles/firebase-thermite.umd.js",
    entry: "dist/index.js",
    external: external,
    format: "umd",
    globals: Object.assign({}, globals),
    moduleName: "firebaseThermite",
    plugins: [
        ignore(["firebase"]),
        nodeResolve({})
    ]
}
