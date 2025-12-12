document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('activityChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
                datasets: [{
                    label: 'Activity',
                    data: [12,19,8,14,18,10,22],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79,70,229,0.1)'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    const ctx2 = document.getElementById('distChart');
    if (ctx2) {
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Completed','Pending','Overdue'],
                datasets: [{
                    data: [70,20,10],
                    backgroundColor: ['#10b981','#f59e0b','#ef4444']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
});