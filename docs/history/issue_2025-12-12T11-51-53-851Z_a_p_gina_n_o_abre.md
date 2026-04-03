# A página não abre

**Date:** 12/12/2025, 08:51:53

## Description
Console Error

A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:
- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

See more info here: https://nextjs.org/docs/messages/react-hydration-error


  ...
    <HotReload globalError={[...]} webSocket={WebSocket} staticIndicatorState={{pathname:null, ...}}>
      <AppDevOverlayErrorBoundary globalError={[...]}>
        <ReplaySsrOnlyErrors>
        <DevRootHTTPAccessFallbackBoundary>
          <HTTPAccessFallbackBoundary notFound={<NotAllowedRootHTTPFallbackError>}>
            <HTTPAccessFallbackErrorBoundary pathname="/" notFound={<NotAllowedRootHTTPFallbackError>} ...>
              <RedirectBoundary>
                <RedirectErrorBoundary router={{...}}>
                  <Head>
                  <__next_root_layout_boundary__>
                    <SegmentViewNode type="layout" pagePath="layout.tsx">
                      <SegmentTrieNode>
                      <link>
                      <script>
                      <script>
                      <RootLayout>
                        <html
                          lang="en"
-                         data-jetski-tab-id="47341109"
                        >
                  ...
src\app\layout.tsx (28:5) @ RootLayout


  26 | }>) {
  27 |   return (
> 28 |     <html lang="en">
     |     ^
  29 |       <body
  30 |         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
  31 |       >
Call Stack
18

Show 1 ignore-listed frame(s)
createConsoleError
file:///C:/Users/ericm/OneDrive/%C3%81rea%20de%20Trabalho/PESSOAL/Agendador%20Andreia/web/.next/dev/static/chunks/node_modules_next_dist_7a8122d0._.js (2189:71)
handleConsoleError
file:///C:/Users/ericm/OneDrive/%C3%81rea%20de%20Trabalho/PESSOAL/Agendador%20Andreia/web/.next/dev/static/chunks/node_modules_next_dist_7a8122d0._.js (2970:54)
console.error
file:///C:/Users/ericm/OneDrive/%C3%81rea%20de%20Trabalho/PESSOAL/Agendador%20Andreia/web/.next/dev/static/chunks/node_modules_next_dist_7a8122d0._.js (3114:57)
<unknown>
file:///C:/Users/ericm/OneDrive/%C3%81rea%20de%20Trabalho/PESSOAL/Agendador%20Andreia/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js (3463:25)
runWithFiberInDEV
file:///C:/Users/ericm/OneDrive/%C3%81rea%20de%20Trabalho/PESSOAL/Agendador%20Andreia/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js (959:74)
emitPendingHydrationWarnings
file:///C:/Users/ericm/OneDrive/%C3%81rea%20de%20Trabalho/PESSOAL/Agendador%20Andreia/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js (3462:13)
completeWork
file:///C:/Users/ericm/OneDrive/%C3%81rea%20de%20Trabalho/PESSOAL/Agendador%20Andreia/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js (6891:102)
runWithFiberInDEV
file:///C:/Users/ericm/OneDrive/%C3%81rea%20de%20Trabalho/PESSOAL/Agendador%20Andreia/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js (959:131)
completeUnitOfWork
file:///C:/Users/ericm/OneDrive/%C3%81rea%20de%20Trabalho/PESSOAL/Agendador%20Andreia/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js (9621:23)
performUnitOfWork
file:///C:/Users/ericm/OneDrive/%C3%81rea%20de%20Trabalho/PESSOAL/Agendador%20Andreia/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js (9558:28)
workLoopConcurrentByScheduler
file:///C:/Users/ericm/OneDrive/%C3%81rea%20de%20Trabalho/PESSOAL/Agendador%20Andreia/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js (9552:58)
renderRootConcurrent
file:///C:/Users/ericm/OneDrive/%C3%81rea%20de%20Trabalho/PESSOAL/Agendador%20Andreia/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js (9535:71)
performWorkOnRoot
file:///C:/Users/ericm/OneDrive/%C3%81rea%20de%20Trabalho/PESSOAL/Agendador%20Andreia/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js (9062:150)
performWorkOnRootViaSchedulerTask
file:///C:/Users/ericm/OneDrive/%C3%81rea%20de%20Trabalho/PESSOAL/Agendador%20Andreia/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js (10224:9)
MessagePort.performWorkUntilDeadline
file:///C:/Users/ericm/OneDrive/%C3%81rea%20de%20Trabalho/PESSOAL/Agendador%20Andreia/web/.next/dev/static/chunks/node_modules_next_dist_compiled_a0e4c7b4._.js (2647:64)
html
<anonymous>
RootLayout
src\app\layout.tsx (28:5)
