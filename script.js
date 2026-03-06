const controlGroups = document.querySelectorAll('.control-group');

controlGroups.forEach(group => {

    const property = group.dataset.property;
    const targetId = group.dataset.target;
    const targetElement = document.getElementById(targetId);
    const buttons = group.querySelectorAll('button');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {


            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const newValue = btn.dataset.value;


            if (!document.startViewTransition) {
                targetElement.style[property] = newValue;
                return;
            }

            document.startViewTransition(() => {
                targetElement.style[property] = newValue;
            });

        });
    });
});