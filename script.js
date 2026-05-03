import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDTlOk4Q-A0YuN--xoxpp2PMmOCNE4MxoQ",
    authDomain: "ooko-ab897.firebaseapp.com",
    projectId: "ooko-ab897",
    storageBucket: "ooko-ab897.firebasestorage.app",
    messagingSenderId: "914585725610",
    appId: "1:914585725610:web:4ca42679e42207619c3ed3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let localDB = { players: [], fans: [], news: [], matches: [] };

// Sync Collections from Firestore
onSnapshot(collection(db, "players"), (snap) => {
    localDB.players = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderAll();
});
onSnapshot(collection(db, "fans"), (snap) => {
    localDB.fans = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderAll();
});
onSnapshot(collection(db, "news"), (snap) => {
    localDB.news = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderAll();
});
onSnapshot(collection(db, "matches"), (snap) => {
    localDB.matches = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderAll();
});

// Navigation
window.showSection = function(id) {
    document.querySelectorAll('section').forEach(s => {
        s.classList.add('hidden');
        s.classList.remove('block');
    });
    
    const target = document.getElementById('section-' + id);
    if(target) {
        target.classList.remove('hidden');
        target.classList.add('block');
    }

    document.querySelectorAll('.nav-link').forEach(n => {
        n.classList.remove('text-blue-600');
        n.classList.add('text-slate-500');
        const icon = n.querySelector('.nav-icon');
        if(icon) {
            icon.classList.remove('fill-blue-100');
        }
    });

    const activeNav = document.getElementById('nav-' + id);
    if(activeNav) {
        activeNav.classList.remove('text-slate-500');
        activeNav.classList.add('text-blue-600');
        const activeIcon = activeNav.querySelector('.nav-icon');
        if(activeIcon) {
            activeIcon.classList.add('fill-blue-100');
        }
    }
}

window.toggleForm = function(id) {
    const f = document.getElementById(id);
    f.classList.toggle('hidden');
}

window.generateCode = function() {
    document.getElementById('p-code').value = 'P-' + Math.floor(1000 + Math.random() * 9000);
}

window.savePlayer = async function() {
    const name = document.getElementById('p-name').value;
    const age = document.getElementById('p-age').value;
    const pos = document.getElementById('p-pos').value;
    const code = document.getElementById('p-code').value;
    const status = document.getElementById('p-status') ? document.getElementById('p-status').value : 'أساسي';
    const photoInput = document.getElementById('p-photo-file');

    if(!name || !code) {
        alert('يرجى تعبئة الاسم والكود');
        return;
    }

    const saveBtn = document.getElementById('btn-save-player');
    const originalText = saveBtn.innerText;
    saveBtn.innerText = 'جاري الحفظ والرفع...';
    saveBtn.disabled = true;

    try {
        let finalPhotoUrl = '';
        
        // رفع الصورة إلى ImageKit
        if (photoInput && photoInput.files.length > 0) {
            const file = photoInput.files[0];
            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("fileName", file.name || "image.jpg");

                const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
                    method: "POST",
                    headers: {
                        "Authorization": "Basic " + btoa("private_DUQ0pMlCq+In1AX0yMGKzKKMUpg=:")
                    },
                    body: formData
                });

                const imageKitData = await response.json();
                if(imageKitData.url) {
                    finalPhotoUrl = imageKitData.url + "?tr=q-60,f-auto";
                }
            } catch (e) {
                console.error("خطأ في رفع الصورة", e);
                alert("فشل رفع الصورة لكن سيتم إكمال حفظ اللاعب");
            }
        }

        await addDoc(collection(db, "players"), {
            name,
            age: parseInt(age || '18'),
            position: pos,
            code,
            status: status,
            photo: finalPhotoUrl,
            timestamp: serverTimestamp()
        });
        
        // reset form
        document.getElementById('p-name').value = '';
        document.getElementById('p-age').value = '';
        document.getElementById('p-pos').value = '';
        document.getElementById('p-code').value = '';
        if(document.getElementById('p-status')) document.getElementById('p-status').value = 'أساسي';
        if(photoInput) photoInput.value = '';
        
        window.toggleForm('player-form');
    } catch(err) {
        console.error("Error saving player", err);
        alert("حدث خطأ أثناء حفظ اللاعب في قاعدة البيانات");
    } finally {
        saveBtn.innerText = originalText;
        saveBtn.disabled = false;
    }
}

window.deletePlayer = async function(id) {
    if(!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
        await deleteDoc(doc(db, "players", id));
    } catch(err) {
        console.error("Error deleting player", err);
    }
}

window.saveNews = async function() {
    const title = document.getElementById('n-title').value;
    const content = document.getElementById('n-content').value;

    if(!title || !content) return;

    try {
        await addDoc(collection(db, "news"), {
            title,
            content,
            date: new Date().toISOString(),
            timestamp: serverTimestamp()
        });
    } catch(err) {
        console.error("Error saving news", err);
    }

    document.getElementById('n-title').value = '';
    document.getElementById('n-content').value = '';
    window.toggleForm('news-form');
}

window.deleteNews = async function(id) {
    if(!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
        await deleteDoc(doc(db, "news", id));
    } catch(err) {
        console.error("Error deleting news", err);
    }
}

// Rendering
function renderAll() {
    // Dashboard Stats
    document.getElementById('stat-players').innerText = localDB.players.length;
    document.getElementById('stat-fans').innerText = localDB.fans.length;
    document.getElementById('stat-news').innerText = localDB.news.length;

    // Fans List
    const fansDiv = document.getElementById('fans-list');
    if (localDB.fans.length === 0) {
        fansDiv.innerHTML = '<p class="text-sm text-slate-500">لا يوجد مشجعين مسجلين بعد.</p>';
    } else {
        fansDiv.innerHTML = localDB.fans.slice(-10).map(f => `
            <div class="flex justify-between border-b pb-2">
                <span class="font-medium">${f.name}</span>
                <span class="text-xs text-slate-500" dir="ltr">${f.contact}</span>
            </div>
        `).join('');
    }

    // Players Table
    const pTable = document.getElementById('players-table');
    if(localDB.players.length === 0) {
        pTable.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-slate-500">لا يوجد لاعبين مضافين</td></tr>';
    } else {
        pTable.innerHTML = localDB.players.map(p => `
            <tr class="hover:bg-slate-50">
                <td class="p-3">
                    <div class="flex items-center gap-3">
                        ${p.photo ? 
                            `<img src="${p.photo}" alt="${p.name}" class="w-10 h-10 rounded-full object-cover border border-slate-200">` : 
                            `<div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200"><i data-lucide="user" class="w-5 h-5 text-slate-400"></i></div>`
                        }
                        <div>
                            <div class="font-bold text-slate-900">${p.name}</div>
                            <div class="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                <span>${p.position || 'غير محدد'}</span>
                                <span class="px-1.5 py-0.5 rounded text-[10px] font-medium 
                                    ${p.status === 'أساسي' ? 'bg-green-100 text-green-700' : 
                                      p.status === 'مصاب' ? 'bg-red-100 text-red-700' : 
                                      'bg-slate-100 text-slate-700'}">
                                    ${p.status || 'أساسي'}
                                </span>
                            </div>
                        </div>
                    </div>
                </td>
                <td class="p-3 text-left font-mono text-sm align-middle" dir="ltr">${p.code}</td>
                <td class="p-3 text-center align-middle">
                    <button onclick="deletePlayer('${p.id}')" class="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-lg text-xs font-bold z-10 relative">حذف</button>
                </td>
            </tr>
        `).join('');
    }

    // News List
    const nList = document.getElementById('news-list');
    if(localDB.news.length === 0) {
        nList.innerHTML = '<div class="p-8 text-center border border-dashed rounded-xl text-slate-500">لا يوجد أخبار مضافة</div>';
    } else {
        nList.innerHTML = localDB.news.map(n => `
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start">
                <div>
                    <h3 class="font-bold text-slate-900">${n.title}</h3>
                    <p class="text-sm text-slate-600 mt-1">${n.content}</p>
                    <span class="block mt-2 text-xs text-blue-600">${new Date(n.date).toLocaleDateString('ar-SA')}</span>
                </div>
                <button onclick="deleteNews('${n.id}')" class="text-red-500 hover:bg-red-50 p-2 rounded-lg z-10 relative">حذف</button>
            </div>
        `).join('');
    }

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Init
renderAll();
