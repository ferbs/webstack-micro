module.exports = {
    globals: {
        "ts-jest": {
            tsConfig: "./tsconfig.json",
            "diagnostics": true
        }
    },
    moduleFileExtensions: [
        "ts",
        "js"
    ],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    testMatch: [
        "**/test/**/*.test.(ts|js)"
    ],
    testEnvironment: "node",
    moduleNameMapper: {
        "^src/(.*)$": "<rootDir>/src/$1"
    },
};
