// Instalação do Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll([
        "/page.tsx",
        "/public",
        "/login",
        "/global.css",
        "/AppImages/android/android-launchericon-192-192.png",
        "/AppImages/android/android-launchericon-512-512.png",
        "/AppImages/screenshots/home.png",
        "/AppImages/screenshots/login.png",
      ]);
    })
  );
});

// Ativação do Service Worker
self.addEventListener("activate", (event) => {
  const cacheWhitelist = ["v1"]; // Defina a versão do cache
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // Excluir caches antigos
          }
        })
      );
    })
  );
});

// Gerenciamento de Requisições (Fetch)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Se a requisição estiver em cache, retorne ela
      if (cachedResponse) {
        return cachedResponse;
      }

      // Caso contrário, faça a requisição de rede normalmente
      return fetch(event.request).then((response) => {
        // Verifique se a resposta da rede é válida
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Copie a resposta para que ela possa ser armazenada em cache
        const responseToCache = response.clone();

        // Armazene a resposta no cache
        caches.open("v1").then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Sincronização em Segundo Plano (Background Sync)
self.addEventListener("sync", (event) => {
  if (event.tag === "syncUserData") {
    event.waitUntil(syncUserData());
  }
});

function syncUserData() {
  return fetch("/api/sync", {
    method: "POST",
    body: JSON.stringify({
      /* Dados para sincronizar */
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .catch((error) => console.log("Erro ao sincronizar dados", error));
}
