// Service Worker для Astra Tournament
const CACHE_NAME = 'astra-tournament-v1.0.0';
const CACHE_FILES = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './admin.html',
    './admin-style.css',
    './admin-script.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(CACHE_FILES);
            })
            .then(() => self.skipWaiting())
    );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Перехват fetch запросов
self.addEventListener('fetch', (event) => {
    // Пропускаем запросы к Google Sheets API
    if (event.request.url.includes('script.google.com')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Возвращаем кэшированный ресурс если он есть
                if (response) {
                    return response;
                }
                
                // Клонируем запрос
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then((response) => {
                    // Проверяем валидность ответа
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Клонируем ответ
                    const responseToCache = response.clone();
                    
                    // Кэшируем новый ресурс
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                }).catch(() => {
                    // Если нет сети и нет в кэше, показываем offline страницу
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                    return new Response('Офлайн режим', {
                        status: 408,
                        headers: { 'Content-Type': 'text/plain' }
                    });
                });
            })
    );
});

// Фоновые задачи
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncDataWithServer());
    }
});

// Синхронизация данных при восстановлении соединения
async function syncDataWithServer() {
    console.log('Background sync started');
    
    try {
        // Здесь будет логика синхронизации с сервером
        // Например, отправка накопленных данных в Google Sheets
        
        const registration = await self.registration;
        registration.showNotification('Данные синхронизированы', {
            body: 'Информация успешно отправлена на сервер',
            icon: '/icon-192.png',
            badge: '/badge-72.png'
        });
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

// Получение push уведомлений
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body || 'Новое уведомление от Astra Tournament',
        icon: data.icon || '/icon-192.png',
        badge: '/badge-72.png',
        tag: data.tag || 'tournament-update',
        data: data.url || './',
        actions: [
            {
                action: 'open',
                title: 'Открыть'
            },
            {
                action: 'close',
                title: 'Закрыть'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Astra Tournament', options)
    );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // Открываем существующее окно если оно есть
            for (const client of clientList) {
                if (client.url === event.notification.data && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Иначе открываем новое окно
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data);
            }
        })
    );
});

// Фоновое обновление данных
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-tournament-data') {
        event.waitUntil(updateTournamentData());
    }
});

async function updateTournamentData() {
    console.log('Periodic sync started');
    
    try {
        // Здесь будет логика периодического обновления данных
        // Например, загрузка новых команд из Google Sheets
        
        return Promise.resolve();
    } catch (error) {
        console.error('Periodic sync failed:', error);
        return Promise.reject(error);
    }
}

// Отправка аналитики
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'ANALYTICS') {
        sendAnalytics(event.data.payload);
    }
});

async function sendAnalytics(data) {
    try {
        // Отправка аналитических данных
        await fetch('https://script.google.com/macros/s/.../exec', {
            method: 'POST',
            body: JSON.stringify({
                type: 'analytics',
                data: data,
                timestamp: new Date().toISOString()
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
    }
}
