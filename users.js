const sampleUsers = [
    {name:'Alice Martin', email:'alice@example.com', role:'Admin', status:'Active'},
    {name:'Bob Lee', email:'bob@example.com', role:'Editor', status:'Active'},
    {name:'Celia Gomez', email:'celia@example.com', role:'Viewer', status:'Invited'}
];

function renderUsers(list) {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    list.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td style="padding:8px">${u.name}</td><td style="padding:8px">${u.email}</td><td style="padding:8px">${u.role}</td><td style="padding:8px">${u.status}</td>`;
        tbody.appendChild(tr);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderUsers(sampleUsers);

    const search = document.getElementById('user-search');
    if (search) {
        search.addEventListener('input', () => {
            const q = search.value.toLowerCase().trim();
            const filtered = sampleUsers.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
            renderUsers(filtered);
        });
    }

    const addBtn = document.getElementById('add-user');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const name = prompt('Name');
            const email = prompt('Email');
            if (name && email) {
                sampleUsers.push({name,email,role:'Viewer',status:'Active'});
                renderUsers(sampleUsers);
            }
        });
    }
});
