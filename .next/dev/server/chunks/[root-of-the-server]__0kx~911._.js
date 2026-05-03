module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/db/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
// Shared Prisma client — Next.js hot-reload safe singleton.
// Import this everywhere instead of calling new PrismaClient() per module.
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]();
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/schemas/api.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiResponseSchema",
    ()=>ApiResponseSchema,
    "apiError",
    ()=>apiError,
    "apiSuccess",
    ()=>apiSuccess,
    "createTypedApiResponseSchema",
    ()=>createTypedApiResponseSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
const ApiResponseSchema = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion('success', [
    __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        success: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(true),
        data: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].unknown()
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        success: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(false),
        error: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        code: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    })
]);
function createTypedApiResponseSchema(dataSchema) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion('success', [
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            success: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(true),
            data: dataSchema
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            success: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(false),
            error: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
            code: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
        })
    ]);
}
function apiSuccess(data) {
    return {
        success: true,
        data
    };
}
function apiError(error, code) {
    return {
        success: false,
        error,
        ...code ? {
            code
        } : {}
    };
}
}),
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/app/api/coach/conversations/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic
]);
// POST /api/coach/conversations
//
// Creates a new coaching conversation anchored to a context type.
// Returns the conversation ID used for all subsequent message calls.
//
// Body: { contextType?, activityId?, title? }
//   contextType: 'DASHBOARD' | 'ACTIVITY' | 'RACE_GOAL' | 'WEEKLY_BRIEF' | 'GENERAL' (default)
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/db/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$schemas$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/schemas/api.ts [app-route] (ecmascript)");
;
;
;
const dynamic = 'force-dynamic';
const CONTEXT_TITLES = {
    DASHBOARD: 'Training Overview',
    ACTIVITY: 'Activity Debrief',
    RACE_GOAL: 'Race Planning',
    WEEKLY_BRIEF: 'Weekly Brief',
    GENERAL: 'Coach Chat'
};
const VALID_CONTEXTS = new Set(Object.keys(CONTEXT_TITLES));
async function POST(request) {
    // Demo mode: uses seeded athlete. Iron Session auth added when Strava OAuth is implemented.
    const athlete = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].athlete.findFirst();
    if (!athlete) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$schemas$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["apiError"])('No athlete data found. Run npx prisma db seed first.'), {
            status: 404
        });
    }
    let body;
    try {
        body = await request.json();
    } catch  {
        body = {};
    }
    const contextType = typeof body.contextType === 'string' && VALID_CONTEXTS.has(body.contextType) ? body.contextType : 'GENERAL';
    const activityId = contextType === 'ACTIVITY' && typeof body.activityId === 'string' ? body.activityId : undefined;
    // Validate activityId belongs to this athlete
    if (activityId) {
        const activity = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].activity.findUnique({
            where: {
                id: activityId
            }
        });
        if (!activity || activity.athleteId !== athlete.id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$schemas$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["apiError"])('Activity not found.'), {
                status: 404
            });
        }
    }
    const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : CONTEXT_TITLES[contextType];
    const conversation = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].coachConversation.create({
        data: {
            athleteId: athlete.id,
            contextType: contextType,
            activityId: activityId ?? null,
            title
        }
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$schemas$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["apiSuccess"])({
        conversationId: conversation.id,
        contextType: conversation.contextType,
        title: conversation.title,
        createdAt: conversation.createdAt.toISOString()
    }), {
        status: 201
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0kx~911._.js.map