document.addEventListener('DOMContentLoaded', () => {
    const display = document.querySelector('#calc-display');
    let current = '';

    function update() { display.value = current || '0'; }

    function press(n) {
        current += n;
        update();
    }

    function clearAll() {
        current = '';
        update();
    }

    function backspace() {
        current = current.slice(0, -1);
        update();
    }

    function calculate() {
        try {
            
            if (!/^[0-9()+\-*/.\s]+$/.test(current)) throw new Error('Invalid');
            const result = Function('return ' + current)();
            current = String(result);
            update();
        } catch (e) {
            display.value = 'Error';
            current = '';
        }
    }

    document.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const v = btn.dataset.val;
            if (v === 'C') clearAll();
            else if (v === 'BS') backspace();
            else if (v === '=') calculate();
            else press(v);
        });
    });

    update();
});
