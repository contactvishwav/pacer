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
"[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/app/api/activities/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic
]);
// GET /api/activities?limit=N
//
// Paginated list of activities for the seeded athlete.
// limit: 1–50, default 20.
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/db/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$schemas$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/lumalabs-eng-take-home-e066572123aa9aa42123db943fd1456b5e05b85f/src/lib/schemas/api.ts [app-route] (ecmascript)");
;
;
;
const dynamic = 'force-dynamic';
function formatPace(secPerKm) {
    const m = Math.floor(secPerKm / 60);
    const s = Math.round(secPerKm) % 60;
    return `${m}:${String(s).padStart(2, '0')}/km`;
}
function activityName(type, distanceKm) {
    const labels = {
        EASY: 'Easy Run',
        RECOVERY: 'Recovery Run',
        STEADY_STATE: 'Steady State Run',
        TEMPO: 'Tempo Run',
        THRESHOLD: 'Threshold Run',
        INTERVAL: 'Interval Session',
        LONG_RUN: 'Long Run',
        RACE: 'Race',
        UNKNOWN: 'Run'
    };
    return `${distanceKm.toFixed(1)}km ${labels[type] ?? 'Run'}`;
}
async function GET(request) {
    // Demo mode: uses seeded athlete. Iron Session auth added when Strava OAuth is implemented.
    const athlete = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].athlete.findFirst();
    if (!athlete) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$schemas$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["apiError"])('No athlete data found. Run npx prisma db seed first.'), {
            status: 404
        });
    }
    try {
        const { searchParams } = new URL(request.url);
        const raw = parseInt(searchParams.get('limit') ?? '20', 10);
        const limit = Math.min(Math.max(isNaN(raw) ? 20 : raw, 1), 50);
        const [activities, total] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].activity.findMany({
                where: {
                    athleteId: athlete.id
                },
                orderBy: {
                    startedAt: 'desc'
                },
                take: limit
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].activity.count({
                where: {
                    athleteId: athlete.id
                }
            })
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$src$2f$lib$2f$schemas$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["apiSuccess"])({
            activities: activities.map((a)=>{
                const distanceKm = Math.round(a.distanceMeters / 100) / 10;
                return {
                    id: a.id,
                    name: activityName(a.workoutType, distanceKm),
                    date: a.startedAt.toISOString().slice(0, 10),
                    workoutType: a.workoutType,
                    executionEvaluation: a.executionEvaluation,
                    distanceKm,
                    durationMinutes: Math.round(a.durationSeconds / 60),
                    avgHR: a.avgHeartRate,
                    avgPaceFormatted: formatPace(a.avgPaceSecPerKm),
                    trainingLoad: a.trainingLoad,
                    elevationGain: a.elevationGainMeters
                };
            }),
            total
        }));
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$lumalabs$2d$eng$2d$take$2d$home$2d$e066572123aa9aa42123db943fd1456b5e05b85f$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to load activities',
            ...("TURBOPACK compile-time truthy", 1) ? {
                details: msg
            } : "TURBOPACK unreachable"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__033amjd._.js.map