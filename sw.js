/* Rattana Purchase Chat — Service Worker v1
   หน้าที่เดียว: รับ Web Push แล้วเด้งแจ้งเตือนของเครื่อง แม้ปิดแอพอยู่
   ไม่ cache ไฟล์แอพ (แอพเป็นไฟล์เดียว อัปเดตบ่อย — cache แล้วจะได้ของเก่า) */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

const ICON = 'icon-192.png';

self.addEventListener('push', event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (_) { d = { body: event.data && event.data.text() }; }

  const title = d.title || 'Rattana Purchase Chat';
  const opts = {
    body: d.body || '',
    icon: ICON,
    badge: ICON,
    // เรื่องเดียวกันเด้งทับอันเดิม ไม่ท่วมจอ · renotify ให้สั่นซ้ำเมื่อมีอันใหม่จริง
    tag: d.tag || 'pur',
    renotify: true,
    data: { chat: d.chat || '', url: d.url || 'rattana-purchase-chat.html' },
    requireInteraction: d.kind === 'sla',
    silent: false,
  };
  event.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const data = event.notification.data || {};
  const target = new URL(data.url || 'rattana-purchase-chat.html', self.location.href);
  if (data.chat) target.hash = 'chat=' + data.chat;

  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) {
      if (w.url.includes('rattana-purchase-chat')) {
        await w.focus();
        w.postMessage({ type: 'open-chat', chat: data.chat || '' });
        return;
      }
    }
    await self.clients.openWindow(target.href);
  })());
});
