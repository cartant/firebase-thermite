import ignore from "rollup-plugin-ignore";
import nodeResolve from "rollup-plugin-node-resolve";
import { external, globals } from "./rollup-constants";

export default {
    dest: "bundles/firebase-thermite-test.umd.js",
    entry: "build/index-spec.js",
    external: [
        "chai",
        ...external
    ],
    format: "umd",
    globals: Object.assign({
        "chai": "chai"
    }, globals),
    intro: `
        var FIREBASE_API_KEY = "${process.env.FIREBASE_API_KEY}";
        var FIREBASE_AUTH_DOMAIN = "${process.env.FIREBASE_AUTH_DOMAIN}";
        var FIREBASE_DATABASE_URL = "${process.env.FIREBASE_DATABASE_URL}";
        var FIREBASE_STORAGE_BUCKET = "${process.env.FIREBASE_STORAGE_BUCKET}";
        var FIREBASE_USER_EMAIL = "${process.env.FIREBASE_USER_EMAIL}";
        var FIREBASE_USER_PASSWORD = "${process.env.FIREBASE_USER_PASSWORD}";
    `,
    plugins: [
        ignore(["firebase"]),
        nodeResolve({})
    ]
}
