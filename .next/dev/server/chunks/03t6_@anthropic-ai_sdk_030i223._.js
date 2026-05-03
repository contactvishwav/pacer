module.exports = [
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/tslib.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__classPrivateFieldGet",
    ()=>__classPrivateFieldGet,
    "__classPrivateFieldSet",
    ()=>__classPrivateFieldSet
]);
function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
;
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/uuid.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
/**
 * https://stackoverflow.com/a/2117523
 */ __turbopack_context__.s([
    "uuid4",
    ()=>uuid4
]);
let uuid4 = function() {
    const { crypto } = globalThis;
    if (crypto?.randomUUID) {
        uuid4 = crypto.randomUUID.bind(crypto);
        return crypto.randomUUID();
    }
    const u8 = new Uint8Array(1);
    const randomByte = crypto ? ()=>crypto.getRandomValues(u8)[0] : ()=>Math.random() * 0xff & 0xff;
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c)=>(+c ^ randomByte() & 15 >> +c / 4).toString(16));
};
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/errors.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
__turbopack_context__.s([
    "castToError",
    ()=>castToError,
    "isAbortError",
    ()=>isAbortError
]);
function isAbortError(err) {
    return typeof err === 'object' && err !== null && // Spec-compliant fetch implementations
    ('name' in err && err.name === 'AbortError' || 'message' in err && String(err.message).includes('FetchRequestCanceledException'));
}
const castToError = (err)=>{
    if (err instanceof Error) return err;
    if (typeof err === 'object' && err !== null) {
        try {
            if (Object.prototype.toString.call(err) === '[object Error]') {
                // @ts-ignore - not all envs have native support for cause yet
                const error = new Error(err.message, err.cause ? {
                    cause: err.cause
                } : {});
                if (err.stack) error.stack = err.stack;
                // @ts-ignore - not all envs have native support for cause yet
                if (err.cause && !error.cause) error.cause = err.cause;
                if (err.name) error.name = err.name;
                return error;
            }
        } catch  {}
        try {
            return new Error(JSON.stringify(err));
        } catch  {}
    }
    return new Error(err);
};
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/error.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APIConnectionError",
    ()=>APIConnectionError,
    "APIConnectionTimeoutError",
    ()=>APIConnectionTimeoutError,
    "APIError",
    ()=>APIError,
    "APIUserAbortError",
    ()=>APIUserAbortError,
    "AnthropicError",
    ()=>AnthropicError,
    "AuthenticationError",
    ()=>AuthenticationError,
    "BadRequestError",
    ()=>BadRequestError,
    "ConflictError",
    ()=>ConflictError,
    "InternalServerError",
    ()=>InternalServerError,
    "NotFoundError",
    ()=>NotFoundError,
    "PermissionDeniedError",
    ()=>PermissionDeniedError,
    "RateLimitError",
    ()=>RateLimitError,
    "UnprocessableEntityError",
    ()=>UnprocessableEntityError
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$errors$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/errors.mjs [app-route] (ecmascript)");
;
class AnthropicError extends Error {
}
class APIError extends AnthropicError {
    constructor(status, error, message, headers, type){
        super(`${APIError.makeMessage(status, error, message)}`);
        this.status = status;
        this.headers = headers;
        this.requestID = headers?.get('request-id');
        this.error = error;
        this.type = type ?? null;
    }
    static makeMessage(status, error, message) {
        const msg = error?.message ? typeof error.message === 'string' ? error.message : JSON.stringify(error.message) : error ? JSON.stringify(error) : message;
        if (status && msg) {
            return `${status} ${msg}`;
        }
        if (status) {
            return `${status} status code (no body)`;
        }
        if (msg) {
            return msg;
        }
        return '(no status code or body)';
    }
    static generate(status, errorResponse, message, headers) {
        if (!status || !headers) {
            return new APIConnectionError({
                message,
                cause: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$errors$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["castToError"])(errorResponse)
            });
        }
        const error = errorResponse;
        const type = error?.['error']?.['type'];
        if (status === 400) {
            return new BadRequestError(status, error, message, headers, type);
        }
        if (status === 401) {
            return new AuthenticationError(status, error, message, headers, type);
        }
        if (status === 403) {
            return new PermissionDeniedError(status, error, message, headers, type);
        }
        if (status === 404) {
            return new NotFoundError(status, error, message, headers, type);
        }
        if (status === 409) {
            return new ConflictError(status, error, message, headers, type);
        }
        if (status === 422) {
            return new UnprocessableEntityError(status, error, message, headers, type);
        }
        if (status === 429) {
            return new RateLimitError(status, error, message, headers, type);
        }
        if (status >= 500) {
            return new InternalServerError(status, error, message, headers, type);
        }
        return new APIError(status, error, message, headers, type);
    }
}
class APIUserAbortError extends APIError {
    constructor({ message } = {}){
        super(undefined, undefined, message || 'Request was aborted.', undefined);
    }
}
class APIConnectionError extends APIError {
    constructor({ message, cause }){
        super(undefined, undefined, message || 'Connection error.', undefined);
        // in some environments the 'cause' property is already declared
        // @ts-ignore
        if (cause) this.cause = cause;
    }
}
class APIConnectionTimeoutError extends APIConnectionError {
    constructor({ message } = {}){
        super({
            message: message ?? 'Request timed out.'
        });
    }
}
class BadRequestError extends APIError {
}
class AuthenticationError extends APIError {
}
class PermissionDeniedError extends APIError {
}
class NotFoundError extends APIError {
}
class ConflictError extends APIError {
}
class UnprocessableEntityError extends APIError {
}
class RateLimitError extends APIError {
}
class InternalServerError extends APIError {
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/values.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "coerceBoolean",
    ()=>coerceBoolean,
    "coerceFloat",
    ()=>coerceFloat,
    "coerceInteger",
    ()=>coerceInteger,
    "ensurePresent",
    ()=>ensurePresent,
    "hasOwn",
    ()=>hasOwn,
    "isAbsoluteURL",
    ()=>isAbsoluteURL,
    "isArray",
    ()=>isArray,
    "isEmptyObj",
    ()=>isEmptyObj,
    "isObj",
    ()=>isObj,
    "isReadonlyArray",
    ()=>isReadonlyArray,
    "maybeCoerceBoolean",
    ()=>maybeCoerceBoolean,
    "maybeCoerceFloat",
    ()=>maybeCoerceFloat,
    "maybeCoerceInteger",
    ()=>maybeCoerceInteger,
    "maybeObj",
    ()=>maybeObj,
    "pop",
    ()=>pop,
    "safeJSON",
    ()=>safeJSON,
    "validatePositiveInteger",
    ()=>validatePositiveInteger
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/error.mjs [app-route] (ecmascript)");
;
// https://url.spec.whatwg.org/#url-scheme-string
const startsWithSchemeRegexp = /^[a-z][a-z0-9+.-]*:/i;
const isAbsoluteURL = (url)=>{
    return startsWithSchemeRegexp.test(url);
};
let isArray = (val)=>(isArray = Array.isArray, isArray(val));
let isReadonlyArray = isArray;
function maybeObj(x) {
    if (typeof x !== 'object') {
        return {};
    }
    return x ?? {};
}
function isEmptyObj(obj) {
    if (!obj) return true;
    for(const _k in obj)return false;
    return true;
}
function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
function isObj(obj) {
    return obj != null && typeof obj === 'object' && !Array.isArray(obj);
}
const ensurePresent = (value)=>{
    if (value == null) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`Expected a value to be given but received ${value} instead.`);
    }
    return value;
};
const validatePositiveInteger = (name, n)=>{
    if (typeof n !== 'number' || !Number.isInteger(n)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`${name} must be an integer`);
    }
    if (n < 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`${name} must be a positive integer`);
    }
    return n;
};
const coerceInteger = (value)=>{
    if (typeof value === 'number') return Math.round(value);
    if (typeof value === 'string') return parseInt(value, 10);
    throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`Could not coerce ${value} (type: ${typeof value}) into a number`);
};
const coerceFloat = (value)=>{
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value);
    throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`Could not coerce ${value} (type: ${typeof value}) into a number`);
};
const coerceBoolean = (value)=>{
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value === 'true';
    return Boolean(value);
};
const maybeCoerceInteger = (value)=>{
    if (value == null) {
        return undefined;
    }
    return coerceInteger(value);
};
const maybeCoerceFloat = (value)=>{
    if (value == null) {
        return undefined;
    }
    return coerceFloat(value);
};
const maybeCoerceBoolean = (value)=>{
    if (value == null) {
        return undefined;
    }
    return coerceBoolean(value);
};
const safeJSON = (text)=>{
    try {
        return JSON.parse(text);
    } catch (err) {
        return undefined;
    }
};
const pop = (obj, key)=>{
    const value = obj[key];
    delete obj[key];
    return value;
};
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/sleep.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
__turbopack_context__.s([
    "sleep",
    ()=>sleep
]);
const sleep = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/version.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VERSION",
    ()=>VERSION
]);
const VERSION = '0.92.0'; // x-release-please-version
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/detect-platform.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getPlatformHeaders",
    ()=>getPlatformHeaders,
    "isRunningInBrowser",
    ()=>isRunningInBrowser
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$version$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/version.mjs [app-route] (ecmascript)");
;
const isRunningInBrowser = ()=>{
    return(// @ts-ignore
    ("TURBOPACK compile-time value", "undefined") !== 'undefined' && // @ts-ignore
    typeof window.document !== 'undefined' && // @ts-ignore
    typeof navigator !== 'undefined');
};
/**
 * Note this does not detect 'browser'; for that, use getBrowserInfo().
 */ function getDetectedPlatform() {
    if (typeof Deno !== 'undefined' && Deno.build != null) {
        return 'deno';
    }
    if (typeof EdgeRuntime !== 'undefined') {
        return 'edge';
    }
    if (Object.prototype.toString.call(typeof globalThis.process !== 'undefined' ? globalThis.process : 0) === '[object process]') {
        return 'node';
    }
    return 'unknown';
}
const getPlatformProperties = ()=>{
    const detectedPlatform = getDetectedPlatform();
    if (detectedPlatform === 'deno') {
        return {
            'X-Stainless-Lang': 'js',
            'X-Stainless-Package-Version': __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$version$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["VERSION"],
            'X-Stainless-OS': normalizePlatform(Deno.build.os),
            'X-Stainless-Arch': normalizeArch(Deno.build.arch),
            'X-Stainless-Runtime': 'deno',
            'X-Stainless-Runtime-Version': typeof Deno.version === 'string' ? Deno.version : Deno.version?.deno ?? 'unknown'
        };
    }
    if (typeof EdgeRuntime !== 'undefined') {
        return {
            'X-Stainless-Lang': 'js',
            'X-Stainless-Package-Version': __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$version$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["VERSION"],
            'X-Stainless-OS': 'Unknown',
            'X-Stainless-Arch': `other:${EdgeRuntime}`,
            'X-Stainless-Runtime': 'edge',
            'X-Stainless-Runtime-Version': globalThis.process.version
        };
    }
    // Check if Node.js
    if (detectedPlatform === 'node') {
        return {
            'X-Stainless-Lang': 'js',
            'X-Stainless-Package-Version': __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$version$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["VERSION"],
            'X-Stainless-OS': normalizePlatform(globalThis.process.platform ?? 'unknown'),
            'X-Stainless-Arch': normalizeArch(globalThis.process.arch ?? 'unknown'),
            'X-Stainless-Runtime': 'node',
            'X-Stainless-Runtime-Version': globalThis.process.version ?? 'unknown'
        };
    }
    const browserInfo = getBrowserInfo();
    if (browserInfo) {
        return {
            'X-Stainless-Lang': 'js',
            'X-Stainless-Package-Version': __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$version$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["VERSION"],
            'X-Stainless-OS': 'Unknown',
            'X-Stainless-Arch': 'unknown',
            'X-Stainless-Runtime': `browser:${browserInfo.browser}`,
            'X-Stainless-Runtime-Version': browserInfo.version
        };
    }
    // TODO add support for Cloudflare workers, etc.
    return {
        'X-Stainless-Lang': 'js',
        'X-Stainless-Package-Version': __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$version$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["VERSION"],
        'X-Stainless-OS': 'Unknown',
        'X-Stainless-Arch': 'unknown',
        'X-Stainless-Runtime': 'unknown',
        'X-Stainless-Runtime-Version': 'unknown'
    };
};
// Note: modified from https://github.com/JS-DevTools/host-environment/blob/b1ab79ecde37db5d6e163c050e54fe7d287d7c92/src/isomorphic.browser.ts
function getBrowserInfo() {
    if (typeof navigator === 'undefined' || !navigator) {
        return null;
    }
    // NOTE: The order matters here!
    const browserPatterns = [
        {
            key: 'edge',
            pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
        },
        {
            key: 'ie',
            pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
        },
        {
            key: 'ie',
            pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/
        },
        {
            key: 'chrome',
            pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
        },
        {
            key: 'firefox',
            pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
        },
        {
            key: 'safari',
            pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/
        }
    ];
    // Find the FIRST matching browser
    for (const { key, pattern } of browserPatterns){
        const match = pattern.exec(navigator.userAgent);
        if (match) {
            const major = match[1] || 0;
            const minor = match[2] || 0;
            const patch = match[3] || 0;
            return {
                browser: key,
                version: `${major}.${minor}.${patch}`
            };
        }
    }
    return null;
}
const normalizeArch = (arch)=>{
    // Node docs:
    // - https://nodejs.org/api/process.html#processarch
    // Deno docs:
    // - https://doc.deno.land/deno/stable/~/Deno.build
    if (arch === 'x32') return 'x32';
    if (arch === 'x86_64' || arch === 'x64') return 'x64';
    if (arch === 'arm') return 'arm';
    if (arch === 'aarch64' || arch === 'arm64') return 'arm64';
    if (arch) return `other:${arch}`;
    return 'unknown';
};
const normalizePlatform = (platform)=>{
    // Node platforms:
    // - https://nodejs.org/api/process.html#processplatform
    // Deno platforms:
    // - https://doc.deno.land/deno/stable/~/Deno.build
    // - https://github.com/denoland/deno/issues/14799
    platform = platform.toLowerCase();
    // NOTE: this iOS check is untested and may not work
    // Node does not work natively on IOS, there is a fork at
    // https://github.com/nodejs-mobile/nodejs-mobile
    // however it is unknown at the time of writing how to detect if it is running
    if (platform.includes('ios')) return 'iOS';
    if (platform === 'android') return 'Android';
    if (platform === 'darwin') return 'MacOS';
    if (platform === 'win32') return 'Windows';
    if (platform === 'freebsd') return 'FreeBSD';
    if (platform === 'openbsd') return 'OpenBSD';
    if (platform === 'linux') return 'Linux';
    if (platform) return `Other:${platform}`;
    return 'Unknown';
};
let _platformHeaders;
const getPlatformHeaders = ()=>{
    return _platformHeaders ?? (_platformHeaders = getPlatformProperties());
};
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/shims.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
__turbopack_context__.s([
    "CancelReadableStream",
    ()=>CancelReadableStream,
    "ReadableStreamFrom",
    ()=>ReadableStreamFrom,
    "ReadableStreamToAsyncIterable",
    ()=>ReadableStreamToAsyncIterable,
    "getDefaultFetch",
    ()=>getDefaultFetch,
    "makeReadableStream",
    ()=>makeReadableStream
]);
function getDefaultFetch() {
    if (typeof fetch !== 'undefined') {
        return fetch;
    }
    throw new Error('`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`');
}
function makeReadableStream(...args) {
    const ReadableStream = globalThis.ReadableStream;
    if (typeof ReadableStream === 'undefined') {
        // Note: All of the platforms / runtimes we officially support already define
        // `ReadableStream` as a global, so this should only ever be hit on unsupported runtimes.
        throw new Error('`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`');
    }
    return new ReadableStream(...args);
}
function ReadableStreamFrom(iterable) {
    let iter = Symbol.asyncIterator in iterable ? iterable[Symbol.asyncIterator]() : iterable[Symbol.iterator]();
    return makeReadableStream({
        start () {},
        async pull (controller) {
            const { done, value } = await iter.next();
            if (done) {
                controller.close();
            } else {
                controller.enqueue(value);
            }
        },
        async cancel () {
            await iter.return?.();
        }
    });
}
function ReadableStreamToAsyncIterable(stream) {
    if (stream[Symbol.asyncIterator]) return stream;
    const reader = stream.getReader();
    return {
        async next () {
            try {
                const result = await reader.read();
                if (result?.done) reader.releaseLock(); // release lock when stream becomes closed
                return result;
            } catch (e) {
                reader.releaseLock(); // release lock when stream becomes errored
                throw e;
            }
        },
        async return () {
            const cancelPromise = reader.cancel();
            reader.releaseLock();
            await cancelPromise;
            return {
                done: true,
                value: undefined
            };
        },
        [Symbol.asyncIterator] () {
            return this;
        }
    };
}
async function CancelReadableStream(stream) {
    if (stream === null || typeof stream !== 'object') return;
    if (stream[Symbol.asyncIterator]) {
        await stream[Symbol.asyncIterator]().return?.();
        return;
    }
    const reader = stream.getReader();
    const cancelPromise = reader.cancel();
    reader.releaseLock();
    await cancelPromise;
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/request-options.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
__turbopack_context__.s([
    "FallbackEncoder",
    ()=>FallbackEncoder
]);
const FallbackEncoder = ({ headers, body })=>{
    return {
        bodyHeaders: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(body)
    };
};
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/query.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "stringifyQuery",
    ()=>stringifyQuery
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/error.mjs [app-route] (ecmascript)");
;
function stringifyQuery(query) {
    return Object.entries(query).filter(([_, value])=>typeof value !== 'undefined').map(([key, value])=>{
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        }
        if (value === null) {
            return `${encodeURIComponent(key)}=`;
        }
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`Cannot stringify type ${typeof value}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
    }).join('&');
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/bytes.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "concatBytes",
    ()=>concatBytes,
    "decodeUTF8",
    ()=>decodeUTF8,
    "encodeUTF8",
    ()=>encodeUTF8
]);
function concatBytes(buffers) {
    let length = 0;
    for (const buffer of buffers){
        length += buffer.length;
    }
    const output = new Uint8Array(length);
    let index = 0;
    for (const buffer of buffers){
        output.set(buffer, index);
        index += buffer.length;
    }
    return output;
}
let encodeUTF8_;
function encodeUTF8(str) {
    let encoder;
    return (encodeUTF8_ ?? (encoder = new globalThis.TextEncoder(), encodeUTF8_ = encoder.encode.bind(encoder)))(str);
}
let decodeUTF8_;
function decodeUTF8(bytes) {
    let decoder;
    return (decodeUTF8_ ?? (decoder = new globalThis.TextDecoder(), decodeUTF8_ = decoder.decode.bind(decoder)))(bytes);
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/decoders/line.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LineDecoder",
    ()=>LineDecoder,
    "findDoubleNewlineIndex",
    ()=>findDoubleNewlineIndex
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/tslib.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$bytes$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/bytes.mjs [app-route] (ecmascript)");
var _LineDecoder_buffer, _LineDecoder_carriageReturnIndex;
;
;
class LineDecoder {
    constructor(){
        _LineDecoder_buffer.set(this, void 0);
        _LineDecoder_carriageReturnIndex.set(this, void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _LineDecoder_buffer, new Uint8Array(), "f");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _LineDecoder_carriageReturnIndex, null, "f");
    }
    decode(chunk) {
        if (chunk == null) {
            return [];
        }
        const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === 'string' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$bytes$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodeUTF8"])(chunk) : chunk;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _LineDecoder_buffer, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$bytes$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["concatBytes"])([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _LineDecoder_buffer, "f"),
            binaryChunk
        ]), "f");
        const lines = [];
        let patternIndex;
        while((patternIndex = findNewlineIndex((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _LineDecoder_buffer, "f"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _LineDecoder_carriageReturnIndex, "f"))) != null){
            if (patternIndex.carriage && (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _LineDecoder_carriageReturnIndex, "f") == null) {
                // skip until we either get a corresponding `\n`, a new `\r` or nothing
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _LineDecoder_carriageReturnIndex, patternIndex.index, "f");
                continue;
            }
            // we got double \r or \rtext\n
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _LineDecoder_carriageReturnIndex, "f") != null && (patternIndex.index !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _LineDecoder_carriageReturnIndex, "f") + 1 || patternIndex.carriage)) {
                lines.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$bytes$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decodeUTF8"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _LineDecoder_buffer, "f").subarray(0, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _LineDecoder_carriageReturnIndex, "f") - 1)));
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _LineDecoder_buffer, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _LineDecoder_buffer, "f").subarray((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _LineDecoder_carriageReturnIndex, "f")), "f");
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _LineDecoder_carriageReturnIndex, null, "f");
                continue;
            }
            const endIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _LineDecoder_carriageReturnIndex, "f") !== null ? patternIndex.preceding - 1 : patternIndex.preceding;
            const line = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$bytes$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decodeUTF8"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _LineDecoder_buffer, "f").subarray(0, endIndex));
            lines.push(line);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _LineDecoder_buffer, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _LineDecoder_buffer, "f").subarray(patternIndex.index), "f");
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _LineDecoder_carriageReturnIndex, null, "f");
        }
        return lines;
    }
    flush() {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _LineDecoder_buffer, "f").length) {
            return [];
        }
        return this.decode('\n');
    }
}
_LineDecoder_buffer = new WeakMap(), _LineDecoder_carriageReturnIndex = new WeakMap();
// prettier-ignore
LineDecoder.NEWLINE_CHARS = new Set([
    '\n',
    '\r'
]);
LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
/**
 * This function searches the buffer for the end patterns, (\r or \n)
 * and returns an object with the index preceding the matched newline and the
 * index after the newline char. `null` is returned if no new line is found.
 *
 * ```ts
 * findNewLineIndex('abc\ndef') -> { preceding: 2, index: 3 }
 * ```
 */ function findNewlineIndex(buffer, startIndex) {
    const newline = 0x0a; // \n
    const carriage = 0x0d; // \r
    for(let i = startIndex ?? 0; i < buffer.length; i++){
        if (buffer[i] === newline) {
            return {
                preceding: i,
                index: i + 1,
                carriage: false
            };
        }
        if (buffer[i] === carriage) {
            return {
                preceding: i,
                index: i + 1,
                carriage: true
            };
        }
    }
    return null;
}
function findDoubleNewlineIndex(buffer) {
    // This function searches the buffer for the end patterns (\r\r, \n\n, \r\n\r\n)
    // and returns the index right after the first occurrence of any pattern,
    // or -1 if none of the patterns are found.
    const newline = 0x0a; // \n
    const carriage = 0x0d; // \r
    for(let i = 0; i < buffer.length - 1; i++){
        if (buffer[i] === newline && buffer[i + 1] === newline) {
            // \n\n
            return i + 2;
        }
        if (buffer[i] === carriage && buffer[i + 1] === carriage) {
            // \r\r
            return i + 2;
        }
        if (buffer[i] === carriage && buffer[i + 1] === newline && i + 3 < buffer.length && buffer[i + 2] === carriage && buffer[i + 3] === newline) {
            // \r\n\r\n
            return i + 4;
        }
    }
    return -1;
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/log.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatRequestDetails",
    ()=>formatRequestDetails,
    "loggerFor",
    ()=>loggerFor,
    "parseLogLevel",
    ()=>parseLogLevel
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$values$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/values.mjs [app-route] (ecmascript)");
;
const levelNumbers = {
    off: 0,
    error: 200,
    warn: 300,
    info: 400,
    debug: 500
};
const parseLogLevel = (maybeLevel, sourceName, client)=>{
    if (!maybeLevel) {
        return undefined;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$values$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasOwn"])(levelNumbers, maybeLevel)) {
        return maybeLevel;
    }
    loggerFor(client).warn(`${sourceName} was set to ${JSON.stringify(maybeLevel)}, expected one of ${JSON.stringify(Object.keys(levelNumbers))}`);
    return undefined;
};
function noop() {}
function makeLogFn(fnLevel, logger, logLevel) {
    if (!logger || levelNumbers[fnLevel] > levelNumbers[logLevel]) {
        return noop;
    } else {
        // Don't wrap logger functions, we want the stacktrace intact!
        return logger[fnLevel].bind(logger);
    }
}
const noopLogger = {
    error: noop,
    warn: noop,
    info: noop,
    debug: noop
};
let cachedLoggers = /* @__PURE__ */ new WeakMap();
function loggerFor(client) {
    const logger = client.logger;
    const logLevel = client.logLevel ?? 'off';
    if (!logger) {
        return noopLogger;
    }
    const cachedLogger = cachedLoggers.get(logger);
    if (cachedLogger && cachedLogger[0] === logLevel) {
        return cachedLogger[1];
    }
    const levelLogger = {
        error: makeLogFn('error', logger, logLevel),
        warn: makeLogFn('warn', logger, logLevel),
        info: makeLogFn('info', logger, logLevel),
        debug: makeLogFn('debug', logger, logLevel)
    };
    cachedLoggers.set(logger, [
        logLevel,
        levelLogger
    ]);
    return levelLogger;
}
const formatRequestDetails = (details)=>{
    if (details.options) {
        details.options = {
            ...details.options
        };
        delete details.options['headers']; // redundant + leaks internals
    }
    if (details.headers) {
        details.headers = Object.fromEntries((details.headers instanceof Headers ? [
            ...details.headers
        ] : Object.entries(details.headers)).map(([name, value])=>[
                name,
                name.toLowerCase() === 'x-api-key' || name.toLowerCase() === 'authorization' || name.toLowerCase() === 'cookie' || name.toLowerCase() === 'set-cookie' ? '***' : value
            ]));
    }
    if ('retryOfRequestLogID' in details) {
        if (details.retryOfRequestLogID) {
            details.retryOf = details.retryOfRequestLogID;
        }
        delete details.retryOfRequestLogID;
    }
    return details;
};
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/streaming.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Stream",
    ()=>Stream,
    "_iterSSEMessages",
    ()=>_iterSSEMessages
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/tslib.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/error.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$shims$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/shims.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$decoders$2f$line$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/decoders/line.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$errors$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/errors.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$values$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/values.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$bytes$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/bytes.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/log.mjs [app-route] (ecmascript)");
var _Stream_client;
;
;
;
;
;
;
;
;
;
;
class Stream {
    constructor(iterator, controller, client){
        this.iterator = iterator;
        _Stream_client.set(this, void 0);
        this.controller = controller;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _Stream_client, client, "f");
    }
    static fromSSEResponse(response, controller, client) {
        let consumed = false;
        const logger = client ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loggerFor"])(client) : console;
        async function* iterator() {
            if (consumed) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"]('Cannot iterate over a consumed stream, use `.tee()` to split the stream.');
            }
            consumed = true;
            let done = false;
            try {
                for await (const sse of _iterSSEMessages(response, controller)){
                    if (sse.event === 'completion') {
                        try {
                            yield JSON.parse(sse.data);
                        } catch (e) {
                            logger.error(`Could not parse message into JSON:`, sse.data);
                            logger.error(`From chunk:`, sse.raw);
                            throw e;
                        }
                    }
                    if (sse.event === 'message_start' || sse.event === 'message_delta' || sse.event === 'message_stop' || sse.event === 'content_block_start' || sse.event === 'content_block_delta' || sse.event === 'content_block_stop' || sse.event === 'message' || sse.event === 'user.message' || sse.event === 'user.interrupt' || sse.event === 'user.tool_confirmation' || sse.event === 'user.custom_tool_result' || sse.event === 'agent.message' || sse.event === 'agent.thinking' || sse.event === 'agent.tool_use' || sse.event === 'agent.tool_result' || sse.event === 'agent.mcp_tool_use' || sse.event === 'agent.mcp_tool_result' || sse.event === 'agent.custom_tool_use' || sse.event === 'agent.thread_context_compacted' || sse.event === 'session.status_running' || sse.event === 'session.status_idle' || sse.event === 'session.status_rescheduled' || sse.event === 'session.status_terminated' || sse.event === 'session.error' || sse.event === 'session.deleted' || sse.event === 'span.model_request_start' || sse.event === 'span.model_request_end') {
                        try {
                            yield JSON.parse(sse.data);
                        } catch (e) {
                            logger.error(`Could not parse message into JSON:`, sse.data);
                            logger.error(`From chunk:`, sse.raw);
                            throw e;
                        }
                    }
                    if (sse.event === 'ping') {
                        continue;
                    }
                    if (sse.event === 'error') {
                        const body = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$values$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeJSON"])(sse.data) ?? sse.data;
                        const type = body?.error?.type;
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIError"](undefined, body, undefined, response.headers, type);
                    }
                }
                done = true;
            } catch (e) {
                // If the user calls `stream.controller.abort()`, we should exit without throwing.
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$errors$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAbortError"])(e)) return;
                throw e;
            } finally{
                // If the user `break`s, abort the ongoing request.
                if (!done) controller.abort();
            }
        }
        return new Stream(iterator, controller, client);
    }
    /**
     * Generates a Stream from a newline-separated ReadableStream
     * where each item is a JSON value.
     */ static fromReadableStream(readableStream, controller, client) {
        let consumed = false;
        async function* iterLines() {
            const lineDecoder = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$decoders$2f$line$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LineDecoder"]();
            const iter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$shims$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ReadableStreamToAsyncIterable"])(readableStream);
            for await (const chunk of iter){
                for (const line of lineDecoder.decode(chunk)){
                    yield line;
                }
            }
            for (const line of lineDecoder.flush()){
                yield line;
            }
        }
        async function* iterator() {
            if (consumed) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"]('Cannot iterate over a consumed stream, use `.tee()` to split the stream.');
            }
            consumed = true;
            let done = false;
            try {
                for await (const line of iterLines()){
                    if (done) continue;
                    if (line) yield JSON.parse(line);
                }
                done = true;
            } catch (e) {
                // If the user calls `stream.controller.abort()`, we should exit without throwing.
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$errors$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAbortError"])(e)) return;
                throw e;
            } finally{
                // If the user `break`s, abort the ongoing request.
                if (!done) controller.abort();
            }
        }
        return new Stream(iterator, controller, client);
    }
    [(_Stream_client = new WeakMap(), Symbol.asyncIterator)]() {
        return this.iterator();
    }
    /**
     * Splits the stream into two streams which can be
     * independently read from at different speeds.
     */ tee() {
        const left = [];
        const right = [];
        const iterator = this.iterator();
        const teeIterator = (queue)=>{
            return {
                next: ()=>{
                    if (queue.length === 0) {
                        const result = iterator.next();
                        left.push(result);
                        right.push(result);
                    }
                    return queue.shift();
                }
            };
        };
        return [
            new Stream(()=>teeIterator(left), this.controller, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Stream_client, "f")),
            new Stream(()=>teeIterator(right), this.controller, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Stream_client, "f"))
        ];
    }
    /**
     * Converts this stream to a newline-separated ReadableStream of
     * JSON stringified values in the stream
     * which can be turned back into a Stream with `Stream.fromReadableStream()`.
     */ toReadableStream() {
        const self = this;
        let iter;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$shims$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["makeReadableStream"])({
            async start () {
                iter = self[Symbol.asyncIterator]();
            },
            async pull (ctrl) {
                try {
                    const { value, done } = await iter.next();
                    if (done) return ctrl.close();
                    const bytes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$bytes$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodeUTF8"])(JSON.stringify(value) + '\n');
                    ctrl.enqueue(bytes);
                } catch (err) {
                    ctrl.error(err);
                }
            },
            async cancel () {
                await iter.return?.();
            }
        });
    }
}
async function* _iterSSEMessages(response, controller) {
    if (!response.body) {
        controller.abort();
        if (typeof globalThis.navigator !== 'undefined' && globalThis.navigator.product === 'ReactNative') {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api`);
        }
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`Attempted to iterate over a response with no body`);
    }
    const sseDecoder = new SSEDecoder();
    const lineDecoder = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$decoders$2f$line$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LineDecoder"]();
    const iter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$shims$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ReadableStreamToAsyncIterable"])(response.body);
    for await (const sseChunk of iterSSEChunks(iter)){
        for (const line of lineDecoder.decode(sseChunk)){
            const sse = sseDecoder.decode(line);
            if (sse) yield sse;
        }
    }
    for (const line of lineDecoder.flush()){
        const sse = sseDecoder.decode(line);
        if (sse) yield sse;
    }
}
/**
 * Given an async iterable iterator, iterates over it and yields full
 * SSE chunks, i.e. yields when a double new-line is encountered.
 */ async function* iterSSEChunks(iterator) {
    let data = new Uint8Array();
    for await (const chunk of iterator){
        if (chunk == null) {
            continue;
        }
        const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === 'string' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$bytes$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodeUTF8"])(chunk) : chunk;
        let newData = new Uint8Array(data.length + binaryChunk.length);
        newData.set(data);
        newData.set(binaryChunk, data.length);
        data = newData;
        let patternIndex;
        while((patternIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$decoders$2f$line$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findDoubleNewlineIndex"])(data)) !== -1){
            yield data.slice(0, patternIndex);
            data = data.slice(patternIndex);
        }
    }
    if (data.length > 0) {
        yield data;
    }
}
class SSEDecoder {
    constructor(){
        this.event = null;
        this.data = [];
        this.chunks = [];
    }
    decode(line) {
        if (line.endsWith('\r')) {
            line = line.substring(0, line.length - 1);
        }
        if (!line) {
            // empty line and we didn't previously encounter any messages
            if (!this.event && !this.data.length) return null;
            const sse = {
                event: this.event,
                data: this.data.join('\n'),
                raw: this.chunks
            };
            this.event = null;
            this.data = [];
            this.chunks = [];
            return sse;
        }
        this.chunks.push(line);
        if (line.startsWith(':')) {
            return null;
        }
        let [fieldname, _, value] = partition(line, ':');
        if (value.startsWith(' ')) {
            value = value.substring(1);
        }
        if (fieldname === 'event') {
            this.event = value;
        } else if (fieldname === 'data') {
            this.data.push(value);
        }
        return null;
    }
}
function partition(str, delimiter) {
    const index = str.indexOf(delimiter);
    if (index !== -1) {
        return [
            str.substring(0, index),
            delimiter,
            str.substring(index + delimiter.length)
        ];
    }
    return [
        str,
        '',
        ''
    ];
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/parse.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addRequestID",
    ()=>addRequestID,
    "defaultParseResponse",
    ()=>defaultParseResponse
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$streaming$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/streaming.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/log.mjs [app-route] (ecmascript)");
;
;
async function defaultParseResponse(client, props) {
    const { response, requestLogID, retryOfRequestLogID, startTime } = props;
    const body = await (async ()=>{
        if (props.options.stream) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loggerFor"])(client).debug('response', response.status, response.url, response.headers, response.body);
            // Note: there is an invariant here that isn't represented in the type system
            // that if you set `stream: true` the response type must also be `Stream<T>`
            if (props.options.__streamClass) {
                return props.options.__streamClass.fromSSEResponse(response, props.controller);
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$streaming$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Stream"].fromSSEResponse(response, props.controller);
        }
        // fetch refuses to read the body when the status code is 204.
        if (response.status === 204) {
            return null;
        }
        if (props.options.__binaryResponse) {
            return response;
        }
        const contentType = response.headers.get('content-type');
        const mediaType = contentType?.split(';')[0]?.trim();
        const isJSON = mediaType?.includes('application/json') || mediaType?.endsWith('+json');
        if (isJSON) {
            const contentLength = response.headers.get('content-length');
            if (contentLength === '0') {
                // if there is no content we can't do anything
                return undefined;
            }
            const json = await response.json();
            return addRequestID(json, response);
        }
        const text = await response.text();
        return text;
    })();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loggerFor"])(client).debug(`[${requestLogID}] response parsed`, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatRequestDetails"])({
        retryOfRequestLogID,
        url: response.url,
        status: response.status,
        body,
        durationMs: Date.now() - startTime
    }));
    return body;
}
function addRequestID(value, response) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return value;
    }
    return Object.defineProperty(value, '_request_id', {
        value: response.headers.get('request-id'),
        enumerable: false
    });
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/api-promise.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APIPromise",
    ()=>APIPromise
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/tslib.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$parse$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/parse.mjs [app-route] (ecmascript)");
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var _APIPromise_client;
;
;
class APIPromise extends Promise {
    constructor(client, responsePromise, parseResponse = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$parse$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["defaultParseResponse"]){
        super((resolve)=>{
            // this is maybe a bit weird but this has to be a no-op to not implicitly
            // parse the response body; instead .then, .catch, .finally are overridden
            // to parse the response
            resolve(null);
        });
        this.responsePromise = responsePromise;
        this.parseResponse = parseResponse;
        _APIPromise_client.set(this, void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _APIPromise_client, client, "f");
    }
    _thenUnwrap(transform) {
        return new APIPromise((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _APIPromise_client, "f"), this.responsePromise, async (client, props)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$parse$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addRequestID"])(transform(await this.parseResponse(client, props), props), props.response));
    }
    /**
     * Gets the raw `Response` instance instead of parsing the response
     * data.
     *
     * If you want to parse the response body but still get the `Response`
     * instance, you can use {@link withResponse()}.
     *
     * 👋 Getting the wrong TypeScript type for `Response`?
     * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
     * to your `tsconfig.json`.
     */ asResponse() {
        return this.responsePromise.then((p)=>p.response);
    }
    /**
     * Gets the parsed response data, the raw `Response` instance and the ID of the request,
     * returned via the `request-id` header which is useful for debugging requests and resporting
     * issues to Anthropic.
     *
     * If you just want to get the raw `Response` instance without parsing it,
     * you can use {@link asResponse()}.
     *
     * 👋 Getting the wrong TypeScript type for `Response`?
     * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
     * to your `tsconfig.json`.
     */ async withResponse() {
        const [data, response] = await Promise.all([
            this.parse(),
            this.asResponse()
        ]);
        return {
            data,
            response,
            request_id: response.headers.get('request-id')
        };
    }
    parse() {
        if (!this.parsedPromise) {
            this.parsedPromise = this.responsePromise.then((data)=>this.parseResponse((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _APIPromise_client, "f"), data));
        }
        return this.parsedPromise;
    }
    then(onfulfilled, onrejected) {
        return this.parse().then(onfulfilled, onrejected);
    }
    catch(onrejected) {
        return this.parse().catch(onrejected);
    }
    finally(onfinally) {
        return this.parse().finally(onfinally);
    }
}
_APIPromise_client = new WeakMap();
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AbstractPage",
    ()=>AbstractPage,
    "Page",
    ()=>Page,
    "PageCursor",
    ()=>PageCursor,
    "PagePromise",
    ()=>PagePromise,
    "TokenPage",
    ()=>TokenPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/tslib.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/error.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$parse$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/parse.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$api$2d$promise$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/api-promise.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$values$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/values.mjs [app-route] (ecmascript)");
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var _AbstractPage_client;
;
;
;
;
;
class AbstractPage {
    constructor(client, response, body, options){
        _AbstractPage_client.set(this, void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _AbstractPage_client, client, "f");
        this.options = options;
        this.response = response;
        this.body = body;
    }
    hasNextPage() {
        const items = this.getPaginatedItems();
        if (!items.length) return false;
        return this.nextPageRequestOptions() != null;
    }
    async getNextPage() {
        const nextOptions = this.nextPageRequestOptions();
        if (!nextOptions) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"]('No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.');
        }
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _AbstractPage_client, "f").requestAPIList(this.constructor, nextOptions);
    }
    async *iterPages() {
        let page = this;
        yield page;
        while(page.hasNextPage()){
            page = await page.getNextPage();
            yield page;
        }
    }
    async *[(_AbstractPage_client = new WeakMap(), Symbol.asyncIterator)]() {
        for await (const page of this.iterPages()){
            for (const item of page.getPaginatedItems()){
                yield item;
            }
        }
    }
}
class PagePromise extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$api$2d$promise$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIPromise"] {
    constructor(client, request, Page){
        super(client, request, async (client, props)=>new Page(client, props.response, await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$parse$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["defaultParseResponse"])(client, props), props.options));
    }
    /**
     * Allow auto-paginating iteration on an unawaited list call, eg:
     *
     *    for await (const item of client.items.list()) {
     *      console.log(item)
     *    }
     */ async *[Symbol.asyncIterator]() {
        const page = await this;
        for await (const item of page){
            yield item;
        }
    }
}
class Page extends AbstractPage {
    constructor(client, response, body, options){
        super(client, response, body, options);
        this.data = body.data || [];
        this.has_more = body.has_more || false;
        this.first_id = body.first_id || null;
        this.last_id = body.last_id || null;
    }
    getPaginatedItems() {
        return this.data ?? [];
    }
    hasNextPage() {
        if (this.has_more === false) {
            return false;
        }
        return super.hasNextPage();
    }
    nextPageRequestOptions() {
        if (this.options.query?.['before_id']) {
            // in reverse
            const first_id = this.first_id;
            if (!first_id) {
                return null;
            }
            return {
                ...this.options,
                query: {
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$values$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maybeObj"])(this.options.query),
                    before_id: first_id
                }
            };
        }
        const cursor = this.last_id;
        if (!cursor) {
            return null;
        }
        return {
            ...this.options,
            query: {
                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$values$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maybeObj"])(this.options.query),
                after_id: cursor
            }
        };
    }
}
class TokenPage extends AbstractPage {
    constructor(client, response, body, options){
        super(client, response, body, options);
        this.data = body.data || [];
        this.has_more = body.has_more || false;
        this.next_page = body.next_page || null;
    }
    getPaginatedItems() {
        return this.data ?? [];
    }
    hasNextPage() {
        if (this.has_more === false) {
            return false;
        }
        return super.hasNextPage();
    }
    nextPageRequestOptions() {
        const cursor = this.next_page;
        if (!cursor) {
            return null;
        }
        return {
            ...this.options,
            query: {
                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$values$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maybeObj"])(this.options.query),
                page_token: cursor
            }
        };
    }
}
class PageCursor extends AbstractPage {
    constructor(client, response, body, options){
        super(client, response, body, options);
        this.data = body.data || [];
        this.next_page = body.next_page || null;
    }
    getPaginatedItems() {
        return this.data ?? [];
    }
    nextPageRequestOptions() {
        const cursor = this.next_page;
        if (!cursor) {
            return null;
        }
        return {
            ...this.options,
            query: {
                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$values$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maybeObj"])(this.options.query),
                page: cursor
            }
        };
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/uploads.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkFileSupport",
    ()=>checkFileSupport,
    "createForm",
    ()=>createForm,
    "getName",
    ()=>getName,
    "isAsyncIterable",
    ()=>isAsyncIterable,
    "makeFile",
    ()=>makeFile,
    "maybeMultipartFormRequestOptions",
    ()=>maybeMultipartFormRequestOptions,
    "multipartFormRequestOptions",
    ()=>multipartFormRequestOptions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$shims$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/shims.mjs [app-route] (ecmascript)");
;
const checkFileSupport = ()=>{
    if (typeof File === 'undefined') {
        const { process } = globalThis;
        const isOldNode = typeof process?.versions?.node === 'string' && parseInt(process.versions.node.split('.')) < 20;
        throw new Error('`File` is not defined as a global, which is required for file uploads.' + (isOldNode ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ''));
    }
};
function makeFile(fileBits, fileName, options) {
    checkFileSupport();
    return new File(fileBits, fileName ?? 'unknown_file', options);
}
function getName(value, stripPath) {
    const val = typeof value === 'object' && value !== null && ('name' in value && value.name && String(value.name) || 'url' in value && value.url && String(value.url) || 'filename' in value && value.filename && String(value.filename) || 'path' in value && value.path && String(value.path)) || '';
    return stripPath ? val.split(/[\\/]/).pop() || undefined : val;
}
const isAsyncIterable = (value)=>value != null && typeof value === 'object' && typeof value[Symbol.asyncIterator] === 'function';
const maybeMultipartFormRequestOptions = async (opts, fetch)=>{
    if (!hasUploadableValue(opts.body)) return opts;
    return {
        ...opts,
        body: await createForm(opts.body, fetch)
    };
};
const multipartFormRequestOptions = async (opts, fetch, stripFilenames = true)=>{
    return {
        ...opts,
        body: await createForm(opts.body, fetch, stripFilenames)
    };
};
const supportsFormDataMap = /* @__PURE__ */ new WeakMap();
/**
 * node-fetch doesn't support the global FormData object in recent node versions. Instead of sending
 * properly-encoded form data, it just stringifies the object, resulting in a request body of "[object FormData]".
 * This function detects if the fetch function provided supports the global FormData object to avoid
 * confusing error messages later on.
 */ function supportsFormData(fetchObject) {
    const fetch = typeof fetchObject === 'function' ? fetchObject : fetchObject.fetch;
    const cached = supportsFormDataMap.get(fetch);
    if (cached) return cached;
    const promise = (async ()=>{
        try {
            const FetchResponse = 'Response' in fetch ? fetch.Response : (await fetch('data:,')).constructor;
            const data = new FormData();
            if (data.toString() === await new FetchResponse(data).text()) {
                return false;
            }
            return true;
        } catch  {
            // avoid false negatives
            return true;
        }
    })();
    supportsFormDataMap.set(fetch, promise);
    return promise;
}
const createForm = async (body, fetch, stripFilenames = true)=>{
    if (!await supportsFormData(fetch)) {
        throw new TypeError('The provided fetch function does not support file uploads with the current global FormData class.');
    }
    const form = new FormData();
    await Promise.all(Object.entries(body || {}).map(([key, value])=>addFormValue(form, key, value, stripFilenames)));
    return form;
};
// We check for Blob not File because Bun.File doesn't inherit from File,
// but they both inherit from Blob and have a `name` property at runtime.
const isNamedBlob = (value)=>value instanceof Blob && 'name' in value;
const isUploadable = (value)=>typeof value === 'object' && value !== null && (value instanceof Response || isAsyncIterable(value) || isNamedBlob(value));
const hasUploadableValue = (value)=>{
    if (isUploadable(value)) return true;
    if (Array.isArray(value)) return value.some(hasUploadableValue);
    if (value && typeof value === 'object') {
        for(const k in value){
            if (hasUploadableValue(value[k])) return true;
        }
    }
    return false;
};
const addFormValue = async (form, key, value, stripFilenames)=>{
    if (value === undefined) return;
    if (value == null) {
        throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
    }
    // TODO: make nested formats configurable
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        form.append(key, String(value));
    } else if (value instanceof Response) {
        let options = {};
        const contentType = value.headers.get('Content-Type');
        if (contentType) {
            options = {
                type: contentType
            };
        }
        form.append(key, makeFile([
            await value.blob()
        ], getName(value, stripFilenames), options));
    } else if (isAsyncIterable(value)) {
        form.append(key, makeFile([
            await new Response((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$shims$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ReadableStreamFrom"])(value)).blob()
        ], getName(value, stripFilenames)));
    } else if (isNamedBlob(value)) {
        form.append(key, makeFile([
            value
        ], getName(value, stripFilenames), {
            type: value.type
        }));
    } else if (Array.isArray(value)) {
        await Promise.all(value.map((entry)=>addFormValue(form, key + '[]', entry, stripFilenames)));
    } else if (typeof value === 'object') {
        await Promise.all(Object.entries(value).map(([name, prop])=>addFormValue(form, `${key}[${name}]`, prop, stripFilenames)));
    } else {
        throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`);
    }
};
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/to-file.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "toFile",
    ()=>toFile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$uploads$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/uploads.mjs [app-route] (ecmascript)");
;
;
/**
 * This check adds the arrayBuffer() method type because it is available and used at runtime
 */ const isBlobLike = (value)=>value != null && typeof value === 'object' && typeof value.size === 'number' && typeof value.type === 'string' && typeof value.text === 'function' && typeof value.slice === 'function' && typeof value.arrayBuffer === 'function';
/**
 * This check adds the arrayBuffer() method type because it is available and used at runtime
 */ const isFileLike = (value)=>value != null && typeof value === 'object' && typeof value.name === 'string' && typeof value.lastModified === 'number' && isBlobLike(value);
const isResponseLike = (value)=>value != null && typeof value === 'object' && typeof value.url === 'string' && typeof value.blob === 'function';
async function toFile(value, name, options) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$uploads$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkFileSupport"])();
    // If it's a promise, resolve it.
    value = await value;
    name || (name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$uploads$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getName"])(value, true));
    // If we've been given a `File` we don't need to do anything if the name / options
    // have not been customised.
    if (isFileLike(value)) {
        if (value instanceof File && name == null && options == null) {
            return value;
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$uploads$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["makeFile"])([
            await value.arrayBuffer()
        ], name ?? value.name, {
            type: value.type,
            lastModified: value.lastModified,
            ...options
        });
    }
    if (isResponseLike(value)) {
        const blob = await value.blob();
        name || (name = new URL(value.url).pathname.split(/[\\/]/).pop());
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$uploads$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["makeFile"])(await getBytes(blob), name, options);
    }
    const parts = await getBytes(value);
    if (!options?.type) {
        const type = parts.find((part)=>typeof part === 'object' && 'type' in part && part.type);
        if (typeof type === 'string') {
            options = {
                ...options,
                type
            };
        }
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$uploads$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["makeFile"])(parts, name, options);
}
async function getBytes(value) {
    let parts = [];
    if (typeof value === 'string' || ArrayBuffer.isView(value) || // includes Uint8Array, Buffer, etc.
    value instanceof ArrayBuffer) {
        parts.push(value);
    } else if (isBlobLike(value)) {
        parts.push(value instanceof Blob ? value : await value.arrayBuffer());
    } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$uploads$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAsyncIterable"])(value) // includes Readable, ReadableStream, etc.
    ) {
        for await (const chunk of value){
            parts.push(...await getBytes(chunk)); // TODO, consider validating?
        }
    } else {
        const constructor = value?.constructor?.name;
        throw new Error(`Unexpected data type: ${typeof value}${constructor ? `; constructor: ${constructor}` : ''}${propsForError(value)}`);
    }
    return parts;
}
function propsForError(value) {
    if (typeof value !== 'object' || value === null) return '';
    const props = Object.getOwnPropertyNames(value);
    return `; props: [${props.map((p)=>`"${p}"`).join(', ')}]`;
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/uploads.mjs [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$to$2d$file$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/to-file.mjs [app-route] (ecmascript)");
;
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
__turbopack_context__.s([
    "APIResource",
    ()=>APIResource
]);
class APIResource {
    constructor(client){
        this._client = client;
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildHeaders",
    ()=>buildHeaders,
    "isEmptyHeaders",
    ()=>isEmptyHeaders
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$values$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/values.mjs [app-route] (ecmascript)");
;
const brand_privateNullableHeaders = Symbol.for('brand.privateNullableHeaders');
function* iterateHeaders(headers) {
    if (!headers) return;
    if (brand_privateNullableHeaders in headers) {
        const { values, nulls } = headers;
        yield* values.entries();
        for (const name of nulls){
            yield [
                name,
                null
            ];
        }
        return;
    }
    let shouldClear = false;
    let iter;
    if (headers instanceof Headers) {
        iter = headers.entries();
    } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$values$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isReadonlyArray"])(headers)) {
        iter = headers;
    } else {
        shouldClear = true;
        iter = Object.entries(headers ?? {});
    }
    for (let row of iter){
        const name = row[0];
        if (typeof name !== 'string') throw new TypeError('expected header name to be a string');
        const values = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$values$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isReadonlyArray"])(row[1]) ? row[1] : [
            row[1]
        ];
        let didClear = false;
        for (const value of values){
            if (value === undefined) continue;
            // Objects keys always overwrite older headers, they never append.
            // Yield a null to clear the header before adding the new values.
            if (shouldClear && !didClear) {
                didClear = true;
                yield [
                    name,
                    null
                ];
            }
            yield [
                name,
                value
            ];
        }
    }
}
const buildHeaders = (newHeaders)=>{
    const targetHeaders = new Headers();
    const nullHeaders = new Set();
    for (const headers of newHeaders){
        const seenHeaders = new Set();
        for (const [name, value] of iterateHeaders(headers)){
            const lowerName = name.toLowerCase();
            if (!seenHeaders.has(lowerName)) {
                targetHeaders.delete(name);
                seenHeaders.add(lowerName);
            }
            if (value === null) {
                targetHeaders.delete(name);
                nullHeaders.add(lowerName);
            } else {
                targetHeaders.append(name, value);
                nullHeaders.delete(lowerName);
            }
        }
    }
    return {
        [brand_privateNullableHeaders]: true,
        values: targetHeaders,
        nulls: nullHeaders
    };
};
const isEmptyHeaders = (headers)=>{
    for (const _ of iterateHeaders(headers))return false;
    return true;
};
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createPathTagFunction",
    ()=>createPathTagFunction,
    "encodeURIPath",
    ()=>encodeURIPath,
    "path",
    ()=>path
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/error.mjs [app-route] (ecmascript)");
;
function encodeURIPath(str) {
    return str.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
const EMPTY = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null));
const createPathTagFunction = (pathEncoder = encodeURIPath)=>function path(statics, ...params) {
        // If there are no params, no processing is needed.
        if (statics.length === 1) return statics[0];
        let postPath = false;
        const invalidSegments = [];
        const path1 = statics.reduce((previousValue, currentValue, index)=>{
            if (/[?#]/.test(currentValue)) {
                postPath = true;
            }
            const value = params[index];
            let encoded = (postPath ? encodeURIComponent : pathEncoder)('' + value);
            if (index !== params.length && (value == null || typeof value === 'object' && // handle values from other realms
            value.toString === Object.getPrototypeOf(Object.getPrototypeOf(value.hasOwnProperty ?? EMPTY) ?? EMPTY)?.toString)) {
                encoded = value + '';
                invalidSegments.push({
                    start: previousValue.length + currentValue.length,
                    length: encoded.length,
                    error: `Value of type ${Object.prototype.toString.call(value).slice(8, -1)} is not a valid path parameter`
                });
            }
            return previousValue + currentValue + (index === params.length ? '' : encoded);
        }, '');
        const pathOnly = path1.split(/[?#]/, 1)[0];
        const invalidSegmentPattern = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
        let match;
        // Find all invalid segments
        while((match = invalidSegmentPattern.exec(pathOnly)) !== null){
            invalidSegments.push({
                start: match.index,
                length: match[0].length,
                error: `Value "${match[0]}" can\'t be safely passed as a path parameter`
            });
        }
        invalidSegments.sort((a, b)=>a.start - b.start);
        if (invalidSegments.length > 0) {
            let lastEnd = 0;
            const underline = invalidSegments.reduce((acc, segment)=>{
                const spaces = ' '.repeat(segment.start - lastEnd);
                const arrows = '^'.repeat(segment.length);
                lastEnd = segment.start + segment.length;
                return acc + spaces + arrows;
            }, '');
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`Path parameters result in path with invalid segments:\n${invalidSegments.map((e)=>e.error).join('\n')}\n${path1}\n${underline}`);
        }
        return path1;
    };
const path = /* @__PURE__ */ createPathTagFunction(encodeURIPath);
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/environments.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Environments",
    ()=>Environments
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
class Environments extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    /**
     * Create a new environment with the specified configuration.
     *
     * @example
     * ```ts
     * const betaEnvironment =
     *   await client.beta.environments.create({
     *     name: 'python-data-analysis',
     *   });
     * ```
     */ create(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/environments?beta=true', {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Retrieve a specific environment by ID.
     *
     * @example
     * ```ts
     * const betaEnvironment =
     *   await client.beta.environments.retrieve(
     *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
     *   );
     * ```
     */ retrieve(environmentID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/environments/${environmentID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Update an existing environment's configuration.
     *
     * @example
     * ```ts
     * const betaEnvironment =
     *   await client.beta.environments.update(
     *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
     *   );
     * ```
     */ update(environmentID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/environments/${environmentID}?beta=true`, {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * List environments with pagination support.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaEnvironment of client.beta.environments.list()) {
     *   // ...
     * }
     * ```
     */ list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/environments?beta=true', __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PageCursor"], {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Delete an environment by ID. Returns a confirmation of the deletion.
     *
     * @example
     * ```ts
     * const betaEnvironmentDeleteResponse =
     *   await client.beta.environments.delete(
     *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
     *   );
     * ```
     */ delete(environmentID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/environments/${environmentID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Archive an environment by ID. Archived environments cannot be used to create new
     * sessions.
     *
     * @example
     * ```ts
     * const betaEnvironment =
     *   await client.beta.environments.archive(
     *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
     *   );
     * ```
     */ archive(environmentID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/environments/${environmentID}/archive?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/stainless-helper-header.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared utilities for tracking SDK helper usage.
 */ /**
 * Symbol used to mark objects created by SDK helpers for tracking.
 * The value is the helper name (e.g., 'mcpTool', 'betaZodTool').
 */ __turbopack_context__.s([
    "SDK_HELPER_SYMBOL",
    ()=>SDK_HELPER_SYMBOL,
    "collectStainlessHelpers",
    ()=>collectStainlessHelpers,
    "stainlessHelperHeader",
    ()=>stainlessHelperHeader,
    "stainlessHelperHeaderFromFile",
    ()=>stainlessHelperHeaderFromFile,
    "wasCreatedByStainlessHelper",
    ()=>wasCreatedByStainlessHelper
]);
const SDK_HELPER_SYMBOL = Symbol('anthropic.sdk.stainlessHelper');
function wasCreatedByStainlessHelper(value) {
    return typeof value === 'object' && value !== null && SDK_HELPER_SYMBOL in value;
}
function collectStainlessHelpers(tools, messages) {
    const helpers = new Set();
    // Collect from tools
    if (tools) {
        for (const tool of tools){
            if (wasCreatedByStainlessHelper(tool)) {
                helpers.add(tool[SDK_HELPER_SYMBOL]);
            }
        }
    }
    // Collect from messages and their content blocks
    if (messages) {
        for (const message of messages){
            if (wasCreatedByStainlessHelper(message)) {
                helpers.add(message[SDK_HELPER_SYMBOL]);
            }
            if (Array.isArray(message.content)) {
                for (const block of message.content){
                    if (wasCreatedByStainlessHelper(block)) {
                        helpers.add(block[SDK_HELPER_SYMBOL]);
                    }
                }
            }
        }
    }
    return Array.from(helpers);
}
function stainlessHelperHeader(tools, messages) {
    const helpers = collectStainlessHelpers(tools, messages);
    if (helpers.length === 0) return {};
    return {
        'x-stainless-helper': helpers.join(', ')
    };
}
function stainlessHelperHeaderFromFile(file) {
    if (wasCreatedByStainlessHelper(file)) {
        return {
            'x-stainless-helper': file[SDK_HELPER_SYMBOL]
        };
    }
    return {};
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/files.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Files",
    ()=>Files
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$stainless$2d$helper$2d$header$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/stainless-helper-header.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$uploads$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/uploads.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
class Files extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    /**
     * List Files
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const fileMetadata of client.beta.files.list()) {
     *   // ...
     * }
     * ```
     */ list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/files?beta=true', __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Page"], {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'files-api-2025-04-14'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Delete File
     *
     * @example
     * ```ts
     * const deletedFile = await client.beta.files.delete(
     *   'file_id',
     * );
     * ```
     */ delete(fileID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/files/${fileID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'files-api-2025-04-14'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Download File
     *
     * @example
     * ```ts
     * const response = await client.beta.files.download(
     *   'file_id',
     * );
     *
     * const content = await response.blob();
     * console.log(content);
     * ```
     */ download(fileID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/files/${fileID}/content?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'files-api-2025-04-14'
                    ].toString(),
                    Accept: 'application/binary'
                },
                options?.headers
            ]),
            __binaryResponse: true
        });
    }
    /**
     * Get File Metadata
     *
     * @example
     * ```ts
     * const fileMetadata =
     *   await client.beta.files.retrieveMetadata('file_id');
     * ```
     */ retrieveMetadata(fileID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/files/${fileID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'files-api-2025-04-14'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Upload File
     *
     * @example
     * ```ts
     * const fileMetadata = await client.beta.files.upload({
     *   file: fs.createReadStream('path/to/file'),
     * });
     * ```
     */ upload(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/files?beta=true', (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$uploads$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["multipartFormRequestOptions"])({
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'files-api-2025-04-14'
                    ].toString()
                },
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$stainless$2d$helper$2d$header$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stainlessHelperHeaderFromFile"])(body.file),
                options?.headers
            ])
        }, this._client));
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/models.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Models",
    ()=>Models
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
class Models extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    /**
     * Get a specific model.
     *
     * The Models API response can be used to determine information about a specific
     * model or resolve a model alias to a model ID.
     *
     * @example
     * ```ts
     * const betaModelInfo = await client.beta.models.retrieve(
     *   'model_id',
     * );
     * ```
     */ retrieve(modelID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/models/${modelID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    ...betas?.toString() != null ? {
                        'anthropic-beta': betas?.toString()
                    } : undefined
                },
                options?.headers
            ])
        });
    }
    /**
     * List available models.
     *
     * The Models API response can be used to determine which models are available for
     * use in the API. More recently released models are listed first.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaModelInfo of client.beta.models.list()) {
     *   // ...
     * }
     * ```
     */ list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/models?beta=true', __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Page"], {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    ...betas?.toString() != null ? {
                        'anthropic-beta': betas?.toString()
                    } : undefined
                },
                options?.headers
            ])
        });
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/user-profiles.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserProfiles",
    ()=>UserProfiles
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
class UserProfiles extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    /**
     * Create User Profile
     *
     * @example
     * ```ts
     * const betaUserProfile =
     *   await client.beta.userProfiles.create();
     * ```
     */ create(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/user_profiles?beta=true', {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'user-profiles-2026-03-24'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Get User Profile
     *
     * @example
     * ```ts
     * const betaUserProfile =
     *   await client.beta.userProfiles.retrieve(
     *     'uprof_011CZkZCu8hGbp5mYRQgUmz9',
     *   );
     * ```
     */ retrieve(userProfileID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/user_profiles/${userProfileID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'user-profiles-2026-03-24'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Update User Profile
     *
     * @example
     * ```ts
     * const betaUserProfile =
     *   await client.beta.userProfiles.update(
     *     'uprof_011CZkZCu8hGbp5mYRQgUmz9',
     *   );
     * ```
     */ update(userProfileID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/user_profiles/${userProfileID}?beta=true`, {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'user-profiles-2026-03-24'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * List User Profiles
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaUserProfile of client.beta.userProfiles.list()) {
     *   // ...
     * }
     * ```
     */ list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/user_profiles?beta=true', __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PageCursor"], {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'user-profiles-2026-03-24'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Create Enrollment URL
     *
     * @example
     * ```ts
     * const betaUserProfileEnrollmentURL =
     *   await client.beta.userProfiles.createEnrollmentURL(
     *     'uprof_011CZkZCu8hGbp5mYRQgUmz9',
     *   );
     * ```
     */ createEnrollmentURL(userProfileID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/user_profiles/${userProfileID}/enrollment_url?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'user-profiles-2026-03-24'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/agents/versions.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Versions",
    ()=>Versions
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
class Versions extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    /**
     * List Agent Versions
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsAgent of client.beta.agents.versions.list(
     *   'agent_011CZkYpogX7uDKUyvBTophP',
     * )) {
     *   // ...
     * }
     * ```
     */ list(agentID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/agents/${agentID}/versions?beta=true`, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PageCursor"], {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/agents/agents.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Agents",
    ()=>Agents
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$agents$2f$versions$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/agents/versions.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
class Agents extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    constructor(){
        super(...arguments);
        this.versions = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$agents$2f$versions$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Versions"](this._client);
    }
    /**
     * Create Agent
     *
     * @example
     * ```ts
     * const betaManagedAgentsAgent =
     *   await client.beta.agents.create({
     *     model: 'claude-sonnet-4-6',
     *     name: 'My First Agent',
     *   });
     * ```
     */ create(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/agents?beta=true', {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Get Agent
     *
     * @example
     * ```ts
     * const betaManagedAgentsAgent =
     *   await client.beta.agents.retrieve(
     *     'agent_011CZkYpogX7uDKUyvBTophP',
     *   );
     * ```
     */ retrieve(agentID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/agents/${agentID}?beta=true`, {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Update Agent
     *
     * @example
     * ```ts
     * const betaManagedAgentsAgent =
     *   await client.beta.agents.update(
     *     'agent_011CZkYpogX7uDKUyvBTophP',
     *     { version: 1 },
     *   );
     * ```
     */ update(agentID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/agents/${agentID}?beta=true`, {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * List Agents
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsAgent of client.beta.agents.list()) {
     *   // ...
     * }
     * ```
     */ list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/agents?beta=true', __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PageCursor"], {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Archive Agent
     *
     * @example
     * ```ts
     * const betaManagedAgentsAgent =
     *   await client.beta.agents.archive(
     *     'agent_011CZkYpogX7uDKUyvBTophP',
     *   );
     * ```
     */ archive(agentID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/agents/${agentID}/archive?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
}
Agents.Versions = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$agents$2f$versions$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Versions"];
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/memory-stores/memories.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Memories",
    ()=>Memories
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
class Memories extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    /**
     * Create a memory
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemory =
     *   await client.beta.memoryStores.memories.create(
     *     'memory_store_id',
     *     { content: 'content', path: 'xx' },
     *   );
     * ```
     */ create(memoryStoreID, params, options) {
        const { view, betas, ...body } = params;
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/memory_stores/${memoryStoreID}/memories?beta=true`, {
            query: {
                view
            },
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Retrieve a memory
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemory =
     *   await client.beta.memoryStores.memories.retrieve(
     *     'memory_id',
     *     { memory_store_id: 'memory_store_id' },
     *   );
     * ```
     */ retrieve(memoryID, params, options) {
        const { memory_store_id, betas, ...query } = params;
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/memory_stores/${memory_store_id}/memories/${memoryID}?beta=true`, {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Update a memory
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemory =
     *   await client.beta.memoryStores.memories.update(
     *     'memory_id',
     *     { memory_store_id: 'memory_store_id' },
     *   );
     * ```
     */ update(memoryID, params, options) {
        const { memory_store_id, view, betas, ...body } = params;
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/memory_stores/${memory_store_id}/memories/${memoryID}?beta=true`, {
            query: {
                view
            },
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * List memories
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsMemoryListItem of client.beta.memoryStores.memories.list(
     *   'memory_store_id',
     * )) {
     *   // ...
     * }
     * ```
     */ list(memoryStoreID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/memory_stores/${memoryStoreID}/memories?beta=true`, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PageCursor"], {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Delete a memory
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeletedMemory =
     *   await client.beta.memoryStores.memories.delete(
     *     'memory_id',
     *     { memory_store_id: 'memory_store_id' },
     *   );
     * ```
     */ delete(memoryID, params, options) {
        const { memory_store_id, expected_content_sha256, betas } = params;
        return this._client.delete(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/memory_stores/${memory_store_id}/memories/${memoryID}?beta=true`, {
            query: {
                expected_content_sha256
            },
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/memory-stores/memory-versions.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MemoryVersions",
    ()=>MemoryVersions
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
class MemoryVersions extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    /**
     * Retrieve a memory version
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemoryVersion =
     *   await client.beta.memoryStores.memoryVersions.retrieve(
     *     'memory_version_id',
     *     { memory_store_id: 'memory_store_id' },
     *   );
     * ```
     */ retrieve(memoryVersionID, params, options) {
        const { memory_store_id, betas, ...query } = params;
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/memory_stores/${memory_store_id}/memory_versions/${memoryVersionID}?beta=true`, {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * List memory versions
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsMemoryVersion of client.beta.memoryStores.memoryVersions.list(
     *   'memory_store_id',
     * )) {
     *   // ...
     * }
     * ```
     */ list(memoryStoreID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/memory_stores/${memoryStoreID}/memory_versions?beta=true`, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PageCursor"], {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Redact a memory version
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemoryVersion =
     *   await client.beta.memoryStores.memoryVersions.redact(
     *     'memory_version_id',
     *     { memory_store_id: 'memory_store_id' },
     *   );
     * ```
     */ redact(memoryVersionID, params, options) {
        const { memory_store_id, betas } = params;
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/memory_stores/${memory_store_id}/memory_versions/${memoryVersionID}/redact?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/memory-stores/memory-stores.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MemoryStores",
    ()=>MemoryStores
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$memory$2d$stores$2f$memories$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/memory-stores/memories.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$memory$2d$stores$2f$memory$2d$versions$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/memory-stores/memory-versions.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
class MemoryStores extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    constructor(){
        super(...arguments);
        this.memories = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$memory$2d$stores$2f$memories$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Memories"](this._client);
        this.memoryVersions = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$memory$2d$stores$2f$memory$2d$versions$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MemoryVersions"](this._client);
    }
    /**
     * Create a memory store
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemoryStore =
     *   await client.beta.memoryStores.create({ name: 'x' });
     * ```
     */ create(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/memory_stores?beta=true', {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Retrieve a memory store
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemoryStore =
     *   await client.beta.memoryStores.retrieve(
     *     'memory_store_id',
     *   );
     * ```
     */ retrieve(memoryStoreID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/memory_stores/${memoryStoreID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Update a memory store
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemoryStore =
     *   await client.beta.memoryStores.update('memory_store_id');
     * ```
     */ update(memoryStoreID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/memory_stores/${memoryStoreID}?beta=true`, {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * List memory stores
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsMemoryStore of client.beta.memoryStores.list()) {
     *   // ...
     * }
     * ```
     */ list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/memory_stores?beta=true', __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PageCursor"], {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Delete a memory store
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeletedMemoryStore =
     *   await client.beta.memoryStores.delete('memory_store_id');
     * ```
     */ delete(memoryStoreID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/memory_stores/${memoryStoreID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Archive a memory store
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemoryStore =
     *   await client.beta.memoryStores.archive('memory_store_id');
     * ```
     */ archive(memoryStoreID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/memory_stores/${memoryStoreID}/archive?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
}
MemoryStores.Memories = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$memory$2d$stores$2f$memories$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Memories"];
MemoryStores.MemoryVersions = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$memory$2d$stores$2f$memory$2d$versions$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MemoryVersions"];
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/error.mjs [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/error.mjs [app-route] (ecmascript)");
;
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/decoders/jsonl.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JSONLDecoder",
    ()=>JSONLDecoder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/error.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$shims$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/shims.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$decoders$2f$line$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/decoders/line.mjs [app-route] (ecmascript)");
;
;
;
class JSONLDecoder {
    constructor(iterator, controller){
        this.iterator = iterator;
        this.controller = controller;
    }
    async *decoder() {
        const lineDecoder = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$decoders$2f$line$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LineDecoder"]();
        for await (const chunk of this.iterator){
            for (const line of lineDecoder.decode(chunk)){
                yield JSON.parse(line);
            }
        }
        for (const line of lineDecoder.flush()){
            yield JSON.parse(line);
        }
    }
    [Symbol.asyncIterator]() {
        return this.decoder();
    }
    static fromResponse(response, controller) {
        if (!response.body) {
            controller.abort();
            if (typeof globalThis.navigator !== 'undefined' && globalThis.navigator.product === 'ReactNative') {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api`);
            }
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`Attempted to iterate over a response with no body`);
        }
        return new JSONLDecoder((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$shims$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ReadableStreamToAsyncIterable"])(response.body), controller);
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/messages/batches.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Batches",
    ()=>Batches
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$decoders$2f$jsonl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/decoders/jsonl.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/error.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/error.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
class Batches extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    /**
     * Send a batch of Message creation requests.
     *
     * The Message Batches API can be used to process multiple Messages API requests at
     * once. Once a Message Batch is created, it begins processing immediately. Batches
     * can take up to 24 hours to complete.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const betaMessageBatch =
     *   await client.beta.messages.batches.create({
     *     requests: [
     *       {
     *         custom_id: 'my-custom-id-1',
     *         params: {
     *           max_tokens: 1024,
     *           messages: [
     *             { content: 'Hello, world', role: 'user' },
     *           ],
     *           model: 'claude-opus-4-6',
     *         },
     *       },
     *     ],
     *   });
     * ```
     */ create(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/messages/batches?beta=true', {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'message-batches-2024-09-24'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * This endpoint is idempotent and can be used to poll for Message Batch
     * completion. To access the results of a Message Batch, make a request to the
     * `results_url` field in the response.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const betaMessageBatch =
     *   await client.beta.messages.batches.retrieve(
     *     'message_batch_id',
     *   );
     * ```
     */ retrieve(messageBatchID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/messages/batches/${messageBatchID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'message-batches-2024-09-24'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * List all Message Batches within a Workspace. Most recently created batches are
     * returned first.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaMessageBatch of client.beta.messages.batches.list()) {
     *   // ...
     * }
     * ```
     */ list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/messages/batches?beta=true', __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Page"], {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'message-batches-2024-09-24'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Delete a Message Batch.
     *
     * Message Batches can only be deleted once they've finished processing. If you'd
     * like to delete an in-progress batch, you must first cancel it.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const betaDeletedMessageBatch =
     *   await client.beta.messages.batches.delete(
     *     'message_batch_id',
     *   );
     * ```
     */ delete(messageBatchID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/messages/batches/${messageBatchID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'message-batches-2024-09-24'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Batches may be canceled any time before processing ends. Once cancellation is
     * initiated, the batch enters a `canceling` state, at which time the system may
     * complete any in-progress, non-interruptible requests before finalizing
     * cancellation.
     *
     * The number of canceled requests is specified in `request_counts`. To determine
     * which requests were canceled, check the individual results within the batch.
     * Note that cancellation may not result in any canceled requests if they were
     * non-interruptible.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const betaMessageBatch =
     *   await client.beta.messages.batches.cancel(
     *     'message_batch_id',
     *   );
     * ```
     */ cancel(messageBatchID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/messages/batches/${messageBatchID}/cancel?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'message-batches-2024-09-24'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Streams the results of a Message Batch as a `.jsonl` file.
     *
     * Each line in the file is a JSON object containing the result of a single request
     * in the Message Batch. Results are not guaranteed to be in the same order as
     * requests. Use the `custom_id` field to match results to requests.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const betaMessageBatchIndividualResponse =
     *   await client.beta.messages.batches.results(
     *     'message_batch_id',
     *   );
     * ```
     */ async results(messageBatchID, params = {}, options) {
        const batch = await this.retrieve(messageBatchID);
        if (!batch.results_url) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`No batch \`results_url\`; Has it finished processing? ${batch.processing_status} - ${batch.id}`);
        }
        const { betas } = params ?? {};
        return this._client.get(batch.results_url, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'message-batches-2024-09-24'
                    ].toString(),
                    Accept: 'application/binary'
                },
                options?.headers
            ]),
            stream: true,
            __binaryResponse: true
        })._thenUnwrap((_, props)=>__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$decoders$2f$jsonl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["JSONLDecoder"].fromResponse(props.response, props.controller));
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/constants.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// File containing shared constants
/**
 * Model-specific timeout constraints for non-streaming requests
 */ __turbopack_context__.s([
    "MODEL_NONSTREAMING_TOKENS",
    ()=>MODEL_NONSTREAMING_TOKENS
]);
const MODEL_NONSTREAMING_TOKENS = {
    'claude-opus-4-20250514': 8192,
    'claude-opus-4-0': 8192,
    'claude-4-opus-20250514': 8192,
    'anthropic.claude-opus-4-20250514-v1:0': 8192,
    'claude-opus-4@20250514': 8192,
    'claude-opus-4-1-20250805': 8192,
    'anthropic.claude-opus-4-1-20250805-v1:0': 8192,
    'claude-opus-4-1@20250805': 8192
};
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/beta-parser.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "maybeParseBetaMessage",
    ()=>maybeParseBetaMessage,
    "parseBetaMessage",
    ()=>parseBetaMessage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/error.mjs [app-route] (ecmascript)");
;
function getOutputFormat(params) {
    // Prefer output_format (deprecated) over output_config.format for backward compatibility
    return params?.output_format ?? params?.output_config?.format;
}
function maybeParseBetaMessage(message, params, opts) {
    const outputFormat = getOutputFormat(params);
    if (!params || !('parse' in (outputFormat ?? {}))) {
        return {
            ...message,
            content: message.content.map((block)=>{
                if (block.type === 'text') {
                    const parsedBlock = Object.defineProperty({
                        ...block
                    }, 'parsed_output', {
                        value: null,
                        enumerable: false
                    });
                    return Object.defineProperty(parsedBlock, 'parsed', {
                        get () {
                            opts.logger.warn('The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead.');
                            return null;
                        },
                        enumerable: false
                    });
                }
                return block;
            }),
            parsed_output: null
        };
    }
    return parseBetaMessage(message, params, opts);
}
function parseBetaMessage(message, params, opts) {
    let firstParsedOutput = null;
    const content = message.content.map((block)=>{
        if (block.type === 'text') {
            const parsedOutput = parseBetaOutputFormat(params, block.text);
            if (firstParsedOutput === null) {
                firstParsedOutput = parsedOutput;
            }
            const parsedBlock = Object.defineProperty({
                ...block
            }, 'parsed_output', {
                value: parsedOutput,
                enumerable: false
            });
            return Object.defineProperty(parsedBlock, 'parsed', {
                get () {
                    opts.logger.warn('The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead.');
                    return parsedOutput;
                },
                enumerable: false
            });
        }
        return block;
    });
    return {
        ...message,
        content,
        parsed_output: firstParsedOutput
    };
}
function parseBetaOutputFormat(params, content) {
    const outputFormat = getOutputFormat(params);
    if (outputFormat?.type !== 'json_schema') {
        return null;
    }
    try {
        if ('parse' in outputFormat) {
            return outputFormat.parse(content);
        }
        return JSON.parse(content);
    } catch (error) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`Failed to parse structured output: ${error}`);
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/_vendor/partial-json-parser/parser.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "partialParse",
    ()=>partialParse
]);
const tokenize = (input)=>{
    let current = 0;
    let tokens = [];
    while(current < input.length){
        let char = input[current];
        if (char === '\\') {
            current++;
            continue;
        }
        if (char === '{') {
            tokens.push({
                type: 'brace',
                value: '{'
            });
            current++;
            continue;
        }
        if (char === '}') {
            tokens.push({
                type: 'brace',
                value: '}'
            });
            current++;
            continue;
        }
        if (char === '[') {
            tokens.push({
                type: 'paren',
                value: '['
            });
            current++;
            continue;
        }
        if (char === ']') {
            tokens.push({
                type: 'paren',
                value: ']'
            });
            current++;
            continue;
        }
        if (char === ':') {
            tokens.push({
                type: 'separator',
                value: ':'
            });
            current++;
            continue;
        }
        if (char === ',') {
            tokens.push({
                type: 'delimiter',
                value: ','
            });
            current++;
            continue;
        }
        if (char === '"') {
            let value = '';
            let danglingQuote = false;
            char = input[++current];
            while(char !== '"'){
                if (current === input.length) {
                    danglingQuote = true;
                    break;
                }
                if (char === '\\') {
                    current++;
                    if (current === input.length) {
                        danglingQuote = true;
                        break;
                    }
                    value += char + input[current];
                    char = input[++current];
                } else {
                    value += char;
                    char = input[++current];
                }
            }
            char = input[++current];
            if (!danglingQuote) {
                tokens.push({
                    type: 'string',
                    value
                });
            }
            continue;
        }
        let WHITESPACE = /\s/;
        if (char && WHITESPACE.test(char)) {
            current++;
            continue;
        }
        let NUMBERS = /[0-9]/;
        if (char && NUMBERS.test(char) || char === '-' || char === '.') {
            let value = '';
            if (char === '-') {
                value += char;
                char = input[++current];
            }
            while(char && NUMBERS.test(char) || char === '.'){
                value += char;
                char = input[++current];
            }
            tokens.push({
                type: 'number',
                value
            });
            continue;
        }
        let LETTERS = /[a-z]/i;
        if (char && LETTERS.test(char)) {
            let value = '';
            while(char && LETTERS.test(char)){
                if (current === input.length) {
                    break;
                }
                value += char;
                char = input[++current];
            }
            if (value == 'true' || value == 'false' || value === 'null') {
                tokens.push({
                    type: 'name',
                    value
                });
            } else {
                // unknown token, e.g. `nul` which isn't quite `null`
                current++;
                continue;
            }
            continue;
        }
        current++;
    }
    return tokens;
}, strip = (tokens)=>{
    if (tokens.length === 0) {
        return tokens;
    }
    let lastToken = tokens[tokens.length - 1];
    switch(lastToken.type){
        case 'separator':
            tokens = tokens.slice(0, tokens.length - 1);
            return strip(tokens);
            //TURBOPACK unreachable
            ;
        case 'number':
            let lastCharacterOfLastToken = lastToken.value[lastToken.value.length - 1];
            if (lastCharacterOfLastToken === '.' || lastCharacterOfLastToken === '-') {
                tokens = tokens.slice(0, tokens.length - 1);
                return strip(tokens);
            }
        case 'string':
            let tokenBeforeTheLastToken = tokens[tokens.length - 2];
            if (tokenBeforeTheLastToken?.type === 'delimiter') {
                tokens = tokens.slice(0, tokens.length - 1);
                return strip(tokens);
            } else if (tokenBeforeTheLastToken?.type === 'brace' && tokenBeforeTheLastToken.value === '{') {
                tokens = tokens.slice(0, tokens.length - 1);
                return strip(tokens);
            }
            break;
        case 'delimiter':
            tokens = tokens.slice(0, tokens.length - 1);
            return strip(tokens);
            //TURBOPACK unreachable
            ;
    }
    return tokens;
}, unstrip = (tokens)=>{
    let tail = [];
    tokens.map((token)=>{
        if (token.type === 'brace') {
            if (token.value === '{') {
                tail.push('}');
            } else {
                tail.splice(tail.lastIndexOf('}'), 1);
            }
        }
        if (token.type === 'paren') {
            if (token.value === '[') {
                tail.push(']');
            } else {
                tail.splice(tail.lastIndexOf(']'), 1);
            }
        }
    });
    if (tail.length > 0) {
        tail.reverse().map((item)=>{
            if (item === '}') {
                tokens.push({
                    type: 'brace',
                    value: '}'
                });
            } else if (item === ']') {
                tokens.push({
                    type: 'paren',
                    value: ']'
                });
            }
        });
    }
    return tokens;
}, generate = (tokens)=>{
    let output = '';
    tokens.map((token)=>{
        switch(token.type){
            case 'string':
                output += '"' + token.value + '"';
                break;
            default:
                output += token.value;
                break;
        }
    });
    return output;
}, partialParse = (input)=>JSON.parse(generate(unstrip(strip(tokenize(input)))));
;
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/streaming.mjs [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$streaming$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/streaming.mjs [app-route] (ecmascript)");
;
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/BetaMessageStream.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BetaMessageStream",
    ()=>BetaMessageStream
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/tslib.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$_vendor$2f$partial$2d$json$2d$parser$2f$parser$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/_vendor/partial-json-parser/parser.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/error.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/error.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$errors$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/errors.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$streaming$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/streaming.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$streaming$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/streaming.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$beta$2d$parser$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/beta-parser.mjs [app-route] (ecmascript)");
var _BetaMessageStream_instances, _BetaMessageStream_currentMessageSnapshot, _BetaMessageStream_params, _BetaMessageStream_connectedPromise, _BetaMessageStream_resolveConnectedPromise, _BetaMessageStream_rejectConnectedPromise, _BetaMessageStream_endPromise, _BetaMessageStream_resolveEndPromise, _BetaMessageStream_rejectEndPromise, _BetaMessageStream_listeners, _BetaMessageStream_ended, _BetaMessageStream_errored, _BetaMessageStream_aborted, _BetaMessageStream_catchingPromiseCreated, _BetaMessageStream_response, _BetaMessageStream_request_id, _BetaMessageStream_logger, _BetaMessageStream_getFinalMessage, _BetaMessageStream_getFinalText, _BetaMessageStream_handleError, _BetaMessageStream_beginRequest, _BetaMessageStream_addStreamEvent, _BetaMessageStream_endRequest, _BetaMessageStream_accumulateMessage;
;
;
;
;
;
;
const JSON_BUF_PROPERTY = '__json_buf';
function tracksToolInput(content) {
    return content.type === 'tool_use' || content.type === 'server_tool_use' || content.type === 'mcp_tool_use';
}
class BetaMessageStream {
    constructor(params, opts){
        _BetaMessageStream_instances.add(this);
        this.messages = [];
        this.receivedMessages = [];
        _BetaMessageStream_currentMessageSnapshot.set(this, void 0);
        _BetaMessageStream_params.set(this, null);
        this.controller = new AbortController();
        _BetaMessageStream_connectedPromise.set(this, void 0);
        _BetaMessageStream_resolveConnectedPromise.set(this, ()=>{});
        _BetaMessageStream_rejectConnectedPromise.set(this, ()=>{});
        _BetaMessageStream_endPromise.set(this, void 0);
        _BetaMessageStream_resolveEndPromise.set(this, ()=>{});
        _BetaMessageStream_rejectEndPromise.set(this, ()=>{});
        _BetaMessageStream_listeners.set(this, {});
        _BetaMessageStream_ended.set(this, false);
        _BetaMessageStream_errored.set(this, false);
        _BetaMessageStream_aborted.set(this, false);
        _BetaMessageStream_catchingPromiseCreated.set(this, false);
        _BetaMessageStream_response.set(this, void 0);
        _BetaMessageStream_request_id.set(this, void 0);
        _BetaMessageStream_logger.set(this, void 0);
        _BetaMessageStream_handleError.set(this, (error)=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_errored, true, "f");
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$errors$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAbortError"])(error)) {
                error = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIUserAbortError"]();
            }
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIUserAbortError"]) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_aborted, true, "f");
                return this._emit('abort', error);
            }
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"]) {
                return this._emit('error', error);
            }
            if (error instanceof Error) {
                const anthropicError = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](error.message);
                // @ts-ignore
                anthropicError.cause = error;
                return this._emit('error', anthropicError);
            }
            return this._emit('error', new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](String(error)));
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_connectedPromise, new Promise((resolve, reject)=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_resolveConnectedPromise, resolve, "f");
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_rejectConnectedPromise, reject, "f");
        }), "f");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_endPromise, new Promise((resolve, reject)=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_resolveEndPromise, resolve, "f");
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_rejectEndPromise, reject, "f");
        }), "f");
        // Don't let these promises cause unhandled rejection errors.
        // we will manually cause an unhandled rejection error later
        // if the user hasn't registered any error listener or called
        // any promise-returning method.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_connectedPromise, "f").catch(()=>{});
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_endPromise, "f").catch(()=>{});
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_params, params, "f");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_logger, opts?.logger ?? console, "f");
    }
    get response() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_response, "f");
    }
    get request_id() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_request_id, "f");
    }
    /**
     * Returns the `MessageStream` data, the raw `Response` instance and the ID of the request,
     * returned vie the `request-id` header which is useful for debugging requests and resporting
     * issues to Anthropic.
     *
     * This is the same as the `APIPromise.withResponse()` method.
     *
     * This method will raise an error if you created the stream using `MessageStream.fromReadableStream`
     * as no `Response` is available.
     */ async withResponse() {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_catchingPromiseCreated, true, "f");
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_connectedPromise, "f");
        if (!response) {
            throw new Error('Could not resolve a `Response` object');
        }
        return {
            data: this,
            response,
            request_id: response.headers.get('request-id')
        };
    }
    /**
     * Intended for use on the frontend, consuming a stream produced with
     * `.toReadableStream()` on the backend.
     *
     * Note that messages sent to the model do not appear in `.on('message')`
     * in this context.
     */ static fromReadableStream(stream) {
        const runner = new BetaMessageStream(null);
        runner._run(()=>runner._fromReadableStream(stream));
        return runner;
    }
    static createMessage(messages, params, options, { logger } = {}) {
        const runner = new BetaMessageStream(params, {
            logger
        });
        for (const message of params.messages){
            runner._addMessageParam(message);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(runner, _BetaMessageStream_params, {
            ...params,
            stream: true
        }, "f");
        runner._run(()=>runner._createMessage(messages, {
                ...params,
                stream: true
            }, {
                ...options,
                headers: {
                    ...options?.headers,
                    'X-Stainless-Helper-Method': 'stream'
                }
            }));
        return runner;
    }
    _run(executor) {
        executor().then(()=>{
            this._emitFinal();
            this._emit('end');
        }, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_handleError, "f"));
    }
    _addMessageParam(message) {
        this.messages.push(message);
    }
    _addMessage(message, emit = true) {
        this.receivedMessages.push(message);
        if (emit) {
            this._emit('message', message);
        }
    }
    async _createMessage(messages, params, options) {
        const signal = options?.signal;
        let abortHandler;
        if (signal) {
            if (signal.aborted) this.controller.abort();
            abortHandler = this.controller.abort.bind(this.controller);
            signal.addEventListener('abort', abortHandler);
        }
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_instances, "m", _BetaMessageStream_beginRequest).call(this);
            const { response, data: stream } = await messages.create({
                ...params,
                stream: true
            }, {
                ...options,
                signal: this.controller.signal
            }).withResponse();
            this._connected(response);
            for await (const event of stream){
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_instances, "m", _BetaMessageStream_addStreamEvent).call(this, event);
            }
            if (stream.controller.signal?.aborted) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIUserAbortError"]();
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_instances, "m", _BetaMessageStream_endRequest).call(this);
        } finally{
            if (signal && abortHandler) {
                signal.removeEventListener('abort', abortHandler);
            }
        }
    }
    _connected(response) {
        if (this.ended) return;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_response, response, "f");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_request_id, response?.headers.get('request-id'), "f");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_resolveConnectedPromise, "f").call(this, response);
        this._emit('connect');
    }
    get ended() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_ended, "f");
    }
    get errored() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_errored, "f");
    }
    get aborted() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_aborted, "f");
    }
    abort() {
        this.controller.abort();
    }
    /**
     * Adds the listener function to the end of the listeners array for the event.
     * No checks are made to see if the listener has already been added. Multiple calls passing
     * the same combination of event and listener will result in the listener being added, and
     * called, multiple times.
     * @returns this MessageStream, so that calls can be chained
     */ on(event, listener) {
        const listeners = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_listeners, "f")[event] || ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_listeners, "f")[event] = []);
        listeners.push({
            listener
        });
        return this;
    }
    /**
     * Removes the specified listener from the listener array for the event.
     * off() will remove, at most, one instance of a listener from the listener array. If any single
     * listener has been added multiple times to the listener array for the specified event, then
     * off() must be called multiple times to remove each instance.
     * @returns this MessageStream, so that calls can be chained
     */ off(event, listener) {
        const listeners = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_listeners, "f")[event];
        if (!listeners) return this;
        const index = listeners.findIndex((l)=>l.listener === listener);
        if (index >= 0) listeners.splice(index, 1);
        return this;
    }
    /**
     * Adds a one-time listener function for the event. The next time the event is triggered,
     * this listener is removed and then invoked.
     * @returns this MessageStream, so that calls can be chained
     */ once(event, listener) {
        const listeners = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_listeners, "f")[event] || ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_listeners, "f")[event] = []);
        listeners.push({
            listener,
            once: true
        });
        return this;
    }
    /**
     * This is similar to `.once()`, but returns a Promise that resolves the next time
     * the event is triggered, instead of calling a listener callback.
     * @returns a Promise that resolves the next time given event is triggered,
     * or rejects if an error is emitted.  (If you request the 'error' event,
     * returns a promise that resolves with the error).
     *
     * Example:
     *
     *   const message = await stream.emitted('message') // rejects if the stream errors
     */ emitted(event) {
        return new Promise((resolve, reject)=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_catchingPromiseCreated, true, "f");
            if (event !== 'error') this.once('error', reject);
            this.once(event, resolve);
        });
    }
    async done() {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_catchingPromiseCreated, true, "f");
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_endPromise, "f");
    }
    get currentMessage() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_currentMessageSnapshot, "f");
    }
    /**
     * @returns a promise that resolves with the the final assistant Message response,
     * or rejects if an error occurred or the stream ended prematurely without producing a Message.
     * If structured outputs were used, this will be a ParsedMessage with a `parsed` field.
     */ async finalMessage() {
        await this.done();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_instances, "m", _BetaMessageStream_getFinalMessage).call(this);
    }
    /**
     * @returns a promise that resolves with the the final assistant Message's text response, concatenated
     * together if there are more than one text blocks.
     * Rejects if an error occurred or the stream ended prematurely without producing a Message.
     */ async finalText() {
        await this.done();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_instances, "m", _BetaMessageStream_getFinalText).call(this);
    }
    _emit(event, ...args) {
        // make sure we don't emit any MessageStreamEvents after end
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_ended, "f")) return;
        if (event === 'end') {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_ended, true, "f");
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_resolveEndPromise, "f").call(this);
        }
        const listeners = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_listeners, "f")[event];
        if (listeners) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_listeners, "f")[event] = listeners.filter((l)=>!l.once);
            listeners.forEach(({ listener })=>listener(...args));
        }
        if (event === 'abort') {
            const error = args[0];
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
                Promise.reject(error);
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_rejectConnectedPromise, "f").call(this, error);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_rejectEndPromise, "f").call(this, error);
            this._emit('end');
            return;
        }
        if (event === 'error') {
            // NOTE: _emit('error', error) should only be called from #handleError().
            const error = args[0];
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
                // Trigger an unhandled rejection if the user hasn't registered any error handlers.
                // If you are seeing stack traces here, make sure to handle errors via either:
                // - runner.on('error', () => ...)
                // - await runner.done()
                // - await runner.final...()
                // - etc.
                Promise.reject(error);
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_rejectConnectedPromise, "f").call(this, error);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_rejectEndPromise, "f").call(this, error);
            this._emit('end');
        }
    }
    _emitFinal() {
        const finalMessage = this.receivedMessages.at(-1);
        if (finalMessage) {
            this._emit('finalMessage', (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_instances, "m", _BetaMessageStream_getFinalMessage).call(this));
        }
    }
    async _fromReadableStream(readableStream, options) {
        const signal = options?.signal;
        let abortHandler;
        if (signal) {
            if (signal.aborted) this.controller.abort();
            abortHandler = this.controller.abort.bind(this.controller);
            signal.addEventListener('abort', abortHandler);
        }
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_instances, "m", _BetaMessageStream_beginRequest).call(this);
            this._connected(null);
            const stream = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$streaming$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Stream"].fromReadableStream(readableStream, this.controller);
            for await (const event of stream){
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_instances, "m", _BetaMessageStream_addStreamEvent).call(this, event);
            }
            if (stream.controller.signal?.aborted) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIUserAbortError"]();
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_instances, "m", _BetaMessageStream_endRequest).call(this);
        } finally{
            if (signal && abortHandler) {
                signal.removeEventListener('abort', abortHandler);
            }
        }
    }
    [(_BetaMessageStream_currentMessageSnapshot = new WeakMap(), _BetaMessageStream_params = new WeakMap(), _BetaMessageStream_connectedPromise = new WeakMap(), _BetaMessageStream_resolveConnectedPromise = new WeakMap(), _BetaMessageStream_rejectConnectedPromise = new WeakMap(), _BetaMessageStream_endPromise = new WeakMap(), _BetaMessageStream_resolveEndPromise = new WeakMap(), _BetaMessageStream_rejectEndPromise = new WeakMap(), _BetaMessageStream_listeners = new WeakMap(), _BetaMessageStream_ended = new WeakMap(), _BetaMessageStream_errored = new WeakMap(), _BetaMessageStream_aborted = new WeakMap(), _BetaMessageStream_catchingPromiseCreated = new WeakMap(), _BetaMessageStream_response = new WeakMap(), _BetaMessageStream_request_id = new WeakMap(), _BetaMessageStream_logger = new WeakMap(), _BetaMessageStream_handleError = new WeakMap(), _BetaMessageStream_instances = new WeakSet(), _BetaMessageStream_getFinalMessage = function _BetaMessageStream_getFinalMessage() {
        if (this.receivedMessages.length === 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"]('stream ended without producing a Message with role=assistant');
        }
        return this.receivedMessages.at(-1);
    }, _BetaMessageStream_getFinalText = function _BetaMessageStream_getFinalText() {
        if (this.receivedMessages.length === 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"]('stream ended without producing a Message with role=assistant');
        }
        const textBlocks = this.receivedMessages.at(-1).content.filter((block)=>block.type === 'text').map((block)=>block.text);
        if (textBlocks.length === 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"]('stream ended without producing a content block with type=text');
        }
        return textBlocks.join(' ');
    }, _BetaMessageStream_beginRequest = function _BetaMessageStream_beginRequest() {
        if (this.ended) return;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_currentMessageSnapshot, undefined, "f");
    }, _BetaMessageStream_addStreamEvent = function _BetaMessageStream_addStreamEvent(event) {
        if (this.ended) return;
        const messageSnapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_instances, "m", _BetaMessageStream_accumulateMessage).call(this, event);
        this._emit('streamEvent', event, messageSnapshot);
        switch(event.type){
            case 'content_block_delta':
                {
                    const content = messageSnapshot.content.at(-1);
                    switch(event.delta.type){
                        case 'text_delta':
                            {
                                if (content.type === 'text') {
                                    this._emit('text', event.delta.text, content.text || '');
                                }
                                break;
                            }
                        case 'citations_delta':
                            {
                                if (content.type === 'text') {
                                    this._emit('citation', event.delta.citation, content.citations ?? []);
                                }
                                break;
                            }
                        case 'input_json_delta':
                            {
                                if (tracksToolInput(content) && content.input) {
                                    this._emit('inputJson', event.delta.partial_json, content.input);
                                }
                                break;
                            }
                        case 'thinking_delta':
                            {
                                if (content.type === 'thinking') {
                                    this._emit('thinking', event.delta.thinking, content.thinking);
                                }
                                break;
                            }
                        case 'signature_delta':
                            {
                                if (content.type === 'thinking') {
                                    this._emit('signature', content.signature);
                                }
                                break;
                            }
                        case 'compaction_delta':
                            {
                                if (content.type === 'compaction' && content.content) {
                                    this._emit('compaction', content.content);
                                }
                                break;
                            }
                        default:
                            checkNever(event.delta);
                    }
                    break;
                }
            case 'message_stop':
                {
                    this._addMessageParam(messageSnapshot);
                    this._addMessage((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$beta$2d$parser$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maybeParseBetaMessage"])(messageSnapshot, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_params, "f"), {
                        logger: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_logger, "f")
                    }), true);
                    break;
                }
            case 'content_block_stop':
                {
                    this._emit('contentBlock', messageSnapshot.content.at(-1));
                    break;
                }
            case 'message_start':
                {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_currentMessageSnapshot, messageSnapshot, "f");
                    break;
                }
            case 'content_block_start':
            case 'message_delta':
                break;
        }
    }, _BetaMessageStream_endRequest = function _BetaMessageStream_endRequest() {
        if (this.ended) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`stream has ended, this shouldn't happen`);
        }
        const snapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_currentMessageSnapshot, "f");
        if (!snapshot) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`request ended without sending any chunks`);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaMessageStream_currentMessageSnapshot, undefined, "f");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$beta$2d$parser$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maybeParseBetaMessage"])(snapshot, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_params, "f"), {
            logger: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_logger, "f")
        });
    }, _BetaMessageStream_accumulateMessage = function _BetaMessageStream_accumulateMessage(event) {
        let snapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_currentMessageSnapshot, "f");
        if (event.type === 'message_start') {
            if (snapshot) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`Unexpected event order, got ${event.type} before receiving "message_stop"`);
            }
            return event.message;
        }
        if (!snapshot) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`Unexpected event order, got ${event.type} before "message_start"`);
        }
        switch(event.type){
            case 'message_stop':
                return snapshot;
            case 'message_delta':
                snapshot.container = event.delta.container;
                snapshot.stop_reason = event.delta.stop_reason;
                snapshot.stop_sequence = event.delta.stop_sequence;
                snapshot.usage.output_tokens = event.usage.output_tokens;
                snapshot.context_management = event.context_management;
                if (event.usage.input_tokens != null) {
                    snapshot.usage.input_tokens = event.usage.input_tokens;
                }
                if (event.usage.cache_creation_input_tokens != null) {
                    snapshot.usage.cache_creation_input_tokens = event.usage.cache_creation_input_tokens;
                }
                if (event.usage.cache_read_input_tokens != null) {
                    snapshot.usage.cache_read_input_tokens = event.usage.cache_read_input_tokens;
                }
                if (event.usage.server_tool_use != null) {
                    snapshot.usage.server_tool_use = event.usage.server_tool_use;
                }
                if (event.usage.iterations != null) {
                    snapshot.usage.iterations = event.usage.iterations;
                }
                return snapshot;
            case 'content_block_start':
                snapshot.content.push(event.content_block);
                return snapshot;
            case 'content_block_delta':
                {
                    const snapshotContent = snapshot.content.at(event.index);
                    switch(event.delta.type){
                        case 'text_delta':
                            {
                                if (snapshotContent?.type === 'text') {
                                    snapshot.content[event.index] = {
                                        ...snapshotContent,
                                        text: (snapshotContent.text || '') + event.delta.text
                                    };
                                }
                                break;
                            }
                        case 'citations_delta':
                            {
                                if (snapshotContent?.type === 'text') {
                                    snapshot.content[event.index] = {
                                        ...snapshotContent,
                                        citations: [
                                            ...snapshotContent.citations ?? [],
                                            event.delta.citation
                                        ]
                                    };
                                }
                                break;
                            }
                        case 'input_json_delta':
                            {
                                if (snapshotContent && tracksToolInput(snapshotContent)) {
                                    // we need to keep track of the raw JSON string as well so that we can
                                    // re-parse it for each delta, for now we just store it as an untyped
                                    // non-enumerable property on the snapshot
                                    let jsonBuf = snapshotContent[JSON_BUF_PROPERTY] || '';
                                    jsonBuf += event.delta.partial_json;
                                    const newContent = {
                                        ...snapshotContent
                                    };
                                    Object.defineProperty(newContent, JSON_BUF_PROPERTY, {
                                        value: jsonBuf,
                                        enumerable: false,
                                        writable: true
                                    });
                                    if (jsonBuf) {
                                        try {
                                            newContent.input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$_vendor$2f$partial$2d$json$2d$parser$2f$parser$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["partialParse"])(jsonBuf);
                                        } catch (err) {
                                            const error = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${err}. JSON: ${jsonBuf}`);
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaMessageStream_handleError, "f").call(this, error);
                                        }
                                    }
                                    snapshot.content[event.index] = newContent;
                                }
                                break;
                            }
                        case 'thinking_delta':
                            {
                                if (snapshotContent?.type === 'thinking') {
                                    snapshot.content[event.index] = {
                                        ...snapshotContent,
                                        thinking: snapshotContent.thinking + event.delta.thinking
                                    };
                                }
                                break;
                            }
                        case 'signature_delta':
                            {
                                if (snapshotContent?.type === 'thinking') {
                                    snapshot.content[event.index] = {
                                        ...snapshotContent,
                                        signature: event.delta.signature
                                    };
                                }
                                break;
                            }
                        case 'compaction_delta':
                            {
                                if (snapshotContent?.type === 'compaction') {
                                    snapshot.content[event.index] = {
                                        ...snapshotContent,
                                        content: (snapshotContent.content || '') + event.delta.content
                                    };
                                }
                                break;
                            }
                        default:
                            checkNever(event.delta);
                    }
                    return snapshot;
                }
            case 'content_block_stop':
                return snapshot;
        }
    }, Symbol.asyncIterator)]() {
        const pushQueue = [];
        const readQueue = [];
        let done = false;
        this.on('streamEvent', (event)=>{
            const reader = readQueue.shift();
            if (reader) {
                reader.resolve(event);
            } else {
                pushQueue.push(event);
            }
        });
        this.on('end', ()=>{
            done = true;
            for (const reader of readQueue){
                reader.resolve(undefined);
            }
            readQueue.length = 0;
        });
        this.on('abort', (err)=>{
            done = true;
            for (const reader of readQueue){
                reader.reject(err);
            }
            readQueue.length = 0;
        });
        this.on('error', (err)=>{
            done = true;
            for (const reader of readQueue){
                reader.reject(err);
            }
            readQueue.length = 0;
        });
        return {
            next: async ()=>{
                if (!pushQueue.length) {
                    if (done) {
                        return {
                            value: undefined,
                            done: true
                        };
                    }
                    return new Promise((resolve, reject)=>readQueue.push({
                            resolve,
                            reject
                        })).then((chunk)=>chunk ? {
                            value: chunk,
                            done: false
                        } : {
                            value: undefined,
                            done: true
                        });
                }
                const chunk = pushQueue.shift();
                return {
                    value: chunk,
                    done: false
                };
            },
            return: async ()=>{
                this.abort();
                return {
                    value: undefined,
                    done: true
                };
            }
        };
    }
    toReadableStream() {
        const stream = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$streaming$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Stream"](this[Symbol.asyncIterator].bind(this), this.controller);
        return stream.toReadableStream();
    }
}
// used to ensure exhaustive case matching without throwing a runtime error
function checkNever(x) {}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/tools/ToolError.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * An error that can be thrown from a tool's `run` method to return structured
 * content blocks as the error result, rather than just a string message.
 *
 * When the ToolRunner catches this error, it will use the `content` property
 * as the tool result with `is_error: true`.
 *
 * @example
 * ```ts
 * const tool = {
 *   name: 'my_tool',
 *   run: async (input) => {
 *     if (somethingWentWrong) {
 *       throw new ToolError([
 *         { type: 'text', text: 'Error details here' },
 *         { type: 'image', source: { type: 'base64', data: '...', media_type: 'image/png' } },
 *       ]);
 *     }
 *     return 'success';
 *   },
 * };
 * ```
 */ __turbopack_context__.s([
    "ToolError",
    ()=>ToolError
]);
class ToolError extends Error {
    constructor(content){
        const message = typeof content === 'string' ? content : content.map((block)=>{
            if (block.type === 'text') return block.text;
            return `[${block.type}]`;
        }).join(' ');
        super(message);
        this.name = 'ToolError';
        this.content = content;
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/tools/CompactionControl.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_SUMMARY_PROMPT",
    ()=>DEFAULT_SUMMARY_PROMPT,
    "DEFAULT_TOKEN_THRESHOLD",
    ()=>DEFAULT_TOKEN_THRESHOLD
]);
const DEFAULT_TOKEN_THRESHOLD = 100000;
const DEFAULT_SUMMARY_PROMPT = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
1. Task Overview
The user's core request and success criteria
Any clarifications or constraints they specified
2. Current State
What has been completed so far
Files created, modified, or analyzed (with paths if relevant)
Key outputs or artifacts produced
3. Important Discoveries
Technical constraints or requirements uncovered
Decisions made and their rationale
Errors encountered and how they were resolved
What approaches were tried that didn't work (and why)
4. Next Steps
Specific actions needed to complete the task
Any blockers or open questions to resolve
Priority order if multiple steps remain
5. Context to Preserve
User preferences or style requirements
Domain-specific details that aren't obvious
Any promises made to the user
Be concise but complete—err on the side of including information that would prevent duplicate work or repeated mistakes. Write in a way that enables immediate resumption of the task.
Wrap your summary in <summary></summary> tags.`;
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/tools/BetaToolRunner.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BetaToolRunner",
    ()=>BetaToolRunner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/tslib.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$tools$2f$ToolError$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/tools/ToolError.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/error.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$tools$2f$CompactionControl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/tools/CompactionControl.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$stainless$2d$helper$2d$header$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/stainless-helper-header.mjs [app-route] (ecmascript)");
var _BetaToolRunner_instances, _BetaToolRunner_consumed, _BetaToolRunner_mutated, _BetaToolRunner_state, _BetaToolRunner_options, _BetaToolRunner_message, _BetaToolRunner_toolResponse, _BetaToolRunner_completion, _BetaToolRunner_iterationCount, _BetaToolRunner_checkAndCompact, _BetaToolRunner_generateToolResponse;
;
;
;
;
;
;
/**
 * Just Promise.withResolvers(), which is not available in all environments.
 */ function promiseWithResolvers() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej)=>{
        resolve = res;
        reject = rej;
    });
    return {
        promise,
        resolve: resolve,
        reject: reject
    };
}
class BetaToolRunner {
    constructor(client, params, options){
        _BetaToolRunner_instances.add(this);
        this.client = client;
        /** Whether the async iterator has been consumed */ _BetaToolRunner_consumed.set(this, false);
        /** Whether parameters have been mutated since the last API call */ _BetaToolRunner_mutated.set(this, false);
        /** Current state containing the request parameters */ _BetaToolRunner_state.set(this, void 0);
        _BetaToolRunner_options.set(this, void 0);
        /** Promise for the last message received from the assistant */ _BetaToolRunner_message.set(this, void 0);
        /** Cached tool response to avoid redundant executions */ _BetaToolRunner_toolResponse.set(this, void 0);
        /** Promise resolvers for waiting on completion */ _BetaToolRunner_completion.set(this, void 0);
        /** Number of iterations (API requests) made so far */ _BetaToolRunner_iterationCount.set(this, 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_state, {
            params: {
                // You can't clone the entire params since there are functions as handlers.
                // You also don't really need to clone params.messages, but it probably will prevent a foot gun
                // somewhere.
                ...params,
                messages: structuredClone(params.messages)
            }
        }, "f");
        const helpers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$stainless$2d$helper$2d$header$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["collectStainlessHelpers"])(params.tools, params.messages);
        const helperValue = [
            'BetaToolRunner',
            ...helpers
        ].join(', ');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_options, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'x-stainless-helper': helperValue
                },
                options?.headers
            ])
        }, "f");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_completion, promiseWithResolvers(), "f");
        if (params.compactionControl?.enabled) {
            console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. ' + 'Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. ' + 'See https://platform.claude.com/docs/en/build-with-claude/compaction');
        }
    }
    async *[(_BetaToolRunner_consumed = new WeakMap(), _BetaToolRunner_mutated = new WeakMap(), _BetaToolRunner_state = new WeakMap(), _BetaToolRunner_options = new WeakMap(), _BetaToolRunner_message = new WeakMap(), _BetaToolRunner_toolResponse = new WeakMap(), _BetaToolRunner_completion = new WeakMap(), _BetaToolRunner_iterationCount = new WeakMap(), _BetaToolRunner_instances = new WeakSet(), _BetaToolRunner_checkAndCompact = async function _BetaToolRunner_checkAndCompact() {
        const compactionControl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_state, "f").params.compactionControl;
        if (!compactionControl || !compactionControl.enabled) {
            return false;
        }
        let tokensUsed = 0;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_message, "f") !== undefined) {
            try {
                const message = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_message, "f");
                const totalInputTokens = message.usage.input_tokens + (message.usage.cache_creation_input_tokens ?? 0) + (message.usage.cache_read_input_tokens ?? 0);
                tokensUsed = totalInputTokens + message.usage.output_tokens;
            } catch  {
                // If we can't get the message, skip compaction
                return false;
            }
        }
        const threshold = compactionControl.contextTokenThreshold ?? __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$tools$2f$CompactionControl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_TOKEN_THRESHOLD"];
        if (tokensUsed < threshold) {
            return false;
        }
        const model = compactionControl.model ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_state, "f").params.model;
        const summaryPrompt = compactionControl.summaryPrompt ?? __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$tools$2f$CompactionControl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_SUMMARY_PROMPT"];
        const messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_state, "f").params.messages;
        if (messages[messages.length - 1].role === 'assistant') {
            // Remove tool_use blocks from the last message to avoid 400 error
            // (tool_use requires tool_result, which we don't have yet)
            const lastMessage = messages[messages.length - 1];
            if (Array.isArray(lastMessage.content)) {
                const nonToolBlocks = lastMessage.content.filter((block)=>block.type !== 'tool_use');
                if (nonToolBlocks.length === 0) {
                    // If all blocks were tool_use, just remove the message entirely
                    messages.pop();
                } else {
                    lastMessage.content = nonToolBlocks;
                }
            }
        }
        const response = await this.client.beta.messages.create({
            model,
            messages: [
                ...messages,
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: summaryPrompt
                        }
                    ]
                }
            ],
            max_tokens: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_state, "f").params.max_tokens
        }, {
            signal: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_options, "f").signal,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_options, "f").headers,
                {
                    'x-stainless-helper': 'compaction'
                }
            ])
        });
        if (response.content[0]?.type !== 'text') {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"]('Expected text response for compaction');
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_state, "f").params.messages = [
            {
                role: 'user',
                content: response.content
            }
        ];
        return true;
    }, Symbol.asyncIterator)]() {
        var _a;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_consumed, "f")) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"]('Cannot iterate over a consumed stream');
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_consumed, true, "f");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_mutated, true, "f");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_toolResponse, undefined, "f");
        try {
            while(true){
                let stream;
                try {
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_state, "f").params.max_iterations && (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_iterationCount, "f") >= (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_state, "f").params.max_iterations) {
                        break;
                    }
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_mutated, false, "f");
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_toolResponse, undefined, "f");
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_iterationCount, (_a = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_iterationCount, "f"), _a++, _a), "f");
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_message, undefined, "f");
                    const { max_iterations, compactionControl, ...params } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_state, "f").params;
                    if (params.stream) {
                        stream = this.client.beta.messages.stream({
                            ...params
                        }, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_options, "f"));
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_message, stream.finalMessage(), "f");
                        // Make sure that this promise doesn't throw before we get the option to do something about it.
                        // Error will be caught when we call await this.#message ultimately
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_message, "f").catch(()=>{});
                        yield stream;
                    } else {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_message, this.client.beta.messages.create({
                            ...params,
                            stream: false
                        }, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_options, "f")), "f");
                        yield (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_message, "f");
                    }
                    const isCompacted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_instances, "m", _BetaToolRunner_checkAndCompact).call(this);
                    if (!isCompacted) {
                        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_mutated, "f")) {
                            const { role, content } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_message, "f");
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_state, "f").params.messages.push({
                                role,
                                content
                            });
                        }
                        const toolMessage = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_instances, "m", _BetaToolRunner_generateToolResponse).call(this, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_state, "f").params.messages.at(-1));
                        if (toolMessage) {
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_state, "f").params.messages.push(toolMessage);
                        } else if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_mutated, "f")) {
                            break;
                        }
                    }
                } finally{
                    if (stream) {
                        stream.abort();
                    }
                }
            }
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_message, "f")) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"]('ToolRunner concluded without a message from the server');
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_completion, "f").resolve(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_message, "f"));
        } catch (error) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_consumed, false, "f");
            // Silence unhandled promise errors
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_completion, "f").promise.catch(()=>{});
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_completion, "f").reject(error);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_completion, promiseWithResolvers(), "f");
            throw error;
        }
    }
    setMessagesParams(paramsOrMutator) {
        if (typeof paramsOrMutator === 'function') {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_state, "f").params = paramsOrMutator((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_state, "f").params);
        } else {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_state, "f").params = paramsOrMutator;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_mutated, true, "f");
        // Invalidate cached tool response since parameters changed
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_toolResponse, undefined, "f");
    }
    setRequestOptions(optionsOrMutator) {
        if (typeof optionsOrMutator === 'function') {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_options, optionsOrMutator((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_options, "f")), "f");
        } else {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_options, {
                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_options, "f"),
                ...optionsOrMutator
            }, "f");
        }
    }
    /**
     * Get the tool response for the last message from the assistant.
     * Avoids redundant tool executions by caching results.
     *
     * @returns A promise that resolves to a BetaMessageParam containing tool results, or null if no tools need to be executed
     *
     * @example
     * const toolResponse = await runner.generateToolResponse();
     * if (toolResponse) {
     *   console.log('Tool results:', toolResponse.content);
     * }
     */ async generateToolResponse(signal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_options, "f").signal) {
        const message = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_message, "f") ?? this.params.messages.at(-1);
        if (!message) {
            return null;
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_instances, "m", _BetaToolRunner_generateToolResponse).call(this, message, signal);
    }
    /**
     * Wait for the async iterator to complete. This works even if the async iterator hasn't yet started, and
     * will wait for an instance to start and go to completion.
     *
     * @returns A promise that resolves to the final BetaMessage when the iterator completes
     *
     * @example
     * // Start consuming the iterator
     * for await (const message of runner) {
     *   console.log('Message:', message.content);
     * }
     *
     * // Meanwhile, wait for completion from another part of the code
     * const finalMessage = await runner.done();
     * console.log('Final response:', finalMessage.content);
     */ done() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_completion, "f").promise;
    }
    /**
     * Returns a promise indicating that the stream is done. Unlike .done(), this will eagerly read the stream:
     * * If the iterator has not been consumed, consume the entire iterator and return the final message from the
     * assistant.
     * * If the iterator has been consumed, waits for it to complete and returns the final message.
     *
     * @returns A promise that resolves to the final BetaMessage from the conversation
     * @throws {AnthropicError} If no messages were processed during the conversation
     *
     * @example
     * const finalMessage = await runner.runUntilDone();
     * console.log('Final response:', finalMessage.content);
     */ async runUntilDone() {
        // If not yet consumed, start consuming and wait for completion
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_consumed, "f")) {
            for await (const _ of this){
            // Iterator naturally populates this.#message
            }
        }
        // If consumed but not completed, wait for completion
        return this.done();
    }
    /**
     * Get the current parameters being used by the ToolRunner.
     *
     * @returns A readonly view of the current ToolRunnerParams
     *
     * @example
     * const currentParams = runner.params;
     * console.log('Current model:', currentParams.model);
     * console.log('Message count:', currentParams.messages.length);
     */ get params() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_state, "f").params;
    }
    /**
     * Add one or more messages to the conversation history.
     *
     * @param messages - One or more BetaMessageParam objects to add to the conversation
     *
     * @example
     * runner.pushMessages(
     *   { role: 'user', content: 'Also, what about the weather in NYC?' }
     * );
     *
     * @example
     * // Adding multiple messages
     * runner.pushMessages(
     *   { role: 'user', content: 'What about NYC?' },
     *   { role: 'user', content: 'And Boston?' }
     * );
     */ pushMessages(...messages) {
        this.setMessagesParams((params)=>({
                ...params,
                messages: [
                    ...params.messages,
                    ...messages
                ]
            }));
    }
    /**
     * Makes the ToolRunner directly awaitable, equivalent to calling .runUntilDone()
     * This allows using `await runner` instead of `await runner.runUntilDone()`
     */ then(onfulfilled, onrejected) {
        return this.runUntilDone().then(onfulfilled, onrejected);
    }
}
_BetaToolRunner_generateToolResponse = async function _BetaToolRunner_generateToolResponse(lastMessage, signal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_options, "f").signal) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_toolResponse, "f") !== undefined) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_toolResponse, "f");
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BetaToolRunner_toolResponse, generateToolResponse((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_state, "f").params, lastMessage, {
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_options, "f"),
        signal
    }), "f");
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BetaToolRunner_toolResponse, "f");
};
async function generateToolResponse(params, lastMessage = params.messages.at(-1), requestOptions) {
    // Only process if the last message is from the assistant and has tool use blocks
    if (!lastMessage || lastMessage.role !== 'assistant' || !lastMessage.content || typeof lastMessage.content === 'string') {
        return null;
    }
    const toolUseBlocks = lastMessage.content.filter((content)=>content.type === 'tool_use');
    if (toolUseBlocks.length === 0) {
        return null;
    }
    const toolResults = await Promise.all(toolUseBlocks.map(async (toolUse)=>{
        const tool = params.tools.find((t)=>('name' in t ? t.name : t.mcp_server_name) === toolUse.name);
        if (!tool || !('run' in tool)) {
            return {
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: `Error: Tool '${toolUse.name}' not found`,
                is_error: true
            };
        }
        try {
            let input = toolUse.input;
            if ('parse' in tool && tool.parse) {
                input = tool.parse(input);
            }
            const result = await tool.run(input, {
                toolUseBlock: toolUse,
                signal: requestOptions?.signal
            });
            return {
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: result
            };
        } catch (error) {
            return {
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$tools$2f$ToolError$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ToolError"] ? error.content : `Error: ${error instanceof Error ? error.message : String(error)}`,
                is_error: true
            };
        }
    }));
    return {
        role: 'user',
        content: toolResults
    };
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/messages/messages.mjs [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Messages",
    ()=>Messages
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/error.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/error.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$messages$2f$batches$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/messages/batches.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$constants$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/constants.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$stainless$2d$helper$2d$header$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/stainless-helper-header.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$beta$2d$parser$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/beta-parser.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$BetaMessageStream$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/BetaMessageStream.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$tools$2f$BetaToolRunner$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/tools/BetaToolRunner.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$tools$2f$ToolError$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/tools/ToolError.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
const DEPRECATED_MODELS = {
    'claude-1.3': 'November 6th, 2024',
    'claude-1.3-100k': 'November 6th, 2024',
    'claude-instant-1.1': 'November 6th, 2024',
    'claude-instant-1.1-100k': 'November 6th, 2024',
    'claude-instant-1.2': 'November 6th, 2024',
    'claude-3-sonnet-20240229': 'July 21st, 2025',
    'claude-3-opus-20240229': 'January 5th, 2026',
    'claude-2.1': 'July 21st, 2025',
    'claude-2.0': 'July 21st, 2025',
    'claude-3-7-sonnet-latest': 'February 19th, 2026',
    'claude-3-7-sonnet-20250219': 'February 19th, 2026'
};
const MODELS_TO_WARN_WITH_THINKING_ENABLED = [
    'claude-mythos-preview',
    'claude-opus-4-6'
];
class Messages extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    constructor(){
        super(...arguments);
        this.batches = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$messages$2f$batches$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Batches"](this._client);
    }
    create(params, options) {
        // Transform deprecated output_format to output_config.format
        const modifiedParams = transformOutputFormat(params);
        const { betas, ...body } = modifiedParams;
        if (body.model in DEPRECATED_MODELS) {
            console.warn(`The model '${body.model}' is deprecated and will reach end-of-life on ${DEPRECATED_MODELS[body.model]}\nPlease migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`);
        }
        if (MODELS_TO_WARN_WITH_THINKING_ENABLED.includes(body.model) && body.thinking && body.thinking.type === 'enabled') {
            console.warn(`Using Claude with ${body.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
        }
        let timeout = this._client._options.timeout;
        if (!body.stream && timeout == null) {
            const maxNonstreamingTokens = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$constants$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MODEL_NONSTREAMING_TOKENS"][body.model] ?? undefined;
            timeout = this._client.calculateNonstreamingTimeout(body.max_tokens, maxNonstreamingTokens);
        }
        // Collect helper info from tools and messages
        const helperHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$stainless$2d$helper$2d$header$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stainlessHelperHeader"])(body.tools, body.messages);
        return this._client.post('/v1/messages?beta=true', {
            body,
            timeout: timeout ?? 600000,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    ...betas?.toString() != null ? {
                        'anthropic-beta': betas?.toString()
                    } : undefined
                },
                helperHeader,
                options?.headers
            ]),
            stream: modifiedParams.stream ?? false
        });
    }
    /**
     * Send a structured list of input messages with text and/or image content, along with an expected `output_format` and
     * the response will be automatically parsed and available in the `parsed_output` property of the message.
     *
     * @example
     * ```ts
     * const message = await client.beta.messages.parse({
     *   model: 'claude-3-5-sonnet-20241022',
     *   max_tokens: 1024,
     *   messages: [{ role: 'user', content: 'What is 2+2?' }],
     *   output_format: zodOutputFormat(z.object({ answer: z.number() }), 'math'),
     * });
     *
     * console.log(message.parsed_output?.answer); // 4
     * ```
     */ parse(params, options) {
        options = {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...params.betas ?? [],
                        'structured-outputs-2025-12-15'
                    ].toString()
                },
                options?.headers
            ])
        };
        return this.create(params, options).then((message)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$beta$2d$parser$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBetaMessage"])(message, params, {
                logger: this._client.logger ?? console
            }));
    }
    /**
     * Create a Message stream
     */ stream(body, options) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$BetaMessageStream$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BetaMessageStream"].createMessage(this, body, options);
    }
    /**
     * Count the number of tokens in a Message.
     *
     * The Token Count API can be used to count the number of tokens in a Message,
     * including tools, images, and documents, without creating it.
     *
     * Learn more about token counting in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/token-counting)
     *
     * @example
     * ```ts
     * const betaMessageTokensCount =
     *   await client.beta.messages.countTokens({
     *     messages: [{ content: 'Hello, world', role: 'user' }],
     *     model: 'claude-opus-4-6',
     *   });
     * ```
     */ countTokens(params, options) {
        // Transform deprecated output_format to output_config.format
        const modifiedParams = transformOutputFormat(params);
        const { betas, ...body } = modifiedParams;
        return this._client.post('/v1/messages/count_tokens?beta=true', {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'token-counting-2024-11-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    toolRunner(body, options) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$tools$2f$BetaToolRunner$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BetaToolRunner"](this._client, body, options);
    }
}
/**
 * Transform deprecated output_format to output_config.format
 * Returns a modified copy of the params without mutating the original
 */ function transformOutputFormat(params) {
    if (!params.output_format) {
        return params;
    }
    if (params.output_config?.format) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"]('Both output_format and output_config.format were provided. ' + 'Please use only output_config.format (output_format is deprecated).');
    }
    const { output_format, ...rest } = params;
    return {
        ...rest,
        output_config: {
            ...params.output_config,
            format: output_format
        }
    };
}
;
;
Messages.Batches = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$messages$2f$batches$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Batches"];
Messages.BetaToolRunner = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$tools$2f$BetaToolRunner$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BetaToolRunner"];
Messages.ToolError = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$tools$2f$ToolError$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ToolError"];
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/sessions/events.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Events",
    ()=>Events
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
class Events extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    /**
     * List Events
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsSessionEvent of client.beta.sessions.events.list(
     *   'sesn_011CZkZAtmR3yMPDzynEDxu7',
     * )) {
     *   // ...
     * }
     * ```
     */ list(sessionID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/sessions/${sessionID}/events?beta=true`, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PageCursor"], {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Send Events
     *
     * @example
     * ```ts
     * const betaManagedAgentsSendSessionEvents =
     *   await client.beta.sessions.events.send(
     *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
     *     {
     *       events: [
     *         {
     *           content: [
     *             {
     *               text: 'Where is my order #1234?',
     *               type: 'text',
     *             },
     *           ],
     *           type: 'user.message',
     *         },
     *       ],
     *     },
     *   );
     * ```
     */ send(sessionID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/sessions/${sessionID}/events?beta=true`, {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Stream Events
     *
     * @example
     * ```ts
     * const betaManagedAgentsStreamSessionEvents =
     *   await client.beta.sessions.events.stream(
     *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
     *   );
     * ```
     */ stream(sessionID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/sessions/${sessionID}/events/stream?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ]),
            stream: true
        });
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/sessions/resources.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Resources",
    ()=>Resources
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
class Resources extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    /**
     * Get Session Resource
     *
     * @example
     * ```ts
     * const resource =
     *   await client.beta.sessions.resources.retrieve(
     *     'sesrsc_011CZkZBJq5dWxk9fVLNcPht',
     *     { session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7' },
     *   );
     * ```
     */ retrieve(resourceID, params, options) {
        const { session_id, betas } = params;
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/sessions/${session_id}/resources/${resourceID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Update Session Resource
     *
     * @example
     * ```ts
     * const resource =
     *   await client.beta.sessions.resources.update(
     *     'sesrsc_011CZkZBJq5dWxk9fVLNcPht',
     *     {
     *       session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7',
     *       authorization_token: 'ghp_exampletoken',
     *     },
     *   );
     * ```
     */ update(resourceID, params, options) {
        const { session_id, betas, ...body } = params;
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/sessions/${session_id}/resources/${resourceID}?beta=true`, {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * List Session Resources
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsSessionResource of client.beta.sessions.resources.list(
     *   'sesn_011CZkZAtmR3yMPDzynEDxu7',
     * )) {
     *   // ...
     * }
     * ```
     */ list(sessionID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/sessions/${sessionID}/resources?beta=true`, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PageCursor"], {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Delete Session Resource
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeleteSessionResource =
     *   await client.beta.sessions.resources.delete(
     *     'sesrsc_011CZkZBJq5dWxk9fVLNcPht',
     *     { session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7' },
     *   );
     * ```
     */ delete(resourceID, params, options) {
        const { session_id, betas } = params;
        return this._client.delete(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/sessions/${session_id}/resources/${resourceID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Add Session Resource
     *
     * @example
     * ```ts
     * const betaManagedAgentsFileResource =
     *   await client.beta.sessions.resources.add(
     *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
     *     {
     *       file_id: 'file_011CNha8iCJcU1wXNR6q4V8w',
     *       type: 'file',
     *     },
     *   );
     * ```
     */ add(sessionID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/sessions/${sessionID}/resources?beta=true`, {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/sessions/sessions.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Sessions",
    ()=>Sessions
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$sessions$2f$events$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/sessions/events.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$sessions$2f$resources$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/sessions/resources.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
class Sessions extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    constructor(){
        super(...arguments);
        this.events = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$sessions$2f$events$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Events"](this._client);
        this.resources = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$sessions$2f$resources$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Resources"](this._client);
    }
    /**
     * Create Session
     *
     * @example
     * ```ts
     * const betaManagedAgentsSession =
     *   await client.beta.sessions.create({
     *     agent: 'agent_011CZkYpogX7uDKUyvBTophP',
     *     environment_id: 'env_011CZkZ9X2dpNyB7HsEFoRfW',
     *   });
     * ```
     */ create(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/sessions?beta=true', {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Get Session
     *
     * @example
     * ```ts
     * const betaManagedAgentsSession =
     *   await client.beta.sessions.retrieve(
     *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
     *   );
     * ```
     */ retrieve(sessionID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/sessions/${sessionID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Update Session
     *
     * @example
     * ```ts
     * const betaManagedAgentsSession =
     *   await client.beta.sessions.update(
     *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
     *   );
     * ```
     */ update(sessionID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/sessions/${sessionID}?beta=true`, {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * List Sessions
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsSession of client.beta.sessions.list()) {
     *   // ...
     * }
     * ```
     */ list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/sessions?beta=true', __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PageCursor"], {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Delete Session
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeletedSession =
     *   await client.beta.sessions.delete(
     *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
     *   );
     * ```
     */ delete(sessionID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/sessions/${sessionID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Archive Session
     *
     * @example
     * ```ts
     * const betaManagedAgentsSession =
     *   await client.beta.sessions.archive(
     *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
     *   );
     * ```
     */ archive(sessionID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/sessions/${sessionID}/archive?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
}
Sessions.Events = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$sessions$2f$events$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Events"];
Sessions.Resources = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$sessions$2f$resources$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Resources"];
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/skills/versions.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Versions",
    ()=>Versions
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$uploads$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/uploads.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
;
class Versions extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    /**
     * Create Skill Version
     *
     * @example
     * ```ts
     * const version = await client.beta.skills.versions.create(
     *   'skill_id',
     * );
     * ```
     */ create(skillID, params = {}, options) {
        const { betas, ...body } = params ?? {};
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/skills/${skillID}/versions?beta=true`, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$uploads$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["multipartFormRequestOptions"])({
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'skills-2025-10-02'
                    ].toString()
                },
                options?.headers
            ])
        }, this._client));
    }
    /**
     * Get Skill Version
     *
     * @example
     * ```ts
     * const version = await client.beta.skills.versions.retrieve(
     *   'version',
     *   { skill_id: 'skill_id' },
     * );
     * ```
     */ retrieve(version, params, options) {
        const { skill_id, betas } = params;
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/skills/${skill_id}/versions/${version}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'skills-2025-10-02'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * List Skill Versions
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const versionListResponse of client.beta.skills.versions.list(
     *   'skill_id',
     * )) {
     *   // ...
     * }
     * ```
     */ list(skillID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/skills/${skillID}/versions?beta=true`, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PageCursor"], {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'skills-2025-10-02'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Delete Skill Version
     *
     * @example
     * ```ts
     * const version = await client.beta.skills.versions.delete(
     *   'version',
     *   { skill_id: 'skill_id' },
     * );
     * ```
     */ delete(version, params, options) {
        const { skill_id, betas } = params;
        return this._client.delete(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/skills/${skill_id}/versions/${version}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'skills-2025-10-02'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/skills/skills.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Skills",
    ()=>Skills
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$skills$2f$versions$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/skills/versions.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$uploads$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/uploads.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
;
class Skills extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    constructor(){
        super(...arguments);
        this.versions = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$skills$2f$versions$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Versions"](this._client);
    }
    /**
     * Create Skill
     *
     * @example
     * ```ts
     * const skill = await client.beta.skills.create();
     * ```
     */ create(params = {}, options) {
        const { betas, ...body } = params ?? {};
        return this._client.post('/v1/skills?beta=true', (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$uploads$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["multipartFormRequestOptions"])({
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'skills-2025-10-02'
                    ].toString()
                },
                options?.headers
            ])
        }, this._client, false));
    }
    /**
     * Get Skill
     *
     * @example
     * ```ts
     * const skill = await client.beta.skills.retrieve('skill_id');
     * ```
     */ retrieve(skillID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/skills/${skillID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'skills-2025-10-02'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * List Skills
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const skillListResponse of client.beta.skills.list()) {
     *   // ...
     * }
     * ```
     */ list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/skills?beta=true', __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PageCursor"], {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'skills-2025-10-02'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Delete Skill
     *
     * @example
     * ```ts
     * const skill = await client.beta.skills.delete('skill_id');
     * ```
     */ delete(skillID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/skills/${skillID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'skills-2025-10-02'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
}
Skills.Versions = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$skills$2f$versions$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Versions"];
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/vaults/credentials.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Credentials",
    ()=>Credentials
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
class Credentials extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    /**
     * Create Credential
     *
     * @example
     * ```ts
     * const betaManagedAgentsCredential =
     *   await client.beta.vaults.credentials.create(
     *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
     *     {
     *       auth: {
     *         token: 'bearer_exampletoken',
     *         mcp_server_url:
     *           'https://example-server.modelcontextprotocol.io/sse',
     *         type: 'static_bearer',
     *       },
     *     },
     *   );
     * ```
     */ create(vaultID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/vaults/${vaultID}/credentials?beta=true`, {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Get Credential
     *
     * @example
     * ```ts
     * const betaManagedAgentsCredential =
     *   await client.beta.vaults.credentials.retrieve(
     *     'vcrd_011CZkZEMt8gZan2iYOQfSkw',
     *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
     *   );
     * ```
     */ retrieve(credentialID, params, options) {
        const { vault_id, betas } = params;
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/vaults/${vault_id}/credentials/${credentialID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Update Credential
     *
     * @example
     * ```ts
     * const betaManagedAgentsCredential =
     *   await client.beta.vaults.credentials.update(
     *     'vcrd_011CZkZEMt8gZan2iYOQfSkw',
     *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
     *   );
     * ```
     */ update(credentialID, params, options) {
        const { vault_id, betas, ...body } = params;
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/vaults/${vault_id}/credentials/${credentialID}?beta=true`, {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * List Credentials
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsCredential of client.beta.vaults.credentials.list(
     *   'vlt_011CZkZDLs7fYzm1hXNPeRjv',
     * )) {
     *   // ...
     * }
     * ```
     */ list(vaultID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/vaults/${vaultID}/credentials?beta=true`, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PageCursor"], {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Delete Credential
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeletedCredential =
     *   await client.beta.vaults.credentials.delete(
     *     'vcrd_011CZkZEMt8gZan2iYOQfSkw',
     *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
     *   );
     * ```
     */ delete(credentialID, params, options) {
        const { vault_id, betas } = params;
        return this._client.delete(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/vaults/${vault_id}/credentials/${credentialID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Archive Credential
     *
     * @example
     * ```ts
     * const betaManagedAgentsCredential =
     *   await client.beta.vaults.credentials.archive(
     *     'vcrd_011CZkZEMt8gZan2iYOQfSkw',
     *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
     *   );
     * ```
     */ archive(credentialID, params, options) {
        const { vault_id, betas } = params;
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/vaults/${vault_id}/credentials/${credentialID}/archive?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/vaults/vaults.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Vaults",
    ()=>Vaults
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$vaults$2f$credentials$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/vaults/credentials.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
class Vaults extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    constructor(){
        super(...arguments);
        this.credentials = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$vaults$2f$credentials$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Credentials"](this._client);
    }
    /**
     * Create Vault
     *
     * @example
     * ```ts
     * const betaManagedAgentsVault =
     *   await client.beta.vaults.create({
     *     display_name: 'Example vault',
     *   });
     * ```
     */ create(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/vaults?beta=true', {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Get Vault
     *
     * @example
     * ```ts
     * const betaManagedAgentsVault =
     *   await client.beta.vaults.retrieve(
     *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
     *   );
     * ```
     */ retrieve(vaultID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/vaults/${vaultID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Update Vault
     *
     * @example
     * ```ts
     * const betaManagedAgentsVault =
     *   await client.beta.vaults.update(
     *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
     *   );
     * ```
     */ update(vaultID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/vaults/${vaultID}?beta=true`, {
            body,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * List Vaults
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsVault of client.beta.vaults.list()) {
     *   // ...
     * }
     * ```
     */ list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/vaults?beta=true', __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PageCursor"], {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Delete Vault
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeletedVault =
     *   await client.beta.vaults.delete(
     *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
     *   );
     * ```
     */ delete(vaultID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/vaults/${vaultID}?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
    /**
     * Archive Vault
     *
     * @example
     * ```ts
     * const betaManagedAgentsVault =
     *   await client.beta.vaults.archive(
     *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
     *   );
     * ```
     */ archive(vaultID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/vaults/${vaultID}/archive?beta=true`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    'anthropic-beta': [
                        ...betas ?? [],
                        'managed-agents-2026-04-01'
                    ].toString()
                },
                options?.headers
            ])
        });
    }
}
Vaults.Credentials = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$vaults$2f$credentials$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Credentials"];
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/beta.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Beta",
    ()=>Beta
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$environments$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/environments.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$files$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/files.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$models$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/models.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$user$2d$profiles$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/user-profiles.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$agents$2f$agents$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/agents/agents.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$memory$2d$stores$2f$memory$2d$stores$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/memory-stores/memory-stores.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$messages$2f$messages$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/messages/messages.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$sessions$2f$sessions$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/sessions/sessions.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$skills$2f$skills$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/skills/skills.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$vaults$2f$vaults$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/vaults/vaults.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
class Beta extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    constructor(){
        super(...arguments);
        this.models = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$models$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Models"](this._client);
        this.messages = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$messages$2f$messages$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Messages"](this._client);
        this.agents = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$agents$2f$agents$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Agents"](this._client);
        this.environments = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$environments$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Environments"](this._client);
        this.sessions = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$sessions$2f$sessions$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Sessions"](this._client);
        this.vaults = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$vaults$2f$vaults$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Vaults"](this._client);
        this.memoryStores = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$memory$2d$stores$2f$memory$2d$stores$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MemoryStores"](this._client);
        this.files = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$files$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Files"](this._client);
        this.skills = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$skills$2f$skills$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Skills"](this._client);
        this.userProfiles = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$user$2d$profiles$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserProfiles"](this._client);
    }
}
Beta.Models = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$models$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Models"];
Beta.Messages = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$messages$2f$messages$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Messages"];
Beta.Agents = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$agents$2f$agents$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Agents"];
Beta.Environments = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$environments$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Environments"];
Beta.Sessions = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$sessions$2f$sessions$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Sessions"];
Beta.Vaults = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$vaults$2f$vaults$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Vaults"];
Beta.MemoryStores = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$memory$2d$stores$2f$memory$2d$stores$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MemoryStores"];
Beta.Files = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$files$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Files"];
Beta.Skills = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$skills$2f$skills$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Skills"];
Beta.UserProfiles = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$user$2d$profiles$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserProfiles"];
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/completions.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Completions",
    ()=>Completions
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
;
;
class Completions extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    create(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/complete', {
            body,
            timeout: this._client._options.timeout ?? 600000,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    ...betas?.toString() != null ? {
                        'anthropic-beta': betas?.toString()
                    } : undefined
                },
                options?.headers
            ]),
            stream: params.stream ?? false
        });
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/parser.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "maybeParseMessage",
    ()=>maybeParseMessage,
    "parseMessage",
    ()=>parseMessage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/error.mjs [app-route] (ecmascript)");
;
function getOutputFormat(params) {
    return params?.output_config?.format;
}
function maybeParseMessage(message, params, opts) {
    const outputFormat = getOutputFormat(params);
    if (!params || !('parse' in (outputFormat ?? {}))) {
        return {
            ...message,
            content: message.content.map((block)=>{
                if (block.type === 'text') {
                    const parsedBlock = Object.defineProperty({
                        ...block
                    }, 'parsed_output', {
                        value: null,
                        enumerable: false
                    });
                    return parsedBlock;
                }
                return block;
            }),
            parsed_output: null
        };
    }
    return parseMessage(message, params, opts);
}
function parseMessage(message, params, opts) {
    let firstParsedOutput = null;
    const content = message.content.map((block)=>{
        if (block.type === 'text') {
            const parsedOutput = parseOutputFormat(params, block.text);
            if (firstParsedOutput === null) {
                firstParsedOutput = parsedOutput;
            }
            const parsedBlock = Object.defineProperty({
                ...block
            }, 'parsed_output', {
                value: parsedOutput,
                enumerable: false
            });
            return parsedBlock;
        }
        return block;
    });
    return {
        ...message,
        content,
        parsed_output: firstParsedOutput
    };
}
function parseOutputFormat(params, content) {
    const outputFormat = getOutputFormat(params);
    if (outputFormat?.type !== 'json_schema') {
        return null;
    }
    try {
        if ('parse' in outputFormat) {
            return outputFormat.parse(content);
        }
        return JSON.parse(content);
    } catch (error) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`Failed to parse structured output: ${error}`);
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/MessageStream.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MessageStream",
    ()=>MessageStream
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/tslib.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$errors$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/errors.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/error.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/error.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$streaming$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/streaming.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$streaming$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/streaming.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$_vendor$2f$partial$2d$json$2d$parser$2f$parser$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/_vendor/partial-json-parser/parser.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$parser$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/parser.mjs [app-route] (ecmascript)");
var _MessageStream_instances, _MessageStream_currentMessageSnapshot, _MessageStream_params, _MessageStream_connectedPromise, _MessageStream_resolveConnectedPromise, _MessageStream_rejectConnectedPromise, _MessageStream_endPromise, _MessageStream_resolveEndPromise, _MessageStream_rejectEndPromise, _MessageStream_listeners, _MessageStream_ended, _MessageStream_errored, _MessageStream_aborted, _MessageStream_catchingPromiseCreated, _MessageStream_response, _MessageStream_request_id, _MessageStream_logger, _MessageStream_getFinalMessage, _MessageStream_getFinalText, _MessageStream_handleError, _MessageStream_beginRequest, _MessageStream_addStreamEvent, _MessageStream_endRequest, _MessageStream_accumulateMessage;
;
;
;
;
;
;
const JSON_BUF_PROPERTY = '__json_buf';
function tracksToolInput(content) {
    return content.type === 'tool_use' || content.type === 'server_tool_use';
}
class MessageStream {
    constructor(params, opts){
        _MessageStream_instances.add(this);
        this.messages = [];
        this.receivedMessages = [];
        _MessageStream_currentMessageSnapshot.set(this, void 0);
        _MessageStream_params.set(this, null);
        this.controller = new AbortController();
        _MessageStream_connectedPromise.set(this, void 0);
        _MessageStream_resolveConnectedPromise.set(this, ()=>{});
        _MessageStream_rejectConnectedPromise.set(this, ()=>{});
        _MessageStream_endPromise.set(this, void 0);
        _MessageStream_resolveEndPromise.set(this, ()=>{});
        _MessageStream_rejectEndPromise.set(this, ()=>{});
        _MessageStream_listeners.set(this, {});
        _MessageStream_ended.set(this, false);
        _MessageStream_errored.set(this, false);
        _MessageStream_aborted.set(this, false);
        _MessageStream_catchingPromiseCreated.set(this, false);
        _MessageStream_response.set(this, void 0);
        _MessageStream_request_id.set(this, void 0);
        _MessageStream_logger.set(this, void 0);
        _MessageStream_handleError.set(this, (error)=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_errored, true, "f");
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$errors$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAbortError"])(error)) {
                error = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIUserAbortError"]();
            }
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIUserAbortError"]) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_aborted, true, "f");
                return this._emit('abort', error);
            }
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"]) {
                return this._emit('error', error);
            }
            if (error instanceof Error) {
                const anthropicError = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](error.message);
                // @ts-ignore
                anthropicError.cause = error;
                return this._emit('error', anthropicError);
            }
            return this._emit('error', new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](String(error)));
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_connectedPromise, new Promise((resolve, reject)=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_resolveConnectedPromise, resolve, "f");
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_rejectConnectedPromise, reject, "f");
        }), "f");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_endPromise, new Promise((resolve, reject)=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_resolveEndPromise, resolve, "f");
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_rejectEndPromise, reject, "f");
        }), "f");
        // Don't let these promises cause unhandled rejection errors.
        // we will manually cause an unhandled rejection error later
        // if the user hasn't registered any error listener or called
        // any promise-returning method.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_connectedPromise, "f").catch(()=>{});
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_endPromise, "f").catch(()=>{});
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_params, params, "f");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_logger, opts?.logger ?? console, "f");
    }
    get response() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_response, "f");
    }
    get request_id() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_request_id, "f");
    }
    /**
     * Returns the `MessageStream` data, the raw `Response` instance and the ID of the request,
     * returned vie the `request-id` header which is useful for debugging requests and resporting
     * issues to Anthropic.
     *
     * This is the same as the `APIPromise.withResponse()` method.
     *
     * This method will raise an error if you created the stream using `MessageStream.fromReadableStream`
     * as no `Response` is available.
     */ async withResponse() {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_catchingPromiseCreated, true, "f");
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_connectedPromise, "f");
        if (!response) {
            throw new Error('Could not resolve a `Response` object');
        }
        return {
            data: this,
            response,
            request_id: response.headers.get('request-id')
        };
    }
    /**
     * Intended for use on the frontend, consuming a stream produced with
     * `.toReadableStream()` on the backend.
     *
     * Note that messages sent to the model do not appear in `.on('message')`
     * in this context.
     */ static fromReadableStream(stream) {
        const runner = new MessageStream(null);
        runner._run(()=>runner._fromReadableStream(stream));
        return runner;
    }
    static createMessage(messages, params, options, { logger } = {}) {
        const runner = new MessageStream(params, {
            logger
        });
        for (const message of params.messages){
            runner._addMessageParam(message);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(runner, _MessageStream_params, {
            ...params,
            stream: true
        }, "f");
        runner._run(()=>runner._createMessage(messages, {
                ...params,
                stream: true
            }, {
                ...options,
                headers: {
                    ...options?.headers,
                    'X-Stainless-Helper-Method': 'stream'
                }
            }));
        return runner;
    }
    _run(executor) {
        executor().then(()=>{
            this._emitFinal();
            this._emit('end');
        }, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_handleError, "f"));
    }
    _addMessageParam(message) {
        this.messages.push(message);
    }
    _addMessage(message, emit = true) {
        this.receivedMessages.push(message);
        if (emit) {
            this._emit('message', message);
        }
    }
    async _createMessage(messages, params, options) {
        const signal = options?.signal;
        let abortHandler;
        if (signal) {
            if (signal.aborted) this.controller.abort();
            abortHandler = this.controller.abort.bind(this.controller);
            signal.addEventListener('abort', abortHandler);
        }
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_instances, "m", _MessageStream_beginRequest).call(this);
            const { response, data: stream } = await messages.create({
                ...params,
                stream: true
            }, {
                ...options,
                signal: this.controller.signal
            }).withResponse();
            this._connected(response);
            for await (const event of stream){
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_instances, "m", _MessageStream_addStreamEvent).call(this, event);
            }
            if (stream.controller.signal?.aborted) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIUserAbortError"]();
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_instances, "m", _MessageStream_endRequest).call(this);
        } finally{
            if (signal && abortHandler) {
                signal.removeEventListener('abort', abortHandler);
            }
        }
    }
    _connected(response) {
        if (this.ended) return;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_response, response, "f");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_request_id, response?.headers.get('request-id'), "f");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_resolveConnectedPromise, "f").call(this, response);
        this._emit('connect');
    }
    get ended() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_ended, "f");
    }
    get errored() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_errored, "f");
    }
    get aborted() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_aborted, "f");
    }
    abort() {
        this.controller.abort();
    }
    /**
     * Adds the listener function to the end of the listeners array for the event.
     * No checks are made to see if the listener has already been added. Multiple calls passing
     * the same combination of event and listener will result in the listener being added, and
     * called, multiple times.
     * @returns this MessageStream, so that calls can be chained
     */ on(event, listener) {
        const listeners = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_listeners, "f")[event] || ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_listeners, "f")[event] = []);
        listeners.push({
            listener
        });
        return this;
    }
    /**
     * Removes the specified listener from the listener array for the event.
     * off() will remove, at most, one instance of a listener from the listener array. If any single
     * listener has been added multiple times to the listener array for the specified event, then
     * off() must be called multiple times to remove each instance.
     * @returns this MessageStream, so that calls can be chained
     */ off(event, listener) {
        const listeners = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_listeners, "f")[event];
        if (!listeners) return this;
        const index = listeners.findIndex((l)=>l.listener === listener);
        if (index >= 0) listeners.splice(index, 1);
        return this;
    }
    /**
     * Adds a one-time listener function for the event. The next time the event is triggered,
     * this listener is removed and then invoked.
     * @returns this MessageStream, so that calls can be chained
     */ once(event, listener) {
        const listeners = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_listeners, "f")[event] || ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_listeners, "f")[event] = []);
        listeners.push({
            listener,
            once: true
        });
        return this;
    }
    /**
     * This is similar to `.once()`, but returns a Promise that resolves the next time
     * the event is triggered, instead of calling a listener callback.
     * @returns a Promise that resolves the next time given event is triggered,
     * or rejects if an error is emitted.  (If you request the 'error' event,
     * returns a promise that resolves with the error).
     *
     * Example:
     *
     *   const message = await stream.emitted('message') // rejects if the stream errors
     */ emitted(event) {
        return new Promise((resolve, reject)=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_catchingPromiseCreated, true, "f");
            if (event !== 'error') this.once('error', reject);
            this.once(event, resolve);
        });
    }
    async done() {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_catchingPromiseCreated, true, "f");
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_endPromise, "f");
    }
    get currentMessage() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_currentMessageSnapshot, "f");
    }
    /**
     * @returns a promise that resolves with the the final assistant Message response,
     * or rejects if an error occurred or the stream ended prematurely without producing a Message.
     * If structured outputs were used, this will be a ParsedMessage with a `parsed_output` field.
     */ async finalMessage() {
        await this.done();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_instances, "m", _MessageStream_getFinalMessage).call(this);
    }
    /**
     * @returns a promise that resolves with the the final assistant Message's text response, concatenated
     * together if there are more than one text blocks.
     * Rejects if an error occurred or the stream ended prematurely without producing a Message.
     */ async finalText() {
        await this.done();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_instances, "m", _MessageStream_getFinalText).call(this);
    }
    _emit(event, ...args) {
        // make sure we don't emit any MessageStreamEvents after end
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_ended, "f")) return;
        if (event === 'end') {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_ended, true, "f");
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_resolveEndPromise, "f").call(this);
        }
        const listeners = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_listeners, "f")[event];
        if (listeners) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_listeners, "f")[event] = listeners.filter((l)=>!l.once);
            listeners.forEach(({ listener })=>listener(...args));
        }
        if (event === 'abort') {
            const error = args[0];
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
                Promise.reject(error);
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_rejectConnectedPromise, "f").call(this, error);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_rejectEndPromise, "f").call(this, error);
            this._emit('end');
            return;
        }
        if (event === 'error') {
            // NOTE: _emit('error', error) should only be called from #handleError().
            const error = args[0];
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
                // Trigger an unhandled rejection if the user hasn't registered any error handlers.
                // If you are seeing stack traces here, make sure to handle errors via either:
                // - runner.on('error', () => ...)
                // - await runner.done()
                // - await runner.final...()
                // - etc.
                Promise.reject(error);
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_rejectConnectedPromise, "f").call(this, error);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_rejectEndPromise, "f").call(this, error);
            this._emit('end');
        }
    }
    _emitFinal() {
        const finalMessage = this.receivedMessages.at(-1);
        if (finalMessage) {
            this._emit('finalMessage', (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_instances, "m", _MessageStream_getFinalMessage).call(this));
        }
    }
    async _fromReadableStream(readableStream, options) {
        const signal = options?.signal;
        let abortHandler;
        if (signal) {
            if (signal.aborted) this.controller.abort();
            abortHandler = this.controller.abort.bind(this.controller);
            signal.addEventListener('abort', abortHandler);
        }
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_instances, "m", _MessageStream_beginRequest).call(this);
            this._connected(null);
            const stream = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$streaming$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Stream"].fromReadableStream(readableStream, this.controller);
            for await (const event of stream){
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_instances, "m", _MessageStream_addStreamEvent).call(this, event);
            }
            if (stream.controller.signal?.aborted) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIUserAbortError"]();
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_instances, "m", _MessageStream_endRequest).call(this);
        } finally{
            if (signal && abortHandler) {
                signal.removeEventListener('abort', abortHandler);
            }
        }
    }
    [(_MessageStream_currentMessageSnapshot = new WeakMap(), _MessageStream_params = new WeakMap(), _MessageStream_connectedPromise = new WeakMap(), _MessageStream_resolveConnectedPromise = new WeakMap(), _MessageStream_rejectConnectedPromise = new WeakMap(), _MessageStream_endPromise = new WeakMap(), _MessageStream_resolveEndPromise = new WeakMap(), _MessageStream_rejectEndPromise = new WeakMap(), _MessageStream_listeners = new WeakMap(), _MessageStream_ended = new WeakMap(), _MessageStream_errored = new WeakMap(), _MessageStream_aborted = new WeakMap(), _MessageStream_catchingPromiseCreated = new WeakMap(), _MessageStream_response = new WeakMap(), _MessageStream_request_id = new WeakMap(), _MessageStream_logger = new WeakMap(), _MessageStream_handleError = new WeakMap(), _MessageStream_instances = new WeakSet(), _MessageStream_getFinalMessage = function _MessageStream_getFinalMessage() {
        if (this.receivedMessages.length === 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"]('stream ended without producing a Message with role=assistant');
        }
        return this.receivedMessages.at(-1);
    }, _MessageStream_getFinalText = function _MessageStream_getFinalText() {
        if (this.receivedMessages.length === 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"]('stream ended without producing a Message with role=assistant');
        }
        const textBlocks = this.receivedMessages.at(-1).content.filter((block)=>block.type === 'text').map((block)=>block.text);
        if (textBlocks.length === 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"]('stream ended without producing a content block with type=text');
        }
        return textBlocks.join(' ');
    }, _MessageStream_beginRequest = function _MessageStream_beginRequest() {
        if (this.ended) return;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_currentMessageSnapshot, undefined, "f");
    }, _MessageStream_addStreamEvent = function _MessageStream_addStreamEvent(event) {
        if (this.ended) return;
        const messageSnapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_instances, "m", _MessageStream_accumulateMessage).call(this, event);
        this._emit('streamEvent', event, messageSnapshot);
        switch(event.type){
            case 'content_block_delta':
                {
                    const content = messageSnapshot.content.at(-1);
                    switch(event.delta.type){
                        case 'text_delta':
                            {
                                if (content.type === 'text') {
                                    this._emit('text', event.delta.text, content.text || '');
                                }
                                break;
                            }
                        case 'citations_delta':
                            {
                                if (content.type === 'text') {
                                    this._emit('citation', event.delta.citation, content.citations ?? []);
                                }
                                break;
                            }
                        case 'input_json_delta':
                            {
                                if (tracksToolInput(content) && content.input) {
                                    this._emit('inputJson', event.delta.partial_json, content.input);
                                }
                                break;
                            }
                        case 'thinking_delta':
                            {
                                if (content.type === 'thinking') {
                                    this._emit('thinking', event.delta.thinking, content.thinking);
                                }
                                break;
                            }
                        case 'signature_delta':
                            {
                                if (content.type === 'thinking') {
                                    this._emit('signature', content.signature);
                                }
                                break;
                            }
                        default:
                            checkNever(event.delta);
                    }
                    break;
                }
            case 'message_stop':
                {
                    this._addMessageParam(messageSnapshot);
                    this._addMessage((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$parser$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maybeParseMessage"])(messageSnapshot, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_params, "f"), {
                        logger: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_logger, "f")
                    }), true);
                    break;
                }
            case 'content_block_stop':
                {
                    this._emit('contentBlock', messageSnapshot.content.at(-1));
                    break;
                }
            case 'message_start':
                {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_currentMessageSnapshot, messageSnapshot, "f");
                    break;
                }
            case 'content_block_start':
            case 'message_delta':
                break;
        }
    }, _MessageStream_endRequest = function _MessageStream_endRequest() {
        if (this.ended) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`stream has ended, this shouldn't happen`);
        }
        const snapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_currentMessageSnapshot, "f");
        if (!snapshot) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`request ended without sending any chunks`);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _MessageStream_currentMessageSnapshot, undefined, "f");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$parser$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maybeParseMessage"])(snapshot, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_params, "f"), {
            logger: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_logger, "f")
        });
    }, _MessageStream_accumulateMessage = function _MessageStream_accumulateMessage(event) {
        let snapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _MessageStream_currentMessageSnapshot, "f");
        if (event.type === 'message_start') {
            if (snapshot) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`Unexpected event order, got ${event.type} before receiving "message_stop"`);
            }
            return event.message;
        }
        if (!snapshot) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`Unexpected event order, got ${event.type} before "message_start"`);
        }
        switch(event.type){
            case 'message_stop':
                return snapshot;
            case 'message_delta':
                snapshot.stop_reason = event.delta.stop_reason;
                snapshot.stop_sequence = event.delta.stop_sequence;
                snapshot.usage.output_tokens = event.usage.output_tokens;
                // Update other usage fields if they exist in the event
                if (event.usage.input_tokens != null) {
                    snapshot.usage.input_tokens = event.usage.input_tokens;
                }
                if (event.usage.cache_creation_input_tokens != null) {
                    snapshot.usage.cache_creation_input_tokens = event.usage.cache_creation_input_tokens;
                }
                if (event.usage.cache_read_input_tokens != null) {
                    snapshot.usage.cache_read_input_tokens = event.usage.cache_read_input_tokens;
                }
                if (event.usage.server_tool_use != null) {
                    snapshot.usage.server_tool_use = event.usage.server_tool_use;
                }
                return snapshot;
            case 'content_block_start':
                snapshot.content.push({
                    ...event.content_block
                });
                return snapshot;
            case 'content_block_delta':
                {
                    const snapshotContent = snapshot.content.at(event.index);
                    switch(event.delta.type){
                        case 'text_delta':
                            {
                                if (snapshotContent?.type === 'text') {
                                    snapshot.content[event.index] = {
                                        ...snapshotContent,
                                        text: (snapshotContent.text || '') + event.delta.text
                                    };
                                }
                                break;
                            }
                        case 'citations_delta':
                            {
                                if (snapshotContent?.type === 'text') {
                                    snapshot.content[event.index] = {
                                        ...snapshotContent,
                                        citations: [
                                            ...snapshotContent.citations ?? [],
                                            event.delta.citation
                                        ]
                                    };
                                }
                                break;
                            }
                        case 'input_json_delta':
                            {
                                if (snapshotContent && tracksToolInput(snapshotContent)) {
                                    // we need to keep track of the raw JSON string as well so that we can
                                    // re-parse it for each delta, for now we just store it as an untyped
                                    // non-enumerable property on the snapshot
                                    let jsonBuf = snapshotContent[JSON_BUF_PROPERTY] || '';
                                    jsonBuf += event.delta.partial_json;
                                    const newContent = {
                                        ...snapshotContent
                                    };
                                    Object.defineProperty(newContent, JSON_BUF_PROPERTY, {
                                        value: jsonBuf,
                                        enumerable: false,
                                        writable: true
                                    });
                                    if (jsonBuf) {
                                        newContent.input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$_vendor$2f$partial$2d$json$2d$parser$2f$parser$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["partialParse"])(jsonBuf);
                                    }
                                    snapshot.content[event.index] = newContent;
                                }
                                break;
                            }
                        case 'thinking_delta':
                            {
                                if (snapshotContent?.type === 'thinking') {
                                    snapshot.content[event.index] = {
                                        ...snapshotContent,
                                        thinking: snapshotContent.thinking + event.delta.thinking
                                    };
                                }
                                break;
                            }
                        case 'signature_delta':
                            {
                                if (snapshotContent?.type === 'thinking') {
                                    snapshot.content[event.index] = {
                                        ...snapshotContent,
                                        signature: event.delta.signature
                                    };
                                }
                                break;
                            }
                        default:
                            checkNever(event.delta);
                    }
                    return snapshot;
                }
            case 'content_block_stop':
                return snapshot;
        }
    }, Symbol.asyncIterator)]() {
        const pushQueue = [];
        const readQueue = [];
        let done = false;
        this.on('streamEvent', (event)=>{
            const reader = readQueue.shift();
            if (reader) {
                reader.resolve(event);
            } else {
                pushQueue.push(event);
            }
        });
        this.on('end', ()=>{
            done = true;
            for (const reader of readQueue){
                reader.resolve(undefined);
            }
            readQueue.length = 0;
        });
        this.on('abort', (err)=>{
            done = true;
            for (const reader of readQueue){
                reader.reject(err);
            }
            readQueue.length = 0;
        });
        this.on('error', (err)=>{
            done = true;
            for (const reader of readQueue){
                reader.reject(err);
            }
            readQueue.length = 0;
        });
        return {
            next: async ()=>{
                if (!pushQueue.length) {
                    if (done) {
                        return {
                            value: undefined,
                            done: true
                        };
                    }
                    return new Promise((resolve, reject)=>readQueue.push({
                            resolve,
                            reject
                        })).then((chunk)=>chunk ? {
                            value: chunk,
                            done: false
                        } : {
                            value: undefined,
                            done: true
                        });
                }
                const chunk = pushQueue.shift();
                return {
                    value: chunk,
                    done: false
                };
            },
            return: async ()=>{
                this.abort();
                return {
                    value: undefined,
                    done: true
                };
            }
        };
    }
    toReadableStream() {
        const stream = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$streaming$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Stream"](this[Symbol.asyncIterator].bind(this), this.controller);
        return stream.toReadableStream();
    }
}
// used to ensure exhaustive case matching without throwing a runtime error
function checkNever(x) {}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/messages/batches.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Batches",
    ()=>Batches
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$decoders$2f$jsonl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/decoders/jsonl.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/error.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/error.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
class Batches extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    /**
     * Send a batch of Message creation requests.
     *
     * The Message Batches API can be used to process multiple Messages API requests at
     * once. Once a Message Batch is created, it begins processing immediately. Batches
     * can take up to 24 hours to complete.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const messageBatch = await client.messages.batches.create({
     *   requests: [
     *     {
     *       custom_id: 'my-custom-id-1',
     *       params: {
     *         max_tokens: 1024,
     *         messages: [
     *           { content: 'Hello, world', role: 'user' },
     *         ],
     *         model: 'claude-opus-4-6',
     *       },
     *     },
     *   ],
     * });
     * ```
     */ create(body, options) {
        return this._client.post('/v1/messages/batches', {
            body,
            ...options
        });
    }
    /**
     * This endpoint is idempotent and can be used to poll for Message Batch
     * completion. To access the results of a Message Batch, make a request to the
     * `results_url` field in the response.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const messageBatch = await client.messages.batches.retrieve(
     *   'message_batch_id',
     * );
     * ```
     */ retrieve(messageBatchID, options) {
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/messages/batches/${messageBatchID}`, options);
    }
    /**
     * List all Message Batches within a Workspace. Most recently created batches are
     * returned first.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const messageBatch of client.messages.batches.list()) {
     *   // ...
     * }
     * ```
     */ list(query = {}, options) {
        return this._client.getAPIList('/v1/messages/batches', __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Page"], {
            query,
            ...options
        });
    }
    /**
     * Delete a Message Batch.
     *
     * Message Batches can only be deleted once they've finished processing. If you'd
     * like to delete an in-progress batch, you must first cancel it.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const deletedMessageBatch =
     *   await client.messages.batches.delete('message_batch_id');
     * ```
     */ delete(messageBatchID, options) {
        return this._client.delete(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/messages/batches/${messageBatchID}`, options);
    }
    /**
     * Batches may be canceled any time before processing ends. Once cancellation is
     * initiated, the batch enters a `canceling` state, at which time the system may
     * complete any in-progress, non-interruptible requests before finalizing
     * cancellation.
     *
     * The number of canceled requests is specified in `request_counts`. To determine
     * which requests were canceled, check the individual results within the batch.
     * Note that cancellation may not result in any canceled requests if they were
     * non-interruptible.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const messageBatch = await client.messages.batches.cancel(
     *   'message_batch_id',
     * );
     * ```
     */ cancel(messageBatchID, options) {
        return this._client.post(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/messages/batches/${messageBatchID}/cancel`, options);
    }
    /**
     * Streams the results of a Message Batch as a `.jsonl` file.
     *
     * Each line in the file is a JSON object containing the result of a single request
     * in the Message Batch. Results are not guaranteed to be in the same order as
     * requests. Use the `custom_id` field to match results to requests.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const messageBatchIndividualResponse =
     *   await client.messages.batches.results('message_batch_id');
     * ```
     */ async results(messageBatchID, options) {
        const batch = await this.retrieve(messageBatchID);
        if (!batch.results_url) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"](`No batch \`results_url\`; Has it finished processing? ${batch.processing_status} - ${batch.id}`);
        }
        return this._client.get(batch.results_url, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    Accept: 'application/binary'
                },
                options?.headers
            ]),
            stream: true,
            __binaryResponse: true
        })._thenUnwrap((_, props)=>__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$decoders$2f$jsonl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["JSONLDecoder"].fromResponse(props.response, props.controller));
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/messages/messages.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Messages",
    ()=>Messages
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$stainless$2d$helper$2d$header$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/stainless-helper-header.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$MessageStream$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/MessageStream.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$parser$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/lib/parser.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$messages$2f$batches$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/messages/batches.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$constants$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/constants.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
class Messages extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    constructor(){
        super(...arguments);
        this.batches = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$messages$2f$batches$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Batches"](this._client);
    }
    create(body, options) {
        if (body.model in DEPRECATED_MODELS) {
            console.warn(`The model '${body.model}' is deprecated and will reach end-of-life on ${DEPRECATED_MODELS[body.model]}\nPlease migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`);
        }
        if (MODELS_TO_WARN_WITH_THINKING_ENABLED.includes(body.model) && body.thinking && body.thinking.type === 'enabled') {
            console.warn(`Using Claude with ${body.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
        }
        let timeout = this._client._options.timeout;
        if (!body.stream && timeout == null) {
            const maxNonstreamingTokens = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$constants$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MODEL_NONSTREAMING_TOKENS"][body.model] ?? undefined;
            timeout = this._client.calculateNonstreamingTimeout(body.max_tokens, maxNonstreamingTokens);
        }
        // Collect helper info from tools and messages
        const helperHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$stainless$2d$helper$2d$header$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stainlessHelperHeader"])(body.tools, body.messages);
        return this._client.post('/v1/messages', {
            body,
            timeout: timeout ?? 600000,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                helperHeader,
                options?.headers
            ]),
            stream: body.stream ?? false
        });
    }
    /**
     * Send a structured list of input messages with text and/or image content, along with an expected `output_config.format` and
     * the response will be automatically parsed and available in the `parsed_output` property of the message.
     *
     * @example
     * ```ts
     * const message = await client.messages.parse({
     *   model: 'claude-sonnet-4-5-20250929',
     *   max_tokens: 1024,
     *   messages: [{ role: 'user', content: 'What is 2+2?' }],
     *   output_config: {
     *     format: zodOutputFormat(z.object({ answer: z.number() })),
     *   },
     * });
     *
     * console.log(message.parsed_output?.answer); // 4
     * ```
     */ parse(params, options) {
        return this.create(params, options).then((message)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$parser$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseMessage"])(message, params, {
                logger: this._client.logger ?? console
            }));
    }
    /**
     * Create a Message stream.
     *
     * If `output_config.format` is provided with a parseable format (like `zodOutputFormat()`),
     * the final message will include a `parsed_output` property with the parsed content.
     *
     * @example
     * ```ts
     * const stream = client.messages.stream({
     *   model: 'claude-sonnet-4-5-20250929',
     *   max_tokens: 1024,
     *   messages: [{ role: 'user', content: 'What is 2+2?' }],
     *   output_config: {
     *     format: zodOutputFormat(z.object({ answer: z.number() })),
     *   },
     * });
     *
     * const message = await stream.finalMessage();
     * console.log(message.parsed_output?.answer); // 4
     * ```
     */ stream(body, options) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$lib$2f$MessageStream$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MessageStream"].createMessage(this, body, options, {
            logger: this._client.logger ?? console
        });
    }
    /**
     * Count the number of tokens in a Message.
     *
     * The Token Count API can be used to count the number of tokens in a Message,
     * including tools, images, and documents, without creating it.
     *
     * Learn more about token counting in our
     * [user guide](https://docs.claude.com/en/docs/build-with-claude/token-counting)
     *
     * @example
     * ```ts
     * const messageTokensCount =
     *   await client.messages.countTokens({
     *     messages: [{ content: 'Hello, world', role: 'user' }],
     *     model: 'claude-opus-4-6',
     *   });
     * ```
     */ countTokens(body, options) {
        return this._client.post('/v1/messages/count_tokens', {
            body,
            ...options
        });
    }
}
const DEPRECATED_MODELS = {
    'claude-1.3': 'November 6th, 2024',
    'claude-1.3-100k': 'November 6th, 2024',
    'claude-instant-1.1': 'November 6th, 2024',
    'claude-instant-1.1-100k': 'November 6th, 2024',
    'claude-instant-1.2': 'November 6th, 2024',
    'claude-3-sonnet-20240229': 'July 21st, 2025',
    'claude-3-opus-20240229': 'January 5th, 2026',
    'claude-2.1': 'July 21st, 2025',
    'claude-2.0': 'July 21st, 2025',
    'claude-3-7-sonnet-latest': 'February 19th, 2026',
    'claude-3-7-sonnet-20250219': 'February 19th, 2026',
    'claude-3-5-haiku-latest': 'February 19th, 2026',
    'claude-3-5-haiku-20241022': 'February 19th, 2026',
    'claude-opus-4-0': 'June 15th, 2026',
    'claude-opus-4-20250514': 'June 15th, 2026',
    'claude-sonnet-4-0': 'June 15th, 2026',
    'claude-sonnet-4-20250514': 'June 15th, 2026'
};
const MODELS_TO_WARN_WITH_THINKING_ENABLED = [
    'claude-mythos-preview',
    'claude-opus-4-6'
];
Messages.Batches = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$messages$2f$batches$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Batches"];
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/models.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Models",
    ()=>Models
]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/resource.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/path.mjs [app-route] (ecmascript)");
;
;
;
;
class Models extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$resource$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIResource"] {
    /**
     * Get a specific model.
     *
     * The Models API response can be used to determine information about a specific
     * model or resolve a model alias to a model ID.
     */ retrieve(modelID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$path$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["path"]`/v1/models/${modelID}`, {
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    ...betas?.toString() != null ? {
                        'anthropic-beta': betas?.toString()
                    } : undefined
                },
                options?.headers
            ])
        });
    }
    /**
     * List available models.
     *
     * The Models API response can be used to determine which models are available for
     * use in the API. More recently released models are listed first.
     */ list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/models', __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Page"], {
            query,
            ...options,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
                {
                    ...betas?.toString() != null ? {
                        'anthropic-beta': betas?.toString()
                    } : undefined
                },
                options?.headers
            ])
        });
    }
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/index.mjs [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$beta$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/beta.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$completions$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/completions.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$messages$2f$messages$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/messages/messages.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$models$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/models.mjs [app-route] (ecmascript)");
;
;
;
;
;
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/env.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
/**
 * Read an environment variable.
 *
 * Trims beginning and trailing whitespace.
 *
 * Will return undefined if the environment variable doesn't exist or cannot be accessed.
 */ __turbopack_context__.s([
    "readEnv",
    ()=>readEnv
]);
const readEnv = (env)=>{
    if (typeof globalThis.process !== 'undefined') {
        return globalThis.process.env?.[env]?.trim() || undefined;
    }
    if (typeof globalThis.Deno !== 'undefined') {
        return globalThis.Deno.env?.get?.(env)?.trim() || undefined;
    }
    return undefined;
};
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/client.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AI_PROMPT",
    ()=>AI_PROMPT,
    "Anthropic",
    ()=>Anthropic,
    "BaseAnthropic",
    ()=>BaseAnthropic,
    "HUMAN_PROMPT",
    ()=>HUMAN_PROMPT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/tslib.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$uuid$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/uuid.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$values$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/values.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$sleep$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/sleep.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$errors$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/errors.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$detect$2d$platform$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/detect-platform.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$shims$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/shims.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$request$2d$options$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/request-options.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$query$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/query.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$version$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/version.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/error.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$uploads$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/uploads.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$to$2d$file$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/to-file.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$completions$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/completions.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$messages$2f$messages$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/messages/messages.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$models$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/models.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$beta$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/resources/beta/beta.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$api$2d$promise$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/api-promise.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/headers.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$env$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/env.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/internal/utils/log.mjs [app-route] (ecmascript)");
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var _BaseAnthropic_instances, _a, _BaseAnthropic_encoder, _BaseAnthropic_baseURLOverridden;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const HUMAN_PROMPT = '\\n\\nHuman:';
const AI_PROMPT = '\\n\\nAssistant:';
class BaseAnthropic {
    /**
     * API Client for interfacing with the Anthropic API.
     *
     * @param {string | null | undefined} [opts.apiKey=process.env['ANTHROPIC_API_KEY'] ?? null]
     * @param {string | null | undefined} [opts.authToken=process.env['ANTHROPIC_AUTH_TOKEN'] ?? null]
     * @param {string} [opts.baseURL=process.env['ANTHROPIC_BASE_URL'] ?? https://api.anthropic.com] - Override the default base URL for the API.
     * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
     * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
     * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
     * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
     * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
     * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
     * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
     */ constructor({ baseURL = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$env$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEnv"])('ANTHROPIC_BASE_URL'), apiKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$env$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEnv"])('ANTHROPIC_API_KEY') ?? null, authToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$env$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEnv"])('ANTHROPIC_AUTH_TOKEN') ?? null, ...opts } = {}){
        _BaseAnthropic_instances.add(this);
        _BaseAnthropic_encoder.set(this, void 0);
        const options = {
            apiKey,
            authToken,
            ...opts,
            baseURL: baseURL || `https://api.anthropic.com`
        };
        if (!options.dangerouslyAllowBrowser && (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$detect$2d$platform$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRunningInBrowser"])()) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"]("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew Anthropic({ apiKey, dangerouslyAllowBrowser: true });\n");
        }
        this.baseURL = options.baseURL;
        this.timeout = options.timeout ?? _a.DEFAULT_TIMEOUT /* 10 minutes */ ;
        this.logger = options.logger ?? console;
        const defaultLogLevel = 'warn';
        // Set default logLevel early so that we can log a warning in parseLogLevel.
        this.logLevel = defaultLogLevel;
        this.logLevel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseLogLevel"])(options.logLevel, 'ClientOptions.logLevel', this) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseLogLevel"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$env$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEnv"])('ANTHROPIC_LOG'), "process.env['ANTHROPIC_LOG']", this) ?? defaultLogLevel;
        this.fetchOptions = options.fetchOptions;
        this.maxRetries = options.maxRetries ?? 2;
        this.fetch = options.fetch ?? __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$shims$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultFetch"]();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _BaseAnthropic_encoder, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$request$2d$options$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FallbackEncoder"], "f");
        const customHeadersEnv = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$env$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readEnv"])('ANTHROPIC_CUSTOM_HEADERS');
        if (customHeadersEnv) {
            const parsed = {};
            for (const line of customHeadersEnv.split('\n')){
                const colon = line.indexOf(':');
                if (colon >= 0) {
                    parsed[line.substring(0, colon).trim()] = line.substring(colon + 1).trim();
                }
            }
            options.defaultHeaders = {
                ...parsed,
                ...options.defaultHeaders
            };
        }
        this._options = options;
        this.apiKey = typeof apiKey === 'string' ? apiKey : null;
        this.authToken = authToken;
    }
    /**
     * Create a new client instance re-using the same options given to the current client with optional overriding.
     */ withOptions(options) {
        const client = new this.constructor({
            ...this._options,
            baseURL: this.baseURL,
            maxRetries: this.maxRetries,
            timeout: this.timeout,
            logger: this.logger,
            logLevel: this.logLevel,
            fetch: this.fetch,
            fetchOptions: this.fetchOptions,
            apiKey: this.apiKey,
            authToken: this.authToken,
            ...options
        });
        return client;
    }
    defaultQuery() {
        return this._options.defaultQuery;
    }
    validateHeaders({ values, nulls }) {
        if (values.get('x-api-key') || values.get('authorization')) {
            return;
        }
        if (this.apiKey && values.get('x-api-key')) {
            return;
        }
        if (nulls.has('x-api-key')) {
            return;
        }
        if (this.authToken && values.get('authorization')) {
            return;
        }
        if (nulls.has('authorization')) {
            return;
        }
        throw new Error('Could not resolve authentication method. Expected either apiKey or authToken to be set. Or for one of the "X-Api-Key" or "Authorization" headers to be explicitly omitted');
    }
    async authHeaders(opts) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
            await this.apiKeyAuth(opts),
            await this.bearerAuth(opts)
        ]);
    }
    async apiKeyAuth(opts) {
        if (this.apiKey == null) {
            return undefined;
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
            {
                'X-Api-Key': this.apiKey
            }
        ]);
    }
    async bearerAuth(opts) {
        if (this.authToken == null) {
            return undefined;
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
            {
                Authorization: `Bearer ${this.authToken}`
            }
        ]);
    }
    /**
     * Basic re-implementation of `qs.stringify` for primitive types.
     */ stringifyQuery(query) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$query$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stringifyQuery"])(query);
    }
    getUserAgent() {
        return `${this.constructor.name}/JS ${__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$version$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["VERSION"]}`;
    }
    defaultIdempotencyKey() {
        return `stainless-node-retry-${(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$uuid$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid4"])()}`;
    }
    makeStatusError(status, error, message, headers) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIError"].generate(status, error, message, headers);
    }
    buildURL(path, query, defaultBaseURL) {
        const baseURL = !(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BaseAnthropic_instances, "m", _BaseAnthropic_baseURLOverridden).call(this) && defaultBaseURL || this.baseURL;
        const url = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$values$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAbsoluteURL"])(path) ? new URL(path) : new URL(baseURL + (baseURL.endsWith('/') && path.startsWith('/') ? path.slice(1) : path));
        const defaultQuery = this.defaultQuery();
        const pathQuery = Object.fromEntries(url.searchParams);
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$values$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isEmptyObj"])(defaultQuery) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$values$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isEmptyObj"])(pathQuery)) {
            query = {
                ...pathQuery,
                ...defaultQuery,
                ...query
            };
        }
        if (typeof query === 'object' && query && !Array.isArray(query)) {
            url.search = this.stringifyQuery(query);
        }
        return url.toString();
    }
    _calculateNonstreamingTimeout(maxTokens) {
        const defaultTimeout = 10 * 60;
        const expectedTimeout = 60 * 60 * maxTokens / 128000;
        if (expectedTimeout > defaultTimeout) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"]('Streaming is required for operations that may take longer than 10 minutes. ' + 'See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details');
        }
        return defaultTimeout * 1000;
    }
    /**
     * Used as a callback for mutating the given `FinalRequestOptions` object.
     */ async prepareOptions(options) {}
    /**
     * Used as a callback for mutating the given `RequestInit` object.
     *
     * This is useful for cases where you want to add certain headers based off of
     * the request properties, e.g. `method` or `url`.
     */ async prepareRequest(request, { url, options }) {}
    get(path, opts) {
        return this.methodRequest('get', path, opts);
    }
    post(path, opts) {
        return this.methodRequest('post', path, opts);
    }
    patch(path, opts) {
        return this.methodRequest('patch', path, opts);
    }
    put(path, opts) {
        return this.methodRequest('put', path, opts);
    }
    delete(path, opts) {
        return this.methodRequest('delete', path, opts);
    }
    methodRequest(method, path, opts) {
        return this.request(Promise.resolve(opts).then((opts)=>{
            return {
                method,
                path,
                ...opts
            };
        }));
    }
    request(options, remainingRetries = null) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$api$2d$promise$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIPromise"](this, this.makeRequest(options, remainingRetries, undefined));
    }
    async makeRequest(optionsInput, retriesRemaining, retryOfRequestLogID) {
        const options = await optionsInput;
        const maxRetries = options.maxRetries ?? this.maxRetries;
        if (retriesRemaining == null) {
            retriesRemaining = maxRetries;
        }
        await this.prepareOptions(options);
        const { req, url, timeout } = await this.buildRequest(options, {
            retryCount: maxRetries - retriesRemaining
        });
        await this.prepareRequest(req, {
            url,
            options
        });
        /** Not an API request ID, just for correlating local log entries. */ const requestLogID = 'log_' + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, '0');
        const retryLogStr = retryOfRequestLogID === undefined ? '' : `, retryOf: ${retryOfRequestLogID}`;
        const startTime = Date.now();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loggerFor"])(this).debug(`[${requestLogID}] sending request`, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatRequestDetails"])({
            retryOfRequestLogID,
            method: options.method,
            url,
            options,
            headers: req.headers
        }));
        if (options.signal?.aborted) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIUserAbortError"]();
        }
        const controller = new AbortController();
        const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$errors$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["castToError"]);
        const headersTime = Date.now();
        if (response instanceof globalThis.Error) {
            const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
            if (options.signal?.aborted) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIUserAbortError"]();
            }
            // detect native connection timeout errors
            // deno throws "TypeError: error sending request for url (https://example/): client error (Connect): tcp connect error: Operation timed out (os error 60): Operation timed out (os error 60)"
            // undici throws "TypeError: fetch failed" with cause "ConnectTimeoutError: Connect Timeout Error (attempted address: example:443, timeout: 1ms)"
            // others do not provide enough information to distinguish timeouts from other connection errors
            const isTimeout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$errors$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAbortError"])(response) || /timed? ?out/i.test(String(response) + ('cause' in response ? String(response.cause) : ''));
            if (retriesRemaining) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loggerFor"])(this).info(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} - ${retryMessage}`);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loggerFor"])(this).debug(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} (${retryMessage})`, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatRequestDetails"])({
                    retryOfRequestLogID,
                    url,
                    durationMs: headersTime - startTime,
                    message: response.message
                }));
                return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID);
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loggerFor"])(this).info(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} - error; no more retries left`);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loggerFor"])(this).debug(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} (error; no more retries left)`, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatRequestDetails"])({
                retryOfRequestLogID,
                url,
                durationMs: headersTime - startTime,
                message: response.message
            }));
            if (isTimeout) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIConnectionTimeoutError"]();
            }
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIConnectionError"]({
                cause: response
            });
        }
        const specialHeaders = [
            ...response.headers.entries()
        ].filter(([name])=>name === 'request-id').map(([name, value])=>', ' + name + ': ' + JSON.stringify(value)).join('');
        const responseInfo = `[${requestLogID}${retryLogStr}${specialHeaders}] ${req.method} ${url} ${response.ok ? 'succeeded' : 'failed'} with status ${response.status} in ${headersTime - startTime}ms`;
        if (!response.ok) {
            const shouldRetry = await this.shouldRetry(response);
            if (retriesRemaining && shouldRetry) {
                const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
                // We don't need the body of this response.
                await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$shims$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CancelReadableStream"](response.body);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loggerFor"])(this).info(`${responseInfo} - ${retryMessage}`);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loggerFor"])(this).debug(`[${requestLogID}] response error (${retryMessage})`, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatRequestDetails"])({
                    retryOfRequestLogID,
                    url: response.url,
                    status: response.status,
                    headers: response.headers,
                    durationMs: headersTime - startTime
                }));
                return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID, response.headers);
            }
            const retryMessage = shouldRetry ? `error; no more retries left` : `error; not retryable`;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loggerFor"])(this).info(`${responseInfo} - ${retryMessage}`);
            const errText = await response.text().catch((err)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$errors$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["castToError"])(err).message);
            const errJSON = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$values$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeJSON"])(errText);
            const errMessage = errJSON ? undefined : errText;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loggerFor"])(this).debug(`[${requestLogID}] response error (${retryMessage})`, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatRequestDetails"])({
                retryOfRequestLogID,
                url: response.url,
                status: response.status,
                headers: response.headers,
                message: errMessage,
                durationMs: Date.now() - startTime
            }));
            const err = this.makeStatusError(response.status, errJSON, errMessage, response.headers);
            throw err;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loggerFor"])(this).info(responseInfo);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loggerFor"])(this).debug(`[${requestLogID}] response start`, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$log$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatRequestDetails"])({
            retryOfRequestLogID,
            url: response.url,
            status: response.status,
            headers: response.headers,
            durationMs: headersTime - startTime
        }));
        return {
            response,
            options,
            controller,
            requestLogID,
            retryOfRequestLogID,
            startTime
        };
    }
    getAPIList(path, Page, opts) {
        return this.requestAPIList(Page, opts && 'then' in opts ? opts.then((opts)=>({
                method: 'get',
                path,
                ...opts
            })) : {
            method: 'get',
            path,
            ...opts
        });
    }
    requestAPIList(Page, options) {
        const request = this.makeRequest(options, null, undefined);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PagePromise"](this, request, Page);
    }
    async fetchWithTimeout(url, init, ms, controller) {
        const { signal, method, ...options } = init || {};
        // Avoid creating a closure over `this`, `init`, or `options` to prevent memory leaks.
        // An arrow function like `() => controller.abort()` captures the surrounding scope,
        // which includes the request body and other large objects. When the user passes a
        // long-lived AbortSignal, the listener prevents those objects from being GC'd for
        // the lifetime of the signal. Using `.bind()` only retains a reference to the
        // controller itself.
        const abort = this._makeAbort(controller);
        if (signal) signal.addEventListener('abort', abort, {
            once: true
        });
        const timeout = setTimeout(abort, ms);
        const isReadableBody = globalThis.ReadableStream && options.body instanceof globalThis.ReadableStream || typeof options.body === 'object' && options.body !== null && Symbol.asyncIterator in options.body;
        const fetchOptions = {
            signal: controller.signal,
            ...isReadableBody ? {
                duplex: 'half'
            } : {},
            method: 'GET',
            ...options
        };
        if (method) {
            // Custom methods like 'patch' need to be uppercased
            // See https://github.com/nodejs/undici/issues/2294
            fetchOptions.method = method.toUpperCase();
        }
        try {
            // use undefined this binding; fetch errors if bound to something else in browser/cloudflare
            return await this.fetch.call(undefined, url, fetchOptions);
        } finally{
            clearTimeout(timeout);
        }
    }
    async shouldRetry(response) {
        // Note this is not a standard header.
        const shouldRetryHeader = response.headers.get('x-should-retry');
        // If the server explicitly says whether or not to retry, obey.
        if (shouldRetryHeader === 'true') return true;
        if (shouldRetryHeader === 'false') return false;
        // Retry on request timeouts.
        if (response.status === 408) return true;
        // Retry on lock timeouts.
        if (response.status === 409) return true;
        // Retry on rate limits.
        if (response.status === 429) return true;
        // Retry internal errors.
        if (response.status >= 500) return true;
        return false;
    }
    async retryRequest(options, retriesRemaining, requestLogID, responseHeaders) {
        let timeoutMillis;
        // Note the `retry-after-ms` header may not be standard, but is a good idea and we'd like proactive support for it.
        const retryAfterMillisHeader = responseHeaders?.get('retry-after-ms');
        if (retryAfterMillisHeader) {
            const timeoutMs = parseFloat(retryAfterMillisHeader);
            if (!Number.isNaN(timeoutMs)) {
                timeoutMillis = timeoutMs;
            }
        }
        // About the Retry-After header: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After
        const retryAfterHeader = responseHeaders?.get('retry-after');
        if (retryAfterHeader && !timeoutMillis) {
            const timeoutSeconds = parseFloat(retryAfterHeader);
            if (!Number.isNaN(timeoutSeconds)) {
                timeoutMillis = timeoutSeconds * 1000;
            } else {
                timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
            }
        }
        // If the API asks us to wait a certain amount of time, just do what it
        // says, but otherwise calculate a default
        if (timeoutMillis === undefined) {
            const maxRetries = options.maxRetries ?? this.maxRetries;
            timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$sleep$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sleep"])(timeoutMillis);
        return this.makeRequest(options, retriesRemaining - 1, requestLogID);
    }
    calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
        const initialRetryDelay = 0.5;
        const maxRetryDelay = 8.0;
        const numRetries = maxRetries - retriesRemaining;
        // Apply exponential backoff, but not more than the max.
        const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
        // Apply some jitter, take up to at most 25 percent of the retry time.
        const jitter = 1 - Math.random() * 0.25;
        return sleepSeconds * jitter * 1000;
    }
    calculateNonstreamingTimeout(maxTokens, maxNonstreamingTokens) {
        const maxTime = 60 * 60 * 1000; // 60 minutes
        const defaultTime = 60 * 10 * 1000; // 10 minutes
        const expectedTime = maxTime * maxTokens / 128000;
        if (expectedTime > defaultTime || maxNonstreamingTokens != null && maxTokens > maxNonstreamingTokens) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"]('Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details');
        }
        return defaultTime;
    }
    async buildRequest(inputOptions, { retryCount = 0 } = {}) {
        const options = {
            ...inputOptions
        };
        const { method, path, query, defaultBaseURL } = options;
        const url = this.buildURL(path, query, defaultBaseURL);
        if ('timeout' in options) (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$utils$2f$values$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validatePositiveInteger"])('timeout', options.timeout);
        options.timeout = options.timeout ?? this.timeout;
        const { bodyHeaders, body } = this.buildBody({
            options
        });
        const reqHeaders = await this.buildHeaders({
            options: inputOptions,
            method,
            bodyHeaders,
            retryCount
        });
        const req = {
            method,
            headers: reqHeaders,
            ...options.signal && {
                signal: options.signal
            },
            ...globalThis.ReadableStream && body instanceof globalThis.ReadableStream && {
                duplex: 'half'
            },
            ...body && {
                body
            },
            ...this.fetchOptions ?? {},
            ...options.fetchOptions ?? {}
        };
        return {
            req,
            url,
            timeout: options.timeout
        };
    }
    async buildHeaders({ options, method, bodyHeaders, retryCount }) {
        let idempotencyHeaders = {};
        if (this.idempotencyHeader && method !== 'get') {
            if (!options.idempotencyKey) options.idempotencyKey = this.defaultIdempotencyKey();
            idempotencyHeaders[this.idempotencyHeader] = options.idempotencyKey;
        }
        const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
            idempotencyHeaders,
            {
                Accept: 'application/json',
                'User-Agent': this.getUserAgent(),
                'X-Stainless-Retry-Count': String(retryCount),
                ...options.timeout ? {
                    'X-Stainless-Timeout': String(Math.trunc(options.timeout / 1000))
                } : {},
                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$detect$2d$platform$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPlatformHeaders"])(),
                ...this._options.dangerouslyAllowBrowser ? {
                    'anthropic-dangerous-direct-browser-access': 'true'
                } : undefined,
                'anthropic-version': '2023-06-01'
            },
            await this.authHeaders(options),
            this._options.defaultHeaders,
            bodyHeaders,
            options.headers
        ]);
        this.validateHeaders(headers);
        return headers.values;
    }
    _makeAbort(controller) {
        // note: we can't just inline this method inside `fetchWithTimeout()` because then the closure
        //       would capture all request options, and cause a memory leak.
        return ()=>controller.abort();
    }
    buildBody({ options: { body, headers: rawHeaders } }) {
        if (!body) {
            return {
                bodyHeaders: undefined,
                body: undefined
            };
        }
        const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$headers$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHeaders"])([
            rawHeaders
        ]);
        if (// Pass raw type verbatim
        ArrayBuffer.isView(body) || body instanceof ArrayBuffer || body instanceof DataView || typeof body === 'string' && // Preserve legacy string encoding behavior for now
        headers.values.has('content-type') || globalThis.Blob && body instanceof globalThis.Blob || // `FormData` -> `multipart/form-data`
        body instanceof FormData || // `URLSearchParams` -> `application/x-www-form-urlencoded`
        body instanceof URLSearchParams || globalThis.ReadableStream && body instanceof globalThis.ReadableStream) {
            return {
                bodyHeaders: undefined,
                body: body
            };
        } else if (typeof body === 'object' && (Symbol.asyncIterator in body || Symbol.iterator in body && 'next' in body && typeof body.next === 'function')) {
            return {
                bodyHeaders: undefined,
                body: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$shims$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ReadableStreamFrom"](body)
            };
        } else if (typeof body === 'object' && headers.values.get('content-type') === 'application/x-www-form-urlencoded') {
            return {
                bodyHeaders: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: this.stringifyQuery(body)
            };
        } else {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$tslib$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _BaseAnthropic_encoder, "f").call(this, {
                body,
                headers
            });
        }
    }
}
_a = BaseAnthropic, _BaseAnthropic_encoder = new WeakMap(), _BaseAnthropic_instances = new WeakSet(), _BaseAnthropic_baseURLOverridden = function _BaseAnthropic_baseURLOverridden() {
    return this.baseURL !== 'https://api.anthropic.com';
};
BaseAnthropic.Anthropic = _a;
BaseAnthropic.HUMAN_PROMPT = HUMAN_PROMPT;
BaseAnthropic.AI_PROMPT = AI_PROMPT;
BaseAnthropic.DEFAULT_TIMEOUT = 600000; // 10 minutes
BaseAnthropic.AnthropicError = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AnthropicError"];
BaseAnthropic.APIError = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIError"];
BaseAnthropic.APIConnectionError = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIConnectionError"];
BaseAnthropic.APIConnectionTimeoutError = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIConnectionTimeoutError"];
BaseAnthropic.APIUserAbortError = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIUserAbortError"];
BaseAnthropic.NotFoundError = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NotFoundError"];
BaseAnthropic.ConflictError = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ConflictError"];
BaseAnthropic.RateLimitError = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RateLimitError"];
BaseAnthropic.BadRequestError = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BadRequestError"];
BaseAnthropic.AuthenticationError = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthenticationError"];
BaseAnthropic.InternalServerError = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["InternalServerError"];
BaseAnthropic.PermissionDeniedError = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PermissionDeniedError"];
BaseAnthropic.UnprocessableEntityError = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UnprocessableEntityError"];
BaseAnthropic.toFile = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$internal$2f$to$2d$file$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toFile"];
class Anthropic extends BaseAnthropic {
    constructor(){
        super(...arguments);
        this.completions = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$completions$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Completions"](this);
        this.messages = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$messages$2f$messages$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Messages"](this);
        this.models = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$models$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Models"](this);
        this.beta = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$beta$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Beta"](this);
    }
}
Anthropic.Completions = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$completions$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Completions"];
Anthropic.Messages = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$messages$2f$messages$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Messages"];
Anthropic.Models = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$models$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Models"];
Anthropic.Beta = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$resources$2f$beta$2f$beta$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Beta"];
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/index.mjs [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/client.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$uploads$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/uploads.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$api$2d$promise$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/api-promise.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$pagination$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/pagination.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$core$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/core/error.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/client.mjs [app-route] (ecmascript) <export Anthropic as default>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Anthropic"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@anthropic-ai/sdk/client.mjs [app-route] (ecmascript)");
}),
];

//# sourceMappingURL=03t6_%40anthropic-ai_sdk_030i223._.js.map