import Head from "next/head";
import { useEffect, useRef } from "react";

export default function SwaggerPage() {
  const swaggerContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSwaggerUI() {
      if (!swaggerContainerRef.current || typeof window === "undefined") {
        return;
      }

      const existingCss = document.querySelector('link[data-swagger-ui="true"]');
      if (!existingCss) {
        const cssLink = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css";
        cssLink.setAttribute("data-swagger-ui", "true");
        document.head.appendChild(cssLink);
      }

      const bundleScript = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js";
      const presetScript = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js";

      const loadScript = (src: string) =>
        new Promise<void>((resolve, reject) => {
          const existingScript = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
          if (existingScript) {
            if (existingScript.dataset.loaded === "true") {
              resolve();
              return;
            }
            existingScript.addEventListener("load", () => resolve(), { once: true });
            existingScript.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
            return;
          }

          const script = document.createElement("script");
          script.src = src;
          script.async = true;
          script.onload = () => {
            script.dataset.loaded = "true";
            resolve();
          };
          script.onerror = () => reject(new Error(`Failed to load ${src}`));
          document.body.appendChild(script);
        });

      try {
        await loadScript(bundleScript);
        await loadScript(presetScript);

        if (!isMounted || !swaggerContainerRef.current || !(window as typeof window & { SwaggerUIBundle?: any }).SwaggerUIBundle) {
          return;
        }

        const SwaggerUIBundle = (window as typeof window & { SwaggerUIBundle?: any }).SwaggerUIBundle;

        const existingSwagger = swaggerContainerRef.current.querySelector(".swagger-ui");
        if (existingSwagger) {
          existingSwagger.remove();
        }

        SwaggerUIBundle({
          url: "/api/swagger",
          dom_id: "#swagger-ui-container",
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.presets.standalone],
          plugins: [SwaggerUIBundle.plugins.DownloadUrl],
          layout: "BaseLayout",
          supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
        });
      } catch (error) {
        console.error("Swagger UI failed to load:", error);
      }
    }

    void loadSwaggerUI();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Head>
        <title>Swagger API | QLPL Demo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          padding: "24px",
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            background: "#ffffff",
            borderRadius: "18px",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #e2e8f0",
              background: "linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)",
            }}
          >
            <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#64748b", fontWeight: 700 }}>
              API Documentation
            </p>
            <h1 style={{ margin: "12px 0 0", fontSize: 32, color: "#0f172a", fontWeight: 700 }}>Swagger API</h1>
          </div>

          <div ref={swaggerContainerRef} id="swagger-ui-container" style={{ padding: 12 }} />
        </div>
      </div>
    </>
  );
}
