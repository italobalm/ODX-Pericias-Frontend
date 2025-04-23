// Instalação do Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll([
        "/", // Página inicial
        "/login", // Rota real do app
        "/AppImages/android/android-launchericon-192-192.png",
        "/AppImages/android/android-launchericon-512-512.png",
        "/AppImages/screenshots/home.png",
        "/AppImages/screenshots/login.png",
        // Adicione aqui apenas arquivos reais que existem em /public ou são acessíveis via navegador
      ]);
    })
  );
});

// Ativação do Service Worker
self.addEventListener("activate", (event) => {
  const cacheWhitelist = ["v1"];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de Requisições
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Ignora requisições que não são HTTP/HTTPS (como chrome-extension://)
  if (!url.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const responseToCache = response.clone();

        caches.open("v1").then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Background Sync
self.addEventListener("sync", (event) => {
  if (event.tag === "syncUserData") {
    event.waitUntil(syncUserData());
  }
});

function syncUserData() {
  return fetch("/api/sync", {
    method: "POST",
    body: JSON.stringify({}),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .catch((error) => console.log("Erro ao sincronizar dados", error));
}
