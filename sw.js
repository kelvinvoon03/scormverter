const generatedIds = {};
// generate random ID
// https://www.codemzy.com/blog/random-unique-id-javascript
function randomId() {
    let id = '';
    do {
        id = Math.random().toString(36).substring(2, 16);
    } while (generatedIds[id] === true);
    generatedIds[id] = true;
    return id;
}

const courseId = randomId();
let logoFile = undefined;
let filesMap = {};

let manifestJson = {
    "language": "en-US",
    "logo": {
        "name": "logo.png",
        "fullPath": `courses/${courseId}/resources/logo.png`,
        "url": ""
    },
    "name": "Untitled",
    "colorScheme": {
        "primary": "#575757",
        "mediaBackground": "#FFFFFF"
    },
    "modifiedAt": Date.now(),
    "createdAt": new Date().toUTCString(),
    "ownerId": randomId(),
    "available": true,
    "courseId": courseId,
    "baseURL": "./assets",
    "settings": {
        "showCloseCourseButton": false,
        "hideProgressBar": false,
        "navigationMode": "disabled"
    },
    "folderId": null,
    "pages": []
};

self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('[SW] Installed');
});

self.addEventListener('message', (event) => {
    const manifestObj = event.data;
    manifestJson = manifestObj.manifest;
    const files = manifestObj.files;
    filesMap = {};
    files.forEach(file => {
        filesMap[file.id] = file;
    });
    logoFile = manifestObj.logo;
    event.source.postMessage('OK');
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (url.pathname.endsWith('assets/data/course.json')) {
        return event.respondWith(
            new Response(JSON.stringify(manifestJson), { headers: { 'Content-Type': 'application/json' } })
        );
    }
    if (url.pathname.endsWith('.mp4') || url.pathname.endsWith('logo.png')) {
        const filename = url.pathname.split('/').pop();
        if (filesMap[filename]) {
            return event.respondWith(
                new Response(
                    filesMap[filename].file,
                    { headers: { 'Content-Type': 'video/mp4' } }
                )
            );
        } else if (filename === 'logo.png') {
            return event.respondWith(
                new Response(
                    logoFile ? logoFile : '',
                    { headers: { 'Content-Type': logoFile ? logoFile.type : 'text/plain' } }
                )
            );
        }
    }
    return fetch(event.request);
});